import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, formatStatus, formatDate, formatCategory } from "@/lib/constants";

// Service categories with icons
const serviceCategories = [
  {
    key: "maintenance",
    title: "Maintenance & Repairs",
    description: "Plumbing, electrical, heating, painting, carpentry, roofing",
    icon: "🔧",
    href: "/app/new/maintenance",
    available: true,
    trades: ["Plumber", "Electrician", "Handyman", "Painter", "Carpenter", "Roofer"],
  },
  {
    key: "renovations",
    title: "Renovations",
    description: "Kitchens, bathrooms, extensions, loft conversions, full refurbs",
    icon: "🏠",
    href: "/app/new/renovations",
    available: true,
    trades: ["Builder", "Architect", "Kitchen fitter", "Bathroom fitter"],
  },
  {
    key: "cleaning",
    title: "Cleaning",
    description: "Regular, deep clean, end of tenancy, carpet, windows",
    icon: "✨",
    href: "/app/new/cleaning",
    available: true,
    trades: ["Cleaner", "Carpet cleaner", "Window cleaner"],
  },
  {
    key: "gardening",
    title: "Garden & Outdoor",
    description: "Landscaping, maintenance, tree surgery, fencing",
    icon: "🌿",
    href: "/app/new/gardening",
    available: true,
    trades: ["Gardener", "Landscaper", "Tree surgeon"],
  },
  {
    key: "security",
    title: "Security",
    description: "Alarms, CCTV, smart locks, access control",
    icon: "🛡️",
    href: "/app/new/security",
    available: true,
    trades: ["Alarm engineer", "CCTV installer", "Locksmith"],
  },
  {
    key: "concierge",
    title: "Concierge",
    description: "Key holding, property checks, contractor access",
    icon: "🔑",
    href: "/app/new/concierge",
    available: true,
    trades: ["Property manager", "Key holder"],
  },
];

// Quick action trades - most common needs
const quickTrades = [
  { name: "Plumber", icon: "🚿", description: "Leaks, boilers, bathrooms", href: "/app/new/maintenance?trade=plumber" },
  { name: "Electrician", icon: "⚡", description: "Wiring, sockets, lighting", href: "/app/new/maintenance?trade=electrician" },
  { name: "Painter", icon: "🎨", description: "Decorating & painting", href: "/app/new/maintenance?trade=painter" },
  { name: "Handyman", icon: "🔨", description: "General repairs & odd jobs", href: "/app/new/maintenance?trade=handyman" },
  { name: "Cleaner", icon: "✨", description: "Regular & deep cleaning", href: "/app/new/cleaning" },
  { name: "Gardener", icon: "🌱", description: "Garden maintenance", href: "/app/new/gardening" },
  { name: "Locksmith", icon: "🔐", description: "Locks, keys, security", href: "/app/new/maintenance?trade=locksmith" },
  { name: "Heating Engineer", icon: "🔥", description: "Boilers, radiators, heating", href: "/app/new/maintenance?trade=heating" },
  { name: "Carpenter", icon: "🪚", description: "Doors, windows, woodwork", href: "/app/new/maintenance?trade=carpenter" },
  { name: "Roofer", icon: "🏠", description: "Roof repairs, gutters", href: "/app/new/maintenance?trade=roofing" },
  { name: "Builder", icon: "🧱", description: "Extensions, renovations", href: "/app/new/renovations" },
  { name: "Tree Surgeon", icon: "🌳", description: "Tree work, pruning, felling", href: "/app/new/gardening?trade=tree_surgery" },
];

// Design specialist services — new category
const designServices = [
  {
    key: "architectural_design",
    title: "Architectural Design",
    icon: "📐",
    description: "Residential architects for extensions, lofts, basements, new builds & full renovations.",
    tags: ["Extensions", "Loft conversions", "Basements", "New builds"],
    cta: "Find an architect",
    href: "/app/new/design",
  },
  {
    key: "interior_design",
    title: "Interior Design",
    icon: "🛋️",
    description: "Interior designers for living spaces, bedrooms, full home styling & furniture sourcing.",
    tags: ["Space planning", "Styling", "Furniture", "Colour consulting"],
    cta: "Find a designer",
    href: "/app/new/design",
  },
  {
    key: "kitchen_bathroom_design",
    title: "Kitchen & Bathroom Design",
    icon: "🍳",
    description: "Bespoke kitchen studios & luxury bathroom specialists, cabinetry, wet rooms & spa bathrooms.",
    tags: ["Bespoke kitchens", "Luxury bathrooms", "Wet rooms", "Cabinetry"],
    cta: "Find a specialist",
    href: "/app/new/design",
  },
  {
    key: "structural_design",
    title: "Structural Design",
    icon: "🏗️",
    description: "Structural engineers for calculations, surveys, beam designs, underpinning & load assessments.",
    tags: ["Structural calcs", "Beam design", "Underpinning", "Surveys"],
    cta: "Find an engineer",
    href: "/app/new/design",
  },
  {
    key: "planning_consultant",
    title: "Planning Consultant",
    icon: "📋",
    description: "Planning applications, conservation area approvals, listed building consent & permitted development.",
    tags: ["Planning apps", "Conservation area", "Listed buildings", "Appeals"],
    cta: "Find a consultant",
    href: "/app/new/design",
  },
  {
    key: "party_wall_surveyor",
    title: "Party Wall Surveyor",
    icon: "📏",
    description: "Party wall notices, agreements, schedules of condition & neighbour dispute resolution.",
    tags: ["Party wall notices", "Agreements", "Schedule of condition", "Disputes"],
    cta: "Find a surveyor",
    href: "/app/new/design",
  },
];

export default async function MemberDashboard() {
  const session = await getServerAuthSession();
  if (!session) return null;

  const userName = session.user.name?.split(" ")[0] || "there";

  // Get user's household(s)
  const householdLinks = await prisma.householdMember.findMany({
    where: { userId: session.user.id },
    select: { householdId: true },
  });

  const householdIds = householdLinks.map((h) => h.householdId);

  // Get requests for user's households
  const requests = await prisma.request.findMany({
    where: {
      householdId: { in: householdIds },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const activeRequests = requests.filter(r => 
    !["COMPLETED", "CANCELLED", "REJECTED"].includes(r.status)
  );

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-8 text-white">
        <p className="text-stone-400 text-sm">Welcome back</p>
        <h1 className="text-3xl font-semibold mt-1">Hello, {userName}</h1>
        <p className="text-stone-300 mt-2 max-w-xl">
          Your property services, on demand. Request a tradesperson, track jobs, and manage your home.
        </p>
        {activeRequests.length > 0 && (
          <div className="mt-6 flex items-center gap-3">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-2xl font-semibold">{activeRequests.length}</span>
              <span className="text-stone-300 ml-2 text-sm">active request{activeRequests.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions - Find a Trade */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Find a tradesperson</h2>
            <p className="text-sm text-gray-500">Quick access to common trades</p>
          </div>
          <Link href="/app/new" className="text-sm text-stone-600 hover:text-stone-900">
            View all services →
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {quickTrades.map((trade) => (
            <Link key={trade.name} href={trade.href}>
              <Card className="hover:border-stone-400 hover:shadow-sm transition-all cursor-pointer h-full group">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2 group-hover:scale-110 transition-transform">{trade.icon}</div>
                  <p className="font-medium text-gray-900 text-xs sm:text-sm">{trade.name}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1 hidden sm:block">{trade.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Design Services */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Design services</h2>
            <p className="text-sm text-gray-500">Architecture, interior design & specialist consultants for your project</p>
          </div>
          <Link href="/app/new/design" className="text-sm text-stone-600 hover:text-stone-900">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {designServices.map((service) => (
            <Link key={service.key} href={service.href}>
              <Card className="hover:border-stone-400 hover:shadow-sm transition-all cursor-pointer group h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{service.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{service.title}</CardTitle>

                      </div>
                      <CardDescription className="mt-1 text-xs">{service.description}</CardDescription>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {service.tags.map((tag) => (
                          <span key={tag} className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <span className="block w-full text-center text-sm py-2 border border-stone-300 rounded-md group-hover:bg-stone-50 transition-colors">
                    {service.cta}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Service Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">All services</h2>
            <p className="text-sm text-gray-500">Browse by category</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {serviceCategories.map((category) => (
            <Card
              key={category.key}
              className={`transition-all ${
                category.available
                  ? "hover:border-stone-400 hover:shadow-sm cursor-pointer"
                  : "opacity-60"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{category.icon}</div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription className="mt-1">{category.description}</CardDescription>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {category.trades.map((trade) => (
                        <span key={trade} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                          {trade}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {category.available ? (
                  <Link href={category.href}>
                    <Button className="w-full bg-stone-900 hover:bg-stone-800">Request service</Button>
                  </Link>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Coming soon
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your requests</h2>
            <p className="text-sm text-gray-500">Track and manage your jobs</p>
          </div>
          {requests.length > 0 && (
            <Link href="/app/requests" className="text-sm text-stone-600 hover:text-stone-900">
              View all →
            </Link>
          )}
        </div>

        {requests.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center">
                <span className="text-stone-400 text-xl">📋</span>
              </div>
              <p className="text-gray-600">No requests yet</p>
              <p className="text-sm text-gray-500 mt-1 mb-4">Submit your first request to get started</p>
              <Link href="/app/new">
                <Button className="bg-stone-900 hover:bg-stone-800">Submit a request</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <Link key={request.id} href={`/app/requests/${request.id}`}>
                <Card className="hover:border-stone-300 hover:shadow-sm transition-all cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {formatCategory(request.category)}
                          </span>
                          {request.subcategory && (
                            <span className="text-gray-500">— {request.subcategory}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {request.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Submitted {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <Badge className={STATUS_COLORS[request.status] || "bg-gray-100 text-gray-800"}>
                        {formatStatus(request.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

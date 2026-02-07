import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const categories = [
  {
    key: "maintenance",
    title: "Maintenance & Repairs",
    description: "Plumbing, electrical, heating, handyman, painting, carpentry, roofing",
    href: "/app/new/maintenance",
    icon: "🔧",
    trades: ["Plumber", "Electrician", "Handyman", "Painter", "Carpenter", "Roofer"],
    available: true,
  },
  {
    key: "renovations",
    title: "Renovations",
    description: "Kitchens, bathrooms, loft conversions, extensions, full refurbishments",
    href: "/app/new/renovations",
    icon: "🏠",
    trades: ["Builder", "Architect", "Kitchen fitter", "Bathroom fitter"],
    available: true,
  },
  {
    key: "cleaning",
    title: "Cleaning",
    description: "Regular cleaning, deep clean, end of tenancy, carpet, windows",
    href: "/app/new/cleaning",
    icon: "✨",
    trades: ["Cleaner", "Carpet cleaner", "Window cleaner"],
    available: true,
  },
  {
    key: "gardening",
    title: "Garden & Outdoor",
    description: "Maintenance, landscaping, tree surgery, fencing, patio cleaning",
    href: "/app/new/gardening",
    icon: "🌿",
    trades: ["Gardener", "Landscaper", "Tree surgeon", "Fencing specialist"],
    available: true,
  },
  {
    key: "security",
    title: "Security",
    description: "Alarms, CCTV, smart locks, intercoms, access control",
    href: "/app/new/security",
    icon: "🛡️",
    trades: ["Alarm engineer", "CCTV installer", "Locksmith"],
    available: true,
  },
  {
    key: "concierge",
    title: "Concierge",
    description: "Key holding, property checks, contractor access, inventory",
    href: "/app/new/concierge",
    icon: "🔑",
    trades: ["Property manager", "Key holder"],
    available: true,
  },
  {
    key: "design",
    title: "Design Services",
    description: "Architecture, interior design, structural engineering, planning & party wall surveys",
    href: "/app/new/design",
    icon: "📐",
    trades: ["Architect", "Interior designer", "Structural engineer", "Planning consultant", "Party wall surveyor"],
    available: true,
  },
];

export default function NewRequestPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/app" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">
          What do you need help with?
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Choose a category to get started
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((category) => (
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
                  <Button className="w-full bg-stone-900 hover:bg-stone-800">Start request</Button>
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
  );
}

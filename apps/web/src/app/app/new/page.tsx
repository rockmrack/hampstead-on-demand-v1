import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const categories = [
  {
    key: "maintenance",
    title: "Maintenance",
    description: "Repairs, emergencies, plumbing, electrical, small works",
    href: "/app/new/maintenance",
    available: true,
  },
  {
    key: "renovations",
    title: "Renovations",
    description: "Refurbishments, kitchens, bathrooms, loft conversions, extensions",
    href: "/app/new/renovations",
    available: false,
  },
  {
    key: "cleaning",
    title: "Cleaning",
    description: "Regular cleaning, deep cleaning, end of tenancy",
    href: "/app/new/cleaning",
    available: false,
  },
  {
    key: "gardening",
    title: "Gardening",
    description: "Garden maintenance, landscaping, tree work",
    href: "/app/new/gardening",
    available: false,
  },
  {
    key: "concierge",
    title: "Concierge",
    description: "Property management, key holding, access coordination",
    href: "/app/new/concierge",
    available: false,
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
                ? "hover:border-gray-400 cursor-pointer"
                : "opacity-60"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-lg">{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {category.available ? (
                <Link href={category.href}>
                  <Button className="w-full">Start request</Button>
                </Link>
              ) : (
                <Button className="w-full" disabled>
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

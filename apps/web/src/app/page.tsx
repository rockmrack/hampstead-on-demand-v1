import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <header className="bg-stone-900 text-white">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-medium tracking-tight">Hampstead On Demand</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-stone-300 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/start">
              <Button variant="outline" size="sm" className="bg-transparent border-stone-600 text-white hover:bg-stone-800">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
        
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight max-w-3xl">
            Property care for
            <span className="block font-medium">Hampstead homes</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-stone-300 max-w-2xl">
            From emergency repairs to full renovations. One app for everything your home needs.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href="/start">
              <Button size="lg" className="bg-white text-stone-900 hover:bg-stone-100 px-8">
                Request Access
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="bg-transparent border-stone-600 text-white hover:bg-stone-800 px-8">
                Member Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-stone-900">
            Two teams. <span className="font-medium">Every property need.</span>
          </h2>
          
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            {/* Maintenance Card */}
            <div className="bg-white rounded-2xl p-8 md:p-10 border border-stone-200 shadow-sm">
              <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-medium text-stone-900">Hampstead Maintenance</h3>
              <p className="mt-3 text-stone-600 leading-relaxed">
                Fast, reliable repairs and small works. Plumbing, electrical, heating, handyman services — usually attended within 48 hours.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                  Emergency repairs
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                  Plumbing & heating
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                  Electrical work
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                  General repairs
                </li>
              </ul>
            </div>

            {/* Renovations Card */}
            <div className="bg-white rounded-2xl p-8 md:p-10 border border-stone-200 shadow-sm">
              <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-medium text-stone-900">Hampstead Renovations</h3>
              <p className="mt-3 text-stone-600 leading-relaxed">
                Design and build for larger projects. Kitchens, bathrooms, loft conversions, extensions — from concept to completion.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                  Full refurbishments
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                  Kitchen & bathroom
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                  Loft conversions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                  Extensions
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28 bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-stone-900">
            How it <span className="font-medium">works</span>
          </h2>
          
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div>
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 font-medium">
                1
              </div>
              <h3 className="mt-4 text-lg font-medium text-stone-900">Submit a request</h3>
              <p className="mt-2 text-stone-600">
                Tell us what you need. Upload photos. Choose your preferred timing.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 font-medium">
                2
              </div>
              <h3 className="mt-4 text-lg font-medium text-stone-900">Get a quote</h3>
              <p className="mt-2 text-stone-600">
                We triage your request and provide a clear quote — often the same day.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 font-medium">
                3
              </div>
              <h3 className="mt-4 text-lg font-medium text-stone-900">Work completed</h3>
              <p className="mt-2 text-stone-600">
                Approve, pay, and track progress. All communication in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-stone-900">
            Currently serving <span className="font-medium">NW3, NW6 & NW8</span>
          </h2>
          <p className="mt-4 text-stone-600 max-w-xl mx-auto">
            Hampstead, Belsize Park, West Hampstead, South Hampstead, and St John's Wood.
          </p>
          <Link href="/start" className="inline-block mt-8">
            <Button size="lg" className="bg-stone-900 hover:bg-stone-800 px-8">
              Check Eligibility
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-lg font-medium">Hampstead On Demand</span>
              <p className="mt-1 text-sm text-stone-400">
                Property care for NW3, NW6 & NW8
              </p>
            </div>
            <div className="flex gap-6 text-sm text-stone-400">
              <Link href="/start" className="hover:text-white transition-colors">Get Started</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-stone-500">
            <span>© 2026 Hampstead On Demand. All rights reserved.</span>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-stone-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-stone-300 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

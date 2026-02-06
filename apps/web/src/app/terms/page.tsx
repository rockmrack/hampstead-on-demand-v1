import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Hampstead On Demand",
  description: "Terms and conditions for using Hampstead On Demand.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-stone-900 text-white">
        <nav className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-medium tracking-tight hover:text-stone-300 transition-colors"
          >
            Hampstead On Demand
          </Link>
          <Link
            href="/login"
            className="text-sm text-stone-300 hover:text-white transition-colors"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-medium text-stone-900">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Last updated: 6 February 2026
        </p>

        <div className="mt-10 prose prose-stone max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-medium text-stone-900">
              1. About these terms
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              These terms of service (&ldquo;Terms&rdquo;) govern your use of
              the Hampstead On Demand application and services
              (&ldquo;Service&rdquo;). By creating an account or using the
              Service, you agree to these Terms. If you do not agree, please do
              not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              2. The Service
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              Hampstead On Demand is a members-only platform for requesting
              property maintenance, renovation, cleaning, gardening, security,
              and concierge services in the NW3, NW6, and NW8 postcodes of
              London. All work is carried out by Hampstead Renovations and
              Hampstead Maintenance — we are not a marketplace and do not use
              third-party contractors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              3. Eligibility and membership
            </h2>
            <ul className="mt-3 list-disc list-inside text-stone-700 space-y-2">
              <li>
                The Service is available only to residents of properties in the
                NW3, NW6, and NW8 postcodes.
              </li>
              <li>
                You must apply for membership. Membership is granted at our
                discretion and may be revoked at any time.
              </li>
              <li>
                You are responsible for maintaining the security of your account
                credentials.
              </li>
              <li>
                You must be at least 18 years old to use the Service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              4. Service requests
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              When you submit a service request, you agree that:
            </p>
            <ul className="mt-3 list-disc list-inside text-stone-700 space-y-2">
              <li>
                All information you provide is accurate and complete.
              </li>
              <li>
                Photos and videos you upload are of the property in question and
                do not infringe on any third party&apos;s rights.
              </li>
              <li>
                Submitting a request does not guarantee that work will be
                undertaken. We will provide a quote where applicable, which you
                must approve before work begins.
              </li>
              <li>
                Emergency requests are triaged based on severity and our team&apos;s
                availability.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              5. Quotes and payments
            </h2>
            <ul className="mt-3 list-disc list-inside text-stone-700 space-y-2">
              <li>
                We will provide a written quote for non-emergency work before
                commencing.
              </li>
              <li>
                By accepting a quote, you authorise us to carry out the work at
                the quoted price.
              </li>
              <li>
                Payments are processed securely via Stripe. You agree to pay all
                charges associated with accepted quotes.
              </li>
              <li>
                A deposit may be required before work begins. The remaining
                balance is due upon completion.
              </li>
              <li>
                All prices are in GBP and inclusive of VAT where applicable.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              6. Your obligations
            </h2>
            <ul className="mt-3 list-disc list-inside text-stone-700 space-y-2">
              <li>
                Provide safe access to the property for our team to carry out
                work.
              </li>
              <li>
                Inform us of any hazards, access restrictions, or special
                conditions at the property.
              </li>
              <li>
                Use the messaging system respectfully. Abusive or threatening
                communication will not be tolerated.
              </li>
              <li>
                Do not use the Service for any unlawful purpose.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              7. Our liability
            </h2>
            <ul className="mt-3 list-disc list-inside text-stone-700 space-y-2">
              <li>
                We carry appropriate insurance for all work carried out by our
                teams.
              </li>
              <li>
                We will make good any defective workmanship within a reasonable
                period.
              </li>
              <li>
                Our liability is limited to the value of the work carried out
                under the relevant quote.
              </li>
              <li>
                We are not liable for losses arising from circumstances beyond
                our reasonable control.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              8. Intellectual property
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              All content, branding, and technology within the Service belong to
              us or our licensors. You may not copy, modify, or distribute any
              part of the Service without our written consent. Content you
              upload (photos, videos, messages) remains yours, but you grant us
              a licence to use it for providing the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              9. Termination
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              You may close your account at any time by contacting us. We may
              suspend or terminate your membership if you breach these Terms or
              for any other reasonable cause. Outstanding payments remain due
              upon termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              10. Changes to these terms
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              We may update these Terms from time to time. We will notify you of
              material changes via email or in-app notification. Continued use
              of the Service after changes constitutes acceptance of the updated
              Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              11. Governing law
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              These Terms are governed by the laws of England and Wales. Any
              disputes will be subject to the exclusive jurisdiction of the
              courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              12. Contact us
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              If you have questions about these Terms, contact us at{" "}
              <a
                href="mailto:hello@hampstead.house"
                className="text-stone-900 underline"
              >
                hello@hampstead.house
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-16 border-t border-stone-200 pt-8">
          <Link
            href="/"
            className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}

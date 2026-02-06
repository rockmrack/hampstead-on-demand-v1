import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Hampstead On Demand",
  description: "How we collect, use, and protect your personal data.",
};

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-medium text-stone-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-stone-500">
          Last updated: 6 February 2026
        </p>

        <div className="mt-10 prose prose-stone max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-medium text-stone-900">
              1. Who we are
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              Hampstead On Demand is a trading name of Hampstead Renovations Ltd
              and Hampstead Maintenance Ltd (together, &ldquo;we&rdquo;,
              &ldquo;us&rdquo;, &ldquo;our&rdquo;). We provide members-only
              property maintenance, renovation, and household services to
              residents in the NW3, NW6, and NW8 postcodes of London.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              2. Data we collect
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              We collect the following personal data when you use our service:
            </p>
            <ul className="mt-3 list-disc list-inside text-stone-700 space-y-2">
              <li>
                <strong>Account information:</strong> name, email address,
                postcode
              </li>
              <li>
                <strong>Property details:</strong> address, property type, number
                of bedrooms
              </li>
              <li>
                <strong>Service requests:</strong> descriptions, photos, and
                videos you upload
              </li>
              <li>
                <strong>Messages:</strong> communications between you and our
                team
              </li>
              <li>
                <strong>Payment information:</strong> processed securely via
                Stripe; we do not store card details
              </li>
              <li>
                <strong>Usage data:</strong> pages visited, device information,
                IP address
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              3. How we use your data
            </h2>
            <ul className="mt-3 list-disc list-inside text-stone-700 space-y-2">
              <li>To provide and manage property services you request</li>
              <li>To verify your eligibility (postcode check)</li>
              <li>To communicate with you about your requests and account</li>
              <li>To process payments and send invoices</li>
              <li>
                To improve our service and understand how members use the app
              </li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              4. Legal basis for processing
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              We process your data on the following grounds:
            </p>
            <ul className="mt-3 list-disc list-inside text-stone-700 space-y-2">
              <li>
                <strong>Contract:</strong> to fulfil services you have requested
              </li>
              <li>
                <strong>Legitimate interest:</strong> to improve our service and
                communicate with members
              </li>
              <li>
                <strong>Consent:</strong> for marketing communications (you may
                withdraw at any time)
              </li>
              <li>
                <strong>Legal obligation:</strong> to comply with applicable laws
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              5. Data sharing
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              We do not sell your personal data. We may share data with:
            </p>
            <ul className="mt-3 list-disc list-inside text-stone-700 space-y-2">
              <li>
                Our internal teams (Hampstead Renovations and Hampstead
                Maintenance) to deliver services
              </li>
              <li>
                Service providers: Vercel (hosting), Neon (database), Stripe
                (payments), email delivery services
              </li>
              <li>
                Legal authorities when required by law or to protect our rights
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              6. Data retention
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              We retain your personal data for as long as your membership is
              active and for up to 6 years after it ends, in line with legal
              requirements for property works and financial records. You may
              request deletion of your account and data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              7. Your rights
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              Under UK GDPR, you have the right to:
            </p>
            <ul className="mt-3 list-disc list-inside text-stone-700 space-y-2">
              <li>Access your personal data</li>
              <li>Rectify inaccurate data</li>
              <li>Erase your data (&ldquo;right to be forgotten&rdquo;)</li>
              <li>Restrict processing</li>
              <li>Data portability</li>
              <li>Object to processing</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-3 text-stone-700 leading-relaxed">
              To exercise these rights, email us at{" "}
              <a
                href="mailto:privacy@hampstead.house"
                className="text-stone-900 underline"
              >
                privacy@hampstead.house
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              8. Cookies and analytics
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              We use essential cookies for authentication and session management.
              We may use analytics tools to understand how members use the app.
              No third-party advertising cookies are used.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              9. Security
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              We take appropriate technical and organisational measures to
              protect your data, including encrypted connections (HTTPS),
              secure authentication, and access controls. All data is hosted
              within reputable cloud infrastructure providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              10. Changes to this policy
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              We may update this privacy policy from time to time. We will
              notify members of significant changes via email or in-app
              notification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-stone-900">
              11. Contact us
            </h2>
            <p className="mt-3 text-stone-700 leading-relaxed">
              If you have questions about this privacy policy or your personal
              data, please contact us at{" "}
              <a
                href="mailto:privacy@hampstead.house"
                className="text-stone-900 underline"
              >
                privacy@hampstead.house
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

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">ProposalCraft</Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-2">What we collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect your email address when you sign up, and the job descriptions you paste to generate proposals. We do not sell your data to any third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">How we use it</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your email is used solely to identify your account. Job descriptions are sent to an AI model to generate proposals and are stored only as part of your proposal history, which you can view in your dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Third-party services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use Supabase for database and authentication, Groq for AI generation, and Lemon Squeezy for payment processing. Each service has its own privacy policy governing their data use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use session cookies to keep you logged in. We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Data deletion</h2>
            <p className="text-muted-foreground leading-relaxed">
              To delete your account and all associated data, email us at{' '}
              <a href="mailto:singh2697.bs@gmail.com" className="underline">
                singh2697.bs@gmail.com
              </a>
              . We will process your request within 7 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about this policy?{' '}
              <a href="mailto:singh2697.bs@gmail.com" className="underline">
                singh2697.bs@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

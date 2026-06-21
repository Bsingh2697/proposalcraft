import Link from 'next/link'
import { Button } from '@/components/ui/button'

const benefits = [
  {
    title: 'Tailored to every job',
    description: 'Our AI reads the posting and writes a proposal that speaks directly to what the client asked for — not a generic template.',
  },
  {
    title: 'Under 10 seconds',
    description: 'Stop spending 20 minutes on a proposal that might not even get a reply. Generate in seconds, customize if needed, submit.',
  },
  {
    title: 'Three tones, one click',
    description: 'Professional, Friendly, or Bold — match your proposal voice to the client and the job type.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-lg">ProposalCraft</span>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Try free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Write winning freelance proposals<br />in 10 seconds
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
          Paste the job posting. ProposalCraft writes a tailored, professional proposal using AI. Stop staring at a blank page.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg">Start for free — no card needed</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">See pricing</Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-4">3 free proposals every month. Pro at $9/month.</p>
      </section>

      {/* Benefits */}
      <section className="max-w-4xl mx-auto px-4 py-16 border-t">
        <div className="grid md:grid-cols-3 gap-10">
          {benefits.map((b) => (
            <div key={b.title}>
              <h3 className="font-semibold text-lg mb-2">{b.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to win more contracts?</h2>
        <p className="text-muted-foreground mb-8">Join freelancers using ProposalCraft to land more clients.</p>
        <Link href="/signup">
          <Button size="lg">Create your free account</Button>
        </Link>
      </section>

      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ProposalCraft ·{' '}
        <Link href="/pricing" className="hover:underline">Pricing</Link>
      </footer>
    </div>
  )
}

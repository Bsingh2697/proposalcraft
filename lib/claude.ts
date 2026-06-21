import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Free users get haiku (fast, cheap ~$0.001/proposal).
// Pro users get sonnet (higher quality output).
const MODELS = {
  free: 'claude-haiku-4-5',
  pro: 'claude-sonnet-4-6',
} as const

const SYSTEM_PROMPT = `You are an expert freelance proposal writer with 10+ years of experience winning contracts on Upwork, Fiverr, and Toptal.

Given a job description and a freelancer's skills, write a concise, personalized proposal (150–250 words) that:
1. Opens with a hook that references something specific from the job posting — show you read it
2. Highlights 1–2 of the freelancer's most relevant skills with a concrete proof point or past result
3. Briefly explains your approach to solving their specific problem
4. Ends with a clear, low-friction call to action (e.g., "I'd love to jump on a quick call this week")

Adjust tone based on the instruction: professional = formal but warm, friendly = conversational, bold = confident and direct.

Return only the proposal text. No labels, no explanations, no "Here is your proposal:" prefix.`

interface GenerateProposalParams {
  jobDescription: string
  skills: string
  tone: 'professional' | 'friendly' | 'bold'
  plan: 'free' | 'pro'
}

export async function generateProposal({
  jobDescription,
  skills,
  tone,
  plan,
}: GenerateProposalParams): Promise<string> {
  const message = await client.messages.create({
    model: MODELS[plan],
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Job description:\n${jobDescription}\n\nMy skills: ${skills}\n\nTone: ${tone}`,
      },
    ],
  })

  const block = message.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
  return block.text
}

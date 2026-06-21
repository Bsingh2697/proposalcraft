import Groq from 'groq-sdk'

let _client: Groq | null = null

function getClient(): Groq {
  if (!_client) _client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _client
}

// Both tiers use llama-3.3-70b — fast, free, and high quality for writing tasks.
// Swap to a larger model for pro users once on a paid Groq plan if needed.
const MODEL = 'llama-3.3-70b-versatile'

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
}: GenerateProposalParams): Promise<string> {
  const completion = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: 500,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Job description:\n${jobDescription}\n\nMy skills: ${skills}\n\nTone: ${tone}`,
      },
    ],
  })

  const text = completion.choices[0]?.message?.content
  if (!text) throw new Error('No response from Groq')
  return text
}

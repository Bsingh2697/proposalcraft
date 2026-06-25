import Groq from 'groq-sdk'

let _client: Groq | null = null

function getClient(): Groq {
  if (!_client) _client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _client
}

const MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `You are an expert freelance proposal writer with 10+ years of experience winning contracts on Upwork, Fiverr, and Toptal.

Given a job description and a freelancer's skills, write a personalized proposal that:
1. Opens with a hook that references something specific from the job posting — show you read it
2. Highlights 1–2 of the freelancer's most relevant skills with a concrete proof point or past result
3. Briefly explains your approach to solving their specific problem
4. Ends with a clear, low-friction call to action (e.g., "I'd love to jump on a quick call this week")

Adjust tone based on the instruction: professional = formal but warm, friendly = conversational, bold = confident and direct.
Stick strictly to the target word count given.

Return only the proposal text. No labels, no explanations, no "Here is your proposal:" prefix.`

const LENGTH_CONFIG = {
  short:  { guide: '80–120 words',   maxTokens: 300 },
  medium: { guide: '150–200 words',  maxTokens: 500 },
  long:   { guide: '250–300 words',  maxTokens: 700 },
}

interface GenerateProposalParams {
  jobDescription: string
  skills: string
  tone: 'professional' | 'friendly' | 'bold'
  length: 'short' | 'medium' | 'long'
  plan: 'free' | 'pro'
}

export async function generateProposal({
  jobDescription,
  skills,
  tone,
  length,
}: GenerateProposalParams): Promise<string> {
  const { guide, maxTokens } = LENGTH_CONFIG[length]
  const completion = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Job description:\n${jobDescription}\n\nMy skills: ${skills}\n\nTone: ${tone}\nTarget length: ${guide}`,
      },
    ],
  })

  const text = completion.choices[0]?.message?.content
  if (!text) throw new Error('No response from Groq')
  return text
}

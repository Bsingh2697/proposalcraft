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

const PLATFORM_CONTEXT: Record<string, string> = {
  upwork: 'Platform: Upwork. Be direct and concise — Upwork clients skim fast. Reference something specific in the first sentence. Avoid generic openers like "I am writing to apply..."',
  fiverr: 'Platform: Fiverr. Lead immediately with your specialization. Keep it punchy.',
  linkedin: 'Platform: LinkedIn InMail. More formal and polished. Focus on mutual professional value.',
  general: '',
}

const LENGTH_CONFIG = {
  short:  { guide: '80–120 words',   maxTokens: 300 },
  medium: { guide: '150–200 words',  maxTokens: 500 },
  long:   { guide: '250–300 words',  maxTokens: 700 },
}

export interface GenerateProposalParams {
  jobDescription: string
  skills: string
  tone: 'professional' | 'friendly' | 'bold'
  length: 'short' | 'medium' | 'long'
  platform: 'upwork' | 'fiverr' | 'linkedin' | 'general'
  plan: 'free' | 'pro'
}

export async function generateProposal({
  jobDescription,
  skills,
  tone,
  length,
  platform,
}: GenerateProposalParams): Promise<string> {
  const { guide, maxTokens } = LENGTH_CONFIG[length]
  const platformHint = PLATFORM_CONTEXT[platform] ?? ''

  const completion = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          `Job description:\n${jobDescription}`,
          `My skills: ${skills}`,
          `Tone: ${tone}`,
          `Target length: ${guide}`,
          platformHint,
        ].filter(Boolean).join('\n'),
      },
    ],
  })

  const text = completion.choices[0]?.message?.content
  if (!text) throw new Error('No response from Groq')
  return text
}

export interface ProposalScore {
  score: number
  strengths: string[]
  improvements: string[]
}

export async function scoreProposal(proposalText: string): Promise<ProposalScore> {
  const completion = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: 300,
    messages: [
      {
        role: 'system',
        content: 'You are a freelance proposal quality reviewer. Respond with ONLY valid JSON (no markdown, no extra text): {"score": <1-10>, "strengths": ["...", "..."], "improvements": ["...", "..."]}. Keep each item under 12 words.',
      },
      { role: 'user', content: proposalText },
    ],
  })

  const raw = completion.choices[0]?.message?.content ?? ''
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch?.[0] ?? raw)
    return {
      score: Math.min(10, Math.max(1, Number(parsed.score) || 7)),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : [],
    }
  } catch {
    return { score: 7, strengths: [], improvements: [] }
  }
}

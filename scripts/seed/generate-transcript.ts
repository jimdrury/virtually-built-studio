export type TranscriptEntry = {
  _type: 'transcriptEntry'
  _key: string
  start: number
  speaker: string
  text: string
}

const PARAGRAPH_TEMPLATES = [
  (title: string, speaker: string) =>
    `${speaker} opens the conversation by framing why ${title.toLowerCase()} matters for teams shipping at scale.`,
  (title: string, speaker: string) =>
    `We start with the constraints that make ${title.toLowerCase()} harder than it looks on a whiteboard.`,
  (_title: string, speaker: string) =>
    `${speaker} walks through a recent example where small assumptions compounded into a production incident.`,
  (title: string, speaker: string) =>
    `The discussion turns to tradeoffs — speed versus durability — and how ${title.toLowerCase()} shows up in day-to-day decisions.`,
  (_title: string, speaker: string) =>
    `${speaker} shares practical patterns teams can adopt without rewriting everything at once.`,
  (title: string, speaker: string) =>
    `We dig into observability, failure modes, and what "good enough" looks like when ${title.toLowerCase()} is the goal.`,
  (_title: string, speaker: string) =>
    `${speaker} pushes back on silver-bullet tooling and argues for habits that survive org change.`,
  (title: string, speaker: string) =>
    `The conversation covers how to communicate these ideas to stakeholders who only see the happy path.`,
  (_title: string, speaker: string) =>
    `${speaker} offers a checklist for reviewing designs before they become expensive to unwind.`,
  (title: string, speaker: string) =>
    `We close by connecting ${title.toLowerCase()} back to product craft — and what listeners can try this week.`,
]

export const SEED_YOUTUBE_URL = 'https://www.youtube.com/watch?v=Bp2ai2MD4Mk'

export const generateTranscript = ({
  durationMinutes,
  speakers,
  title,
}: {
  durationMinutes: number
  speakers: string[]
  title: string
}): TranscriptEntry[] => {
  if (speakers.length === 0) {
    speakers = ['Host']
  }

  const paragraphCount = Math.min(
    PARAGRAPH_TEMPLATES.length,
    Math.max(8, Math.round(durationMinutes / 4)),
  )
  const totalSeconds = durationMinutes * 60
  const interval = Math.floor(totalSeconds / paragraphCount)

  return Array.from({ length: paragraphCount }, (_, index) => {
    const speaker = speakers[index % speakers.length]
    const template = PARAGRAPH_TEMPLATES[index % PARAGRAPH_TEMPLATES.length]

    return {
      _type: 'transcriptEntry' as const,
      _key: `transcript-${String(index).padStart(2, '0')}`,
      start: index * interval,
      speaker,
      text: template(title, speaker),
    }
  })
}

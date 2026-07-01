export type EpisodeDefinition = {
  title: string
  durationMinutes: number
}

export const EPISODE_DEFINITIONS: EpisodeDefinition[] = [
  {title: 'Welcome to Virtually Built', durationMinutes: 20},
  {title: 'Gemini Enterprise', durationMinutes: 20},
  {title: 'The state of AI Coding', durationMinutes: 25},
  {title: 'Claude Code in production', durationMinutes: 42},
  {title: 'Building agents with the ADK', durationMinutes: 38},
  {title: 'Why local-first still matters', durationMinutes: 38},
  {title: 'The craft of incremental delivery', durationMinutes: 52},
  {title: 'Platform teams without bottlenecks', durationMinutes: 44},
  {title: 'Observability without the overhead', durationMinutes: 41},
  {
    title: 'Designing for durability in distributed systems',
    durationMinutes: 47,
  },
  {title: 'Design systems at scale', durationMinutes: 48},
  {title: 'Latency budgets engineers actually trust', durationMinutes: 36},
  {title: 'Evals that catch real regressions', durationMinutes: 39},
  {title: 'Shipping with AI code review', durationMinutes: 43},
  {title: 'Context windows and long-running agents', durationMinutes: 45},
  {title: 'MCP servers in real products', durationMinutes: 40},
  {title: 'From prototype to production with Cursor', durationMinutes: 46},
  {title: 'Structured outputs vs tool calling', durationMinutes: 37},
  {title: 'The state of open models in 2026', durationMinutes: 50},
  {title: 'Voice agents for developer tools', durationMinutes: 34},
  {title: 'Redis, queues, and agent memory', durationMinutes: 42},
  {title: 'Testing non-deterministic systems', durationMinutes: 41},
  {title: 'Guardrails without killing velocity', durationMinutes: 38},
  {title: 'Monorepos and AI-assisted refactors', durationMinutes: 44},
  {title: 'Semantic search for codebases', durationMinutes: 39},
  {title: 'Fine-tuning vs prompting for domain tasks', durationMinutes: 48},
  {title: 'Building a design system with AI', durationMinutes: 43},
  {title: 'Incident response when agents fail', durationMinutes: 36},
  {title: 'Cost control for LLM-heavy apps', durationMinutes: 40},
  {title: 'Human-in-the-loop workflows', durationMinutes: 42},
  {title: 'Multi-agent orchestration patterns', durationMinutes: 45},
  {title: 'Document ingestion at scale', durationMinutes: 37},
  {title: 'Privacy and on-device inference', durationMinutes: 41},
  {title: 'Developer experience for AI platforms', durationMinutes: 46},
  {title: 'What we learned shipping season two', durationMinutes: 35},
  {title: 'The roadmap for Virtually Built', durationMinutes: 28},
]

export const EPISODE_COUNT = EPISODE_DEFINITIONS.length

export const slugifyTitle = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const formatEpisodeNumber = (episodeNumber: number) =>
  String(episodeNumber).padStart(3, '0')

export const episodeDocumentId = (episodeNumber: number) =>
  formatEpisodeNumber(episodeNumber)

export const buildEpisodeSlug = (episodeNumber: number, title: string) =>
  `${formatEpisodeNumber(episodeNumber)}-${slugifyTitle(title)}`

import {getCliClient} from 'sanity/cli'

import {buildEpisodeSlug, episodeDocumentId} from '../lib/episode-slug'
import {assignGuestsToEpisodes} from './seed/assign-guests'
import {EPISODE_COUNT, EPISODE_DEFINITIONS} from './seed/episode-definitions'
import {generateTranscript, SEED_YOUTUBE_URL} from './seed/generate-transcript'
import {GUEST_DEFINITIONS} from './seed/guest-definitions'

const ARTWORK_ASSET_REF =
  'image-cbd1fa822dbfd1848267c8dbe8f152f7286011ce-1376x768-jpg'
const HOST_JIM_REF = '08f92296-f091-4fc6-a920-857a42f251db'
const HOST_MATTHEW_REF = 'host-matthew-law'
const HOST_SPEAKER_NAMES = ['Jim Drury', 'Matthew Law']
const LEGACY_EPISODE_IDS = [
  '6e76fa04-9b80-4ccd-8dc1-234dabca68e8',
  '35ca8847-a097-448b-b8f0-81fcadcc6f96',
  '97500ae0-c08e-46e4-8007-3adde61d3fac',
]

const INITIAL_PUBLISHED_AT = new Date('2026-07-05T09:00:00.000Z')
const DAYS_BETWEEN_EARLY_EPISODES = 1
const DAYS_BETWEEN_LATER_EPISODES = 14

const guestNameById = new Map(GUEST_DEFINITIONS.map((guest) => [guest.id, guest.name]))

const publishedAtForEpisode = (episodeNumber: number) => {
  const date = new Date(INITIAL_PUBLISHED_AT)

  if (episodeNumber <= 3) {
    date.setUTCDate(date.getUTCDate() + (episodeNumber - 1) * DAYS_BETWEEN_EARLY_EPISODES)
    return date.toISOString()
  }

  date.setUTCDate(
    date.getUTCDate() +
      2 * DAYS_BETWEEN_EARLY_EPISODES +
      (episodeNumber - 3) * DAYS_BETWEEN_LATER_EPISODES,
  )

  return date.toISOString()
}

const formatGuestList = (guestNames: string[]) => {
  if (guestNames.length === 0) {
    return ''
  }

  if (guestNames.length === 1) {
    return guestNames[0]
  }

  if (guestNames.length === 2) {
    return `${guestNames[0]} and ${guestNames[1]}`
  }

  return `${guestNames.slice(0, -1).join(', ')}, and ${guestNames[guestNames.length - 1]}`
}

const showNotesForEpisode = (title: string, guestNames: string[]) => {
  const intro =
    guestNames.length > 0
      ? `In this episode we talk with ${formatGuestList(guestNames)} about ${title.toLowerCase()}.`
      : `In this episode we explore ${title.toLowerCase()}.`

  return [
    {
      _type: 'block',
      _key: 'intro',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'intro-span',
          text: intro,
          marks: [],
        },
      ],
    },
  ]
}

const guestReferencesForEpisode = (guestIds: string[]) =>
  guestIds.map((guestId) => ({
    _type: 'reference' as const,
    _ref: guestId,
    _key: guestId,
  }))

const buildGuestDocument = (definition: (typeof GUEST_DEFINITIONS)[number]) => ({
  _id: definition.id,
  _type: 'guest',
  name: definition.name,
  role: definition.role,
})

const buildEpisodeDocument = (
  episodeNumber: number,
  definition: (typeof EPISODE_DEFINITIONS)[number],
  guestIds: string[],
) => {
  const slug = buildEpisodeSlug(episodeNumber, definition.title)
  const guestNames = guestIds
    .map((guestId) => guestNameById.get(guestId))
    .filter((name): name is string => Boolean(name))
  const speakers = [...HOST_SPEAKER_NAMES, ...guestNames]

  return {
    _id: episodeDocumentId(episodeNumber),
    _type: 'episode',
    episodeNumber,
    title: definition.title,
    slug: {
      _type: 'slug',
      current: slug,
    },
    guests: guestReferencesForEpisode(guestIds),
    hosts: [
      {_type: 'reference', _ref: HOST_JIM_REF, _key: 'host-jim'},
      {_type: 'reference', _ref: HOST_MATTHEW_REF, _key: 'host-matthew'},
    ],
    publishedAt: publishedAtForEpisode(episodeNumber),
    durationMinutes: definition.durationMinutes,
    artwork: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: ARTWORK_ASSET_REF,
      },
      alt: `${definition.title} artwork`,
    },
    showNotes: showNotesForEpisode(definition.title, guestNames),
    youtubeUrl: SEED_YOUTUBE_URL,
    transcript: generateTranscript({
      durationMinutes: definition.durationMinutes,
      speakers,
      title: definition.title,
    }),
  }
}

const seedEpisodes = async () => {
  if (EPISODE_DEFINITIONS.length !== EPISODE_COUNT) {
    throw new Error('Episode definitions and count are out of sync.')
  }

  const client = getCliClient()
  const guestAssignments = assignGuestsToEpisodes(
    EPISODE_COUNT,
    GUEST_DEFINITIONS.map((guest) => guest.id),
  )
  const transaction = client.transaction()

  for (const guest of GUEST_DEFINITIONS) {
    transaction.createOrReplace(buildGuestDocument(guest))
  }

  for (const [index, definition] of EPISODE_DEFINITIONS.entries()) {
    const episodeNumber = index + 1
    const guestIds = guestAssignments.get(episodeNumber) ?? []

    transaction.createOrReplace(
      buildEpisodeDocument(episodeNumber, definition, guestIds),
    )
  }

  await transaction.commit()

  const legacyEpisodes = await client.fetch<
    Array<{_id: string; episodeNumber?: number; title?: string}>
  >(
    `*[_type == "episode" && _id in $legacyIds]{
      _id,
      episodeNumber,
      title
    }`,
    {legacyIds: LEGACY_EPISODE_IDS},
  )

  if (legacyEpisodes.length > 0) {
    const cleanup = client.transaction()

    for (const episode of legacyEpisodes) {
      cleanup.delete(episode._id)
    }

    await cleanup.commit()

    console.warn(
      `Removed ${legacyEpisodes.length} legacy duplicate episode documents with random IDs.`,
    )
  }

  const prefixedEpisodes = await client.fetch<Array<{_id: string}>>(
    `*[_type == "episode" && _id match "episode-*"]{_id}`,
  )

  if (prefixedEpisodes.length > 0) {
    const cleanup = client.transaction()

    for (const episode of prefixedEpisodes) {
      cleanup.delete(episode._id)
    }

    await cleanup.commit()

    console.warn(
      `Removed ${prefixedEpisodes.length} episode documents with the old episode- ID prefix.`,
    )
  }

  const staleDraftEpisodes = await client.fetch<Array<{_id: string}>>(
    `*[_type == "episode" && _id in path("drafts.**")]{_id}`,
  )

  if (staleDraftEpisodes.length > 0) {
    const cleanup = client.transaction()

    for (const episode of staleDraftEpisodes) {
      cleanup.delete(episode._id)
    }

    await cleanup.commit()

    console.warn(
      `Removed ${staleDraftEpisodes.length} stale draft episode documents that were overriding published content.`,
    )
  }

  const [episodeCount, guestCount, episodesWithGuests, episodesWithYoutube] =
    await Promise.all([
      client.fetch<number>('count(*[_type == "episode"])'),
      client.fetch<number>('count(*[_type == "guest"])'),
      client.fetch<number>('count(*[_type == "episode" && count(guests) > 0])'),
      client.fetch<number>('count(*[_type == "episode" && defined(youtubeUrl)])'),
    ])

  console.log(`Seeded ${GUEST_DEFINITIONS.length} guests.`)
  console.log(`Seeded ${EPISODE_COUNT} episodes with stable IDs 001 … 036.`)
  console.log(
    `${episodesWithGuests} of ${episodeCount} episodes include guests (${Math.round((episodesWithGuests / episodeCount) * 100)}%).`,
  )
  console.log(
    `${episodesWithYoutube} of ${episodeCount} episodes include a YouTube URL.`,
  )
  console.log(`Dataset now contains ${episodeCount} episodes and ${guestCount} guests.`)
}

seedEpisodes().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})

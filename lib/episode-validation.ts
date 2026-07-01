import type {SlugValidationContext, ValidationContext} from 'sanity'

export const SANITY_API_VERSION = '2026-07-01'

const getDocumentIdPair = (documentId: string | undefined) => {
  if (!documentId) {
    return null
  }

  const published = documentId.replace(/^drafts\./, '')

  return {
    draft: `drafts.${published}`,
    published,
  }
}

export const isUniqueEpisodeNumber = async (
  episodeNumber: number | undefined,
  context: ValidationContext,
) => {
  if (typeof episodeNumber !== 'number') {
    return true
  }

  const ids = getDocumentIdPair(context.document?._id)

  if (!ids) {
    return true
  }

  const client = context.getClient({apiVersion: SANITY_API_VERSION})
  const count = await client.fetch<number>(
    `count(*[_type == "episode" && episodeNumber == $episodeNumber && !(_id in [$draft, $published])])`,
    {
      episodeNumber,
      draft: ids.draft,
      published: ids.published,
    },
  )

  return count === 0 ? true : 'Episode number is already used by another episode'
}

export const isUniqueEpisodeSlug = async (slug: string, context: SlugValidationContext) => {
  if (!slug) {
    return true
  }

  const ids = getDocumentIdPair(context.document?._id)

  if (!ids) {
    return true
  }

  const client = context.getClient({apiVersion: SANITY_API_VERSION})
  const count = await client.fetch<number>(
    `count(*[_type == "episode" && slug.current == $slug && !(_id in [$draft, $published])])`,
    {
      slug,
      draft: ids.draft,
      published: ids.published,
    },
  )

  return count === 0
}

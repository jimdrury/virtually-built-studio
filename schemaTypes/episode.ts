import {ComposeIcon, DocumentTextIcon, ImageIcon, PlayIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {TranscriptEntryPreview} from '../components/transcript-entry-preview'
import {buildEpisodeSlug} from '../lib/episode-slug'
import {isUniqueEpisodeNumber, isUniqueEpisodeSlug} from '../lib/episode-validation'

const defaultHosts = [
  {_type: 'reference', _ref: 'host-matthew-law', _key: 'host-matthew-law'},
]

const collectEpisodeSpeakerRefs = (document: Record<string, unknown> | undefined) => {
  const refs: string[] = []

  for (const field of ['hosts', 'guests'] as const) {
    const entries = document?.[field]

    if (!Array.isArray(entries)) {
      continue
    }

    for (const entry of entries) {
      if (
        entry &&
        typeof entry === 'object' &&
        '_ref' in entry &&
        typeof entry._ref === 'string'
      ) {
        refs.push(entry._ref)
      }
    }
  }

  return refs
}

export const episode = defineType({
  name: 'episode',
  title: 'Episode',
  type: 'document',
  icon: PlayIcon,
  groups: [
    {name: 'details', title: 'Details', default: true},
    {name: 'media', title: 'Media', icon: ImageIcon},
    {name: 'showNotes', title: 'Show notes', icon: DocumentTextIcon},
    {name: 'transcript', title: 'Transcript', icon: ComposeIcon},
  ],
  fields: [
    defineField({
      name: 'episodeNumber',
      title: 'Episode number',
      type: 'number',
      group: 'details',
      description: 'Must be unique across all episodes.',
      validation: (rule) =>
        rule
          .required()
          .integer()
          .positive()
          .custom((value, context) => isUniqueEpisodeNumber(value, context)),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'details',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'details',
      description:
        'Generated from the episode number and title. Regenerate after changing the title — changing the slug breaks existing links.',
      options: {
        source: (document): string => {
          const episodeNumber = document?.episodeNumber
          const title = document?.title

          if (typeof episodeNumber !== 'number' || typeof title !== 'string') {
            return typeof title === 'string' ? title : ''
          }

          return buildEpisodeSlug(episodeNumber, title)
        },
        slugify: (input) => String(input),
        isUnique: isUniqueEpisodeSlug,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'details',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Duration (minutes)',
      type: 'number',
      group: 'details',
      description: 'Whole minutes. Used on episode cards and in structured data.',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'hosts',
      title: 'Hosts',
      type: 'array',
      group: 'details',
      of: [defineArrayMember({type: 'reference', to: [{type: 'host'}]})],
      initialValue: defaultHosts,
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'guests',
      title: 'Guests',
      type: 'array',
      group: 'details',
      of: [defineArrayMember({type: 'reference', to: [{type: 'guest'}]})],
    }),
    defineField({
      name: 'artwork',
      title: 'Artwork',
      type: 'image',
      group: 'media',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) =>
            rule.required().warning('Alt text is important for accessibility'),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      group: 'media',
      description: 'Optional while preparing an episode. Required before publishing to the site.',
      validation: (rule) =>
        rule
          .uri({
            scheme: ['https'],
            allowRelative: false,
          })
          .custom((value) => {
            if (typeof value !== 'string' || value.length === 0) {
              return true
            }

            try {
              const hostname = new URL(value).hostname.replace(/^www\./, '')

              if (hostname === 'youtube.com' || hostname === 'youtu.be') {
                return true
              }

              return 'Must be a YouTube URL (youtube.com or youtu.be)'
            } catch {
              return 'Must be a valid URL'
            }
          }),
    }),
    defineField({
      name: 'showNotes',
      title: 'Show notes',
      type: 'array',
      group: 'showNotes',
      description:
        'Full episode write-up. The site uses the first paragraph as the “About this episode” excerpt.',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'transcript',
      title: 'Transcript',
      type: 'array',
      group: 'transcript',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'transcriptEntry',
          fields: [
            defineField({
              name: 'start',
              title: 'Start (seconds)',
              type: 'number',
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: 'speaker',
              title: 'Speaker',
              type: 'reference',
              to: [{type: 'host'}, {type: 'guest'}],
              options: {
                filter: ({document}) => {
                  const allowedIds = collectEpisodeSpeakerRefs(document)

                  if (allowedIds.length === 0) {
                    return {filter: 'false'}
                  }

                  return {
                    filter: '_id in $allowedIds',
                    params: {allowedIds},
                  }
                },
              },
              validation: (rule) =>
                rule.required().custom((value, context) => {
                  const ref =
                    value &&
                    typeof value === 'object' &&
                    '_ref' in value &&
                    typeof value._ref === 'string'
                      ? value._ref
                      : undefined

                  if (!ref) {
                    return true
                  }

                  const allowedIds = collectEpisodeSpeakerRefs(
                    context.document as Record<string, unknown> | undefined,
                  )

                  if (allowedIds.length === 0) {
                    return 'Add at least one host or guest before choosing a speaker'
                  }

                  return allowedIds.includes(ref)
                    ? true
                    : 'Speaker must be one of this episode’s hosts or guests'
                }),
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
          components: {
            preview: TranscriptEntryPreview,
          },
          preview: {
            select: {
              start: 'start',
              speaker: 'speaker',
              text: 'text',
            },
          },
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Published date (newest first)',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
    {
      title: 'Episode number (newest first)',
      name: 'episodeNumberDesc',
      by: [{field: 'episodeNumber', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      episodeNumber: 'episodeNumber',
      media: 'artwork',
    },
    prepare({title, episodeNumber, media}) {
      const number =
        typeof episodeNumber === 'number'
          ? String(episodeNumber).padStart(3, '0')
          : undefined

      return {
        title: number ? `${number} · ${title}` : title,
        media,
      }
    },
  },
})

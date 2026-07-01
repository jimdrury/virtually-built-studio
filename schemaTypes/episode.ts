import {PlayIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {buildEpisodeSlug} from '../lib/episode-slug'

const defaultHosts = [
  {_type: 'reference', _ref: 'host-matthew-law', _key: 'host-matthew-law'},
]

export const episode = defineType({
  name: 'episode',
  title: 'Episode',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'episodeNumber',
      title: 'Episode number',
      type: 'number',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
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
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'guests',
      title: 'Guests',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'guest'}]})],
    }),
    defineField({
      name: 'hosts',
      title: 'Hosts',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'host'}]})],
      initialValue: defaultHosts,
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Duration (minutes)',
      type: 'number',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'artwork',
      title: 'Artwork',
      type: 'image',
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
      name: 'showNotes',
      title: 'Show notes',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      validation: (rule) =>
        rule
          .required()
          .uri({
            scheme: ['https'],
            allowRelative: false,
          })
          .custom((value) => {
            if (typeof value !== 'string') {
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
      name: 'transcript',
      title: 'Transcript',
      type: 'array',
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
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              start: 'start',
              speaker: 'speaker',
              text: 'text',
            },
            prepare({start, speaker, text}) {
              const timestamp =
                typeof start === 'number'
                  ? `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`
                  : '00:00'

              return {
                title: `${timestamp} · ${speaker ?? 'Unknown'}`,
                subtitle: typeof text === 'string' ? text.slice(0, 80) : undefined,
              }
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

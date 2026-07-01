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

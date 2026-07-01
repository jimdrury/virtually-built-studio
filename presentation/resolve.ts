import {
  defineDocuments,
  defineLocations,
  type PresentationPluginOptions,
} from 'sanity/presentation'

export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([
    {
      route: '/watch/:slug',
      filter: `_type == "episode" && slug.current == $slug`,
    },
  ]),
  locations: {
    episode: defineLocations({
      select: {
        title: 'title',
        slug: 'slug.current',
      },
      resolve: (doc) => {
        const locations = [
          {
            title: 'All episodes',
            href: '/episodes',
          },
        ]

        if (typeof doc?.slug === 'string' && doc.slug.length > 0) {
          locations.unshift({
            title: doc.title ?? 'Untitled',
            href: `/watch/${doc.slug}`,
          })
        }

        return {locations}
      },
    }),
  },
}

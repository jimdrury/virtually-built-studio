import {PlayIcon, UsersIcon} from '@sanity/icons'
import type {StructureResolver} from 'sanity/structure'

const pinnedTypes = new Set(['episode', 'guest'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Episodes')
        .icon(PlayIcon)
        .child(
          S.documentTypeList('episode')
            .title('Episodes')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}]),
        ),
      S.listItem()
        .title('Guests')
        .icon(UsersIcon)
        .child(S.documentTypeList('guest').title('Guests')),
      ...S.documentTypeListItems().filter((item) => !pinnedTypes.has(item.getId() ?? '')),
    ])

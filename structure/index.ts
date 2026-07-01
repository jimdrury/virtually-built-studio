import {PlayIcon} from '@sanity/icons'
import type {StructureResolver} from 'sanity/structure'

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
      ...S.documentTypeListItems().filter((item) => item.getId() !== 'episode'),
    ])

// @flow
import { getParents } from './utils'
import type { Options, LoadStoryOptions } from './picturebook.types'

export default function getDefaults<P: Options | LoadStoryOptions>(
  userOptions: $Shape<P> = {}
): P {
  return {
    baseUrl: 'http://localhost:6006',
    flattenFolders: ['__screenshots__', '__snapshots__'],
    filter: {
      screenshots: file => file.endsWith('.png'),
      tests: file => /\.(spec|test)\.(t|j)sx?$/.test(file || ''),
      docs: file => /\.md$/.test(file || ''),
      story: (file, target) =>
        new RegExp(`${target}\\.(t|j)sx?$`).test(file || ''),
      ...userOptions.filter,
    },
    findKindAndStory: story => ({
      selectedKind: getParents(story),
      selectedStory: story.title,
    }),
    ...userOptions,
  }
}

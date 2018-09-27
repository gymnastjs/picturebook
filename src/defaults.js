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
      tests: file => file.endsWith('.spec.js') || file.endsWith('.test.js'),
      docs: file => file.endsWith('.md'),
      story: (file, target) => file.endsWith(`${target}.js`),
      ...userOptions.filter,
    },
    findKindAndStory: story => ({
      selectedKind: getParents(story),
      selectedStory: story.title,
    }),
    ...userOptions,
  }
}

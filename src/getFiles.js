// @flow
import type { Options, StoryPaths } from './picturebook.types'
import { folderStructure } from './utils'
import defaults from './defaults'

export default function getFiles(
  userOptions: $Shape<Options>
): Array<StoryPaths> {
  return folderStructure({ ...defaults, ...userOptions })
}

// @flow
import type { Options, StoryPaths } from './picturebook.types'
import { folderStructure } from './utils'
import getDefaults from './defaults'

export default function getFiles(
  userOptions: $Shape<Options>
): Array<StoryPaths> {
  return folderStructure(getDefaults(userOptions))
}

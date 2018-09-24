// @flow
import type { StoryPaths } from './picturebook.types'
import { folderStructure } from './utils'
import defaults from './defaults'

export default function getFiles(userOptions: {
  stories: any,
  flattenFolders: $ReadOnlyArray<string>,
  baseUrl?: string,
}): Array<StoryPaths> {
  return folderStructure({ ...defaults, ...userOptions })
}

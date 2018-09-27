// @flow
import { groupBy, map, mapValues, compact } from 'lodash'
import type { Options, StoryPaths } from '../picturebook.types'

function removeFolderInPath(file: string, folder: string): string {
  return file.replace(folder, '').replace(/(\\\\|\/\/)/g, '/')
}

function groupRelatedFiles(
  filename: string,
  flattenFolders: $ReadOnlyArray<string>
): string {
  const relativePath = filename.replace(/^(\.\/|\/)/, '')
  const flattenedPath = flattenFolders
    .reduce(removeFolderInPath, relativePath)
    .replace(/^(\.\/|\/)/, '')

  // https://regex101.com/r/dqUZ6u/2
  return (flattenedPath.match(/([^.]+)[a-z.0-9]+$/) || [])[1]
}

function deKebab(text) {
  return text
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map((word = '') => {
      const first = (word[0] || '').toUpperCase()

      return `${first}${word.slice(1)}`
    })
    .join(' ')
}

// https://regex101.com/r/tHmeSq/1
function groupFilesBySubExtension(
  filenames: $ReadOnlyArray<string>
): {| [group: string]: string |} {
  return mapValues(
    groupBy(
      filenames,
      filename => (filename.match(/[^.]+\.(.+)\.[a-z]+$/) || [])[1]
    ),
    ([filename]) => filename
  )
}

function createRelatedFileGroup(
  files: $ReadOnlyArray<string>,
  name: string,
  filter: $PropertyType<Options, 'filter'>
): ?$Diff<StoryPaths, { +url: ?string }> {
  const parents = name.split('/')
  const story = parents.pop()
  const storyPath = files.find(file => filter.story(file, name))

  if (!storyPath) {
    return undefined
  }

  return {
    name,
    parents,
    title: deKebab(story),
    path: storyPath,
    screenshots: groupFilesBySubExtension(files.filter(filter.screenshots)),
    tests: groupFilesBySubExtension(files.filter(filter.tests)),
    doc: files.find(filter.docs),
  }
}

function addUrl(
  story: ?$Diff<StoryPaths, { +url: ?string }>,
  baseUrl: ?string,
  findKindAndStory: $PropertyType<Options, 'findKindAndStory'>
): ?StoryPaths {
  if (!baseUrl || !story) {
    return undefined
  }

  const { selectedKind, selectedStory } = findKindAndStory(story)
  const url = `${baseUrl}/iframe.html?selectedKind=${encodeURIComponent(
    selectedKind
  )}&selectedStory=${encodeURIComponent(selectedStory)}`

  return { ...story, url }
}

export default function folderStructure({
  stories,
  flattenFolders,
  baseUrl,
  filter,
  findKindAndStory,
}: Options): Array<StoryPaths> {
  const groups = groupBy(stories.keys(), filename =>
    groupRelatedFiles(filename, flattenFolders)
  )

  return compact(
    map(groups, (files, name) =>
      createRelatedFileGroup(files, name, filter)
    ).map(story => addUrl(story, baseUrl, findKindAndStory))
  )
}

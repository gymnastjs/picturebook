// @flow
import { groupBy, map, mapValues, compact } from 'lodash'
import type { Options, StoryPaths } from '../picturebook.types'
import getParents from './getParents'

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
  name: string
): ?$Diff<StoryPaths, { +url: ?string }> {
  const parents = name.split('/')
  const story = parents.pop()
  const storyPath = files.find(file => file.endsWith(`${name}.js`))

  if (!storyPath) {
    return undefined
  }

  return {
    name,
    parents,
    title: deKebab(story),
    path: storyPath,
    screenshots: groupFilesBySubExtension(
      files.filter(file => file.endsWith('.png'))
    ),
    tests: groupFilesBySubExtension(
      files.filter(
        file => file.endsWith('.spec.js') || file.endsWith('.test.js')
      )
    ),
    doc: files.find(file => file.endsWith('.md')),
  }
}

function addUrl(
  story: ?$Diff<StoryPaths, { +url: ?string }>,
  baseUrl: ?string
): ?StoryPaths {
  if (!baseUrl || !story) {
    return undefined
  }

  const encodedParents = encodeURIComponent(getParents(story))
  const encodedStory = encodeURIComponent(story.title)
  const url = `${baseUrl}/iframe.html?selectedKind=${encodedParents}&selectedStory=${encodedStory}`

  return { ...story, url }
}

export default function folderStructure({
  stories,
  flattenFolders,
  baseUrl,
}: Options): Array<StoryPaths> {
  const groups = groupBy(stories.keys(), filename =>
    groupRelatedFiles(filename, flattenFolders)
  )

  return compact(
    map(groups, createRelatedFileGroup).map(story => addUrl(story, baseUrl))
  )
}

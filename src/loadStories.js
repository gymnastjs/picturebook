// @flow
import { groupBy, map } from 'lodash'
import type { Options, LoadedStory, StoryPaths } from './picturebook.types'
import { folderStructure, getParents, moduleAsFunction } from './utils'
import defaults from './defaults'

export function importStories(
  list: $ReadOnlyArray<StoryPaths>,
  options: $Shape<Options>
): $ReadOnlyArray<LoadedStory> {
  return list.map(
    ({ doc, ...story }: StoryPaths): LoadedStory => ({
      ...story,
      doc: doc ? options.stories(doc) : undefined,
      main: moduleAsFunction(
        story.path ? options.stories(story.path) : undefined
      ),
    })
  )
}

function groupByParent(
  stories: $ReadOnlyArray<LoadedStory>
): {|
  [parent: string]: $ReadOnlyArray<LoadedStory>,
|} {
  return (groupBy(stories, getParents): any)
}

export function createStories(
  groupedPaths: $ReadOnlyArray<LoadedStory>,
  { storiesOf, decorators }: Options
) {
  const grouped = groupByParent(groupedPaths)

  return map(grouped, (storyGroup, title) => {
    const storyModule = storiesOf(title, module)

    storyGroup.forEach(story => {
      const decorated = decorators.reduce(
        (acc, current) => current(acc, story, storyModule) || acc,
        story.main
      )
      storyModule.add(story.title, decorated)
    })

    return storyModule
  })
}

export default function loadStories(
  userOptions: $Shape<Options>
): Array<LoadedStory> {
  const options: Options = { ...defaults, ...userOptions }
  const grouped = folderStructure(options)
  const imported = importStories(grouped, options)
  const created = createStories(imported, options)

  return created
}

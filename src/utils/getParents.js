// @flow

export default function getParents(story: { parents: $ReadOnlyArray<string> }) {
  return (story.parents || []).join('.') || 'unsorted'
}

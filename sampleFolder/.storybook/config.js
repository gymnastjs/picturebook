import { storiesOf, configure, addDecorator } from '@storybook/react'
import { withMarkdownNotes } from '@storybook/addon-notes'
import { withKnobs } from '@storybook/addon-knobs'
import { setOptions } from '@storybook/addon-options'
import { withConsole } from '@storybook/addon-console'
import * as picturebook from '../../dist/picturebook.web'

/**
 * Some addons can be defined globally, e.g options or knobs. This is the
 * simplest use case
 */
setOptions({
  name: 'Test Storybook',
})
addDecorator(withKnobs)
addDecorator((storyFn, context) => withConsole()(storyFn)(context))

function loadStories() {
  picturebook.loadStories({
    storiesOf,
    /**
     * For components that we want to customize on a per-story basis like
     * providing component-specific documentation, the decorators array allows
     * specifying any modifiers to each story
     */
    decorators: [(story, { doc }) => doc && withMarkdownNotes(doc)(story)],
    stories: require.context('../stories', true, /\.(js|md|png)/),
  })
}

configure(loadStories, module)

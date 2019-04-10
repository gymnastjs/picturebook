import {
  storiesOf,
  configure,
  addDecorator,
  addParameters,
} from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'
import { withConsole } from '@storybook/addon-console'
import * as picturebook from '../../dist/picturebook.web'

addParameters({
  name: 'Test Storybook',
})
/**
 * Some addons can be defined globally, e.g knobs. This is the
 * simplest use case
 */
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
    decorators: [(story, { doc }) => [story, doc ? { notes: doc } : {}]],
    stories: require.context('../stories', true, /\.(js|md|png)/),
  })
}

configure(loadStories, module)

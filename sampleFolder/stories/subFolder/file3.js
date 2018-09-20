// @flow
import * as React from 'react'
import { action } from '@storybook/addon-actions'

export default () => (
  <div
    role="button"
    tabIndex={0}
    onClick={action('clicked')}
    onKeyPress={() => null}
  >
    <span role="img" aria-label="so cool">
      😀 😎 👍 💯
    </span>
  </div>
)

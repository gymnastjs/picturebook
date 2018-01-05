import * as React from 'react'
import { WithNotes } from '@storybook/addon-notes'

export default function WithExtensions({ notes, ...props }) {
  if (notes) {
    return (
      <div>
        <WithNotes notes={notes}>
          <div data-picturebook-test-id="root" {...props} />
        </WithNotes>
      </div>
    )
  }

  return (
    <div>
      <div data-picturebook-test-id="root" {...props}  />
    </div>
  )
}

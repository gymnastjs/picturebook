import * as React from 'react'
import { WithNotes } from '@storybook/addon-notes'

export default function WithExtensions({ notes, className = '', ...props }) {
  const isCI = window.location.href.indexOf('isCI') !== -1
  const classes = isCI ? ['isCI', className] : [className]
  const classesStr = classes.join(' ')

  if (notes) {
    return (
      <div>
        <WithNotes notes={notes}>
          <div {...props} className={classesStr} />
        </WithNotes>
      </div>
    )
  }

  return (
    <div>
      <div {...props} className={classesStr} />
    </div>
  )
}

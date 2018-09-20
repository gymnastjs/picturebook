// @flow
import { storiesOf } from '@storybook/react'
import getFiles from './getFiles'
import type { Options } from './picturebook.types'
import defaults from './defaults'

const { resolve } = require('path')

describe('getFiles', () => {
  let options: $Shape<Options>

  beforeEach(() => {
    options = {
      ...defaults,
      stories: require.context(
        resolve(__dirname, '../sampleFolder/stories'),
        true,
        /\.(js|md|png|jpg)/
      ),
      storiesOf,
    }
  })

  describe('getFiles', () => {
    it('should retrieve files without crashing', () => {
      expect(() => {
        getFiles(options)
      }).not.toThrow()
    })
  })
})

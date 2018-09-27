// @flow
import getFiles from './getFiles'
import type { Options } from './picturebook.types'
import getDefaults from './defaults'

const { resolve } = require('path')

describe('getFiles', () => {
  let options: $Shape<Options>

  beforeEach(() => {
    options = getDefaults({
      stories: require.context(
        resolve(__dirname, '../sampleFolder/stories'),
        true,
        /\.(js|md|png|jpg)/
      ),
    })
  })

  describe('getFiles', () => {
    it('should retrieve files without crashing', () => {
      expect(() => {
        getFiles(options)
      }).not.toThrow()
    })
  })
})

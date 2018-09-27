// @flow
import { storiesOf } from '@storybook/react'
import { importStories, createStories } from './loadStories'
import type { LoadStoryOptions } from './picturebook.types'
import { folderStructure } from './utils'
import getDefaults from './defaults'

const { resolve } = require('path')

describe('loadStories', () => {
  let options: $Shape<LoadStoryOptions>
  let grouped
  let imported

  beforeEach(() => {
    options = getDefaults({
      decorators: [],
      stories: require.context(
        resolve(__dirname, '../sampleFolder/stories'),
        true,
        /\.(js|md|png|jpg)/
      ),
      storiesOf,
    })
    grouped = folderStructure(options)
    imported = importStories(grouped, options)
  })

  describe('importStories', () => {
    it('should create all stories without crashing', () => {
      expect(() => {
        importStories(grouped, options)
      }).not.toThrow()
    })

    it('should load all stories as functions', () => {
      importStories(grouped, options).forEach(({ main }) => {
        expect(main).toEqual(expect.any(Function))
      })
    })
  })

  describe('createStories', () => {
    it('should load all stories without crashing', () => {
      expect(() => {
        createStories(imported, options)
      }).not.toThrow()
    })
  })
})

const { flattenDeep } = require('lodash')
const { getBrowserData } = require('../shared')
const { storyFolders } = require('../../../shared/storyFolders')
const { skip } = require('../../../params')

const targetUrlIndex = process.argv.indexOf('--url')

const BASE_URL = process.argv[targetUrlIndex + 1]

function getStories(content) {
  if (content.namepath) {
    return content
  }
  return Object.values(content).map(getStories)
}

function isPartialMatch(reference, partial) {
  return reference.toLowerCase().includes(partial.toLowerCase())
}

function partialSkipMatch(props) {
  const { name, folderpath } = props

  return !skip.some(
    match => isPartialMatch(name, match) || isPartialMatch(folderpath, match)
  )
}

function formatProperties(props) {
  const { folderpath, name, image, mobile } = props

  return {
    label: `${folderpath}__${name}`,
    image,
    mobile,
    url: `${BASE_URL}?selectedKind=${encodeURIComponent(
      folderpath
    )}&selectedStory=${encodeURIComponent(name)}&isCI`,
  }
}

const scenarios = Object.keys(storyFolders)
  .map(kind => ({
    kind,
    storyNames: flattenDeep(getStories(storyFolders[kind])),
  }))
  .reduce(
    (prev, story) =>
      prev.concat(
        story.storyNames.filter(partialSkipMatch).map(formatProperties)
      ),
    []
  )

function storyBookImageComparison(browser) {
  const { name, platform } = getBrowserData(
    browser.options.desiredCapabilities.browserName
  )
  const isMobile = platform === 'mobile'

  return browser.session(session =>
    scenarios
      .reduce(
        (b, { url, label, image, mobile }) =>
          b
            .url(url)
            .compareScreenshot(
              `${label}${isMobile ? '_mobile' : ''}.png`,
              isMobile ? mobile : image,
              session,
              name
            ),
        browser
      )
      .seleniumEnd()
      .end()
  )
}

module.exports = {
  storyBookImageComparison,
}

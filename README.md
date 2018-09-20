# 🤖📗 PictureBook

Automated React Storybook Setup

Simplify React Storybook story creation and cross-browser image comparison testing

## 💡 Rationale

Setting up storybook and implement cross-browser image comparison testing on multiple projects is time consuming.

Instead of providing a wrapper on top of existing projects that will fall out of date, Picturebook lets you retain control of the Storybook and Nightwatch packages.

This project aims to provide utility methods to simplify [Storybook](https://storybook.js.org/), [SauceLabs](https://saucelabs.com/) and [Nightwatch](http://nightwatchjs.org/) configuration and screenshot comparison. Specifically:

- **Creation of storybook stories**: They are created based on your file system structure
- **Saucelabs tunnel setup**: Reduce SauceConnect config to the tunnel id and username / accessKey
- **Screenshot**: Take screenshots of every story on different browsers using SauceLabs and Nightwatch
- **Image Comparison**: Compare and update screenshots to baselines collocated with your stories.

## ⚙️ Install

1. You will need a SauceLabs account. If you don't have one you can sign up for a trial [here](https://signup.saucelabs.com/signup/trial) or request a free one for open source projects [here](https://saucelabs.com/open-source-request-account).
1. If you want to run tests against Safari and IE11 from localhost, add `localtest.dev 127.0.0.1` to your `/etc/hosts` (the exact steps may vary depending on your platform, see [here](https://www.howtogeek.com/howto/27350/beginner-geek-how-to-edit-your-hosts-file/) for more details).
1. Add picturebook and its peer dependencies:

```sh
yarn add --dev picturebook @storybook/react nightwatch react
```

If you don't have Storybook set it up yet, follow [these instructions](https://storybook.js.org/basics/quick-start-guide/) first.

Some of Picturebook utility methods rely on the output of `require.context`. This is a webpack construct and it's not available in Node or test environments. There are multiple ways to mock it. If you are using babel you could add the [require-context-hook](https://github.com/smrq/babel-plugin-require-context-hook) plugin. For instance, if you want to enable it only for tests, you can do something like:

```json
{
  "env": {
    "test": {
      "plugins": ["require-context-hook"]
    }
  }
}
```

and on your test setup:

```js
require('babel-plugin-require-context-hook/register')()
```

Alternatively, there's also the [require-context](https://www.npmjs.com/package/require-context) npm package that will also emulate webpack's `require.context`.

## 📚 API

```js
type StoryPaths = {|
  +name: string,
  +parents: $ReadOnlyArray<string>,
  +title: string,
  +path: string,
  +screenshots: {|
    +[extension: string]: string,
  |},
  +tests: {|
    +[extension: string]: string,
  |},
  +doc: ?string,
  +url: ?string,
|}

type LoadedStory = {|
  ...$Exact<StoryPaths>,
  +main: () => React.Node,
|}

type Options = {|
  flattenFolders: $ReadOnlyArray<string>,
  storiesOf: any,
  stories: any,
  baseUrl?: string,
  decorators: $ReadOnlyArray<Function>,
  storyFiles: $ReadOnlyArray<string>,
|}

type ImgLog = {|
  +imgFileName: string,
  +name: string,
  +platform: string,
  +browser: string
|}

function getFiles(userOptions: $Shape<Options>): Array<StoryPaths>

function loadStories(userOptions: $Shape<Options>): Array<LoadedStory>

function nightwatchConfig(params: {
  desiredCapabilities?: {},     // nightwatch desired capabilities object
  files: Array<StoryPaths>,     // output of getFiles()
  username: string,             // SauceLabs username
  access_key: string,           // SauceLabs accessKey
  browsers?: {                  // List of browsers to test. Default list
    [browserName: string]: {    //   includes chrome, firefox, edge, ie11, iphone7
      desiredCapabilities: {    //   and safari but any valid SauceLabs config is
        platform: string,       //   valid
        version: string,
        browserName: string,
        screenResolution: string,
      },
      custom_vars: {|           // Custom properties required per browser config:
        name: string,           // Must match "browserName"
        platform: string,       // "mobile" | "desktop" but any string is allowed
        extract?: {|            // If cropping the output, specify crop
          top: number,
          left: number,
          width: number,
          height: number,
        |},
      |},
    },
  },
  // Alias for browsers where localhost cannot be accessed from a tunnel,
  // defaults to "localtest.dev"
  localhostAlias?: string,
  // List of browsers that can't access localhost from a tunnel, defaults to:
  // ["ie11", "safari"]
  localhostAliasBrowsers?: Array<string>,
  resultPath?: string,           // Where to output the result file
  proxy?: {},                    // Nightwatch proxy object
}): Object

function compareImages(params: {
    screenshots: Array<ImgLog>,  // output of runTests() or runTestsWithTunnel()
    files: Array<StoryPaths>,    // output of getFiles()
    root: string,                // base path for the stories
    threshold?: number,          // max number of different pixels allowed
    overwrite?: boolean          // update image instead of failing
  }): Promise<{
    +name: string,
    +status: 'CREATED' | 'SUCCESS' | 'FAILED',
    +error: ?string,
    +diffPath: ?string,
    +referencePath: ?string,
    +screenshotPath: ?string,
    +diffThreshold: number,
    +browser: string,
    +platform: string,
  }>

function runTests(configPath: string): Promise<Array<ImgLog>>

function runTestsWithTunnel(tunnelId: string, configPath: string): Promise<Array<ImgLog>>
```

## 🎪 Sample App

This project includes a sample app to demo the behavior. You can view it running `yarn start` and opening `localhost:6006` on your browser.

To run the image comparison tests, keep `yarn start` running and call `SAUCE_ACCESS_KEY={YOUR_ACCESS_KEY} SAUCE_USERNAME={YOUR_USERNAME} yarn test:app`.

## ️✏️ Storybook Usage

To take advantage of the automated storybook folder config (and testing) modify your storybook `config.js` to look like this:

```js
import { storiesOf, configure } from '@storybook/react'
import * as picturebook from 'picturebook'

function loadStories() {
  picturebook.loadStories({
    storiesOf,
    stories: require.context('../stories', true, /\.(js|md|png)/),
  })
}

configure(loadStories, module)
```

If you want to see a more advanced use case on how to use it with decorators and other plugins, check out the [sample project](./sampleFolder/.storybook/config.js).

## 📸 Screenshot Usage

To take screenshots, picturebook relies on nightwatch. With the exception of a few required fields, configuration is generated for you. To take advantage of it you should create a `nightwatch.conf.js` file on your root (or customize it following instructions [here](http://nightwatchjs.org/gettingstarted#settings-file)).

```js
require('babel-register')

const { resolve } = require('path')
const { nightwatchConfig, getFiles } = require('picturebook')
const requireContext = require('require-context')

const config = nightwatchConfig({
  username: process.env.SAUCE_USERNAME,
  access_key: process.env.SAUCE_ACCESS_KEY,
  files: getFiles({
    baseUrl: 'http://localhost:6006',
    stories: requireContext(resolve(__dirname, './stories'), true, /\.js/),
  }),
  resultPath: resolve(__dirname, './picturebook-img.log'),
  desiredCapabilities: {
    build: 'local',
    'tunnel-identifier': 'picturebook-sample',
  },
})

module.exports = config
```

To run image comparison, after screenshots have been taken you can call:

```js
compareImages({
  screenshots,
  root: storyRoot,
  overwrite: true,
  files: getFiles({
    stories: requireContext(storyRoot, true, /\.(js|png)/),
  }),
})
```

Where `screenshots` is the output of `runTestsWithTunnel` or `runTests` (if running with or without a tunnel, respectively).

## 🙋 QYMA (Questions you may ask)

### Why do I need to add localtest.dev as a localhost alias?

This is a SauceLabs issue. To work around it, `safari` and `edge` browsers replace `localhost` from urls to `localtest.dev` as described [here](https://support.saucelabs.com/hc/en-us/articles/225106887-Safari-and-Internet-Explorer-Won-t-Load-Website-When-Using-Sauce-Connect-on-Localhost).

You can customize the target browsers and localhost alias with the `localhostAliasBrowsers` and `localhostAlias`, respectively.

### How do you skip some files?

Picturebook will only take screenshots of the files you tell it exists. You can filter the output from [require.context](https://webpack.js.org/guides/dependency-management/#require-context) by specifying a different regExp to filter by.

### SauceConnect ENOENT error

If you see the following error after a couple unsuccessful runs of SauceConnect:

```sh
events.js:167
      throw er; // Unhandled 'error' event
      ^

Error: spawn ~/picturebook/node_modules/node-sauce-connect/lib/sc ENOENT
```

Sometimes it gets stuck. Try cleaning `node_modules` and re-running yarn:

```sh
rm -rf node_modules
yarn
```

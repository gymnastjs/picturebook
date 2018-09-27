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

The API can be split into 2 sections, storybook creation for finding files in the file system and creating storybook stories around them and storybook testing, to connect to SauceLabs and run cross-browser image comparison tests.

### Storybook creation

`getFiles` and `loadStories` have very similar APIs and output.

`getFiles` allows you to retrieve a list of related files. For instance if you have:

```sh
file1.js
file1.md
file2.png
file2.js
```

It will provide an array of 2 elements (file1 and file2) with the different related files grouped.

These values are used to identify helper files for stories where `*.md` is understood to be documentation,`.*(spec|test).js` is a test file and an unprefixed `*.js` file is a story. The `flattenFolders` parameters allow grouping nested folders as well. For instance if `flattenFolders: ['a']` `file1.js` and `a/file1.png` will be grouped together.

`loadStories` provide the same functionality than `getFiles` but it also loads and creates storybook stories. This is why it requires storybook's [storiesOf](https://storybook.js.org/basics/writing-stories/#writing-stories) method as a parameter. The response is also similar but it includes a `main` method with the loaded story.

You can find the exact APIs below:

```js
type StoryPaths = {|
  name: string,
  parents: $ReadOnlyArray<string>,
  title: string,
  path: string,
  screenshots: {|
    [extension: string]: string,
  |},
  tests: {|
    [extension: string]: string,
  |},
  doc: ?string,
  url: ?string,
|}

// Retrieve and group the different stories based on their filenames
function getFiles({|
  baseUrl?: string,              // The url for the story, defaults to:
                                 //   'http://localhost:6006'
  flattenFolders?: Array<string> // Folders to flatten
                                 //   defaults to ['__snapshots__', '__screenshots__']
  stories: any,                  // Output of require context with the stories
  findKindAndStory?: (           // Customize "selectedKind" and "selectedStory" on the URL
    story: StoryPaths,           //   this is not needed if stories are generated with "loadStories"
  ) => {|
    selectedKind: string,
    selectedStory: string
  |},
  filter?: {|                    // Filter functions to determine how different files are grouped
    screenshots?: (file: string) => boolean,
    tests?: (file: string) => boolean,
    docs?: (file: string) => boolean,
    story?: (file: string, target: string) => boolean,
  |}
|}): Array<StoryPaths>

// Retrieve, group, load and create stories
function loadStories({|
  baseUrl?: string,              // The url for the story, defaults to:
                                 //   'http://localhost:6006'
  flattenFolders?: Array<string> // Folders to flatten
                                 //   defaults to ['__snapshots__', '__screenshots__']
  stories: any,                  // Output of require context with the stories
  decorators: $ReadOnlyArray<Function>,
  storiesOf: any,
  storyFiles: $ReadOnlyArray<string>,
|}): Array<StoryPaths & {|
  main: () => React.Node,
|}>
```

### Storybook testing

Once stories are loaded, `runTests` will connect to SauceLabs (optionally through a SauceConnect tunnel) and return a Promise that includes the results of the test.

Since it uses `nightwatch` under the hood, you must have a valid nightwatch instance running. To assist with it, `nightwatchConfig` provides defaultValues

```js
type Status = 'CREATED' | 'SUCCESS' | 'FAILED'
type ImgResults = {|
    browser: string,
    diffPath: ?string,
    diffThreshold: number,
    error: ?string,
    name: string,
    platform: string,
    referencePath: ?string,
    screenshotPath: ?string,
    status: Status,
  |}

// Invoke nightwatch and run image comparison in SauceLabs
function runTests(options: {|
  configPath: string,           // absolute path to nightwatch config
  files: Array<StoryPaths>,     // output of getFiles()
  overwrite: boolean,           // true to replace failing or missing images
  storyRoot: string,            // absolute path to the stories
  tunnelId?: string,            // if set, it will set up a SC tunnel with the id
  outputPath?: string,          // if set, where to store the test results as a
                                // json file matching the return of `runTests`
|}): Promise<{|
  error: Error | null,          // null if there were no exceptions during tests
  results: Array<ImgResults>,   // per browser / platform / story results
  // An overall summary status. If any tests failed, it's FAILED, if any tests
  // where created or updated it's CREATED, if all tests succeeded it's SUCCESS
  // if no tests ran, it's EMPTY
  status: Status | 'EMPTY',
  counts: {|                    // counts for all tests
    CREATED: number,
    SUCCESS: number,
    FAILED: number,
  |},
  version: string,              // picturebook version used
  date: string,                 // ISO date when was the test report created
|}>

// Nightwatch config generation helper
function nightwatchConfig(options: {|
  desiredCapabilities?: {},     // nightwatch desired capabilities object
  files: Array<StoryPaths>,     // output of getFiles()
  username: string,             // SauceLabs username
  access_key: string,           // SauceLabs accessKey
  browsers?: {                  // List of browsers to test. Default list
                                //   includes chrome, firefox, edge, ie11,
                                //   iphone7 and safari but any valid SauceLabs
                                //   config is valid
    [browserName: string]: {
      desiredCapabilities: {
        platform: string,
        version: string,
        browserName: string,
        screenResolution: string,
      },
      custom_vars: {|           // Custom properties required per browser config:
        name: string,           // Must match "browserName"
        platform: string,       // "mobile" | "desktop" but any string is allowed
        extract?: {|            // If cropping the output, specify crop dimensions
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
  proxy?: {},                   // Nightwatch proxy object
|}): Object
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
  desiredCapabilities: {
    build: 'local',
    'tunnel-identifier': 'picturebook-sample',
  },
})

module.exports = config
```

To take screenshots and run image comparison, you can call:

```js
runTests({
  storyRoot,
  files: getFiles({
    stories: requireContext(storyRoot, true, /\.(js|png)/),
  }),
  overwrite,
  tunnelId: 'picturebook-sample',
  configPath: resolve(__dirname, 'nightwatch.conf.js'),
})
```

Note that if using a tunnel, `tunnel-identifier` on your nightwatch config must match the `tunnelId` parameter passed to `runTests`.

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

### Error retrieving a new session from the selenium server

This is a Nightwatch issue, addressed in 1.0.4 versions of Nightwatch and later as per [this issue](https://github.com/nightwatchjs/nightwatch/issues/1772).

### node-dir "cannot read property 'files' of undefined" error

There's currently a [bug in node-dir](https://github.com/fshost/node-dir/issues/53) that fails on empty dirs.

Remove empty folders within your stories if you see the following error:

```sh
yourProject/node_modules/node-dir/lib/paths.js:92
                results.files = results.files.concat(res.files);
                                                         ^

TypeError: Cannot read property 'files' of undefined
    at subloop (/Users/obartra/repos/gymnast/node_modules/node-dir/lib/paths.js:92:58)
    at /Users/obartra/repos/gymnast/node_modules/node-dir/lib/paths.js:107:13
    at onDirRead (/Users/obartra/repos/gymnast/node_modules/node-dir/lib/paths.js:139:35)
    at onStat (/Users/obartra/repos/gymnast/node_modules/node-dir/lib/paths.js:154:14)
```

You can do so with:

```sh
find /some/path -depth -type d -exec rmdir {} \;
```

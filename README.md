# 🤖📗 PictureBook

Automated Storybook Setup

Simplify Storybook story creation and cross-browser saucelabs image comparison testing

## ⚙️ Install

Install with:

```sh
$ yarn add --dev picturebook @storybook/addon-actions @storybook/addon-knobs @storybook/addon-notes @storybook/addon-options @storybook/channels @storybook/react
```

Configure it creating `.picturebookrc` file on your root directory. The following are the default values:

```js
{
  "projectName": "PictureBook",
  "projectUrl": "https://github.com/obartra/picturebook",
  "storiesUrl": "",
  "skip": [],
  "storyPath": "",
  "entryPoint": "node_modules/picturebook/index.js",
  "markdownFooter": "node_modules/picturebook/shared/storyFolders/footer.md",
  "postcssConfig": "",
  "babelConfig": "",
  "webpackConfig": "",
  "seleniumPath": "", // defaults to internal copy of the selenium jar file
  "picturebookPath": "node_modules/picturebook",
  "root": ".",
  "image": {
    "local": false,
    "username: "",
    "accessKey": "",
    "desiredCapabilities": {}
  },
  "browsers": {
    /* chrome, ie11, edge, ff, safari, iphone7, galaxy4 */
  }
}
```

- **projectName**: The name of the project
- **projectUrl**: The url of the project
- **storiesUrl**: The public url where the stories are located
- **storyPath**: The path, from the project root, to the stories
- **entryPoint**: The stories entry point (it should import `picturebook`)
- **markdownFooter**: The markdown footer applied to all stories. The keyword `[[url]]` is translated to the specific story url if `storiesUrl` is specified.
- **postcssConfig**: A path to a file exporting either a plain object that returns a postcss config. This is a convenience method in case you don't need to customize other webpack settings. If you want full control on how css is loaded, you can do so by modifying the `webpackConfig` parameter. It expects the same format than storybook (a function that will receive the default config as first parameter and the environment as the second one)
- **image**: It's a required configuration object to run the image comparison tests
- **seleniumPath**: Modify to use a custom selenium server jar
- **skip**: A case insensitive array of string to match partially with tests to skip

Configuration is parsed with [cosmiconfig](https://github.com/davidtheclark/cosmiconfig)

## ✏️ Usage

PictureBook relies on the folder structure to define the stories for you.

Simply specify a `storyPath` on your config (e.g. `src/stories`) and PictureBook will take care of the rest. The name of the story is set by un-camel-casing the file name.

Documentation is added to each story if there's a matching file with the same name but with `md` extension.

To add actions (using `@storybook/addon-actions`) follow [these usage instructions](https://github.com/storybooks/storybook/tree/master/addons/actions).

To add knobs (using `@storybook/addon-knobs`) follow [these usage instructions](https://github.com/storybooks/storybook/tree/master/addons/knobs).

## 📸 Screenshot Testing

To run automated screenshot tests, run `./node_modules/.bin/picturebook-image`

### Available Flags:

**--env**: Define which browsers should be tested (`chrome`, `firefox`, etc)

**--suiteRetries**: How many times to retry all tests if a screenshot fails due to flaky connection

**-u** or **--updateScreenshot**: Update and replace baselines images for all failing tests




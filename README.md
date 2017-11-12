# 🤖📗 PictureBook

Automated Storybook Setup

Simplify Storybook story creation and cross-browser image comparison testing

## ⚙️ Install

Install with:

```sh
$ yarn add --dev picturebook
```

Configure it creating `.picturebookrc` file on your root directory. The following are the default values:

```json
{
  "projectName": "PictureBook",
  "projectUrl": "https://github.com/obartra/picturebook",
  "storiesUrl": "",
  "storyPath": "",
  "entryPoint": "node_modules/picturebook/index.js",
  "markdownFooter": "node_modules/picturebook/shared/storyFolders/footer.md",
  "postcssConfig": "",
  "jestConfig": "",
  "picturebookPath": "node_modules/picturebook",
  "root": ".",
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
- **postcssConfig**: A path to a file exporting either a plain object that returns a postcss config.

## ✏️ Usage

PictureBook relies on the folder structure to define the stories for you.

Simply specify a `storyPath` on your config (e.g. `src/stories`) and PictureBook will take care of the rest. The name of the story is set by un-camel-casing the file name.

Documentation is added to each story if there's a matching file with the same name but with `md` extension.

To add actions (using `@storybook/addon-actions`) import `picturebook/actions`.

To add knobs (using `@storybook/addon-knobs`) import `picturebook/knobs`.

To run unit automated snapshots on your stories, create a test file importing `picturebook/screenshot`.

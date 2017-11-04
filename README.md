# PictureBook

Opinionated Storybook setup

## Setup

Install with:

```sh
$ yarn add --dev picturebook
```

After the package is installed you will need to define your settings.

Create a `.picturebookrc` file on the root of the project with the following options:

- **projectName**: The name of the project
- **projectUrl**: The url of the project
- **storiesUrl**: The public url where the stories are located
- **storyPath**: The path, from the project root, to the stories
- **entryPoint**: The stories entry point (it should import `picturebook`)

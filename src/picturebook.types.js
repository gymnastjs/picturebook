// @flow
export type StoryPaths = {|
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

export type Options = {
  stories: any,
  flattenFolders: $ReadOnlyArray<string>,
  baseUrl?: string,
  findKindAndStory: (
    story: $Diff<StoryPaths, { +url: ?string }>
  ) => {|
    selectedKind: string,
    selectedStory: string,
  |},
  filter: {
    screenshots: (file: string) => boolean,
    tests: (file: string) => boolean,
    docs: (file: string) => boolean,
    story: (file: string, target: string) => boolean,
  },
}

export type LoadStoryOptions = Options & {
  stories: any,
  storiesOf: any,
  decorators: $ReadOnlyArray<Function>,
  storyFiles: $ReadOnlyArray<string>,
}

export type LoadedStory = {|
  ...$Exact<StoryPaths>,
  +main: () => any,
|}

export type ImgLog = {|
  +imgFileName: string,
  +name: string,
  +platform: string,
  +browser: string,
|}

export type Status = 'CREATED' | 'SUCCESS' | 'FAILED'

export type ImgTest = {|
  +name: string,
  +status: Status,
  +error: ?string,
  +diffPath: ?string,
  +referencePath: ?string,
  +screenshotPath: ?string,
  +diffThreshold: number,
  +browser: string,
  +platform: string,
|}

export type ImgResult = {|
  +error: Error | null,
  +results: Array<ImgTest>,
  +status: Status | 'EMPTY',
  +counts: {|
    +CREATED: number,
    +SUCCESS: number,
    +FAILED: number,
  |},
  +version: string,
  +date: string,
  +retryAttempts: number,
|}

export type Tunnel = {|
  +id: string,
  +binaryPath: string,
|}

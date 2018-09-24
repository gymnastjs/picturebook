// @flow
import * as React from 'react'

export type Options = {|
  flattenFolders: $ReadOnlyArray<string>,
  storiesOf: any,
  stories: any,
  baseUrl?: string,
  decorators: $ReadOnlyArray<Function>,
  storyFiles: $ReadOnlyArray<string>,
|}

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

export type LoadedStory = {|
  ...$Exact<StoryPaths>,
  +main: () => React.Node,
|}

export type ImgLog = {|
  +imgFileName: string,
  +name: string,
  +platform: string,
  +browser: string,
|}

export type ImgTest = {|
  +name: string,
  +status: 'CREATED' | 'SUCCESS' | 'FAILED',
  +error: ?string,
  +diffPath: ?string,
  +referencePath: ?string,
  +screenshotPath: ?string,
  +diffThreshold: number,
  +browser: string,
  +platform: string,
|}

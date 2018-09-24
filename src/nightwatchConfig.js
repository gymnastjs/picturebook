// @flow
/* eslint-disable camelcase */
import type { StoryPaths } from './picturebook.types'

const selenium = require('selenium-server-standalone-jar')
const path = require('path')
const { merge, mapValues } = require('lodash')
const defaultBrowsers = require('./utils/browsers.json')

type Overrides = {
  desiredCapabilities?: {},
  files: Array<StoryPaths>,
  username: string,
  access_key: string,
  browsers?: {
    [browserName: string]: {
      desiredCapabilities: {
        platform: string,
        version: string,
        browserName: string,
        screenResolution: string,
      },
      custom_vars: {|
        name: string,
        platform: string,
        extract?: {|
          top: number,
          left: number,
          width: number,
          height: number,
        |},
      |},
    },
  },
  localhostAlias?: string,
  localhostAliasBrowsers?: Array<string>,
  proxy?: {},
}

const error = msg => {
  throw new Error(msg)
}

module.exports = function nightwatchConfig({
  files = [],
  username,
  access_key,
  proxy,
  browsers,
  localhostAliasBrowsers = ['edge', 'safari'],
  localhostAlias = 'localtest.dev',
  ...overrides
}: Overrides) {
  if (!files.length) {
    error(
      '"files" array must be an array of size 1 or greater. No files with urls means no tests will run'
    )
  }

  const desiredCapabilities = {
    acceptSslCerts: true,
    extendedDebugging: true,
    files,
    ...overrides.desiredCapabilities,
  }
  const commonSettings = {
    log_path: path.resolve(__dirname, './screenshot/reports'),
    screenshots: {
      enabled: false,
    },
    proxy,
    desiredCapabilities,
    selenium_host: 'ondemand.saucelabs.com',
    selenium_port: 80,
    start_process: true,
    launch_url: files[0].url || 'http://localhost:6006/iframe.html',
    username,
    access_key,
  }

  return {
    src_folders: [path.resolve(__dirname, './screenshot/tests/picturebook.js')],
    selenium: {
      start_process: true,
      server_path: selenium.path,
      cli_args: {
        'webdriver.chrome.driver': '',
        'webdriver.ie.driver': '',
      },
    },
    test_workers: false,
    live_output: true,
    skip_testcases_on_fail: false,
    test_settings: {
      default: commonSettings,
      ...mapValues({ ...defaultBrowsers, ...browsers }, browser =>
        merge(
          {
            globals: {
              localhostAlias,
              localhostAliasBrowsers,
            },
          },
          commonSettings,
          browser
        )
      ),
    },
  }
}

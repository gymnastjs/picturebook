// @flow
import { resolve, dirname, basename } from 'path'
import rimraf from 'rimraf'
import { isEmpty } from 'lodash'
import type { StoryPaths, ImgLog } from './picturebook.types'
import { replaceImage, getImageDiff, writeImage } from './utils'

type Params = {
  screenshots: Array<ImgLog>,
  files: Array<StoryPaths>,
  root: string,
  threshold?: number,
  overwrite?: boolean,
}

type Response = {
  +name: string,
  +status: 'CREATED' | 'SUCCESS' | 'FAILED',
  +error: ?string,
  +diffPath: ?string,
  +referencePath: ?string,
  +screenshotPath: ?string,
  +diffThreshold: number,
  +browser: string,
  +platform: string,
}

const diffRoot = resolve(__dirname, 'screenshot', 'reports', 'diffs')

function compareImageGroup({
  imgFileName,
  name,
  screenshots,
  platform,
  browser,
  root,
  overwrite = false,
  threshold = 0,
}): Promise<Response> {
  const browserKey = `${platform}.${browser}`
  const referenceFolder = resolve(root, dirname(name), '__screenshots__')
  const referenceFile = `${basename(name)}.${browserKey}.png`
  const referencePath = resolve(referenceFolder, referenceFile)
  const baseResponse = {
    name,
    browser,
    platform,
    error: null,
    diffPath: null,
    referencePath,
    screenshotPath: imgFileName,
  }

  if (!platform || !browser || !imgFileName) {
    return Promise.resolve({
      ...baseResponse,
      status: 'FAILED',
      error: 'browser, platform and imgFileName are required parameters',
      diffThreshold: -1,
    })
  }

  if (isEmpty(screenshots) || !screenshots[browserKey]) {
    return replaceImage(imgFileName, referencePath)
      .then(() => ({
        ...baseResponse,
        status: 'CREATED',
        diffThreshold: 0,
      }))
      .catch(() => ({
        ...baseResponse,
        status: 'FAILED',
        error: 'Unable to copy image',
        diffThreshold: -1,
      }))
  }

  const diffPath = resolve(diffRoot, screenshots[browserKey])
  const derivedRefPath = resolve(root, screenshots[browserKey])

  if (referencePath !== derivedRefPath) {
    return Promise.resolve({
      ...baseResponse,
      status: 'FAILED',
      error: `Path mismatch ${referencePath} should match ${derivedRefPath}`,
      diffThreshold: -1,
    })
  }

  return getImageDiff(imgFileName, referencePath, 0)
    .then(({ count, diff }) => {
      if (count > threshold) {
        return writeImage(diff.pack(), diffPath)
          .then(() => {
            if (overwrite) {
              return replaceImage(imgFileName, referencePath).then(() => ({
                ...baseResponse,
                status: 'CREATED',
                diffThreshold: 0,
              }))
            }
            return {
              ...baseResponse,
              status: 'FAILED',
              error: `Pixel differences of ${count} are above the threshold (${threshold})`,
              diffPath,
              diffThreshold: count,
            }
          })
          .catch(e => ({
            ...baseResponse,
            status: 'FAILED',
            error: e.message,
            diffThreshold: count,
          }))
      }
      return {
        ...baseResponse,
        status: 'SUCCESS',
        diffThreshold: count,
      }
    })
    .catch(e => ({
      ...baseResponse,
      status: 'FAILED',
      error: e.message,
      diffThreshold: -1,
    }))
}

export default function compareImages({
  screenshots,
  files,
  root,
  threshold,
  overwrite,
}: Params) {
  // remove old diffs
  rimraf.sync(diffRoot)

  const results = []

  return screenshots
    .map(screenshot => ({
      root,
      threshold,
      overwrite,
      screenshots: {},
      ...screenshot,
      ...files.find(({ name }) => name === screenshot.name),
    }))
    .reduce(
      (acc, current) =>
        acc.then(() =>
          compareImageGroup(current).then(result => results.push(result))
        ),
      Promise.resolve()
    )
    .then(() => results)
}

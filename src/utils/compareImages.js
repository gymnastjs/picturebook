// @flow
import { resolve, dirname, basename } from 'path'
import rimraf from 'rimraf'
import { isEmpty } from 'lodash'
import type { StoryPaths, ImgLog, ImgTest } from '../picturebook.types'
import { replaceImage, getImageDiff, writeImage } from './image'

type Params = {
  screenshots: Array<ImgLog>,
  files: Array<StoryPaths>,
  root: string,
  threshold?: number,
  overwrite?: boolean,
}

const diffRoot = resolve(__dirname, 'screenshot', 'reports', 'diffs')
const toPct = num => `${num * 100}%`

function updateReferenceImage({
  imgFileName,
  referencePath,
  baseResponse,
  diffThreshold,
}) {
  return replaceImage(imgFileName, referencePath)
    .then(() => ({
      ...baseResponse,
      status: 'CREATED',
      diffThreshold: 0,
    }))
    .catch(e => ({
      ...baseResponse,
      status: 'FAILED',
      error: `Updating image failed ${e.message}`,
      diffThreshold,
    }))
}

function writeDiffImage({
  diffData,
  diffPath,
  baseResponse,
  diffThreshold,
  threshold,
}) {
  return writeImage(diffData, diffPath)
    .then(() => ({
      ...baseResponse,
      status: 'FAILED',
      error: `Pixel differences of ${toPct(
        diffThreshold
      )} are above the threshold (${toPct(threshold)})`,
      diffPath,
      diffThreshold,
    }))
    .catch(e => ({
      ...baseResponse,
      status: 'FAILED',
      error: `Image creation failed ${e.message}`,
      diffThreshold,
    }))
}

function compareImageGroup({
  imgFileName,
  name,
  screenshots,
  platform,
  browser,
  root,
  overwrite = false,
  threshold = 0,
}): Promise<ImgTest> {
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
    .then(({ diffThreshold, diff, img1Size, img2Size }) => {
      const sizeMismatch = img1Size !== img2Size
      const aboveThreshold = diffThreshold > threshold
      const hasError = sizeMismatch || aboveThreshold

      if (hasError && overwrite) {
        return updateReferenceImage({
          imgFileName,
          referencePath,
          baseResponse,
          diffThreshold,
        })
      }

      if (sizeMismatch) {
        return {
          ...baseResponse,
          status: 'FAILED',
          error: `Image size mismatch ${img1Size} vs reference ${img2Size}`,
          diffPath,
          diffThreshold,
        }
      }
      if (diffThreshold > threshold) {
        return writeDiffImage({
          diffData: diff.pack(),
          diffPath,
          baseResponse,
          diffThreshold,
          threshold,
        })
      }
      return {
        ...baseResponse,
        status: 'SUCCESS',
        diffThreshold,
      }
    })
    .catch(e => ({
      ...baseResponse,
      status: 'FAILED',
      error: `ImageDiff failed: ${e.message}`,
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

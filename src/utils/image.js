// @flow
import { dirname } from 'path'
import { mkdirpSync } from 'fs-extra'
import {
  createReadStream,
  createWriteStream,
  existsSync,
  readFileSync,
  writeFileSync,
} from 'fs'
import compareImages from 'resemblejs/compareImages'

export function writeImage(buffer: Buffer, path: string): void {
  mkdirpSync(dirname(path))
  writeFileSync(path, buffer)
}

export function replaceImage(
  sourcePath: string,
  destinationPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!existsSync(sourcePath)) {
      reject(new Error('Invalid source'))
    }
    mkdirpSync(dirname(destinationPath))
    createReadStream(sourcePath)
      .pipe(createWriteStream(destinationPath))
      .on('end', resolve)
      .on('close', resolve)
      .on('error', reject)
  })
}

export async function getImageDiff(
  imgPath1: string,
  imgPath2: string
): Promise<{|
  getBuffer: () => Buffer,
  diffBounds: {
    top: number,
    left: number,
    right: number,
    bottom: number,
  },
  dimensionDifference: {
    height: number,
    width: number,
  },
  isSameDimensions: boolean,
  misMatchPercentage: string,
  error: void | string,
|}> {
  const img1 = readFileSync(imgPath1)
  const img2 = readFileSync(imgPath2)

  return compareImages(img1, img2, {
    output: {
      errorColor: {
        red: 255,
        green: 0,
        blue: 255,
      },
      errorType: 'movement',
      transparency: 0.3,
      largeImageThreshold: 1200,
      useCrossOrigin: false,
      outputDiff: true,
    },
    scaleToSameSize: true,
    ignore: 'antialiasing',
  })
}

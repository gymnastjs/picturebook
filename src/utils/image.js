// @flow
import { dirname } from 'path'
import { mkdirpSync } from 'fs-extra'
import { createReadStream, createWriteStream, existsSync } from 'fs'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

function readImage(path: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img: any = createReadStream(path)
      .pipe(new PNG())
      .on('parsed', () => resolve(img))
      .on('error', reject)
  })
}

export function writeImage(
  stream: stream$Readable,
  path: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    mkdirpSync(dirname(path))
    stream
      .pipe(createWriteStream(path))
      .on('close', resolve)
      .on('error', reject)
  })
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

function getSize(img: ImageData): string {
  return `${img.width}x${img.height}`
}

export function getImageDiff(
  imgPath1: string,
  imgPath2: string,
  threshold: number
): Promise<{|
  +diffThreshold: number,
  +diff: PNG,
  +img1Size: string,
  +img2Size: string,
|}> {
  return Promise.all([readImage(imgPath1), readImage(imgPath2)]).then(
    ([img1, img2]) => {
      const diff = new PNG({ width: img1.width, height: img1.height })
      const total = img1.width * img1.height
      const count = pixelmatch(
        img1.data,
        img2.data,
        diff.data,
        img1.width,
        img1.height,
        {
          threshold,
        }
      )

      return {
        diff,
        diffThreshold: Math.round((count * 100) / total) / 100,
        img1Size: getSize(img1),
        img2Size: getSize(img2),
      }
    }
  )
}

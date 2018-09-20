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

export function getImageDiff(
  imgPath1: string,
  imgPath2: string,
  threshold: number
) {
  return Promise.all([readImage(imgPath1), readImage(imgPath2)]).then(
    ([ref, img]) => {
      const diff = new PNG({ width: ref.width, height: ref.height })
      const count = pixelmatch(
        ref.data,
        img.data,
        diff.data,
        ref.width,
        ref.height,
        {
          threshold,
        }
      )
      return { count, diff }
    }
  )
}

// @flow
import { mkdirpSync } from 'fs-extra'
import { resolve, dirname } from 'path'
import { writeFileSync, readFileSync, readdirSync } from 'fs'
import type { ImgLog } from '../picturebook.types'

const logPath = resolve(__dirname, '../screenshot/reports/logs')

export function writeFile(path: string, data: Object) {
  mkdirpSync(dirname(path))
  writeFileSync(path, JSON.stringify(data, undefined, 2), 'utf-8')
}

export function writeLog(name: string, data: ImgLog) {
  const path = resolve(logPath, `${name}.log`)

  return writeFile(path, data)
}

export function readLogs(): Array<ImgLog> {
  return readdirSync(logPath)
    .filter(fileName => fileName.endsWith('.log'))
    .map(file => JSON.parse(readFileSync(resolve(logPath, file), 'utf-8')))
    .reduce((acc, curr) => [...acc, ...curr], [])
}

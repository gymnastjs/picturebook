// @flow

import { spawn } from 'child_process'
import sauceConnect from 'node-sauce-connect'
import { version } from '../package.json'
import { readLogs, writeFile, compareImages } from './utils'
import type {
  ImgTest,
  ImgResult,
  StoryPaths,
  Status,
} from './picturebook.types'

function logger(cb) {
  return data => {
    console.log(data.toString())

    if (data.includes('you may start your tests.')) {
      cb()
    }
  }
}

function startTunnel(tunnelId: string) {
  console.log(`\n🤖 📗 Setting up tunnel: "${tunnelId}"\n`)

  // make sure there are no previous connections open
  sauceConnect.stop()

  // set up tunnel
  sauceConnect.start([`-i=${tunnelId}`])

  return new Promise(resolve => {
    sauceConnect.defaultInstance.stdout.on('data', logger(resolve))
    sauceConnect.defaultInstance.on('data', logger(resolve))
  })
}

function stopTunnel(exitCode: number): Promise<number> {
  return new Promise((resolve, reject) => {
    sauceConnect.stop()
    if (exitCode === 0) {
      return resolve(0)
    }
    return reject(exitCode)
  })
}

function internalRunTests(configPath: string): Promise<number> {
  // run tests
  console.log('\n🤖 📗 capturing screenshots\n')
  const params = ['--config', configPath, ...process.argv.slice(2)]

  if (!params.includes('--env')) {
    params.push('--env', 'chrome')
  }

  const nightwatch = spawn('./node_modules/.bin/nightwatch', params, {
    stdio: 'pipe',
    env: process.env,
  })
  nightwatch.stdout.on('data', data => console.log(data.toString()))
  nightwatch.stderr.on('data', data => console.error(data.toString()))

  // terminate
  return new Promise(resolve => {
    nightwatch.on('close', resolve)
  })
}

function count(results: Array<ImgTest>, targetStatus: Status): number {
  return results.reduce(
    (total, { status }) => (targetStatus === status ? total + 1 : total),
    0
  )
}

function getOverallStatus(counts: Object): Status | 'EMPTY' {
  if (counts.FAILED > 0) {
    return 'FAILED'
  }
  if (counts.CREATED > 0) {
    return 'CREATED'
  }
  if (counts.SUCCESS > 0) {
    return 'SUCCESS'
  }

  return 'EMPTY'
}

function writeResults(
  outputPath: ?string,
  results: Array<ImgTest>,
  error: Error | null
): ImgResult {
  const counts = {
    CREATED: count(results, 'CREATED'),
    SUCCESS: count(results, 'SUCCESS'),
    FAILED: count(results, 'FAILED'),
  }
  const status = getOverallStatus(counts)
  const date = new Date().toISOString()

  const data = { error, counts, status, results, version, date }

  if (error) {
    console.error(error)
  }

  if (outputPath) {
    writeFile(outputPath, data)
  }

  return data
}

export default async function runTests({
  configPath,
  storyRoot,
  overwrite,
  files,
  tunnelId,
  outputPath,
}: {|
  +storyRoot: string,
  +files: Array<StoryPaths>,
  +overwrite: boolean,
  +tunnelId?: string,
  +configPath: string,
  +outputPath?: string,
|}): Promise<ImgResult> {
  try {
    if (tunnelId) {
      await startTunnel(tunnelId)
    }

    const exitCode = await internalRunTests(configPath)

    if (exitCode !== 0) {
      await stopTunnel(exitCode)
      throw new Error('Error running tests')
    }

    const screenshots = readLogs()
    const results = await compareImages({
      screenshots,
      root: storyRoot,
      overwrite,
      files,
    })

    if (tunnelId) {
      await stopTunnel(exitCode)
    }

    return writeResults(outputPath, results, null)
  } catch (error) {
    return writeResults(outputPath, [], error)
  }
}

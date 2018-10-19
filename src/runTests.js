// @flow
/* eslint-disable no-await-in-loop */
import { spawn } from 'child_process'
import { version } from '../package.json'
import { readLogs, writeFile, compareImages } from './utils'
import type {
  ImgTest,
  ImgResult,
  StoryPaths,
  Status,
  Tunnel,
} from './picturebook.types'

let retryAttempts = 0
let shouldRetry = false
let tunnelInstance

function killTunnelInstance() {
  if (tunnelInstance) {
    tunnelInstance.kill()
  }
}

function retry(resolve, reject, maxRetryAttempts) {
  return () => {
    killTunnelInstance()

    if (++retryAttempts > maxRetryAttempts) {
      shouldRetry = false
      reject(new Error('Unable to connect to Sauce Labs'))
    } else {
      console.log(
        `Sauce Labs connection failed, attempting ${retryAttempts} of ${maxRetryAttempts} retries`
      )
      shouldRetry = true
      resolve()
    }
  }
}

function logger(cb) {
  return data => {
    console.log(data.toString())

    if (data.includes('you may start your tests.')) {
      cb()
    }
  }
}

function startTunnel({ id, binaryPath, maxRetryAttempts = 0 }: Tunnel) {
  console.log(`\n🤖 📗 Setting up tunnel: "${id}"\n`)

  // make sure there are no previous connections open
  killTunnelInstance()

  // set up tunnel
  tunnelInstance = spawn(binaryPath, [`-i=${id}`])

  return new Promise((resolve, reject) => {
    tunnelInstance.stdout.on('data', logger(resolve))
    tunnelInstance.on('data', logger(resolve))
    tunnelInstance.on('error', retry(resolve, reject, maxRetryAttempts))
  })
}

function stopTunnel(exitCode: number): Promise<number> {
  return new Promise((resolve, reject) => {
    killTunnelInstance()

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
  tunnel,
  outputPath,
}: {|
  +storyRoot: string,
  +files: Array<StoryPaths>,
  +overwrite: boolean,
  +tunnel?: Tunnel,
  +configPath: string,
  +outputPath?: string,
|}): Promise<ImgResult> {
  try {
    if (tunnel) {
      do {
        await startTunnel(tunnel)
      } while (shouldRetry)
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

    if (tunnel) {
      await stopTunnel(exitCode)
    }

    return writeResults(outputPath, results, null)
  } catch (error) {
    return writeResults(outputPath, [], error)
  }
}
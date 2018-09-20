// @flow

import { spawn } from 'child_process'
import sauceConnect from 'node-sauce-connect'
import { readLogs } from './utils'
import type { ImgLog } from './picturebook.types'

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

export function runTests(configPath: string): Promise<Array<ImgLog>> {
  return internalRunTests(configPath).then(() => readLogs())
}

export function runTestsWithTunnel(
  tunnelId: string,
  configPath: string
): Promise<Array<ImgLog>> {
  return startTunnel(tunnelId)
    .then(() => internalRunTests(configPath))
    .then(stopTunnel)
    .then(() => readLogs())
    .catch(e => {
      console.error(e)
      return []
    })
}

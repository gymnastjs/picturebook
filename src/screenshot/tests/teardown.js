const https = require('https')

module.exports = function sauce(callback) {
  const { currentTest, options, capabilities } = this.client
  const { username, accessKey } = options
  const sessionId = capabilities['webdriver.remote.sessionid']

  if (!username || !accessKey || !sessionId) {
    callback()
    return
  }

  const passed = currentTest.results.passed === currentTest.results.tests
  const data = JSON.stringify({ passed })
  const requestPath = `/rest/v1/${username}/jobs/${sessionId}`

  function responseCallback(res) {
    res.setEncoding('utf8')
    if (res.statusCode !== 200) {
      console.error('Error updating saucelabs status', res.headers())
    }
    callback()
  }

  try {
    const req = https.request(
      {
        hostname: 'saucelabs.com',
        path: requestPath,
        method: 'PUT',
        auth: `${username}:${accessKey}`,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      },
      responseCallback
    )

    req.on('error', e => {
      console.error(`problem with request: ${e.message}`)
      callback()
    })
    req.write(data)
    req.end()
  } catch (error) {
    console.log('Error', error)
    callback()
  }
}

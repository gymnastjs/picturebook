// @flow
/* eslint-disable no-console */
import * as React from 'react'

export default () => <button type="button" onClick={() => console.error('testing')}>I log an error to the console!</button>

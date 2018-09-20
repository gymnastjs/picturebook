// @flow
export default function moduleAsFunction(unknown: any): Function {
  if (typeof unknown === 'function') {
    return unknown
  }

  if (unknown && typeof unknown.default === 'function') {
    return unknown.default
  }

  throw new Error('Unable to load story')
}

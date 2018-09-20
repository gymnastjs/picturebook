// @flow
import moduleAsFunction from './moduleAsFunction'

describe('moduleAsFunction', () => {
  it('should return the input if it already is a function', () => {
    const spy = jest.fn()
    expect(moduleAsFunction(spy)).toBe(spy)
  })

  it('should return the default function if the input is an object with a default function', () => {
    const spy = { default: jest.fn() }
    expect(moduleAsFunction(spy)).toBe(spy.default)
  })

  it('should throw if a function is not found', () => {
    expect(() => moduleAsFunction(3)).toThrow()
  })
})

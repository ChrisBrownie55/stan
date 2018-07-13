const stan = require('./index.js')

const actualValue = stanObject => stanObject[Object.getOwnPropertySymbols(stanObject)[1]]
const getSubscriptions = stanObject => stanObject[Object.getOwnPropertySymbols(stanObject)[0]]

it('Number assignment', () => {
  const num = stan(0)

  expect(num.value).toBe(0)
  expect(actualValue(num)).toBe(0)

  num.value = Infinity

  expect(num.value).toBe(Infinity)
  expect(actualValue(num)).toBe(Infinity)
})

it('String assignment', () => {
  const string = stan('')

  expect(string.value).toBe('')
  expect(actualValue(string)).toBe('')

  string.value = 'Hello World'

  expect(string.value).toBe('Hello World')
  expect(actualValue(string)).toBe('Hello World')
})

it('Object assignment', () => {
  const object = stan({})

  expect(object.value).not.toBe({})
  expect(object.value).toEqual({})
  expect(actualValue(object)).not.toBe({})
  expect(actualValue(object)).toEqual({})

  const newObject = {
    a: 'b',
    1: 2,
    '{}': {c: 'd'},
    '[]': [3],
  }
  object.value = newObject

  expect(object.value).toBe(newObject)
  expect(object.value).toEqual(newObject)
  expect(actualValue(object)).toBe(newObject)
  expect(actualValue(object)).toEqual(newObject)
})

it('Array assignment', () => {
  const array = stan([])

  expect(array.value).not.toBe([])
  expect(array.value).toEqual([])
  expect(actualValue(array)).not.toBe([])
  expect(actualValue(array)).toEqual([])

  const newArray = [
    'a',
    1,
    {b: 'c'},
    [2],
  ]
  array.value = newArray

  expect(array.value).not.toBe(newArray)
  expect(array.value).toEqual(newArray)
  expect(actualValue(array)).not.toBe(newArray)
  expect(actualValue(array)).toEqual(newArray)
})

describe('Subscriptions', () => {
  const state = stan({
    cart: [],
  })

  describe('Subscription function', () => {
    const subscriber = jest.fn((newState, oldState) => {
      it('gives new and old data', () => {
        expect(newState).toEqual({
          cart: ['nacho cheese'],
        })

        expect(oldState).toEqual({
          cart: [],
        })
      })

      it('Is called once', () => expect(subscriber).toHaveBeenCalledTimes(1))
    })

    it('Subscriber is registered in array', () => {
      state.subscribe(subscriber)

      expect(getSubscriptions(state).length).toBe(1)
      expect(getSubscriptions(state)[0]).toBe(subscriber)
    })

    state.value = {
      ...state.value,
      cart: state.value.cart.concat('nacho cheese'),
    }

    it('Function was removed from subscription list', () => {
      state.unsubscribe(subscriber)
      expect(getSubscriptions(state).length).toBe(0)
    })
  })

  describe('Multiple different subscribers', () => {
    const subscribers = [...Array(3)].map((_, index) => jest.fn(() => index))

    it('Are all called once each', () => {
      subscribers.forEach(subscriber => state.subscribe(subscriber))

      state.value = {}

      expect(getSubscriptions(state).length).toBe(3)
      subscribers.forEach(subscriber => expect(subscriber).toHaveBeenCalledTimes(1))
    })

    it('Are removed on unsubscribe', () => {
      subscribers.forEach(currentSubscriber => state.unsubscribe(currentSubscriber))
      expect(getSubscriptions(state).length).toBe(0)
    })
  })

  describe('Multiple of one subscriber function', () => {
    const subscriber = jest.fn(() => {})

    it('Is called multiple times',
      () => {
        state.subscribe(subscriber)
        state.subscribe(subscriber)
        state.subscribe(subscriber)

        state.value = {}

        expect(subscriber).toHaveBeenCalledTimes(3)
      })

    it('Is removed on unsubscribe',
      () => {
        state.unsubscribe(subscriber)
        expect(getSubscriptions(state).length).toBe(0)
      })
  })
})

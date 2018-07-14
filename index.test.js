const stan = require('./index.js')


it('Number assignment', () => {
  const num = stan(0)

  expect(num.value).toBe(0)

  num.value = Infinity

  expect(num.value).toBe(Infinity)
})

it('String assignment', () => {
  const string = stan('')

  expect(string.value).toBe('')

  string.value = 'Hello World'

  expect(string.value).toBe('Hello World')
})

it('Object assignment', () => {
  const object = stan({})

  expect(object.value).not.toBe({})
  expect(object.value).toEqual({})

  const newObject = {
    a: 'b',
    1: 2,
    '{}': {c: 'd'},
    '[]': [3],
  }
  object.value = newObject

  expect(object.value).not.toBe(newObject)
  expect(object.value).toEqual(newObject)
})

it('Array assignment', () => {
  const array = stan([])

  expect(array.value).not.toBe([])
  expect(array.value).toEqual([])

  const newArray = [
    'a',
    1,
    {b: 'c'},
    [2],
  ]
  array.value = newArray

  expect(array.value).not.toBe(newArray)
  expect(array.value).toEqual(newArray)
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

    state.subscribe(subscriber)

    state.value = {
      ...state.value,
      cart: state.value.cart.concat('nacho cheese'),
    }

    state.unsubscribe(subscriber)

    it('Is not called after unsubscription', () => {
      state.value = 'should not fire off `subscription` again'
      expect(subscriber).toHaveBeenCalledTimes(1)
    })
  })

  describe('Multiple different subscribers', () => {
    const subscribers = [...Array(3)].map((_, index) => jest.fn(() => index))

    it('Are all called once each', () => {
      subscribers.forEach(subscriber => state.subscribe(subscriber))

      state.value = {}

      subscribers.forEach(subscriber => expect(subscriber).toHaveBeenCalled())
    })

    it('Are removed on unsubscribe', () => {
      subscribers.forEach(currentSubscriber => state.unsubscribe(currentSubscriber))
      state.value = 'none of `subscribers` should have been called again'
      subscribers.forEach(subscriber => expect(subscriber).toHaveBeenCalledTimes(1))
    })
  })

  describe('Multiple of one subscriber function', () => {
    const subscriber = jest.fn(() => {})

    it('Is called multiple times', () => {
      state.subscribe(subscriber)
      state.subscribe(subscriber)
      state.subscribe(subscriber)

      state.value = {}

      expect(subscriber).toHaveBeenCalledTimes(3)
    })

    it('Is removed on unsubscribe', () => {
      state.unsubscribe(subscriber)
      state.value = '`subscriber` should not be called three more times'
      expect(subscriber).toHaveBeenCalledTimes(3)
    })
  })
})

describe('Immutability of:', () => {
  it('String', () => {
    const string = stan('I am immutable')
    string.value[0] = 'U'
    expect(string.value[0]).toBe('I')
  })

  it('Array', () => {
    const array = stan([1, 2, 3, 4, 5])
    array.value.splice(3)
    expect(array.value).toEqual([1, 2, 3, 4, 5])
  })

  it('Object', () => {
    const object = stan({
      isImmutable: true,
    })
    object.value.isImmutable = false
    expect(object.value).toEqual({
      isImmutable: true,
    })
  })
})

describe('Modifiers', () => {
  it('Are called before listeners', () => {
    const num = stan(0)

    const modifier = value => value * 2
    const listener = value => expect(value).toBe(100)

    num.subscribe(modifier, true)
    num.subscribe(listener)

    num.value = 50
  })
})

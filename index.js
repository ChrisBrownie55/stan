const copyOf = value => {
  let copiedValue
  if (Array.isArray(value)) {
    copiedValue = value.map(currentValue => copyOf(currentValue))
  } else if (typeof value === 'object') {
    copiedValue = Object
      .keys(value)
      .reduce((newObject, key) => {
        newObject[key] = copyOf(value[key])
        return newObject
      }, {})
  } else {
    copiedValue = value
  }

  return copiedValue
}

const stan = initialValue => {
  const value = Symbol('value')
  const subscriberList = Symbol('subscriberList')
  return {
    [subscriberList]: [],
    subscribe(subscriberFunction) {
      this[subscriberList].push(subscriberFunction)
    },
    unsubscribe(subscriber) {
      this[subscriberList] = this[subscriberList].filter(currentSubscriber => currentSubscriber !== subscriber)
    },

    [value]: initialValue,
    get value() {
      return copyOf(this[value])
    },
    set value(newValue) {
      this[subscriberList].forEach(subscriber => subscriber(copyOf(newValue), copyOf(this[value])))
      this[value] = copyOf(newValue)
    },
  }
}

module.exports = stan

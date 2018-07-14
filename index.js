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

const stan = (value, subscriberList=[], modifierList=[]) => {
  return {
    subscribe(subscriberFunction, isModifier=false) {
      if (isModifier) modifierList.push(subscriberFunction)
      else subscriberList.push(subscriberFunction)
    },
    unsubscribe(subscribedFunction) {
      [subscriberList, modifierList] = [subscriberList, modifierList].map(
        list => list.filter(currentFunction => currentFunction !== subscribedFunction)
      )
    },

    get value() {
      return copyOf(value)
    },
    set value(newValue) {
      newValue = modifierList.reduce((finalValue, modifier) => modifier(finalValue), copyOf(newValue))
      subscriberList.forEach(subscriber => subscriber(newValue, copyOf(value)))
      value = copyOf(newValue)
    },
  }
}

module.exports = stan

/**
 * Creates a deep copy of any value passed in
 * @function copyOf
 * @param {*} value the value to make a copy of
 * @return {*} the copied value
 */
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

/**
 * An immutable, observable value
 * @function stan
 * @param   {*}          value           the initial value
 * @param   {Callback[]} subscriberList  the initial subscriber list
 * @param   {Callback[]} modifierList    the initial modifier list
 * @return  {Object}
 */

const stan = (value, subscriberList=[], modifierList=[]) => {
  /**
   * Callback for observing changes in a value
   * @callback Callback
   * @param {*} newValue the value being set
   * @param {*} oldValue the old value being replaced
   */

  return {
    /**
     * Subscribe to changes in value, allows for modifiers (functions that modify the value before it is set)
     * @method subscribe
     * @param {Callback} callback function to be added to subscriberList
     * @param {Boolean}  isModifier determines whether or not the subscriberFunction goes to subscriberList or modifierList
     */
    subscribe(callback, isModifier=false) {
      if (isModifier) modifierList.push(callback)
      else subscriberList.push(callback)
    },

    /**
     * Remove a previously subscribed function
     * @method unsubscribe
     * @param {Callback} subscribedCallback a function that is either in subscriberList or modifierList
     */
    unsubscribe(subscribedCallback) {
      [subscriberList, modifierList] = [subscriberList, modifierList].map(
        list => list.filter(callback => callback !== subscribedCallback)
      )
    },

    /**
     * Immutable getter for value
     * @type {*}
     */
    get value() {
      return copyOf(value)
    },

    /**
     * Immutable setter for value
     * @param {*} newValue the new value to be copied into value
     */
    set value(newValue) {
      newValue = modifierList.reduce((finalValue, modifier) => modifier(finalValue), copyOf(newValue))
      subscriberList.forEach(subscriber => subscriber(newValue, copyOf(value)))
      value = copyOf(newValue)
    },
  }
}

if (typeof module === 'object') {
  module.exports = stan
}

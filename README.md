<h1 align=center> Stanager </h1>
<p align=center>_Stanager is an immutable state manager with subscribe and unsubscribe features based on git.io/Valoo_</p>

## Installation

```bash
npm i stanager
```

## Usage

```js
const stanager = require('stanager')
// or
import stanager from 'stanager'

// create an observable value:
const shoppingCart = stanager(['bread'])

// assign new value:
shoppingCart.value = shoppingCart.value.concat(['meatballs', 'flat bread')

console.log(shoppingCart.value)
// output: ['meatballs', 'flat bread']

// subscribe to changes:
const changeLogger = (newCart, oldCart) => {
  const changes = {
    removed: oldCart.filter(item => newCart.indexOf(item) === -1),
    added: newCart.filter(item => oldCart.indexOf(item) === -1),
  }
  
  changes.removed.forEach(item => console.log(`removed: '${item}'`))
  changes.added.forEach(item => console.log(`added: '${item}'`))
}

shoppingCart.subscribe(changeLogger)

// invoke listener(s):
shoppingCart.value = shoppingCart.value.filter(item => item.indexOf('bread') === -1).concat('marinara sauce')

/* output:
removed: 'bread'
removed: 'flat bread'
added: 'marinara sauce'
*/

// get current value:
shoppingCart.value
```
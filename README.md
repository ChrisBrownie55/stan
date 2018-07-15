<h1 align=center> 👩‍💼 Stanager (stan) </h1>
<p align=center><em>Stanager is an immutable state manager with subscribe and unsubscribe features based on https://git.io/Valoo</em></p>

<p align=center><img width=650 alt='Screenshot of stanager in action via carbon.now.sh' src='Screenshots/stanager-carbon.png' /></p>

## Installation

```bash
npm i stanager
```

## Usage

Hotlink it from __https://unpkg.com/stanager__, or if you need to use ES6 modules try __https://unpkg.com/stanager/index.mjs__.

See [interactive Codepen demo.](https://codepen.io/chbchb55/pen/MBazqy)

```js
const stan = require('stanager')
// or
import stan from 'stanager'
// or
import stan from 'https://unpkg.com/stanager'
// or
import stan from 'https://unpkg.com/stanager/index.mjs'

// create an observable value:
const shoppingCart = stan(['bread'])

// assign new value:
shoppingCart.value = shoppingCart.value.concat(['meatballs', 'flat bread'])

// create listener function:
const changeLogger = (newCart, oldCart) => {
  const changes = {
    removed: oldCart.filter(item => newCart.indexOf(item) === -1),
    added: newCart.filter(item => oldCart.indexOf(item) === -1),
  }
  
  changes.removed.forEach(item => console.log(`removed: '${item}'`))
  changes.added.forEach(item => console.log(`added: '${item}'`))
}

// subscribe to changes:
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
### Version 1.1.0
You not only have _listeners_, but you also have **_modifiers_**. These are created the same way as listeners, but instead of just passing the function to `subscribe()`, you also need to pass in `true` as the second argument. `subscribe(func, true)` creates a modifier.

```js
// create an observabe value:
const shoppingCart = stan({
  products: [],
})

let discount = 1 - 0.25 // 25% off

// create modifier function
const discountApplier = cart => ({
  ...cart,
  products: cart.products.map(product => ({
    ...product,
    discount: product.discount || product.price * discount,
  })),
})

// subscribe to changes and modify them
shoppingCart.subscribe(discountApplier, true)

let currentCart = shoppingCart.value
currentCart.products.push({
  name: 'blouse',
  price: 38
})

// assign new value
shoppingCart.value = currentCart

/* output:

{
  products: [{
    name: 'blouse',
    price: 38,
    discount: 28.5
  }]
}

*/

// unsubscribe modifier
shoppingCart.unsubscribe(discountApplier)
```

## How it works:

When you run `stan(value)` it returns an object with four methods:

```js
{
  subscribe(...) {...},
  unsubscribe(...) {...},
  get value() {...},
  set value(...) {...},
}
```

You can use these four methods to _listen_, and _unlisten_ to value changes, and to _set/get_ the value, as per their names. However, you __cannot__ mutate the data, hence the term immutable. Even if you pass in an array or object and you change some stuff elsewhere, it won't affect this because everything is recursively copied.

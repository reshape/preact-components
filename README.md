# Reshape Preact Components

[![npm](https://img.shields.io/npm/v/reshape-preact-components.svg?style=flat-square)](https://npmjs.com/package/reshape-preact-components)
[![tests](https://img.shields.io/travis/reshape/preact-components.svg?style=flat-square)](https://travis-ci.org/reshape/preact-components?branch=master)
[![dependencies](https://img.shields.io/david/reshape/preact-components.svg?style=flat-square)](https://david-dm.org/reshape/preact-components)
[![coverage](https://img.shields.io/codecov/c/github/reshape/preact-components.svg?style=flat-square)](https://codecov.io/gh/reshape/preact-components)

Render preact components to static html and use them like custom elements.

> **Note:** This project is in early development, and versioning is a little different. [Read this](http://markup.im/#q4_cRZ1Q) for more details.

### Installation

`yarn add reshape-preact-components`

### Usage

Setup is pretty simple -- just add the plugin to reshape and pass it an object with the key being the custom element name you want to be replaced with the rendered component, and the value as the actual component. Reshape will render your components and replace the given custom element names with the components' static html.

```js
const {h} = require('preact')
const reshape = require('reshape')
const renderComponents = require('reshape-preact-components')

const MyComponent = ({ foo }) => {
  return h('p', {}, `the value of foo is "${foo}"`)
}

const html = "<my-component foo='bar' />"

reshape({ plugins: [renderComponents({ 'my-component': MyComponent })] })
  .process(html)
  .then((res) => {
    console.log(res.output()) // <p>the value of foo is "bar"</p>
  })
```

#### Hydrating Initial State

So there is one case where you might want some additional logic to avoid duplication. Luckily, we have this logic ready to go, and will walk you through both the use case and solution here. So imagine you have a component like this:

```js
export default class SortableList {
  render () {
    return (
      <ul className='sortable'>
        <span className='sort-icon' />
        {this.props.children}
      </ul>
    )
  }

  componentDidMount () {
    // some logic here to make this list sortable
  }
}
```

Now you set up the component through the plugin as such:

```js
const renderComponents = require('reshape-preact-components')
const SortableList = require('./sortable-list')

renderComponents({ 'sortable-list': SortableList })
```

And now in your html, you'd put down something like this:

```html
<body>
  <sortable-list>
    <li>wow</li>
    <li>amaze</li>
    <li>very list</li>
  </sortable-list>
</body>
```

Ok, so you would get the rendered out `ul` with the classes and span elements you wanted, as expected. However, with this element, you definitely want to also client-side render it since it contains interactive elements. So if your client-side javascript, you run something like this:

```js
const {render} = require('preact')
const SortableList = require('./sortable-list')

render(<SortableList />, document.body, document.querySelector('.sortable'))
```

Ok so this would find the right element and add the javascript interactivity on top. But it would also remove all the contents of your list as soon as the javascript render loads in, because you just rendered an empty element in the code above. Oops! Let's fix that:

```js
const {render} = require('preact')
const SortableList = require('./sortable-list')

render(
  <SortableList>
    <li>wow</li>
    <li>amaze</li>
    <li>very list</li>
  </SortableList>,
  document.body,
  document.querySelector('.sortable')
)
```

Ok so this works, but now we have some seriously non-DRY code. Now our markup has to be repeated both in our html for the initial static render, and in the client-side js for the client render. Luckily, `reshape-preact-components` has got your back. By default, it takes the initial html you used to render your preact element, parsed into a reshape AST and compressed as efficiently as possible, and gives it to your element as a prop called `_state`. It also provides a helper that you can use to decompress and hydrate it into a vdom tree that can be directly rendered by preact. So let's take advantage of this in our code and completely cut out all repetition - starting with our component.

What we'll do here is put our compressed initial state on a data attribute so that our client-side js can pick it up and hydrate:

```js
export default class SortableList {
  render () {
    return (
      <ul className='sortable' data-state={this.props._state}>
        <span className='sort-icon' />
        {this.props.children}
      </ul>
    )
  }

  componentDidMount () {
    // some logic here to make this list sortable
  }
}
```

You can see on the top level `ul`, we placed an additional data prop. If you render this to the page, you'll see something like this:

```html
<ul class='sortable' data-state='3nko2ir2cR3i2nr2croi23nrc23='></ul>
```

Now let's pick up that compressed initial state from out client side javascript:

```js
const {render} = require('preact')
const SortableList = require('./sortable-list')
const sortableEl = document.querySelector('.sortable')
console.log(sortable.dataset.state)
```

Looking good -- now we can pull in `reshape-preact-components`'s helper function that will hydrate the initial state as a vdom tree that's directly renderable by preact. We just need to pass it the compressed initial state, and a remapping back from the custom element name to the actual component as we required it on the client side.

```js
const {render} = require('preact')
const SortableList = require('./sortable-list')
const {hydrateInitialState} = require('reshape-preact-components/browser')

const sortableEl = document.querySelector('.sortable')
const vdom = hydrateInitialState(sortableEl.dataset.state, {
  'sortable-list': SortableList
})

console.log(vdom)
```

Note that for client side code, we require from `reshape-preact-components/browser`. Although full es-module compatibility would allow a selective import that avoided additional dependencies, at the moment both node stable and many build systems are *not* yet es-module compatible, so it's safer to import from a separate namespace to ensure there is no extra bloat for the client-side code.

> *Note:* If you're using webpack2, you can require `reshape-preact-components/browser.esm` to get a version that uses es modules

In the console log, you'll see that we have a full preact vdom ready to go, using the right components everywhere you needed them. Now the last step is just to render it!

```js
const {render} = require('preact')
const SortableList = require('./sortable-list')
const {hydrateInitialState} = require('reshape-preact-components/browser')

const sortableEl = document.querySelector('.sortable')
const vdom = hydrateInitialState(sortableEl.dataset.state, {
  'sortable-list': SortableList
})

render(vdom, document.body, sortableEl)
```

And that's it! You'll see no visual difference, as preact won't re-render existing html, but it will remove the `data-state` property and layer on the javascript interaction as soon as it loads. Perfect!

### Passing Complex Data Into Components

You might find yourself in a situation in which you want to pass a large js object into your component at some point. This works fluidly with client-only react, since its javascript -> javascript, but when you are rendering as static, the data is written as static and transmitted via http before being consumed by javascript. This causes two issues.

First, html is parsed such that attribute values start and end with quotes. So if you have something like `<div data="{ foo: "bar" }"></div>`, you now have a parsing issue. HTML parsers will think that as soon as it hits the second double quote, you are done with your attribute value, and now you've got screwed up data and invalid html.

Second, since you are going to be transmitting this data directly in your html, it is included directly in your http requests and will appear in your html. As such, it would be a benefit to compress the data to minimize size.

There are two ways that this can be accomplished. The first is to only pass data that you need into your component, attribute by attribute, as such:

```html
<my-component
  something='xxx'
  somethingElse='yyy'
  wowMoreThings='zzz'
  lastThing='aaa'
></my-component>
```

The second way is to serialize your full object, pass it in a single attribute, and deserialze on the other end. This library exposes simple and efficient serialization and deserialization functions that you can use for this purpose. Using [spike](https://spike.cf) as an example here:

```js
// app.js
const renderComponents = require('reshape-preact-components')
const MyComponent = require('./my-component')

module.exports = {
  reshape: htmlStandards({
    locals: { encode: render.encode, data: { foo: 'bar' } },
    appendPlugins: [renderComponents({ 'my-component': MyComponent })]
  })
}
```

```html
<!-- index.html -->
<my-component data='{{ encode(data) }}'></my-component>
```

```js
// my-component.js
const {h} = require('preact')
const {decode} = require('reshape-preact-components/browser')

module.exports = ({ data }) => {
  const _data = decode(data)
  return (<p>JSON.stringify(_data)</p>)
}
```

### License & Contributing

- Details on the license [can be found here](LICENSE.md)
- Details on running tests and contributing [can be found here](contributing.md)

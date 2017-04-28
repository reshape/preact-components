# reshape-preact-ssr

[![npm](https://img.shields.io/npm/v/reshape-preact-ssr.svg?style=flat-square)](https://npmjs.com/package/reshape-preact-ssr)
[![tests](https://img.shields.io/travis/reshape/reshape-preact-ssr.svg?style=flat-square)](https://travis-ci.org/reshape/reshape-preact-ssr?branch=master)
[![dependencies](https://img.shields.io/david/reshape/reshape-preact-ssr.svg?style=flat-square)](https://david-dm.org/reshape/reshape-preact-ssr)
[![coverage](https://img.shields.io/coveralls/reshape/reshape-preact-ssr.svg?style=flat-square)](https://coveralls.io/r/reshape/reshape-preact-ssr?branch=master)
[![coverage](https://img.shields.io/codecov/c/github/reshape/reshape-preact-ssr.svg?style=flat-square)](https://codecov.io/gh/reshape/reshape-preact-ssr)

Render preact components to static html and use them like custom elements.

> **Note:** This project is in early development, and versioning is a little different. [Read this](http://markup.im/#q4_cRZ1Q) for more details.

### Installation

`yarn add reshape-preact-ssr`

### Usage

```js
const {h} = require('preact')
const reshape = require('reshape')
const ssr = require('reshape-preact-ssr')

const MyComponent = ({ foo }) => {
  return h('p', {}, `the value of foo is "${foo}"`)
}

const html = "<my-component foo='bar' />"

reshape({ plugins: [ssr({ 'my-component': MyComponent })] })
  .process(someHtml)
  .then((res) => {
    const result = res.output() // <p>the value of foo is "bar"</p>
  })
```

### License & Contributing

- Details on the license [can be found here](LICENSE.md)
- Details on running tests and contributing [can be found here](contributing.md)

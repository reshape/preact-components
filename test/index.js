const {h} = require('preact')
const reshape = require('reshape')
const ssr = require('..')
const test = require('ava')

test('basic', (t) => {
  const MyComponent = ({ foo }) => {
    return h('p', {}, `the value of foo is "${foo}"`)
  }

  const html = "<my-component foo='bar' />"

  return reshape({ plugins: [ssr({ 'my-component': MyComponent })] })
    .process(html)
    .then((res) => {
      t.is(res.output(), '<p>the value of foo is "bar"</p>')
    })
})

test('multi element, different props', (t) => {
  const MyComponent = ({ foo }) => {
    return h('p', {}, `the value of foo is "${foo}"`)
  }

  const html = "<my-component foo='bar' /><p>wow</p><my-component foo='wow' />"

  return reshape({ plugins: [ssr({ 'my-component': MyComponent })] })
    .process(html)
    .then((res) => {
      t.is(res.output(), '<p>the value of foo is "bar"</p><p>wow</p><p>the value of foo is "wow"</p>')
    })
})

test('renders children', (t) => {
  const MyComponent = ({ foo, children }) => {
    return h('div', { class: 'parent' }, 'hello', children)
  }

  const c2 = () => {
    return h('div', { class: 'wow' }, 'hello from c2')
  }

  const html = "<my-component foo='bar'><p>wow</p><div><c2></c2></div></my-component>"

  return reshape({ plugins: [ssr({ 'my-component': MyComponent, c2 })] })
    .process(html)
    .then((res) => {
      t.is(res.output(), '<div class="parent">hello<p>wow</p><div><div class="wow">hello from c2</div></div></div>')
    })
})

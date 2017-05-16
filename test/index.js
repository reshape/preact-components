const preact = require('preact')
const h = preact.h
const {render} = require('preact-render-to-string')
const reshape = require('reshape')
const components = require('..')
const test = require('ava')
const {JSDOM} = require('jsdom')
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

test('basic', (t) => {
  const MyComponent = ({ foo }) => {
    return h('p', {}, `the value of foo is "${foo}"`)
  }

  const html = "<my-component foo='bar' />"

  return reshape({ plugins: [components({ 'my-component': MyComponent })] })
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

  return reshape({ plugins: [components({ 'my-component': MyComponent })] })
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

  return reshape({ plugins: [components({ 'my-component': MyComponent, c2 })] })
    .process(html)
    .then((res) => {
      t.is(res.output(), '<div class="parent">hello<p>wow</p><div><div class="wow">hello from c2</div></div></div>')
    })
})

test('initial state rehydration', (t) => {
  const component = `
    function MyComponent ({ foo, _state }) {
      return preact.h('p', { 'data-state': _state }, 'the value of foo is "' + foo + '"')
    }
  `
  const MyComponent = eval(`${component}; MyComponent`)
  const html = "<my-component foo='bar' />"

  return reshape({ plugins: [components({ 'my-component': MyComponent })] })
    .process(html)
    .then((res) => {
      const dom = new JSDOM(`
        ${res.output()}
        <script>
          // require preact
          ${fs.readFileSync(path.join(__dirname, '../node_modules/preact/dist/preact.js'))}
          // require reshapePreact
          ${fs.readFileSync(path.join(__dirname, '../lib/browser.js'))}
          // our custom component
          ${component}
          // implementation
          var el = document.querySelector('p')
          window.out = reshapePreact.hydrateInitialState(el.getAttribute('data-state'), {
            'my-component': MyComponent
          })
        </script>
      `, { runScripts: 'dangerously' })
      t.is(render(dom.window.out), '<p>the value of foo is &quot;bar&quot;</p>')
    })
})

test('node encode and decode', (t) => {
  const data = JSON.stringify({ foo: 'bar' })
  const encoded = components.encode(data)
  const decoded = components.decode(encoded)
  t.is(data, decoded)
})

test('browser encode and decode', (t) => {
  const data = JSON.stringify({ foo: 'bar' })
  const dom = new JSDOM(`
    <script>
      // require preact, because its referenced in the browser lib
      ${fs.readFileSync(path.join(__dirname, '../node_modules/preact/dist/preact.js'))}
      // require browser lib
      ${fs.readFileSync(path.join(__dirname, '../lib/browser.js'))}
      // implementation
      var encoded = reshapePreact.encode(${data})
      window.decoded = reshapePreact.decode(encoded)
    </script>
  `, { runScripts: 'dangerously' })
  t.is(dom.window.decoded.foo, 'bar')
})

// webpack erroring with jsdom for some reason
test.skip.cb('webpack loads es module version in browser', (t) => {
  const fixturesPath = path.join(__dirname, 'fixtures')
  webpack({
    entry: path.join(fixturesPath, 'entry'),
    output: { filename: 'bundle.js', path: fixturesPath}
  }, (err, stats) => {
    // console.log(fs.readFileSync(path.join(fixturesPath, 'bundle.js'), 'utf8'))
    const dom = new JSDOM(`
      <script>
        ${fs.readFileSync(path.join(fixturesPath, 'bundle.js'), 'utf8')}
      </script>
    `, { runScripts: 'dangerously' })
    console.log(dom.window.result)
    fs.unlinkSync(path.join(fixturesPath, 'bundle.js'))
    t.end()
  })
})

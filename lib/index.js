const util = require('reshape-plugin-util')
const {render} = require('preact-render-to-string')
const {h} = require('preact')
const parse = require('reshape-parser')
const {gzipSync, gunzipSync} = require('zlib')

module.exports = (components) => {
  return (tree) => {
    return util.modifyNodes(tree, (node) => {
      return Object.keys(components).indexOf(node.name) > -1
    }, (node) => {
      // encode/compress the original html structure
      // this can be rehydrated later to reduce client/server duplication
      const originalHtml = encode(node)
      return parse(render(toVnode(components, node, originalHtml)))
    })
  }
}

// Given an encoded _ssr attribute and an object that maps keys as custom
// element names to values as preact components, provides a full rehydrated
// vdom object representing the initial state before server rendering
module.exports.hydrateInitialState = (encoded, components) => {
  return toVnode(components, decode(encoded))
}

function toVnode (components, node, originalHtml) {
  // get element name or component name if registered
  const name = components[node.name] || node.name
  // convert props to strings
  const props = {}
  for (let k in node.attrs) {
    props[k] = node.attrs[k].map((n) => n.content).join('')
  }
  // if there is a compressed original source, add it as _ssr prop
  if (originalHtml) { props._ssr = originalHtml }
  // content is either a string, a subtree, or there isn't any
  if (typeof node.content === 'string') {
    return h(name, props, node.content)
  } else if (Array.isArray(node.content)) {
    const subtree = node.content.map((n) => {
      if (n.type === 'tag') return toVnode(components, n)
      if (n.type === 'text') return n.content
    })
    return h(name, props, subtree)
  } else {
    return h(name, props)
  }
}

function encode (data) {
  return gzipSync(JSON.stringify(data)).toString('base64')
}
module.exports.encode = encode

function decode (data) {
  return JSON.parse(gunzipSync(Buffer.from(data, 'base64')))
}
module.exports.decode = decode

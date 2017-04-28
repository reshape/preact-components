const util = require('reshape-plugin-util')
const {render} = require('preact-render-to-string')
const {h} = require('preact')
const parse = require('reshape-parser')

module.exports = (components) => {
  return (tree) => {
    return util.modifyNodes(tree, (node) => {
      return Object.keys(components).indexOf(node.name) > -1
    }, (node) => {
      const Component = components[node.name]
      const props = {}
      for (let k in node.attrs) {
        props[k] = node.attrs[k].map((n) => n.content).join('')
      }
      return parse(render(h(Component, props)))
    })
  }
}

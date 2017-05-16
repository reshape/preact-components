import {h} from 'preact'

export default function toVnode (components, node, originalHtml) {
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

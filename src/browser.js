import toVdom from './reshape-ast-to-vdom'
import {browserDecode} from './serialize'

export function hydrateInitialState (encoded, components) {
  return toVdom(components, browserDecode(encoded))
}

export {browserEncode as encode, browserDecode as decode} from './serialize'

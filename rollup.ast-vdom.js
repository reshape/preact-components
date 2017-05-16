import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'src/reshape-ast-to-vdom.js',
  external: ['preact'],
  plugins: [nodeResolve()],
  dest: 'lib/reshape-ast-to-vdom.js',
  format: 'cjs'
}

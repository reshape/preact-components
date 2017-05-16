import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify-es'

export default {
  entry: 'src/browser.js',
  external: ['preact'],
  globals: { preact: 'preact' },
  plugins: [
    nodeResolve({ browser: true }),
    commonjs({ include: ['node_modules/**', 'src/*'] }),
    babel(),
    uglify()
  ],
  targets: [
    { dest: 'lib/browser.js', format: 'umd', moduleName: 'reshapePreact' },
    { dest: 'lib/browser.esm.js', format: 'es' }
  ]
}

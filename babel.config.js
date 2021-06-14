module.exports = {
  presets: [
    ['@vue/app'],
    ['@babel/preset-env', {
      'useBuiltIns': 'usage',
      'corejs': '3'
    }]
  ],
  plugins: ['@babel/plugin-transform-runtime', "@babel/plugin-transform-modules-commonjs"],
}

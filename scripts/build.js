const path = require('path');
const fs = require('fs')
const System = require('systemjs');
const Builder = require('systemjs-builder');

const builder = new Builder(path.resolve(__dirname, '../tmp'));

builder.config({
  transpiler: "babel",
  bundles: { "index.js": ["bootstrap"] }
});

builder.buildStatic('index.js', path.resolve(__dirname,'../dist/index.js'), { globalName: 'App' })
  .then(() => console.log('Build complete'))
  .catch(err => console.log('Build error', err));

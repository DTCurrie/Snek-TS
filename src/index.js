require('babel-polyfill');
require('systemjs');

System.config({
  transpiler: "typescript",
  baseURL: "/",
  bundles: {
    "app.js": ["bootstrap"],
  },
  map: {
    text: '../../node_modules/systemjs-plugin-text/text.js'
  }
});

System.import("bootstrap");

require('babel-polyfill');
require('systemjs');

System.config({
  transpiler: "babel",
  baseURL: "/",
  bundles: {
    "index.js": ["bootstrap"],
  }
});
System.import("bootstrap");

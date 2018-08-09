const path = require('path');
const fs = require('fs')
const requirejs = require('requirejs');
const config = {
    baseUrl: path.resolve(__dirname, '../tmp'),
    name: 'index',
    out: path.resolve(__dirname, '../tmp/index-built.js'),
    paths: { requireLib: path.resolve(__dirname, '../node_modules/requirejs/require') },
    include: ["requireLib"]
};

requirejs.optimize(config, (buildResponse) => fs.readFileSync(config.out, 'utf8'), (err) => console.log('Build Error: ', err));

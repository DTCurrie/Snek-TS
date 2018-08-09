const path = require('path');
const imagemin = require('imagemin-keep-folder');
const imageminPngquant = require('imagemin-pngquant');

imagemin([path.resolve(__dirname, '../', 'src', 'images/**/*.png')], {
  plugins: [ imageminPngquant({ quality: '80-100', speed: 1 })],
  replaceOutputDir: output => output.replace(/src\/images\//, `dist/images/`)
}).then(files => files.forEach(file => console.log(file.path)));

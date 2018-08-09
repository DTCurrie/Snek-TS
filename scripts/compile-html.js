const path = require('path');
const fs = require('fs');

const fileArray = [];

function getViews(directory) {
  fs.readdirSync(directory).forEach(file => {
    const fileName = path.join(directory, file);
    if (fs.lstatSync(fileName).isDirectory()) {
      getViews(fileName);
    } else if (fileName.indexOf('.html') >= 0) {
      fileArray.push(fileName);
    };
  })
};

function compileView(fileName) {
  const file = fs.readFileSync(fileName, 'utf-8');
  const fileNameArray = fileName.split('/');
  let newPathDir = path.join(__dirname, '../dist');

  if (!fs.existsSync(newPathDir)) fs.mkdirSync(newPathDir);
  fs.writeFileSync(path.join(newPathDir, fileNameArray[fileNameArray.length - 1]), file);
}

function compileViews() {
  getViews(path.join(__dirname, '../src'));
  fileArray.forEach(fileName => compileView(fileName));
}

compileViews();

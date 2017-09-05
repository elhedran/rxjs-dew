var pkg = require('./package.json');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

delete pkg.scripts;
delete pkg.devDependencies

var cjsPkg = Object.assign({}, pkg, {
  main: 'index.js',
  typings: 'index.d.ts'
});

var version;
process.argv.forEach((value, index, array) => {
  if (value.startsWith('--version=')) {
    cjsPkg.version = value.splice(11);
  } else if (value.startsWith('-version=')) {
    cjsPkg.version = value.splice(10);
  } else if ((value === '--version' || value === '-version') && array[index+1] !== undefined) {
    cjsPkg.version = array[index+1];
  }
});

fs.writeFileSync('js/dist/package.json', JSON.stringify(cjsPkg, null, 2));
fs.writeFileSync('js/dist/README.md', fs.readFileSync('./README.md').toString());
fs.writeFileSync('js/dist/LICENSE.txt', fs.readFileSync('./LICENSE.txt').toString());
<p align="center">
  <img src="https://i.gyazo.com/ae23f834385276ae51e1b81000e883ff.gif" /> 
  <br />
  <br />
  WordPress Coding Standards Node.js
</p>

## :computer: Install 
With NPM
```bash
$ npm install wpcs --save
```
With Yarn
```bash
$ yarn install
```

If you want to install as CLI tool, you should install it globally.

```bash
$ npm install wpcs -g
```

## :books: Usage Example as Module
```javascript
const WPCS = require('wpcs')

const wpcs = new WPCS(path, rule)

wpcs.on('start', () => {
  // Your script here
})

wpcs.on('scan', filename => {
  // Filename
})

wpcs.on('error', (filename, info) => {
  // Filename, {line: Number, column: Number, message: Number}
})

wpcs.on('warning', (filename, info) => {
  // Filename, {line: Number, column: Number, message: Number}
})

wpcs.on('done', totals => {
  // {errors: Number, warnings: Numbers, files: Numbers}
})
```

## :zap: CLI
```bash
USAGE
  wpcs [path]

ARGUMENTS
  [path]  Script path could be a directory or filename (optional)   

OPTIONS
  --rule <rulename> Default rule is WordPress. WordPress | Wordpress-Core | Wordpress-Docs | WordPress-Extra (optional)
```

## License
MIT © [oknoorap](https://github.com/oknoorap)

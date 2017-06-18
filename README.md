# :page_with_curl: wpcs
> Check WordPress Coding Standards quickly with Node.js without installing any PHP dependencies.

## :computer: Install 
Using NPM  
```bash
$ npm install wpcs --save
```

Using Yarn
```bash
$ yarn add wpcs
```

If you want to use CLI version, please install it globally.

```bash
# NPM
$ npm install wpcs -g

# Yarn
$ yarn global add wpcs
```

## :elephant: PHP Scripts
This module depends with these scripts below. By using `git subtree` method under `scripts` directory.

* [PHP Code Sniffer](https://github.com/squizlabs/PHP_CodeSniffer)
* [Wordpress Coding Standards](https://github.com/WordPress-Coding-Standards/WordPress-Coding-Standards)

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

[![https://gyazo.com/e655bf900ae1693d6d98bcbb1d447d5c](https://i.gyazo.com/e655bf900ae1693d6d98bcbb1d447d5c.gif)](https://gyazo.com/e655bf900ae1693d6d98bcbb1d447d5c)

```bash
wpcs - Check WordPress Coding Standard

  USAGE
    wpcs [path]

  ARGUMENTS
    [path]    Script path could be a directory or filename (optional)   

  OPTIONS
    --rule <rulename>    Default rule is WordPress. WordPress | Wordpress-Core | Wordpress-Docs | WordPress-Extra (optional)
```

## License
MIT © [oknoorap](https://github.com/oknoorap)

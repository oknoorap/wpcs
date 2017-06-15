const path = require('path')
const os = require('os')

const rootdir = path.resolve(__dirname, '..')
exports.phpcsPath = path.join(rootdir, 'phpcs', 'scripts', os.platform() === 'win32' ? 'phpcs.bat' : 'phpcs')
exports.wpcsPath = path.join(rootdir, 'wordpress-coding-standards')

exports.rulesetList = [
  'WordPress',
  'WordPress-Core',
  'WordPress-Docs',
  'WordPress-Extra'
]

exports.rulesetTypes = {
  WORDPRESS: 'WordPress',
  WORDPRESS_CORE: 'WordPress-Core',
  WORDPRESS_DOCS: 'WordPress-Docs',
  WORDPRESS_EXTRA: 'WordPress-Extra'
}

exports.successfulMsg = [
  'added successfully',
  'updated successfully'
]

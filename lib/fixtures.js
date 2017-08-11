const path = require('path')

const scriptdir = path.resolve(__dirname, '..', 'scripts')
exports.phpcsPath = path.join(scriptdir, 'phpcs', 'scripts', 'phpcs')
exports.phpcbfPath = path.join(scriptdir, 'phpcs', 'scripts', 'phpcbf')
exports.wpcsPath = path.join(scriptdir, 'wordpress-coding-standards')

exports.rulesetList = [
  'WordPress',
  'WordPress-Core',
  'WordPress-Docs',
  'WordPress-Extra',
  'WordPress-VIP'
]

exports.rulesetTypes = {
  WORDPRESS: 'WordPress',
  WORDPRESS_CORE: 'WordPress-Core',
  WORDPRESS_DOCS: 'WordPress-Docs',
  WORDPRESS_EXTRA: 'WordPress-Extra',
  WORDPRESS_VIP: 'WordPress-VIP'
}

exports.successfulMsg = [
  'added successfully',
  'updated successfully'
]

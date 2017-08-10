const spawn = require('child_process').spawn
const {
  phpcsPath,
  wpcsPath,
  rulesetList,
  successfulMsg
} = require('./fixtures')

exports.checkWPCS = () => new Promise((resolve, reject) => {
  const phpcs = spawn('php', [phpcsPath, '-i'])
  phpcs.stdout.on('data', data => {
    if ((new RegExp(rulesetList.join('|'), 'g')).test(data.toString())) {
      resolve(true)
    }

    resolve(false)
  })

  phpcs.stderr.on('data', data => {
    reject(new Error(data.toString()))
  })
})

exports.installWPCS = () => new Promise((resolve, reject) => {
  const phpcs = spawn('php', [phpcsPath, '--config-set', 'installed_paths', wpcsPath])

  phpcs.stdout.on('data', data => {
    if ((new RegExp(successfulMsg.join('|', 'g'))).test(data.toString())) {
      resolve()
    }

    reject(new Error(`stdout ${data}`))
  })

  phpcs.stderr.on('data', data => {
    reject(new Error(data.toString()))
  })
})

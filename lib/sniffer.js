const path = require('path')
const {existsSync, statSync} = require('fs')
const EventEmitter = require('events')
const spawn = require('child_process').spawn
const globby = require('globby')
const {checkWPCS, installWPCS} = require('./utils')
const {phpcsPath, phpcbfPath, rulesetList, rulesetTypes} = require('./const')

class Sniffer extends EventEmitter {
  constructor(dirpath, ruleset) {
    super()

    this.ruleset = ruleset
    this.dirpath = dirpath
    this.totals = {errors: 0, warnings: 0}
    this.totalFiles = 0
    this.fixableFiles = []

    this.process = new EventEmitter()
    this.process.on('error', () => null)
    this.on('error', () => null)
    this.on('warning', () => null)
    this.on('done', () => null)
    this.on('start', () => null)
    this.on('fix', () => null)
    this.on('fixing', () => null)
    this.on('fixed', () => null)
    this.once('begin', () => {
      this.emit('start')
      this.run()
    })

    checkWPCS().then(isInstalled => {
      if (!isInstalled) {
        return installWPCS().then(() => {
          this.emit('begin')
        })
      }

      this.emit('begin')
    })
  }

  run() {
    if (existsSync(this.dirpath) === false) {
      this.process.emit('error', new Error(`${this.dirpath} not exists.`))
    }

    if (!rulesetList.includes(this.ruleset)) {
      this.ruleset = rulesetTypes.WORDPRESS
    }

    let scanpath = this.dirpath
    if (statSync(scanpath).isDirectory()) {
      scanpath = path.join(this.dirpath, '**', '*.php')
    }

    if (path.basename(scanpath).substr(-3) !== 'php') {
      this.process.emit('error', new Error('Invalid extension'))
    }

    globby([scanpath]).then(paths => {
      this.scan(paths)
    })
  }

  scan(paths) {
    try {
      const phpcsWorker = paths.map(item => new Promise((resolve, reject) => {
        const phpcs = spawn('php', [phpcsPath, '--tab-width=4', '--extensions=php,inc', `--standard=${this.ruleset}`, item, '--report-json'])
        const data = []

        phpcs.stdout.on('data', buffer => {
          data.push(buffer.toString())
        })

        phpcs.stderr.on('data', data => {
          reject(new Error(data.toString()))
        })

        phpcs.on('close', () => {
          const json = JSON.parse(data.join(''))
          this.totals = json.totals

          for (const filename in json.files) {
            if (Object.prototype.hasOwnProperty.call(json.files, filename)) {
              this.emit('scan', filename)
              this.totalFiles++

              if (json.files[filename].messages.length > 0) {
                this.scanMsg(filename, json.files[filename].messages)
              }
            }
          }
          resolve()
        })
      }))

      Promise.all(phpcsWorker).then(() => {
        this.totals.files = this.totalFiles
        this.emit('done', this.totals)
      }).catch(err => {
        this.process.emit('error', err)
      })
    } catch (err) {
      this.process.emit('error', err)
    }
  }

  scanMsg(filename, msg) {
    for (const key in msg) {
      if (Object.prototype.hasOwnProperty.call(msg, key)) {
        const info = Object.assign({}, msg[key])

        if (msg[key].fixable && !this.fixableFiles.includes(filename)) {
          this.fixableFiles.push(filename)
        }

        if (msg[key].type === 'ERROR') {
          this.emit('error', filename, info)
        } else if (msg[key].type === 'WARNING') {
          this.emit('warning', filename, info)
        }
      }
    }
  }

  fix() {
    try {
      this.emit('fix')
      if (this.fixableFiles.length > 0) {
        const phpcsFixer = this.fixableFiles.map(filename => new Promise((resolve, reject) => {
          const phpcbf = spawn('php', [phpcbfPath, `--standard=${this.ruleset}`, '--no-patch', filename])
          let overwritten = false

          phpcbf.stdout.on('data', data => {
            if (/file was overwritten/.test(data.toString().toLowerCase())) {
              overwritten = true
            }
          })

          phpcbf.stderr.on('data', data => {
            reject(new Error(data.toString()))
          })

          phpcbf.on('close', () => {
            this.emit('fixing', filename)
            resolve(overwritten)
          })
        }))

        Promise.all(phpcsFixer).then(() => {
          this.emit('fixed', this.fixableFiles)
        }).catch(err => {
          this.process.emit('error', err)
        })
      } else {
        this.emit('fixed')
      }
    } catch (err) {
      this.process.emit('error', err)
    }
  }
}

module.exports = Sniffer

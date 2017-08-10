const path = require('path')
const {existsSync, statSync} = require('fs')
const EventEmitter = require('events')
const spawn = require('child_process').spawn
const globby = require('globby')
const async = require('async')
const {checkWPCS, installWPCS} = require('./utils')
const {
  phpcsPath,
  phpcbfPath,
  rulesetList,
  rulesetTypes
} = require('./fixtures')

class Sniffer extends EventEmitter {
  constructor(dirpath, ruleset) {
    super()

    this.ruleset = ruleset
    this.dirpath = dirpath
    this.totals = {errors: 0, warnings: 0}
    this.totalFiles = 0
    this.fixableFiles = []

    this.process = new EventEmitter()

    this.on('error', () => null)
    this.on('warning', () => null)
    this.on('done', () => null)
    this.on('start', () => null)
    this.on('fix', () => null)
    this.on('fixing', () => null)
    this.on('fixed', () => null)
    this.process.on('error', () => null)

    this.once('begin', () => {
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

  /**
   * Main Engine
   */
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

    const globbyOpts = {
      ignore: [
        '**/node_modules/**',
        '**/.git/**',
        '**/bower_components/**'
      ]
    }

    globby(scanpath, globbyOpts).then(files => {
      this.scan(files)
    })
  }

  /**
   * Scan files
   *
   * @param {Array} files
   */
  scan(files) {
    try {
      this.emit('start')

      const worker = async.queue((filename, resolve) => {
        this.emit('scan', filename)

        const phpcs = spawn('php', [
          phpcsPath,
          '--tab-width=4',
          '--extensions=php,inc',
          `--standard=${this.ruleset}`,
          '--report-json',
          filename
        ])

        const data = []

        phpcs.stdout.on('data', buffer => {
          data.push(buffer.toString())
        })

        phpcs.stderr.on('data', data => {
          const err = new Error(data.toString())
          this.process.emit('error', err)
        })

        phpcs.on('close', () => {
          const json = JSON.parse(data.join(''))
          this.totals.errors += json.totals.errors
          this.totals.warnings += json.totals.warnings
          this.totals.fixable + json.totals.fixable

          for (const filename in json.files) {
            if (Object.prototype.hasOwnProperty.call(json.files, filename)) {
              this.totalFiles++

              if (json.files[filename].messages.length > 0) {
                this.scanMsg(filename, json.files[filename].messages)
              }
            }
          }

          // Add site timeout to refresh spawn
          // Before calling it again
          setTimeout(() => {
            resolve()
          }, 100)
        })
      }, 1)

      worker.drain = () => {
        this.totals.files = this.totalFiles
        this.emit('done', this.totals)
      }

      files.forEach(filename => {
        worker.push(filename)
      })
    } catch (err) {
      this.process.emit('error', err)
    }
  }

  /**
   * Scan Messages
   *
   * @param {String} filename
   * @param {String} msg
   */
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

  /**
   * Apply autofix from phpcs
   */
  fix() {
    try {
      this.emit('fix')
      if (this.fixableFiles.length > 0) {
        const fixWorker = async.queue((filename, resolve) => {
          this.emit('fixing', filename)

          const phpcbf = spawn('php', [
            phpcbfPath,
            `--standard=${this.ruleset}`,
            '--no-patch',
            filename
          ])

          let waitingTime = 0

          phpcbf.stdout.on('data', () => {
            if (waitingTime > 15) {
              phpcbf.kill('SIGKILL')
              this.process.emit('error', new Error('Engine is too busy to fixing this file, please do it manually.'))
            }

            waitingTime++
          })

          phpcbf.stderr.on('data', data => {
            const err = new Error(data.toString())
            this.process.emit('error', err)
          })

          phpcbf.on('close', () => {
            resolve()
          })
        })

        fixWorker.drain = () => {
          this.emit('fixed', this.fixableFiles)
        }

        this.fixableFiles.forEach(filename => {
          fixWorker.push(filename)
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

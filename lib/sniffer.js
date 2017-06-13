const path = require('path')
const {existsSync, statSync} = require('fs')
const EventEmitter = require('events')
const spawn = require('child_process').spawn
// const chalk = require('chalk')
const globby = require('globby')
// const logger = require('./logger')
const {checkWPCS, installWPCS} = require('./utils')
const {phpcsPath, rulesetList, rulesetTypes} = require('./const')

// const displayLog = info => {
//   for (const i in info) {
//     if (Object.prototype.hasOwnProperty.call(info, i)) {
//       switch (info[i].type) {
//         case 'ERROR':
//           logger.error(info[i])
//           break

//         case 'WARNING':
//           logger.warning(info[i])
//           break

//         default:
//           break
//       }
//     }
//   }
// }

// const scanpartial = (dirpath, rule) => new Promise((resolve, reject) => {
//   let globpath = dirpath
//   if (statSync(dirpath).isDirectory()) {
//     globpath = path.join(dirpath, '**')
//   }

//   globby([globpath]).then(paths => {
//     const filteredPath = paths.filter(item => {
//       if (/(.js|.css|.svg|.jpg|.png|.gif|.txt|.md)$/.test(item)) {
//         return false
//       }

//       if (statSync(item).isDirectory()) {
//         return false
//       }

//       return true
//     })

//     try {
//       let totalError = 0
//       let totalWarning = 0

//       const phpcsWorker = filteredPath.map(item => new Promise((resolve, reject) => {
//         const phpcs = spawn(phpcsPath, [`--standard=${rule}`, item, '--report-json'])
//         const data = []

//         phpcs.stdout.on('data', buffer => {
//           data.push(buffer.toString())
//         })

//         phpcs.stderr.on('data', data => {
//           reject(new Error(data.toString()))
//         })

//         phpcs.on('close', () => {
//           const json = JSON.parse(data.join(''))
//           if (json.totals.errors === 0 && json.totals.warnings === 0) {
//             return resolve()
//           }

//           logger.blank()
//           for (const filename in json.files) {
//             if (Object.prototype.hasOwnProperty.call(json.files, filename)) {
//               if (json.totals.errors) {
//                 totalErr
//               }
//               totalWarning += json.totals.warnings

//               logger.tab(chalk.underline.white(filename))
//               displayLog(json.files[filename].messages)
//             }
//           }
//           logger.blank()
//           resolve()
//         })
//       }))

//       Promise.all(phpcsWorker).then(() => {
//         resolve()
//       })
//     } catch (err) {
//       reject(err)
//     }
//   })
// })

class Sniffer extends EventEmitter {
  constructor(dirpath, ruleset) {
    super()

    this.ruleset = ruleset
    this.dirpath = dirpath
    this.total = {errors: 0, warnings: 0}
    this.process = new EventEmitter()
    this.process.on('error', () => null)
    this.on('error', () => null)
    this.on('warning', () => null)
    this.on('done', () => null)
    this.once('start', () => {
      this.run()
    })

    checkWPCS().then(isInstalled => {
      if (!isInstalled) {
        return installWPCS().then(() => {
          this.emit('start')
        })
      }

      this.emit('start')
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
        const phpcs = spawn(phpcsPath, [`--standard=${this.ruleset}`, item, '--report-json'])
        const data = []

        phpcs.stdout.on('data', buffer => {
          data.push(buffer.toString())
        })

        phpcs.stderr.on('data', data => {
          reject(new Error(data.toString()))
        })

        phpcs.on('close', () => {
          const json = JSON.parse(data.join(''))
          for (const filename in json.files) {
            if (Object.prototype.hasOwnProperty.call(json.files, filename)) {
              this.emit('scan', filename)
              if (json.files[filename].messages.length > 0) {
                this.scanMsg(filename, json.files[filename].messages)
              }
            }
          }
          resolve()
        })
      }))

      Promise.all(phpcsWorker).then(() => {
        this.emit('done', this.total)
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
        const obj = Object.assign({}, msg[key])
        if (msg[key].type === 'ERROR') {
          this.total.errors++
          this.emit('error', filename, obj)
        } else if (msg[key].type === 'WARNING') {
          this.total.warnings++
          this.emit('warning', filename, obj)
        }
      }
    }
  }
}

module.exports = Sniffer

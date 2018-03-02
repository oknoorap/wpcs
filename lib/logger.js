/* eslint-disable no-console */
const chalk = require('chalk')
const logSymbols = require('log-symbols')

exports.blank = () => {
  console.log('')
}

const tab = (msg, count = 1) => {
  const tabs = []
  for (let i = 0; i < count; i++) {
    tabs.push('    ')
  }
  console.log(`${tabs.join('')}${msg}`)
}

const symbol = (err, symbol) => {
  const message = err.message ? err.message : err
  tab(`${logSymbols[symbol]}  ${message}`)
}

const stdlog = (info, symbol) => {
  const line = `${info.line}:${info.column}`
  const fixable = info.fixable ? ` ${chalk.green('Fixable')}` : ''
  const message = info.message + fixable
  tab(`${logSymbols[symbol]}  ${line}\t${message}`)
}

const json = logs => {
  console.log(JSON.stringify(logs))
}

module.exports.error = info => stdlog(info, 'error')
module.exports.error2 = err => symbol(err, 'error')
module.exports.warning = info => stdlog(info, 'warning')
module.exports.symbol = symbol
module.exports.tab = tab
module.exports.json = json

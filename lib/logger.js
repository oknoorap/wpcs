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
exports.tab = tab

const stdlog = (info, symbol) => {
  const line = `${info.line}:${info.column}`
  const fixable = info.fixable ? ` ${chalk.green('Fixable')}` : ''
  const message = info.message + fixable

  tab(`${logSymbols[symbol]}  ${line}\t${message}`)
}

exports.error = info => stdlog(info, 'error')
exports.warning = info => stdlog(info, 'warning')

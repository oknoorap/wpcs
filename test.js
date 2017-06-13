import test from 'ava'

test('just passing', t => {
  t.pass()
})

const WPCS = require('./index')
const wpcs = new WPCS('/Applications/MAMP/htdocs/wp/wp-content/themes/twentyseventeen')

wpcs.on('scan', filename => {
  console.log(filename)
})

wpcs.on('done', info => {
  console.log(info)
})

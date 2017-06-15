import path from 'path'
import test from 'ava'
import WPCS from '../index'

const themePath = path.join(__dirname, 'test-theme')
const wpcs = new WPCS(themePath)

const checkTotal = () => new Promise(resolve => {
  wpcs.on('done', totals => {
    resolve(totals)
  })
})

const checkError = filename => new Promise(resolve => {
  const errors = []

  wpcs.on('error', (_filename, info) => {
    if (_filename === path.join(themePath, filename)) {
      errors.push(info)
    }
  })

  wpcs.on('done', () => {
    resolve(errors)
  })
})

const check404 = () => checkError('404.php')

const checkFooter = () => checkError('footer.php')

const checkContentPage = () => checkError('template-parts/content-page.php')

test('total scanned are 20 files', async t => {
  await checkTotal().then(totals => {
    t.is(totals.files, 20)
  })
})

test('theme have 0 warning', async t => {
  await checkTotal().then(totals => {
    t.true(totals.warnings === 0)
  })
})

test('404.php have an error', async t => {
  await check404().then(errors => {
    t.true(errors.length > 0)
  })
})

test('404.php error is fixable', async t => {
  await check404().then(errors => {
    t.true(errors[0].fixable)
  })
})

test('footer.php has no error', async t => {
  await checkFooter().then(errors => {
    t.true(errors.length === 0)
  })
})

test('template-parts/content-page.php error: textdomain arg should be single a string literal, not variable.', async t => {
  await checkContentPage().then(errors => {
    t.is(errors[0].message, 'The $domain arg must be a single string literal, not "$test".')
  })
})


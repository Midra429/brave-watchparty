import browser from 'webextension-polyfill'

declare module 'webextension-polyfill' {
  const isFirefox: boolean
  const isChrome: boolean
}

const url = browser.runtime.getURL('/')

Object.setPrototypeOf(browser, {
  isChrome: url.startsWith('chrome-extension'),
  isFirefox: url.startsWith('moz-extension'),
})

export const webext = browser

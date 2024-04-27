import { webext } from '@/webext'

export type OsName = (typeof OS_NAMES)[keyof typeof OS_NAMES]
export type BrowserName = 'Chrome' | 'Firefox'

const OS_NAMES = {
  mac: 'macOS',
  win: 'Windows',
  android: 'Android',
  cros: 'ChromeOS',
  linux: 'Linux',
  openbsd: 'OpenBSD',
} as const

export const getEnvironment = async (): Promise<{
  version: string
  os: OsName
  browser: BrowserName
}> => {
  const { version } = webext.runtime.getManifest()
  const { os } = await webext.runtime.getPlatformInfo()
  const osName = OS_NAMES[os]

  return {
    version,
    browser: webext.isFirefox ? 'Firefox' : 'Chrome',
    os: osName,
  }
}

import type { PlasmoCSConfig } from 'plasmo'

import { BwpVodMod } from '@/BwpVodMod'
import { storage } from '@/utils/storage'
import { isCurrentTab } from '@/utils/isCurrentTab'

export const config: PlasmoCSConfig = {
  matches: ['https://tv.dmm.com/*'],
  run_at: 'document_start',
}

console.log('[Brave Watchparty]', config.matches)

let mod: BwpVodMod

window.addEventListener('load', async () => {
  if (!(await isCurrentTab())) {
    return
  }

  const mode = await storage.get('mode')
  const isHost = mode === 'host'

  const obs_config: MutationObserverInit = {
    childList: true,
    subtree: true,
  }
  const obs = new MutationObserver(() => {
    if (location.pathname.startsWith('/vod/playback/')) {
      const video = document.querySelector<HTMLVideoElement>(
        '#vodWrapper > div > video'
      )

      if (video) {
        mod = new BwpVodMod(video, isHost)

        obs.disconnect()
      }
    }
  })

  obs.observe(document, obs_config)
})

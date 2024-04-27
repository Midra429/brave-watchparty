import type { PlasmoCSConfig } from 'plasmo'

import { BwpVodMod } from '@/BwpVodMod'
import { storage } from '@/utils/storage'
import { isCurrentTab } from '@/utils/isCurrentTab'

export const config: PlasmoCSConfig = {
  matches: ['https://www.youtube.com/watch?v=*'],
  run_at: 'document_start',
}

console.log('[Brave Watchparty]', config.matches)

let mod: BwpVodMod
let videoId = new URLSearchParams(location.search).get('v')

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
    if (location.pathname === '/watch' && videoId) {
      const video = document.querySelector<HTMLVideoElement>(
        '.html5-video-player:not(.ad-showing) .html5-main-video'
      )

      if (video) {
        mod = new BwpVodMod(video, isHost)

        window.addEventListener('yt-page-data-updated', () => {
          const v = new URLSearchParams(location.search).get('v')

          if (v !== videoId) {
            mod.dispose()
            videoId = null
          }
        })

        obs.disconnect()
      }
    }
  })

  obs.observe(document, obs_config)
})

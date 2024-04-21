import type { PlasmoCSConfig } from 'plasmo'

import { BwpVodMod } from '@/BwpVodMod'
import { storage } from '@/utils/storage'
import { isCurrentTab } from '@/utils/isCurrentTab'
import { isVisible } from '@/utils/isVisible'

export const config: PlasmoCSConfig = {
  matches: ['https://www.amazon.co.jp/*'],
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
    attributes: true,
    attributeFilter: ['src'],
  }
  const obs = new MutationObserver(() => {
    const video = document.querySelector<HTMLVideoElement>(
      '.webPlayerSDKContainer video'
    )

    if (isVisible(video)) {
      mod = new BwpVodMod(video, isHost)

      obs.disconnect()
    }
  })

  obs.observe(document, obs_config)
})

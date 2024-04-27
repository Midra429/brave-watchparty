import type { PlasmoCSConfig } from 'plasmo'

import { BwpVodMod } from '@/BwpVodMod'
import { storage } from '@/utils/storage'
import { isCurrentTab } from '@/utils/isCurrentTab'

export const config: PlasmoCSConfig = {
  matches: ['https://animestore.docomo.ne.jp/animestore/sc_d_pc?partId=*'],
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

  const video = document.querySelector<HTMLVideoElement>('video#video')

  if (video) {
    mod = new BwpVodMod(video, isHost)
  }
})

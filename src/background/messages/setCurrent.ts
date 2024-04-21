import type { PlasmoMessaging } from '@plasmohq/messaging'
import type { BwpVodId } from '@/utils/vods'

import { webext } from '@/webext'
import { storage } from '@/utils/storage'
import { sendToContentScript } from '@/utils/messaging'

export type ReqBody = {
  url?: string
  vodId?: BwpVodId
}

export type ResBody = number | null | undefined

const handler: PlasmoMessaging.MessageHandler<ReqBody, ResBody> = async (
  req,
  res
) => {
  if (!req.body) {
    return res.send(null)
  }

  console.log('[bg:msg:setCurrent]', req.body)

  const currentTabId = await storage.get('current_tab_id')

  let tab: Awaited<ReturnType<typeof webext.tabs.get>> | null = null

  if (typeof currentTabId !== 'undefined') {
    try {
      tab = await webext.tabs.get(currentTabId)
    } catch {}
  }

  if (tab) {
    const pong = await sendToContentScript({
      name: 'ping',
      tabId: tab.id,
    })

    if (tab.url !== req.body.url || !pong) {
      await webext.tabs.update(tab.id, {
        url: req.body.url,
        active: true,
      })
    } else {
      await webext.tabs.update(tab.id, {
        active: true,
      })
    }
  } else {
    tab = await webext.tabs.create({
      url: req.body.url,
      active: true,
    })
  }

  storage.set('current_tab_id', tab.id)
  storage.set('current_vod_id', req.body.vodId)

  return res.send(tab.id)
}

export default handler

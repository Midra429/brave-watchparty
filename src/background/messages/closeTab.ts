import type { PlasmoMessaging } from '@plasmohq/messaging'

import { webext } from '@/webext'

export type ReqBody = {
  tabId: number
}

export type ResBody = boolean

const handler: PlasmoMessaging.MessageHandler<ReqBody, ResBody> = async (
  req,
  res
) => {
  console.log('[bg:msg:closeTab]', req.body)

  const tabId = req.body?.tabId ?? req.sender?.tab?.id

  if (typeof tabId !== 'undefined') {
    await webext.tabs.remove(tabId)

    return res.send(true)
  } else {
    return res.send(false)
  }
}

export default handler

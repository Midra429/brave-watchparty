import type { PlasmoMessaging } from '@plasmohq/messaging'

export type ReqBody = void

export type ResBody = number | null

const handler: PlasmoMessaging.MessageHandler<ReqBody, ResBody> = (
  req,
  res
) => {
  console.log('[bg:msg:getSelfTabId]', req.body)

  const tabId = req.sender?.tab?.id

  if (typeof tabId !== 'undefined') {
    return res.send(tabId)
  } else {
    return res.send(null)
  }
}

export default handler

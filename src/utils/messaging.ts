import type { PlasmoMessaging } from '@plasmohq/messaging'
import type { AblyMessageData } from '@/api/ably'
import type * as MsgGetSelfTabId from '@/background/messages/getSelfTabId'
import type * as MsgSetCurrent from '@/background/messages/setCurrent'
import type * as MsgCloseTab from '@/background/messages/closeTab'
import type * as MsgRoom from '@/background/messages/room'

import {
  sendToBackground as plasmoSendToBackground,
  sendToContentScript as plasmoSendToContentScript,
} from '@plasmohq/messaging'

export type SendToBackgrounds = {
  getSelfTabId: [MsgGetSelfTabId.ReqBody, MsgGetSelfTabId.ResBody]
  setCurrent: [MsgSetCurrent.ReqBody, MsgSetCurrent.ResBody]
  closeTab: [MsgCloseTab.ReqBody, MsgCloseTab.ResBody]
  room: [MsgRoom.ReqBody, MsgRoom.ResBody]
}

export type SendToContentScripts = {
  ping: [void, boolean]
  video: [AblyMessageData['video'], void]
  change: [AblyMessageData['change'], void]
  leave: [void, void]
}

export const sendToBackground = async <T extends keyof SendToBackgrounds>(
  req: PlasmoMessaging.Request<T, SendToBackgrounds[T][0]>
) => {
  try {
    // @ts-expect-error
    return await plasmoSendToBackground<T, SendToBackgrounds[T][1]>(req)
  } catch {}
}

export const sendToContentScript = async <T extends keyof SendToContentScripts>(
  req: PlasmoMessaging.Request<T, SendToContentScripts[T][0]>
) => {
  try {
    // @ts-expect-error
    return await plasmoSendToContentScript<T, SendToContentScripts[T][1]>(req)
  } catch {}
}

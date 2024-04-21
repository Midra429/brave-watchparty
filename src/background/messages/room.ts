import type { PlasmoMessaging } from '@plasmohq/messaging'
import type { AblyMessageData } from '@/api/ably'

import { storage } from '@/utils/storage'
import { sendToContentScript } from '@/utils/messaging'
import { RoomAPI } from '@/api/room'
import { AblyApi } from '@/api/ably'

export type ReqBody =
  | {
      type: 'join' | 'leave'
      roomId?: string
    }
  | ({
      type: 'pub:video'
    } & AblyMessageData['video'])
  | ({
      type: 'pub:change'
    } & AblyMessageData['change'])

export type ResBody = boolean

let intervalId_5m: NodeJS.Timeout | null = null

const startInterval = () => {
  stopInterval()

  console.log('startInterval()')

  intervalId_5m = setInterval(async () => {
    if (AblyApi.channel) {
      if (AblyApi.isHost) {
        await RoomAPI.heartbeat()
      } else {
        const joinedRoom = await storage.get('joined_room')
        const room = await RoomAPI.meta(joinedRoom?.id ?? '')

        if (!room?.is_open) {
          await leave()
        }
      }
    } else {
      stopInterval()
    }
  }, 1000 * 60 * 5)
}

const stopInterval = () => {
  console.log('stopInterval()')

  if (intervalId_5m) {
    clearInterval(intervalId_5m)
  }
}

const leave = async () => {
  sendToContentScript({
    name: 'leave',
    tabId: await storage.get('current_tab_id'),
  })

  stopInterval()
  await AblyApi.close()
}

const handler: PlasmoMessaging.MessageHandler<ReqBody, ResBody> = async (
  req,
  res
) => {
  if (!req.body) {
    return res.send(false)
  }

  console.log('[bg:msg:room]', req.body)

  // 部屋に入る
  if (req.body.type === 'join') {
    await AblyApi.join(req.body.roomId)

    if (AblyApi.channel) {
      AblyApi.channel.whenState('attached').then(() => {
        startInterval()

        // 参加者
        if (!AblyApi.isHost) {
          // ようこそ！
          AblyApi.channel?.subscribe('welcome', async (message) => {
            console.log(`[sub:${message.name}]`, message.data)

            const name = message.name as 'welcome'
            const body: AblyMessageData[typeof name] = message.data

            const { misskey_server, misskey_user } = await storage.get(
              'misskey_server',
              'misskey_user'
            )
            const clientId = `@${misskey_user?.username}@${misskey_server}`

            if (body.clientId === clientId) {
              storage.set('playing', body.playing)
              storage.set('playing_time', body.playing_time)
              storage.set('playing_items', body.playing_items)
            }
          })

          // 再生・一時停止・シーク・時間更新
          AblyApi.channel?.subscribe('video', async (message) => {
            console.log(`[sub:${message.name}]`, message.data)

            const name = message.name as 'video'
            const body: AblyMessageData[typeof name] = message.data

            await storage.set('playing', body.playing)
            await storage.set('playing_time', body.time)
          })

          // 動画変更
          AblyApi.channel?.subscribe('change', async (message) => {
            console.log(`[sub:${message.name}]`, message.data)

            const name = message.name as 'change'
            const body: AblyMessageData[typeof name] = message.data

            if (0 < body.items.length) {
              await storage.set('playing_items', body.items)
            } else {
              await storage.remove('playing_items')
            }
          })

          // 部屋を出る
          AblyApi.channel?.subscribe('leave', async () => {
            console.log('[sub:leave]')

            await leave()
          })
        }
      })

      AblyApi.channel.whenState('detached').then(stopInterval)

      AblyApi.channel.whenState('failed').then(leave)
    }

    return res.send(!!AblyApi.channel)
  }

  // 部屋を出る
  if (req.body.type === 'leave') {
    await leave()

    return res.send(true)
  }

  // publish (ホストのみ)
  if (req.body.type.startsWith('pub:')) {
    if (!AblyApi.isHost) {
      return res.send(false)
    }

    if (req.body.type === 'pub:video') {
      await storage.set('playing', req.body.playing)
      await storage.set('playing_time', req.body.time)

      await AblyApi.channel?.publish('video', {
        playing: req.body.playing,
        time: req.body.time,
      } as AblyMessageData['video'])

      return res.send(true)
    }

    if (req.body.type === 'pub:change') {
      await storage.set('playing_items', req.body.items)

      await AblyApi.channel?.publish('change', {
        items: req.body.items,
      } as AblyMessageData['change'])

      return res.send(true)
    }
  }

  return res.send(false)
}

export default handler

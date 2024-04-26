import type { ChannelMode, PresenceMessage } from 'ably'
import type { D1MisskeyUserData } from '@/types/d1'
import type { StorageItems } from '@/types/storage'

// @ts-expect-error
import * as Ably from 'ably/build/ably'
import { BACKEND_URL } from '@/constants'
import { webext } from '@/webext'
import { storage } from '@/utils/storage'
import { RoomAPI } from './room'

export type AblyMessageData = {
  video: {
    playing: boolean
    time: number
  }

  change: {
    items: NonNullable<StorageItems['playing_items']>
  }

  welcome: {
    clientId: string
    playing: StorageItems['playing']
    playing_time: StorageItems['playing_time']
    playing_items: StorageItems['playing_items']
  }
}

export type PresenceData = Omit<
  NonNullable<StorageItems['joined_members']>[number],
  'id'
>

const manifest = webext.runtime.getManifest()

storage.watch({
  misskey_session: () => AblyApi.close(),
})

const presenceMessagesToMembers = (
  messages: PresenceMessage[]
): StorageItems['joined_members'] => {
  return messages.flatMap((message) => {
    const data: PresenceData | undefined = message.data

    return {
      id: message.clientId,
      name: data?.name ?? null,
      avatar: data?.avatar ?? null,
      vod_ids: data?.vod_ids ?? null,
      version: data?.version ?? null,
    }
  })
}

let timeoutId: NodeJS.Timeout | null = null

const checkPing = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }

  timeoutId = setTimeout(() => {
    AblyApi.realtime?.connection.ping().then((ping) => {
      if (AblyApi.realtime && AblyApi.channel) {
        storage.set('joined_state_ping', ping)
        checkPing()
      } else {
        storage.remove('joined_state_ping')
      }
    })
  }, 5000)
}

export class AblyApi {
  static #rest: import('ably').Rest | null = null
  static #realtime: import('ably').Realtime | null = null
  static #channel: import('ably').RealtimeChannel | null = null

  static #isHost: boolean = false

  static get rest() {
    return this.#rest
  }
  static get realtime() {
    return this.#realtime
  }
  static get channel() {
    return this.#channel
  }

  static get isHost() {
    return this.#isHost
  }

  static async getRest() {
    if (this.#rest) {
      return this.#rest
    }

    console.log('AblyApi.rest()')

    const { misskey_session, misskey_server, misskey_user } = await storage.get(
      'misskey_session',
      'misskey_server',
      'misskey_user'
    )

    if (misskey_session && misskey_server && misskey_user) {
      this.#rest = new Ably.Rest({
        authUrl: `${BACKEND_URL}/ably/auth`,
        authMethod: 'POST',
        authParams: {
          session: misskey_session,
          host: misskey_server,
          username: misskey_user.username,
        } as D1MisskeyUserData,
      })
    }

    return this.#rest
  }

  static async getRealtime() {
    if (this.#realtime) {
      return this.#realtime
    }

    console.log('AblyApi.realtime()')

    const { misskey_session, misskey_server, misskey_user } = await storage.get(
      'misskey_session',
      'misskey_server',
      'misskey_user'
    )

    if (misskey_session && misskey_server && misskey_user) {
      this.#realtime = new Ably.Realtime({
        authUrl: `${BACKEND_URL}/ably/auth`,
        authMethod: 'POST',
        authParams: {
          session: misskey_session,
          host: misskey_server,
          username: misskey_user.username,
        } as D1MisskeyUserData,
      })

      this.#realtime.connection.on(['connecting', 'disconnected'], () => {
        storage.remove('joined_state_ping')
      })

      this.#realtime.connection.on('connected', () => {
        this.#realtime?.connection.ping().then((ping) => {
          storage.set('joined_state_ping', ping)
        })

        checkPing()
      })
    }

    return this.#realtime
  }

  static async join(roomId?: string) {
    console.log(`AblyApi.join(${roomId || ''})`)

    if (!roomId) {
      const myRoom = await storage.get('my_room')

      if (myRoom) {
        this.#isHost = true
        roomId = myRoom.id
      } else {
        this.#isHost = false
        return null
      }
    }

    const room = await RoomAPI.meta(roomId)

    if (!room) {
      this.#isHost = false
      return null
    }

    const joinedRoom = await storage.get('joined_room')
    const isJoined = joinedRoom?.id === room.id

    // すでに部屋に入っている場合
    if (isJoined && this.#channel) {
      return null
    }

    await this.getRealtime()

    if (!this.#realtime) {
      return null
    }

    // 部屋が閉じている場合
    if (!room.is_open && this.#isHost) {
      room.is_open = (await RoomAPI.key('unlock')) ? 1 : 0
    }

    if (!room.is_open) {
      await this.close()

      return null
    }

    // チャンネルに接続
    const modes: ChannelMode[] = ['PRESENCE', 'PRESENCE_SUBSCRIBE', 'SUBSCRIBE']

    if (this.#isHost) {
      modes.push('PUBLISH')
    }

    this.#channel = this.#realtime.channels.get(`room:${room.id}`, { modes })

    this.#channel.presence.get().then((messages) => {
      const members = presenceMessagesToMembers(messages)

      storage.set('joined_members', members)
    })

    this.#channel.presence.subscribe(async (msg) => {
      const messages = await this.#channel?.presence.get()
      const members = messages && presenceMessagesToMembers(messages)

      storage.set('joined_members', members)

      if (this.#isHost && msg.action === 'enter') {
        const nowplaying = await storage.get(
          'playing',
          'playing_time',
          'playing_items'
        )

        this.#channel?.publish('welcome', {
          clientId: msg.clientId,
          ...nowplaying,
        } as AblyMessageData['welcome'])
      }
    })

    this.#channel.whenState('attached').then(async () => {
      const { vod_ids, misskey_user } = await storage.get(
        'vod_ids',
        'misskey_user'
      )

      this.#channel?.presence.enter({
        name: misskey_user?.name,
        avatar: misskey_user?.avatarUrl,
        vod_ids: vod_ids,
        version: manifest.version,
      } as PresenceData)
    })

    await storage.set('mode', this.#isHost ? 'host' : 'guest')
    await storage.set('joined_room', room)

    return this.#channel
  }

  static async leave() {
    console.log('AblyApi.leave()')

    if (this.#isHost) {
      RoomAPI.key('lock')
      await this.#channel?.publish('leave', {})
    }

    await this.#channel?.presence.leave()

    this.#channel?.unsubscribe()
    this.#channel?.presence.unsubscribe()

    await this.#channel?.detach()

    this.#channel = null

    const joinedRoom = await storage.get('joined_room')

    if (joinedRoom) {
      this.#realtime?.channels.release(`room:${joinedRoom.id}`)
    }

    await storage.remove(
      'joined_room',
      'joined_members',
      'joined_state_ping',

      'playing',
      'playing_time',
      'playing_items',

      'current_tab_id'
    )
  }

  static async close() {
    console.log('AblyApi.close()')

    await this.leave()

    this.#realtime?.connection.close()
    this.#realtime?.close()

    this.#rest = null
    this.#realtime = null

    this.#isHost = false
  }
}

import type { D1MisskeyUserData, D1RoomData } from '@/types/d1'

import { BACKEND_URL } from '@/constants'
import { storage } from '@/utils/storage'
import { validateRoomId } from '@/utils/validate'

export const RoomAPI = {
  /**
   * 部屋の情報
   */
  async meta(roomId: string) {
    console.log(`RoomAPI.meta('${roomId}')`)

    if (validateRoomId(roomId)) {
      const url = `${BACKEND_URL}/room/meta`

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: roomId,
        })
        const room: D1RoomData = await res.json()

        return room
      } catch (err) {
        console.error(err)
      }
    }

    return null
  },

  /**
   * 部屋の生存確認用（一定時間経過でオートロック）
   */
  async heartbeat() {
    console.log('RoomAPI.heartbeat()')

    const { misskey_session, misskey_server, misskey_user } = await storage.get(
      'misskey_session',
      'misskey_server',
      'misskey_user'
    )

    if (misskey_session && misskey_server && misskey_user) {
      const url = `${BACKEND_URL}/room/heartbeat`

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session: misskey_session,
            host: misskey_server,
            username: misskey_user.username,
          } as D1MisskeyUserData),
        })
        const success: boolean = await res.json()

        return success
      } catch (err) {
        console.error(err)
      }
    }

    return null
  },

  /**
   * 部屋の鍵の開閉
   */
  async key(method: 'lock' | 'unlock') {
    console.log(`RoomAPI.key('${method}')`)

    const { misskey_session, misskey_server, misskey_user } = await storage.get(
      'misskey_session',
      'misskey_server',
      'misskey_user'
    )

    if (misskey_session && misskey_server && misskey_user) {
      const url = `${BACKEND_URL}/room/${method}`

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session: misskey_session,
            host: misskey_server,
            username: misskey_user.username,
          } as D1MisskeyUserData),
        })
        const success: boolean = await res.json()

        return success
      } catch (err) {
        console.error(err)
      }
    }

    return false
  },

  /**
   * 部屋の引越し
   */
  async moving() {
    console.log('RoomAPI.moving()')

    const { misskey_session, misskey_server, misskey_user } = await storage.get(
      'misskey_session',
      'misskey_server',
      'misskey_user'
    )

    if (misskey_session && misskey_server && misskey_user) {
      const url = `${BACKEND_URL}/room/moving`

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session: misskey_session,
            host: misskey_server,
            username: misskey_user.username,
          } as D1MisskeyUserData),
        })
        const newRoom: D1RoomData | null = await res.json()

        if (newRoom) {
          await storage.set('my_room', newRoom)
        }

        return newRoom
      } catch (err) {
        console.error(err)
      }
    }

    return null
  },
}

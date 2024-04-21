import type { entities as MisskeyEntities } from 'misskey-js'
import type { D1MisskeyUserData, D1RoomData } from '@/types/d1'

import { BACKEND_URL } from '@/constants'
import { storage } from '@/utils/storage'

export const MiAuthApi = {
  /**
   * MiAuthのProxy & ユーザー登録
   */
  async check() {
    const { misskey_session, misskey_server } = await storage.get(
      'misskey_session',
      'misskey_server'
    )

    if (misskey_session && misskey_server) {
      const url = `${BACKEND_URL}/miauth/check`

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session: misskey_session,
            host: misskey_server,
          }),
        })
        const json: {
          token: string
          user: MisskeyEntities.User
          room: D1RoomData | null
        } | null = await res.json()

        return json
      } catch (err) {
        console.error(err)
      }
    }

    return null
  },

  /**
   * ユーザー削除
   */
  async logout() {
    const { misskey_session, misskey_server, misskey_user } = await storage.get(
      'misskey_session',
      'misskey_server',
      'misskey_user'
    )

    if (misskey_session && misskey_server && misskey_user) {
      const url = `${BACKEND_URL}/miauth/logout`

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
}

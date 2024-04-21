import { message } from 'antd'
import { storage } from '@/utils/storage'
import { MiAuthApi } from '@/api/miauth'

export const logout = async () => {
  await MiAuthApi.logout()

  await storage.remove(
    // 'misskey_server',
    'misskey_session',
    'misskey_token',
    'misskey_user',
    'my_room',

    'joined_room',
    'joined_members',
    'joined_state_ping',

    'playing',
    'playing_time',
    'playing_items'

    // 'can_resume'
  )

  message.destroy()
}

import type { entities as MisskeyEntities } from 'misskey-js'
import type { D1RoomData } from '@/types/d1'
import type { BwpVodId } from '@/utils/vods'
import type { OsName, BrowserName } from '@/utils/getEnvironment'

export type StorageItems = Partial<{
  mode: 'guest' | 'host'

  vod_ids: BwpVodId[]

  misskey_server: string
  misskey_session: string
  misskey_token: string
  misskey_user: MisskeyEntities.User
  my_room: D1RoomData | null

  joined_room: D1RoomData | null
  joined_members: {
    id: string
    name: string | null
    avatar: string | null
    vod_ids: BwpVodId[] | null
    environment: {
      Version: string
      Browser: BrowserName
      OS: OsName
    } | null
  }[]
  joined_state_ping: number

  playing: boolean
  playing_time: number
  playing_items: {
    vodId: BwpVodId
    videoId: string
  }[]

  current_tab_id: number
  current_vod_id: BwpVodId
}>

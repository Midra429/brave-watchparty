import type { StorageItems } from '@/types/storage'

import { webext } from '@/webext'
import { storage } from '@/utils/storage'
import { sendToContentScript } from '@/utils/messaging'
import { getVodById } from '@/utils/vods'
import { AblyApi } from '@/api/ably'

const getVideoDetail = async (items: StorageItems['playing_items']) => {
  const { vod_ids, current_vod_id } = await storage.get(
    'vod_ids',
    'current_vod_id'
  )

  if (items) {
    const item =
      items.find((item) => item.vodId === current_vod_id) ??
      items.find((item) => vod_ids?.includes(item.vodId))
    const vod = item && getVodById(item.vodId)
    const url = item && vod?.getWatchPageUrl(item.videoId)

    return vod && url ? { vod, url } : null
  }

  return null
}

webext.action.setBadgeBackgroundColor({
  color: '#808080',
})
webext.action.setBadgeTextColor({
  color: '#fff',
})
webext.action.setBadgeText({
  text: '',
})

AblyApi.close()

storage.watch({
  joined_state_ping: ({ newValue }) => {
    if (typeof newValue !== 'undefined') {
      webext.action.setBadgeBackgroundColor({
        color: newValue < 300 ? '#52c41a' : '#faad14',
      })
    } else {
      webext.action.setBadgeBackgroundColor({
        color: '#808080',
      })
    }
  },

  joined_members: ({ newValue }) => {
    if (typeof newValue !== 'undefined') {
      webext.action.setBadgeText({
        text: newValue.length.toString(),
      })
    } else {
      webext.action.setBadgeText({
        text: '',
      })
    }
  },

  playing_items: async ({ newValue }) => {
    const { mode, joined_room, current_tab_id } = await storage.get(
      'mode',
      'joined_room',
      'current_tab_id'
    )

    if (!joined_room) {
      return
    }

    let tab: Awaited<ReturnType<typeof webext.tabs.get>> | null = null

    if (typeof current_tab_id !== 'undefined') {
      try {
        tab = await webext.tabs.get(current_tab_id)
      } catch {}
    }

    if (newValue?.length) {
      if (mode === 'guest') {
        const newVideoDetail = await getVideoDetail(newValue)

        if (newVideoDetail) {
          if (tab) {
            const pong = await sendToContentScript({
              name: 'ping',
              tabId: tab.id,
            })

            if (tab.url !== newVideoDetail.url || !pong) {
              await webext.tabs.update(tab.id, {
                url: newVideoDetail.url,
              })
            }
          } else {
            tab = await webext.tabs.create({
              url: newVideoDetail.url,
            })
          }

          storage.set('current_tab_id', tab.id)
          storage.set('current_vod_id', newVideoDetail.vod.id)
        }
      }
    } else if (tab) {
      storage.remove('playing', 'playing_time')

      sendToContentScript({
        name: 'leave',
        tabId: tab.id,
      })
    }
  },
})

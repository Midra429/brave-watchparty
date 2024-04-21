import { storage } from './storage'
import { sendToBackground } from './messaging'

export const isCurrentTab = async () => {
  const selfTabId = await sendToBackground({ name: 'getSelfTabId' })
  const currentTabId = await storage.get('current_tab_id')

  return typeof currentTabId !== 'undefined' && selfTabId === currentTabId
}

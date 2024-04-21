import { storage } from '@/utils/storage'

export const reset = async () => {
  await storage.remove('mode', 'vod_ids')
}

import type { StorageAreaName } from '@plasmohq/storage'
import type { StorageItems } from '@/types/storage'

import { Storage as PlasmoStorage } from '@plasmohq/storage'
import { useStorage as plasmoUseStorage } from '@plasmohq/storage/hook'

const instance = new PlasmoStorage({ area: 'local' })

export const storage = {
  clear: instance.clear,

  get: async <
    K extends (keyof StorageItems)[],
    T extends K['length'] extends 0
      ? StorageItems
      : K['length'] extends 1
      ? StorageItems[K[0]]
      : { [key in K[number]]: StorageItems[key] }
  >(
    ...keys: K
  ): Promise<T> => {
    if (keys.length === 0) {
      return instance.getAll() as unknown as T
    }

    const values = await Promise.all(keys.map((key) => instance.get(key)))

    if (keys.length === 1) {
      return values[0] as T
    } else {
      return Object.fromEntries(values.map((val, idx) => [keys[idx], val])) as T
    }
  },

  set: <K extends keyof StorageItems>(key: K, value: StorageItems[K]) => {
    return instance.set(key, value)
  },

  remove: <K extends (keyof StorageItems)[]>(...keys: K) => {
    return Promise.all(keys.map((key) => instance.remove(key)))
  },

  watch: (callbackMap: {
    [key in keyof StorageItems]?: (
      change: {
        newValue?: StorageItems[key]
        oldValue?: StorageItems[key]
      },
      area: StorageAreaName
    ) => void
  }) => {
    return instance.watch(callbackMap)
  },

  unwatch: (callbackMap: {
    [key in keyof StorageItems]?: (
      change: {
        newValue?: StorageItems[key]
        oldValue?: StorageItems[key]
      },
      area: StorageAreaName
    ) => void
  }) => {
    return instance.unwatch(callbackMap)
  },
}

export const useStorage = <K extends keyof StorageItems>(
  key: K,
  init?: StorageItems[K]
) => {
  return typeof init !== 'undefined'
    ? plasmoUseStorage<StorageItems[K]>({ key, instance }, init)
    : plasmoUseStorage<StorageItems[K]>({ key, instance })
}

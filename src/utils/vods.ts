export type BwpVodId =
  | 'primevideo'
  | 'danime'
  | 'dmmtv'
  | 'abema'
  | 'niconico'
  | 'youtube'

export const BWP_VODS: {
  id: BwpVodId
  name: string
  hostnames: string[]
  getVideoId: (url: string | URL) => string | null
  getWatchPageUrl: (videoId: string) => string
}[] = [
  {
    id: 'primevideo',
    name: 'Prime Video',
    hostnames: ['www.amazon.co.jp'],

    getVideoId: (url: string | URL) => {
      try {
        const { href } = new URL(url)
        const regexp = /\/video\/detail\/(?<id>[A-Z0-9]+)/
        const matched = href.match(regexp)

        return matched?.groups?.id ?? null
      } catch {}

      return null
    },

    getWatchPageUrl: (videoId: string) => {
      const url = new URL(
        `/gp/video/detail/${videoId}`,
        'https://www.amazon.co.jp'
      )
      url.searchParams.set('autoplay', '1')
      url.searchParams.set('t', '0')

      return url.href
    },
  },

  {
    id: 'danime',
    name: 'dアニメストア',
    hostnames: ['animestore.docomo.ne.jp'],

    getVideoId: (url: string | URL) => {
      try {
        const { searchParams } = new URL(url)

        return searchParams.get('partId') ?? null
      } catch {}

      return null
    },

    getWatchPageUrl: (videoId: string) => {
      const url = new URL(
        `/animestore/sc_d_pc?partId=${videoId}`,
        'https://animestore.docomo.ne.jp'
      )

      return url.href
    },
  },

  // {
  //   id: 'dmmtv',
  //   name: 'DMM TV',
  //   hostnames: ['tv.dmm.com'],

  //   getVideoId: (url: string | URL) => {
  //     try {
  //       const { searchParams } = new URL(url)

  //       const season = searchParams.get('season')
  //       const content = searchParams.get('content')

  //       return season && content ? `season=${season}&content=${content}` : null
  //     } catch {}

  //     return null
  //   },

  //   getWatchPageUrl: (videoId: string) => {
  //     const url = new URL('/vod/playback/', 'https://tv.dmm.com')
  //     url.search = videoId

  //     return url.href
  //   },
  // },

  {
    id: 'abema',
    name: 'ABEMA',
    hostnames: ['abema.tv'],

    getVideoId: (url: string | URL) => {
      try {
        const { href } = new URL(url)
        const regexp = /\/video\/episode\/(?<id>[a-z0-9_\-]+)/
        const matched = href.match(regexp)

        return matched?.groups?.id ?? null
      } catch {}

      return null
    },

    getWatchPageUrl: (videoId: string) => {
      const url = new URL(`/video/episode/${videoId}`, 'https://abema.tv')

      return url.href
    },
  },

  // {
  //   id: 'niconico',
  //   name: 'ニコニコ',
  //   hostnames: ['www.nicovideo.jp', 'sp.nicovideo.jp'],

  //   getVideoId: (url: string | URL) => {
  //     try {
  //       const { href } = new URL(url)
  //       const regexp = /\/watch\/(?<id>[a-z]{2}\d+)/
  //       const matched = href.match(regexp)

  //       return matched?.groups?.id ?? null
  //     } catch {}

  //     return null
  //   },

  //   getWatchPageUrl: (videoId: string) => {
  //     const url = new URL(`/watch/${videoId}`, 'https://www.nicovideo.jp')

  //     return url.href
  //   },
  // },

  // {
  //   id: 'youtube',
  //   name: 'YouTube',
  //   hostnames: ['www.youtube.com', 'm.youtube.com', 'youtu.be'],

  //   getVideoId: (url: string | URL) => {
  //     try {
  //       const { hostname, pathname, searchParams } = new URL(url)

  //       if (hostname === 'youtu.be') {
  //         return pathname.slice(1) ?? null
  //       }

  //       return searchParams.get('v') ?? null
  //     } catch {}

  //     return null
  //   },

  //   getWatchPageUrl: (videoId: string) => {
  //     const url = new URL('/watch', 'https://www.youtube.com')
  //     url.searchParams.set('v', videoId)

  //     return url.href
  //   },
  // },
]

export const getVodByURL = (url: string | URL) => {
  try {
    const { hostname } = new URL(url)

    return BWP_VODS.find((vod) => vod.hostnames.includes(hostname)) ?? null
  } catch {
    return null
  }
}

export const getVodById = (id: BwpVodId) => {
  return BWP_VODS.find((vod) => vod.id === id) ?? null
}

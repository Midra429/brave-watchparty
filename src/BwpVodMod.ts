import { sendToBackground } from '@/utils/messaging'
import { storage } from '@/utils/storage'
import { webext } from './webext'

type MessageCallbackArgs = [
  message: any,
  sender: any,
  sendResponse: (response?: any) => void
]

export class BwpVodMod {
  #video: HTMLVideoElement | null
  #isHost: boolean | null

  #_intervalId: NodeJS.Timeout | null = null

  get video() {
    return this.#video
  }

  constructor(video: HTMLVideoElement, isHost: boolean = false) {
    console.log('[Brave Watchparty] new BwpVodMod()')

    this.#video = video
    this.#isHost = isHost

    if (this.#isHost) {
      this.#video?.addEventListener('playing', this.#listener.playing)
      this.#video?.addEventListener('pause', this.#listener.pause)
      this.#video?.addEventListener('seeked', this.#listener.seeked)
      // this.#video?.addEventListener('timeupdate', this.#listener.timeupdate)

      this.#_intervalId = setInterval(async () => {
        const currentTime = this.#getCurrentTime()

        if (currentTime !== null) {
          sendToBackground({
            name: 'room',
            body: {
              type: 'pub:video',
              playing: this.#video ? !this.#video.paused : false,
              time: currentTime,
            },
          })
        }
      }, 4000)
    } else {
      this.#video.addEventListener(
        'loadedmetadata',
        this.#listener.loadedmetadata
      )

      if (HTMLMediaElement.HAVE_METADATA <= this.#video.readyState) {
        setTimeout(() => {
          this.#listener.loadedmetadata(new Event('loadedmetadata'))
        }, 100)
      }

      this.#_intervalId = setInterval(async () => {
        const { playing, playing_time } = await storage.get(
          'playing',
          'playing_time'
        )

        if (playing) {
          this.#video?.play()
        } else {
          this.#video?.pause()

          if (typeof playing_time !== 'undefined' && this.#video) {
            this.#video.currentTime = playing_time
          }
        }
      }, 2000)
    }

    webext.runtime.onMessage.addListener(this.#listener.message)
  }

  dispose() {
    console.log('[Brave Watchparty] BwpVodMod.dispose()')

    if (this.#_intervalId) {
      clearInterval(this.#_intervalId)
    }

    if (this.#isHost) {
      this.#video?.removeEventListener('playing', this.#listener.playing)
      this.#video?.removeEventListener('pause', this.#listener.pause)
      this.#video?.removeEventListener('seeked', this.#listener.seeked)
      // this.#video?.removeEventListener('timeupdate', this.#listener.timeupdate)
    } else {
      this.#video?.removeEventListener(
        'loadedmetadata',
        this.#listener.loadedmetadata
      )

      storage.unwatch({
        playing: this.#watch.playing,
        playing_time: this.#watch.playing_time,
      })
    }

    webext.runtime.onMessage.removeListener(this.#listener.message)

    this.#video = null
    this.#isHost = null
    this.#_intervalId = null
  }

  #getCurrentTime() {
    const { currentTime } = this.#video ?? {}

    if (Number.isFinite(currentTime)) {
      return currentTime as number
    }

    return null
  }

  #watch = {
    playing: ({ newValue }) => {
      if (typeof newValue !== 'undefined') {
        if (newValue) {
          this.#video?.play()
        } else {
          this.#video?.pause()
        }
      }
    },

    playing_time: async ({ newValue }) => {
      if (
        typeof newValue !== 'undefined' &&
        this.#video &&
        1.5 < Math.abs(newValue - this.#video.currentTime)
      ) {
        this.#video.currentTime = newValue
      }
    },
  } as Parameters<typeof storage.watch>[0]

  #listener = {
    loadedmetadata: (evt: Event) => {
      return this.#onLoadedmetadata(evt)
    },

    playing: (evt: Event) => {
      return this.#onPlaying(evt)
    },

    pause: (evt: Event) => {
      return this.#onPause(evt)
    },

    seeked: (evt: Event) => {
      return this.#onSeeked(evt)
    },

    // timeupdate: (evt: Event) => {
    //   return this.#onTimeupdate(evt)
    // },

    message: (...args: MessageCallbackArgs) => {
      return this.#onMessage(args)
    },
  }

  #onLoadedmetadata(evt: HTMLVideoElementEventMap['loadedmetadata']) {
    storage.watch({
      playing: this.#watch.playing,
      playing_time: this.#watch.playing_time,
    })
  }

  #onPlaying(evt: HTMLVideoElementEventMap['playing']) {
    const currentTime = this.#getCurrentTime()

    if (currentTime === null) {
      return
    }

    sendToBackground({
      name: 'room',
      body: {
        type: 'pub:video',
        playing: true,
        time: currentTime,
      },
    })
  }

  #onPause(evt: HTMLVideoElementEventMap['pause']) {
    const currentTime = this.#getCurrentTime()

    if (currentTime === null) {
      return
    }

    sendToBackground({
      name: 'room',
      body: {
        type: 'pub:video',
        playing: false,
        time: currentTime,
      },
    })
  }

  #onSeeked(evt: HTMLVideoElementEventMap['seeked']) {
    const currentTime = this.#getCurrentTime()

    if (currentTime === null) {
      return
    }

    sendToBackground({
      name: 'room',
      body: {
        type: 'pub:video',
        playing: this.#video ? !this.#video.paused : false,
        time: currentTime,
      },
    })
  }

  // #onTimeupdate(evt: HTMLVideoElementEventMap['timeupdate']) {}

  #onMessage([message, sender, sendResponse]: MessageCallbackArgs) {
    if (message.name === 'leave') {
      this.dispose()
    }

    if (message.name === 'ping') {
      sendResponse(true)
    }

    return
  }
}

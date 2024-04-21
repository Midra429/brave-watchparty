import { api } from 'misskey-js/built/esm'
import { storage } from '@/utils/storage'

storage.watch({
  misskey_token: () => MisskeyAPI.dispose(),
})

export class MisskeyAPI {
  static #client: api.APIClient | null = null

  static async client() {
    if (!this.#client) {
      const { misskey_server, misskey_token } = await storage.get(
        'misskey_server',
        'misskey_token'
      )

      if (misskey_server && misskey_token) {
        this.#client = new api.APIClient({
          origin: `https://${misskey_server}`,
          credential: misskey_token,
        })
      }
    }

    return this.#client
  }

  static dispose() {
    this.#client = null
  }
}

export type D1MisskeyUserData = {
  session: string
  host: string
  username: string
}

export type D1RoomData = {
  id: string
  resident: string
  is_open: 0 | 1
  last_updated: number
}

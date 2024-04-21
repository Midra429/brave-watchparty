import tlds from 'tlds'

const UUID_REGEXP = /^[0-9a-z]{8}(?:-[0-9a-z]{4}){3}-[0-9a-z]{12}$/i
const DOMAIN_REGEXP = new RegExp(`^[^:\\/]+\\.(${tlds.join('|')})$`)
const ROOM_ID_REGEXP = /^[a-z0-9]{12}$/i

export const validateUUID = (
  uuid: string | null | undefined
): uuid is string => {
  return !!uuid && UUID_REGEXP.test(uuid)
}

export const validateDomain = (
  domain: string | null | undefined
): domain is string => {
  return !!domain && DOMAIN_REGEXP.test(domain)
}

export const validateRoomId = (
  roomId: string | null | undefined
): roomId is string => {
  return !!roomId && ROOM_ID_REGEXP.test(roomId)
}

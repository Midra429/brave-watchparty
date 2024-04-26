import { Flex } from 'antd'
import { useStorage } from '@/utils/storage'
import { JoinedStatus } from '@/popup/components/JoinedStatus'
import { RoomIdAndURL } from '@/popup/components/RoomIdAndUrl'

export const HostPane: React.FC = () => {
  const [myRoom] = useStorage('my_room')
  const [joinedRoom] = useStorage('joined_room')

  if (!myRoom) {
    return null
  }

  return (
    <Flex vertical gap="middle">
      {joinedRoom && <JoinedStatus isHost />}

      <RoomIdAndURL id={myRoom.id} />
    </Flex>
  )
}

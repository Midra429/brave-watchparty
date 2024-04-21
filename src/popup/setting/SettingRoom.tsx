import { Flex, Button, Modal, message } from 'antd'
import { CarOutlined } from '@ant-design/icons'
import { useStorage } from '@/utils/storage'
import { RoomAPI } from '@/api/room'
import { RoomIdAndURL } from '@/popup/components/RoomIdAndUrl'

export const SettingRoom: React.FC = () => {
  const [myRoom] = useStorage('my_room')

  return (
    myRoom && (
      <Flex vertical gap="middle">
        <RoomIdAndURL id={myRoom.id} />

        <Button
          block
          shape="round"
          icon={<CarOutlined />}
          onClick={() => {
            Modal.confirm({
              title: '引っ越しますか？',
              content: '部屋IDと招待URLを変更します。',
              centered: true,
              maskClosable: true,
              onOk: async () => {
                if (await RoomAPI.moving()) {
                  message.success('引っ越しました')
                } else {
                  message.error('引っ越しに失敗しました')
                }
              },
            })
          }}
        >
          部屋のお引越し
        </Button>
      </Flex>
    )
  )
}

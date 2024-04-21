import { useState } from 'react'
import { Flex, Button, Popconfirm, message } from 'antd'
import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import { useStorage } from '@/utils/storage'
import { sendToBackground } from '@/utils/messaging'
import { JoinedStatus } from '@/popup/components/JoinedStatus'
import { RoomIdAndURL } from '@/popup/components/RoomIdAndUrl'

export const HostPane: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false)

  const [myRoom] = useStorage('my_room')
  const [joinedRoom] = useStorage('joined_room')

  if (!myRoom) {
    return null
  }

  return (
    <Flex vertical gap="middle">
      {joinedRoom ? (
        <>
          <JoinedStatus isHost />

          <RoomIdAndURL id={myRoom.id} />

          <Popconfirm
            title="閉じますか？"
            description="部屋にいる人を退室させて、部屋を閉じます。"
            okButtonProps={{
              danger: true,
            }}
            zIndex={1071}
            onConfirm={async () => {
              setLoading(true)

              await sendToBackground({
                name: 'room',
                body: { type: 'leave' },
              })

              setLoading(false)
            }}
          >
            <Button
              block
              shape="round"
              danger
              icon={<LockOutlined />}
              loading={loading}
            >
              部屋を閉じる
            </Button>
          </Popconfirm>
        </>
      ) : (
        <>
          <RoomIdAndURL id={myRoom.id} />

          <Popconfirm
            title="開けますか？"
            description="他の人が部屋に入れるようにします。"
            zIndex={1071}
            onConfirm={async () => {
              setLoading(true)

              const success = await sendToBackground({
                name: 'room',
                body: { type: 'join' },
              })

              if (!success) {
                message.error('部屋の解錠に失敗しました')
              }

              setLoading(false)
            }}
          >
            <Button
              block
              shape="round"
              type="primary"
              icon={<UnlockOutlined />}
              loading={loading}
            >
              部屋を開ける
            </Button>
          </Popconfirm>
        </>
      )}
    </Flex>
  )
}

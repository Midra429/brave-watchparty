import { useState } from 'react'
import { Flex, Space, Button, Input, Popconfirm, Tooltip, message } from 'antd'
import { HomeOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons'
import { validateRoomId } from '@/utils/validate'
import { useStorage } from '@/utils/storage'
import { sendToBackground } from '@/utils/messaging'
import { JoinedStatus } from '@/popup/components/JoinedStatus'
import { RoomIdAndURL } from '@/popup/components/RoomIdAndUrl'

export const GuestPane: React.FC = () => {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const [joinedRoom] = useStorage('joined_room')

  const isRoomIdValid = validateRoomId(roomId)

  return (
    <Flex vertical gap="middle">
      {joinedRoom ? (
        <>
          <JoinedStatus />

          <RoomIdAndURL id={joinedRoom.id} />

          <Popconfirm
            title="退室しますか？"
            description="現在入っている部屋から出ます。"
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
            <Button block shape="round" danger icon={<LogoutOutlined />}>
              部屋から出る
            </Button>
          </Popconfirm>
        </>
      ) : (
        <Space.Compact>
          <Input
            addonBefore={<HomeOutlined />}
            placeholder="部屋ID"
            onChange={(evt) => setRoomId(evt.target.value)}
          />

          <Tooltip placement="left" title={isRoomIdValid && !loading && '入室'}>
            <Button
              type="primary"
              icon={<LoginOutlined />}
              disabled={!isRoomIdValid}
              loading={loading}
              onClick={async () => {
                setLoading(true)

                const success = await sendToBackground({
                  name: 'room',
                  body: {
                    type: 'join',
                    roomId: roomId!,
                  },
                })

                if (success) {
                  setRoomId('')
                } else {
                  message.error('部屋に入れませんでした')
                }

                setLoading(false)
              }}
            />
          </Tooltip>
        </Space.Compact>
      )}
    </Flex>
  )
}

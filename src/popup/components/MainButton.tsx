import { useState } from 'react'
import { Button, Popconfirm, message } from 'antd'
import { LogoutOutlined, UnlockOutlined, LockOutlined } from '@ant-design/icons'
import { sendToBackground } from '@plasmohq/messaging'
import { useStorage } from '@/utils/storage'

const BUTTON_PROPS: {
  [mode in 'host' | 'guest']: {
    [status in 'notJoined' | 'joined']?: {
      title: string
      description: string
      danger: boolean
      buttonIcon: React.ReactNode
      buttonText: string
      onConfirm: () => Promise<void>
    }
  }
} = {
  host: {
    notJoined: {
      title: '開けますか？',
      description: '他の人が部屋に入れるようにします。',
      buttonIcon: <UnlockOutlined />,
      buttonText: '部屋を開ける',
      danger: false,
      onConfirm: async () => {
        const success = await sendToBackground({
          name: 'room',
          body: { type: 'join' },
        })

        if (!success) {
          message.error('部屋の解錠に失敗しました')
        }
      },
    },
    joined: {
      title: '閉じますか？',
      description: '部屋にいる人を退室させて、部屋を閉じます。',
      buttonIcon: <LockOutlined />,
      buttonText: '部屋を閉じる',
      danger: true,
      onConfirm: async () => {
        await sendToBackground({
          name: 'room',
          body: { type: 'leave' },
        })
      },
    },
  },
  guest: {
    joined: {
      title: '退室しますか？',
      description: '現在入っている部屋から出ます。',
      buttonIcon: <LogoutOutlined />,
      buttonText: '部屋から出る',
      danger: true,
      onConfirm: async () => {
        await sendToBackground({
          name: 'room',
          body: { type: 'leave' },
        })
      },
    },
  },
}

export const MainButton: React.FC = () => {
  const [loading, setLoading] = useState(false)

  const [mode] = useStorage('mode', 'guest')
  const [misskeyToken] = useStorage('misskey_token')
  const [joinedRoom] = useStorage('joined_room')

  const isLogin = !!misskeyToken
  const isJoined = isLogin && !!joinedRoom

  const prop = mode && BUTTON_PROPS[mode][isJoined ? 'joined' : 'notJoined']

  return (
    prop && (
      <Popconfirm
        title={prop.title}
        description={prop.description}
        okButtonProps={{ danger: prop.danger }}
        zIndex={1071}
        onConfirm={async () => {
          setLoading(true)

          await prop.onConfirm()

          setLoading(false)
        }}
      >
        <Button
          shape="round"
          type={!prop.danger ? 'primary' : 'default'}
          danger={prop.danger}
          icon={prop.buttonIcon}
          style={{ margin: 'auto 12px 12px' }}
          loading={loading}
        >
          {prop.buttonText}
        </Button>
      </Popconfirm>
    )
  )
}

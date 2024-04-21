import { useState } from 'react'
import { Flex, Button, Modal, message } from 'antd'
import { SyncOutlined, LogoutOutlined } from '@ant-design/icons'
import { useStorage } from '@/utils/storage'
import { logout } from '@/utils/logout'
import { MisskeyAPI } from '@/api/misskey'
import { UserItem } from '@/popup/components/UserItem'

export const SettingAccount: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false)

  const [misskeyServer] = useStorage('misskey_server')
  const [misskeyUser, setMisskeyUser] = useStorage('misskey_user')

  return (
    <Flex vertical gap="small">
      {misskeyUser && (
        <UserItem
          size="large"
          avatar={misskeyUser.avatarUrl}
          name={misskeyUser.name}
          id={`@${misskeyUser.username}@${misskeyServer}`}
        />
      )}

      <Flex gap="small">
        <Button
          block
          shape="round"
          icon={<SyncOutlined />}
          loading={loading}
          onClick={async () => {
            setLoading(true)

            const client = await MisskeyAPI.client()

            if (client) {
              try {
                const user = await client.request('i', {})

                if (user) {
                  await setMisskeyUser(user)

                  message.success('更新しました')
                }
              } catch {
                message.error('更新に失敗しました')
              }
            }

            setLoading(false)
          }}
        >
          情報を更新
        </Button>

        <Button
          block
          shape="round"
          danger
          icon={<LogoutOutlined />}
          onClick={() => {
            Modal.confirm({
              title: 'ログアウトしますか？',
              content: 'ログイン中のアカウントからログアウトします。',
              okType: 'danger',
              okButtonProps: {
                type: 'primary',
              },
              centered: true,
              maskClosable: true,
              onOk: async () => {
                await logout()
                location.reload()
              },
            })
          }}
        >
          ログアウト
        </Button>
      </Flex>
    </Flex>
  )
}

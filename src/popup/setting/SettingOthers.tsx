import { Flex, Button, Modal } from 'antd'
import { UndoOutlined, DeleteOutlined } from '@ant-design/icons'
import { storage } from '@/utils/storage'
import { logout } from '@/utils/logout'
import { reset } from '@/utils/reset'

export const SettingOthers: React.FC = () => {
  return (
    <Flex gap="small">
      <Button
        block
        shape="round"
        danger
        icon={<UndoOutlined />}
        onClick={() => {
          Modal.confirm({
            title: 'リセットしますか？',
            content: '全ての設定をリセットします。',
            okType: 'danger',
            okButtonProps: {
              type: 'primary',
            },
            centered: true,
            maskClosable: true,
            onOk: async () => {
              await reset()
            },
          })
        }}
      >
        リセット
      </Button>

      <Button
        block
        shape="round"
        danger
        icon={<DeleteOutlined />}
        onClick={() => {
          Modal.confirm({
            title: '初期化しますか？',
            content: 'ログアウト後、全ての設定をリセットします。',
            okType: 'danger',
            okButtonProps: {
              type: 'primary',
            },
            centered: true,
            maskClosable: true,
            onOk: async () => {
              await logout()
              await storage.clear()
              location.reload()
            },
          })
        }}
      >
        初期化
      </Button>
    </Flex>
  )
}

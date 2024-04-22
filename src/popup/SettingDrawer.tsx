import { Flex, Collapse, Typography } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { webext } from '@/webext'
import { useStorage } from '@/utils/storage'
import { Drawer } from './components/Drawer'
import { SettingAccount } from './setting/SettingAccount'
import { SettingRoom } from './setting/SettingRoom'
import { SettingVods } from './setting/SettingVods'
import { SettingOthers } from './setting/SettingOthers'

const { Text, Link } = Typography

const manifest = webext.runtime.getManifest()

export const SettingDrawer: React.FC<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ open, setOpen }) => {
  const [myRoom] = useStorage('my_room')

  return (
    <Drawer
      placement="top"
      title="設定"
      icon={<SettingOutlined />}
      open={open}
      setOpen={setOpen}
    >
      {open && (
        <Flex vertical>
          <Collapse
            size="small"
            defaultActiveKey={['account']}
            items={[
              {
                key: 'account',
                label: 'アカウント',
                children: <SettingAccount />,
              },
              myRoom && {
                key: 'room',
                label: '部屋',
                children: <SettingRoom />,
              },
              {
                key: 'vods',
                label: '動画配信サービス',
                children: <SettingVods />,
              },
              {
                key: 'others',
                label: 'その他',
                children: <SettingOthers />,
              },
            ].flatMap((item) =>
              item
                ? {
                    ...item,
                    style: { borderRadius: 0 },
                  }
                : []
            )}
            style={{ borderRadius: 0 }}
          />

          <Link
            type="secondary"
            href={manifest.homepage_url}
            target="_blank"
            style={{ margin: '1em auto' }}
          >
            {manifest.name} v{manifest.version}
          </Link>
        </Flex>
      )}
    </Drawer>
  )
}

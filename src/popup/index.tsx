import type { TabsProps } from 'antd'

import { useState } from 'react'
import { ConfigProvider, App, Flex, Tabs, Button, message } from 'antd'
import localeJaJP from 'antd/locale/ja_JP'
import { UserOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons'
import { useStorage } from '@/utils/storage'
import { LoginPane } from './LoginPane'
import { GuestPane } from './GuestPane'
import { HostPane } from './HostPane'
import { SettingDrawer } from './SettingDrawer'
import { NowPlaying } from './components/NowPlaying'

import 'ress'

message.config({
  maxCount: 1,
  duration: 1.5,
})

const Popup: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [mode, setMode] = useStorage('mode', 'guest')
  const [misskeyToken] = useStorage('misskey_token')
  const [myRoom] = useStorage('my_room')
  const [joinedRoom] = useStorage('joined_room')

  const hasHostPrivileges = !!myRoom
  const isLogin = !!misskeyToken
  const isJoined = isLogin && !!joinedRoom
  const canDrawerOpen = isLogin && !isJoined

  return (
    <ConfigProvider locale={localeJaJP}>
      <App
        style={{
          width: 'fit-content',
          height: isDrawerOpen && canDrawerOpen ? 450 : 'fit-content',
        }}
      >
        {isLogin ? (
          <Flex>
            {isJoined && <NowPlaying />}

            <Tabs
              centered
              style={{ width: 350 }}
              tabBarStyle={{ marginBottom: 0 }}
              destroyInactiveTabPane
              activeKey={!hasHostPrivileges ? 'guest' : mode}
              items={(
                [
                  {
                    key: 'guest',
                    icon: <UserOutlined />,
                    label: '参加者',
                    children: <GuestPane />,
                    disabled: isJoined,
                  },
                  {
                    key: 'host',
                    icon: <HomeOutlined />,
                    label: 'ホスト',
                    children: <HostPane />,
                    disabled: !hasHostPrivileges || isJoined,
                  },
                ] as Required<TabsProps>['items']
              ).map((item) => ({
                ...item,
                icon: item.icon && (
                  <span style={{ marginLeft: '1em' }}>{item.icon}</span>
                ),
                label: item.label && (
                  <span style={{ marginRight: '1em' }}>{item.label}</span>
                ),
                children: item.children && (
                  <div style={{ padding: 12 }}>{item.children}</div>
                ),
              }))}
              tabBarExtraContent={
                <Button
                  shape="circle"
                  icon={<SettingOutlined />}
                  style={{ marginRight: 8 }}
                  disabled={isJoined}
                  onClick={() => setIsDrawerOpen(true)}
                />
              }
              onChange={(key) => !isJoined && setMode(key as 'guest' | 'host')}
            />

            <SettingDrawer open={isDrawerOpen} setOpen={setIsDrawerOpen} />
          </Flex>
        ) : (
          <LoginPane />
        )}
      </App>
    </ConfigProvider>
  )
}

export default Popup

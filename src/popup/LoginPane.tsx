import { useState, useEffect } from 'react'
import { Flex, Divider, Button, Input, Typography } from 'antd'
import { BACKEND_URL } from '@/constants'
import { webext } from '@/webext'
import { storage } from '@/utils/storage'
import { validateDomain } from '@/utils/validate'

const { Title } = Typography

const manifest = webext.runtime.getManifest()

export const LoginPane: React.FC = () => {
  const [server, setServer] = useState<string | null>(null)

  const isServerValid = validateDomain(server)

  useEffect(() => {
    storage.get('misskey_server').then((val) => {
      setServer(val || 'submarin.online')
    })
  }, [])

  return (
    <Flex vertical gap="middle" style={{ width: 350, padding: 12 }}>
      <Divider style={{ margin: 0 }}>
        <Title level={4} style={{ margin: 0 }}>
          Misskeyでログイン
        </Title>
      </Divider>

      {server !== null && (
        <>
          <Input
            addonBefore="https://"
            placeholder="submarin.online"
            defaultValue={server}
            onChange={(evt) => setServer(evt.target.value)}
          />

          <Button
            block
            shape="round"
            type="primary"
            disabled={!isServerValid}
            onClick={async () => {
              const session = crypto.randomUUID()

              await storage.set('misskey_session', session)
              await storage.set('misskey_server', server)

              const url = new URL(`/miauth/${session}`, `https://${server}`)

              url.searchParams.set('name', manifest.name)
              url.searchParams.set('callback', `${BACKEND_URL}/miauth/callback`)
              url.searchParams.set('permission', 'read:account')

              webext.tabs.create({ url: url.toString() })
            }}
          >
            ログイン
          </Button>
        </>
      )}
    </Flex>
  )
}

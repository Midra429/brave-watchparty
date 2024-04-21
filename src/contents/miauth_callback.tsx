import type { GetProp, ResultProps } from 'antd'
import type { PlasmoCSConfig, PlasmoGetRootContainer } from 'plasmo'

import { useState, useEffect } from 'react'
import { App, Result, Button } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { sendToBackground } from '@/utils/messaging'
import { storage } from '@/utils/storage'
import { logout } from '@/utils/logout'
import { MiAuthApi } from '@/api/miauth'

export const config: PlasmoCSConfig = {
  matches: ['https://bwp.midra.me/miauth/callback?session=*'],
  run_at: 'document_end',
}

export const getRootContainer: PlasmoGetRootContainer = () => {
  return (
    document.getElementById('root') ??
    document.body.appendChild(document.createElement('div'))
  )
}

const Page: React.FC = () => {
  const [status, setStatus] = useState<GetProp<ResultProps, 'status'>>()
  const [title, setTitle] = useState<React.ReactNode>()
  const [subTitle, setSubTitle] = useState<React.ReactNode>()

  useEffect(() => {
    setTitle('認証中...')
    setSubTitle('このタブを閉じないでください')

    storage
      .get('misskey_session', 'misskey_token')
      .then(({ misskey_session, misskey_token }) => {
        const session = new URLSearchParams(location.search).get('session')

        if (misskey_session === session) {
          if (misskey_token) {
            setStatus('info')
            setTitle('認証済みです')
            setSubTitle('このタブを閉じてください')
          } else {
            MiAuthApi.check().then(async (miAuthResult) => {
              if (miAuthResult) {
                await storage.set('misskey_token', miAuthResult.token)
                await storage.set('misskey_user', miAuthResult.user)
                await storage.set('my_room', miAuthResult.room)

                setStatus('success')
                setTitle('認証に成功しました')
                setSubTitle('このタブを閉じてください')
              } else {
                logout()

                setStatus('error')
                setTitle('Misskeyの認証に失敗しました')
                setSubTitle('このタブを閉じて最初からやり直してください')
              }
            })
          }
        } else {
          logout()

          setStatus('error')
          setTitle('セッションIDが一致しませんでした')
          setSubTitle('このタブを閉じて最初からやり直してください')
        }
      })
  }, [])

  return (
    <App
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#fff',
      }}
    >
      <Result
        status={status}
        icon={
          !status ? (
            <LoadingOutlined spin style={{ fontSize: 72 }} />
          ) : undefined
        }
        title={title}
        subTitle={subTitle}
        extra={
          status && (
            <Button
              size="large"
              onClick={() => {
                sendToBackground({ name: 'closeTab' })
              }}
            >
              タブを閉じる
            </Button>
          )
        }
      />
    </App>
  )
}

export default Page

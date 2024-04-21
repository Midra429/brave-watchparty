import type { GetProp, ResultProps } from 'antd'
import type { PlasmoCSConfig, PlasmoGetRootContainer } from 'plasmo'

import { useState, useEffect } from 'react'
import { App, Result, Button, message } from 'antd'
import {
  LoadingOutlined,
  HomeOutlined,
  LockOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { sendToBackground } from '@/utils/messaging'
import { storage } from '@/utils/storage'
import { RoomAPI } from '@/api/room'

export const config: PlasmoCSConfig = {
  matches: ['https://bwp.midra.me/room/*'],
  run_at: 'document_end',
}

export const getRootContainer: PlasmoGetRootContainer = () => {
  return (
    document.getElementById('root') ??
    document.body.appendChild(document.createElement('div'))
  )
}

const Page: React.FC = () => {
  const { roomId } = document.body.dataset

  if (!roomId) {
    return null
  }

  const [status, setStatus] = useState<GetProp<ResultProps, 'status'>>()
  const [icon, setIcon] = useState<React.ReactNode>()
  const [title, setTitle] = useState<React.ReactNode>()
  const [subTitle, setSubTitle] = useState<React.ReactNode>()

  const [isMyRoom, setIsMyRoom] = useState<boolean>(false)
  const [isJoinedRoom, setIsJoinedRoom] = useState<boolean>(false)
  const [isRoomOpen, setIsRoomOpen] = useState<boolean>(false)

  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    setIcon(<LoadingOutlined spin style={{ fontSize: 72 }} />)
    setTitle('部屋情報を取得中...')
    setSubTitle('少々お待ちください')

    Promise.all([
      RoomAPI.meta(roomId),
      storage.get('my_room', 'joined_room'),
    ]).then(([room, { my_room, joined_room }]) => {
      if (room) {
        const isMyRoom = room.id === my_room?.id
        const isJoinedRoom = room.id === joined_room?.id

        setIsMyRoom(isMyRoom)
        setIsJoinedRoom(isJoinedRoom)

        if (room.is_open) {
          setStatus('info')
          setIcon(<HomeOutlined style={{ fontSize: 72 }} />)
          setIsRoomOpen(true)

          if (isMyRoom) {
            setTitle('あなたの部屋です')
            setSubTitle(null)
          } else {
            setTitle(`${room.resident} の部屋`)

            if (isJoinedRoom) {
              setSubTitle('あなたはこの部屋に入っています')
            } else {
              setSubTitle(null)
            }
          }
        } else {
          setStatus('warning')
          setIcon(<LockOutlined style={{ fontSize: 72 }} />)
          setTitle('部屋に鍵がかかっています')

          if (isMyRoom) {
            setSubTitle(null)
          } else {
            setSubTitle('ホストが部屋を開けるまで入れません')
          }
        }
      } else {
        setStatus('error')
        setIcon(<CloseOutlined style={{ fontSize: 72 }} />)
        setTitle('部屋が存在しません')
        setSubTitle(null)
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
        icon={icon}
        title={title}
        subTitle={subTitle}
        extra={
          !isMyRoom &&
          !isJoinedRoom &&
          isRoomOpen && (
            <Button
              size="large"
              type="primary"
              loading={loading}
              onClick={async () => {
                setLoading(true)

                const success = await sendToBackground({
                  name: 'room',
                  body: {
                    type: 'join',
                    roomId,
                  },
                })

                if (success) {
                  location.reload()
                } else {
                  message.error('部屋に入れませんでした')
                }

                setLoading(false)
              }}
            >
              部屋に入る
            </Button>
          )
        }
      />
    </App>
  )
}

export default Page

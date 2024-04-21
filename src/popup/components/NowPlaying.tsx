import { useState, useEffect } from 'react'
import { Flex, Space, List, Button, Input, Popconfirm, Typography } from 'antd'
import {
  PlayCircleOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  PlayCircleTwoTone,
} from '@ant-design/icons'
import { webext } from '@/webext'
import { useStorage } from '@/utils/storage'
import { getVodById, getVodByURL } from '@/utils/vods'
import { sendToBackground, sendToContentScript } from '@/utils/messaging'

const { Text } = Typography

export const NowPlaying: React.FC = () => {
  const [isCurrentTabOpen, setIsCurrentTabOpen] = useState<boolean>(false)
  const [pendingVodUrl, setPendingVodUrl] = useState<string>()

  const [mode] = useStorage('mode')
  const [currentTabId] = useStorage('current_tab_id')
  const [currentVodId] = useStorage('current_vod_id')
  const [playingItems] = useStorage('playing_items')

  const pendingVod = getVodByURL(pendingVodUrl ?? '')
  const isHost = mode === 'host'

  useEffect(() => {
    if (typeof currentTabId !== 'undefined') {
      webext.tabs
        .get(currentTabId)
        .then(async (tab) => {
          const pong = await sendToContentScript({
            name: 'ping',
            tabId: tab.id,
          })
          setIsCurrentTabOpen(!!pong)
        })
        .catch(() => {
          setIsCurrentTabOpen(false)
        })
    } else {
      setIsCurrentTabOpen(false)
    }
  }, [currentTabId])

  const items = playingItems?.flatMap((item) => {
    const vod = getVodById(item.vodId)
    return vod
      ? {
          vodId: vod.id,
          vodName: vod.name,
          url: vod.getWatchPageUrl(item.videoId),
        }
      : []
  })

  if (!isHost && !items?.length) {
    return null
  }

  return (
    <Flex
      vertical
      style={{
        width: 300,
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <List
        itemLayout="horizontal"
        size="small"
        style={{ maxHeight: 300, padding: '0.5em 0.75em', overflow: 'auto' }}
        dataSource={items}
        renderItem={(item) => (
          <List.Item style={{ padding: '0.5em 0.75em' }}>
            <Flex
              justify="space-between"
              align="center"
              gap="small"
              style={{ width: '100%', maxWidth: '100%' }}
            >
              <Flex vertical style={{ overflow: 'hidden' }}>
                <Text strong ellipsis style={{ lineHeight: 1.5 }}>
                  {item.vodName}
                </Text>
                <Text
                  type="secondary"
                  ellipsis
                  title={item.url}
                  style={{ lineHeight: 1.5 }}
                >
                  {item.url}
                </Text>
              </Flex>

              <Flex
                style={{
                  flexShrink: 0,
                  flexGrow: 0,
                }}
              >
                <Button
                  type="text"
                  size="large"
                  shape="circle"
                  icon={
                    item.vodId === currentVodId && isCurrentTabOpen ? (
                      <PlayCircleTwoTone />
                    ) : (
                      <PlayCircleOutlined />
                    )
                  }
                  onClick={async () => {
                    await sendToBackground({
                      name: 'setCurrent',
                      body: {
                        vodId: item.vodId,
                        url: item.url,
                      },
                    })
                  }}
                />

                {isHost && (
                  <Popconfirm
                    placement="right"
                    title="削除しますか？"
                    okButtonProps={{
                      danger: true,
                    }}
                    zIndex={1071}
                    onConfirm={async () => {
                      await sendToBackground({
                        name: 'room',
                        body: {
                          type: 'pub:change',
                          items:
                            playingItems?.filter(
                              ({ vodId }) => vodId !== item.vodId
                            ) ?? [],
                        },
                      })
                    }}
                  >
                    <Button
                      type="text"
                      size="large"
                      shape="circle"
                      danger
                      icon={<MinusCircleOutlined />}
                    />
                  </Popconfirm>
                )}
              </Flex>
            </Flex>
          </List.Item>
        )}
      />

      {isHost && (
        <Space.Compact
          style={{
            marginTop: 'auto',
            padding: 12,
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <Input
            placeholder="動画視聴ページのURL"
            value={pendingVodUrl}
            onChange={(evt) => setPendingVodUrl(evt.target.value)}
          />

          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            disabled={
              !pendingVod || items?.some(({ vodId }) => vodId === pendingVod.id)
            }
            onClick={async () => {
              const vodId = pendingVod?.id
              const videoId = pendingVod?.getVideoId(pendingVodUrl ?? '')

              if (vodId && videoId) {
                await sendToBackground({
                  name: 'room',
                  body: {
                    type: 'pub:change',
                    items: [...(playingItems ?? []), { vodId, videoId }],
                  },
                })

                setPendingVodUrl('')
              }
            }}
          />
        </Space.Compact>
      )}
    </Flex>
  )
}

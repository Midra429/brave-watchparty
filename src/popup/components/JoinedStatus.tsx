import { useState } from 'react'
import { Flex, Space, List, Button, Typography } from 'antd'
import {
  LoadingOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  WifiOutlined,
} from '@ant-design/icons'
import { formatDuration } from '@/utils/formatDuration'
import { useStorage } from '@/utils/storage'
import { Drawer } from '@/popup/components/Drawer'
import { UserItem } from '@/popup/components/UserItem'

const { Paragraph, Text } = Typography

export const JoinedStatus: React.FC<{ isHost?: boolean }> = ({ isHost }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [room] = useStorage('joined_room')
  const [members] = useStorage('joined_members')
  const [ping] = useStorage('joined_state_ping')
  const [playing] = useStorage('playing')
  const [playingTime] = useStorage('playing_time')

  return (
    room && (
      <>
        <Flex vertical gap="small">
          <Flex justify="space-between">
            <Button
              type="text"
              size="small"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Space>
                <TeamOutlined />
                <Text>{members?.length ?? 0}</Text>
              </Space>
            </Button>

            <Space>
              {playing ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
              <Text>{formatDuration(playingTime ?? 0)}</Text>
            </Space>

            <Space>
              {ping ? (
                <>
                  <WifiOutlined
                    style={{ color: ping < 300 ? '#52c41a' : '#faad14' }}
                  />
                  <Text style={{ color: ping < 300 ? '#52c41a' : '#faad14' }}>
                    {ping} ms
                  </Text>
                </>
              ) : (
                <>
                  <LoadingOutlined spin style={{ color: '#1677ff' }} />
                  <Text type="secondary">接続中...</Text>
                </>
              )}
            </Space>
          </Flex>

          {!isHost && (
            <Paragraph ellipsis style={{ margin: 0 }}>
              <Text type="secondary">ホスト: </Text>
              <Text strong>{room.resident}</Text>
            </Paragraph>
          )}
        </Flex>

        <Drawer
          placement="left"
          width={250}
          title="参加者一覧"
          icon={<TeamOutlined />}
          open={isDrawerOpen}
          setOpen={setIsDrawerOpen}
        >
          <List
            itemLayout="horizontal"
            size="small"
            dataSource={members}
            renderItem={(member) => (
              <List.Item style={{ padding: '0.5em 0.75em' }}>
                <UserItem
                  avatar={member.avatar}
                  name={member.name}
                  id={member.id}
                />
              </List.Item>
            )}
          />
        </Drawer>
      </>
    )
  )
}

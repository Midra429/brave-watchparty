import { Flex, Space, Typography } from 'antd'
import {
  LoadingOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  WifiOutlined,
} from '@ant-design/icons'
import { formatDuration } from '@/utils/formatDuration'
import { useStorage } from '@/utils/storage'

const { Paragraph, Text } = Typography

export const JoinedStatus: React.FC<{ isHost?: boolean }> = ({ isHost }) => {
  const [room] = useStorage('joined_room')
  const [members] = useStorage('joined_members')
  const [ping] = useStorage('joined_state_ping')
  const [playing] = useStorage('playing')
  const [playingTime] = useStorage('playing_time')

  return (
    room && (
      <Flex vertical gap="small">
        <Flex justify="space-between">
          <Space>
            <TeamOutlined />
            <Text>{members?.length ?? 0}</Text>
          </Space>

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
    )
  )
}

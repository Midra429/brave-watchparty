import { Flex, Avatar, Typography } from 'antd'
import { UserOutlined } from '@ant-design/icons'

const { Text } = Typography

export const UserItem: React.FC<{
  size?: 'small' | 'default' | 'large'
  avatar?: string | null
  name?: string | null
  id?: string | null
}> = ({ size, avatar, name, id }) => {
  const fontSize = {
    small: 10,
    default: 12,
    large: 14,
  }[size || 'default']

  const lineHeight = {
    small: 1.3,
    default: 1.4,
    large: 1.5,
  }[size || 'default']

  return (
    <Flex
      align="center"
      gap="small"
      style={{ width: '100%', overflow: 'hidden' }}
    >
      <Avatar
        size={size}
        icon={!avatar ? <UserOutlined /> : undefined}
        src={avatar}
        draggable={false}
        style={{
          flexShrink: 0,
          flexGrow: 0,
          border: '1px solid #d9d9d9',
          backgroundColor: '#d9d9d9',
        }}
      />

      <Flex vertical style={{ overflow: 'hidden' }}>
        <Text strong ellipsis style={{ fontSize, lineHeight }}>
          {name || id}
        </Text>
        <Text type="secondary" ellipsis style={{ fontSize, lineHeight }}>
          {id}
        </Text>
      </Flex>
    </Flex>
  )
}

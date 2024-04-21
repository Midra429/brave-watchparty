import { memo } from 'react'
import { Flex, Space, Input, Button, Tooltip, message } from 'antd'
import { HomeOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons'
import { BACKEND_URL } from '@/constants'

export const RoomIdAndURL = memo(({ id }: { id: string }) => {
  const url = new URL(`/room/${id}`, BACKEND_URL).href

  return (
    <Flex vertical gap="small">
      <Space.Compact>
        <Input addonBefore={<HomeOutlined />} value={id} readOnly />

        <Tooltip placement="left" title="部屋IDをコピー">
          <Button
            type="primary"
            icon={<CopyOutlined />}
            onClick={() => {
              navigator.clipboard.writeText(id)
              message.success('コピーしました')
            }}
          />
        </Tooltip>
      </Space.Compact>

      <Space.Compact>
        <Input addonBefore={<LinkOutlined />} value={url} readOnly />

        <Tooltip placement="left" title="招待URLをコピー">
          <Button
            type="primary"
            icon={<CopyOutlined />}
            onClick={() => {
              navigator.clipboard.writeText(url)
              message.success('コピーしました')
            }}
          />
        </Tooltip>
      </Space.Compact>
    </Flex>
  )
})

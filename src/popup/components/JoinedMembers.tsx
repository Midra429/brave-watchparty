import type { StorageItems } from '@/types/storage'

import { useState } from 'react'
import { Flex, List, Button, Tag, Popconfirm, Typography } from 'antd'
import { InfoCircleOutlined, LogoutOutlined } from '@ant-design/icons'
import { useStorage } from '@/utils/storage'
import { getVodById } from '@/utils/vods'
import { Drawer } from '@/popup/components/Drawer'
import { UserItem } from './UserItem'

const { Text } = Typography

export const JoinedMembers: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [memberDetail, setMemberDetail] =
    useState<NonNullable<StorageItems['joined_members']>[number]>()

  const [mode] = useStorage('mode')
  const [server] = useStorage('misskey_server')
  const [user] = useStorage('misskey_user')
  const [members] = useStorage('joined_members')

  const isHost = mode === 'host'
  const isMidra =
    server &&
    ['submarin.online', 'team.matechan.com'].includes(server) &&
    user?.username === 'Midra'

  const memberDetailVodNames = memberDetail?.vod_ids?.flatMap(
    (id) => getVodById(id)?.name ?? []
  )

  return (
    <>
      <List
        itemLayout="horizontal"
        size="small"
        style={{
          maxHeight: 300,
          padding: '8px 12px',
          overflow: 'auto',
        }}
        dataSource={members}
        renderItem={(member) => (
          <List.Item style={{ padding: '0.5em 0.25em' }}>
            <Flex
              justify="space-between"
              align="center"
              gap="small"
              style={{ width: '100%', maxWidth: '100%' }}
            >
              <UserItem
                avatar={member.avatar}
                name={member.name}
                id={member.id}
              />

              {(isHost || isMidra) && (
                <Button
                  type="text"
                  shape="circle"
                  icon={<InfoCircleOutlined style={{ fontSize: 18 }} />}
                  onClick={() => {
                    setIsDrawerOpen(true)
                    setMemberDetail(member)
                  }}
                />
              )}
            </Flex>
          </List.Item>
        )}
      />

      <Drawer
        placement="left"
        width={300}
        title="ユーザー情報"
        icon={<InfoCircleOutlined />}
        open={isDrawerOpen}
        setOpen={setIsDrawerOpen}
      >
        {memberDetail && (
          <Flex vertical gap="middle" style={{ padding: 12 }}>
            <UserItem
              size="large"
              avatar={memberDetail.avatar}
              name={memberDetail.name}
              id={memberDetail.id}
            />

            <Flex wrap="wrap" gap={5}>
              {memberDetailVodNames?.map((name) => (
                <Tag
                  key={name}
                  style={{
                    margin: 0,
                    borderRadius: '99rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {name}
                </Tag>
              ))}
            </Flex>

            {memberDetail.environment && (
              <Flex justify="space-between">
                {Object.entries(memberDetail.environment).map(([key, val]) => (
                  <Text type="secondary" style={{ fontSize: 12 }} key={key}>
                    {key}: {<Text style={{ fontSize: 12 }}>{val}</Text>}
                  </Text>
                ))}
              </Flex>
            )}

            {/* <Popconfirm
              title="追放しますか？"
              description="このユーザーを部屋から退出させます。"
              okButtonProps={{ danger: true }}
              zIndex={1071}
              onConfirm={async () => {
                // setLoading(true)
                // setLoading(false)
              }}
            >
              <Button
                shape="round"
                danger
                icon={<LogoutOutlined />}
                style={{ marginTop: 'auto' }}
                // loading={loading}
              >
                追放
              </Button>
            </Popconfirm> */}
          </Flex>
        )}
      </Drawer>
    </>
  )
}

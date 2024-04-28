import { useState } from 'react'
import { Flex, Segmented } from 'antd'
import { UnorderedListOutlined, TeamOutlined } from '@ant-design/icons'
import { NowPlaying } from './components/NowPlaying'
import { JoinedMembers } from './components/JoinedMembers'

export const SidePane: React.FC = () => {
  const [selectedSeg, setSelectedSeg] = useState('nowplaying')

  return (
    <Flex
      vertical
      style={{
        width: 300,
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <Segmented
        block
        defaultValue={selectedSeg}
        options={[
          {
            icon: <UnorderedListOutlined />,
            label: '再生中',
            value: 'nowplaying',
          },
          {
            icon: <TeamOutlined />,
            label: 'メンバー',
            value: 'members',
          },
        ]}
        style={{ margin: '12px 12px 0' }}
        onChange={(val) => setSelectedSeg(val)}
      />

      {selectedSeg === 'nowplaying' && <NowPlaying />}
      {selectedSeg === 'members' && <JoinedMembers />}
    </Flex>
  )
}

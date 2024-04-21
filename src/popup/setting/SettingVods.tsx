import type { CheckboxOptionType } from 'antd'
import type { BwpVodId } from '@/utils/vods'

import { Flex, Checkbox, Typography } from 'antd'
import { useStorage } from '@/utils/storage'
import { BWP_VODS } from '@/utils/vods'

const { Text } = Typography

const options = BWP_VODS.map<CheckboxOptionType>((vod) => ({
  label: vod.name,
  value: vod.id,
  style: { width: '50%' },
}))

export const SettingVods: React.FC = () => {
  const [vodIds, setVodIds] = useStorage('vod_ids')

  return (
    <Flex vertical gap="small">
      <Text type="secondary">優先する動画配信サービスを選択</Text>

      <Checkbox.Group
        options={options}
        value={vodIds}
        style={{ gap: '0.25em 0' }}
        onChange={(val) => setVodIds(val as BwpVodId[])}
      />
    </Flex>
  )
}

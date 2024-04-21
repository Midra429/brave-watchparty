import type { GetProp, DrawerProps } from 'antd'

import { Drawer as AntdDrawer, Flex, Button } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

export const Drawer: React.FC<{
  placement: GetProp<DrawerProps, 'placement'>
  title: string
  icon: React.ReactNode
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  width?: string | number
  children?: React.ReactNode
}> = ({ placement, title, icon, open, setOpen, width, children }) => {
  return (
    <AntdDrawer
      placement={placement}
      width={width ?? '100%'}
      height="100%"
      styles={{
        header: {
          height: 46,
          minHeight: 46,
          maxHeight: 46,
          padding: '0 0 0 16px',
        },
        body: { padding: 0 },
      }}
      open={open}
      closable={false}
      destroyOnClose
      title={
        <Flex gap={12}>
          {icon}
          {title}
        </Flex>
      }
      extra={
        <Button
          shape="circle"
          icon={<CloseOutlined />}
          style={{ marginRight: 8 }}
          onClick={() => setOpen(false)}
        />
      }
      onClose={() => setOpen(false)}
    >
      {children}
    </AntdDrawer>
  )
}

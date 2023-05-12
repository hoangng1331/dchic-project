import React from 'react';
import {
  LogoutOutlined,
  UserOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { useNavigate } from 'react-router-dom';


type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('Thông tin tài khoản', 'customer-information', <UserOutlined />),
  getItem('Đơn hàng của bạn', 'customer-orders', <FileTextOutlined />),
  getItem('Đổi mật khẩu', 'customer-changePass', <LogoutOutlined />),

];

const CustomerMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ width: 255 }}>
      <Menu
       onClick={({ key }) => {
        navigate("/" + key.split("-").join("/"));
      }}
        defaultSelectedKeys={['1']}
        mode="inline"
        items={items}
      />
    </div>    
  );
};

export default CustomerMenu;
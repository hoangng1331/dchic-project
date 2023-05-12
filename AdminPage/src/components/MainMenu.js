import {
  DatabaseOutlined,
  ScheduleOutlined,
  LoadingOutlined,
  DeleteOutlined,
  SendOutlined,
  HomeOutlined,
  FileTextOutlined,
  AreaChartOutlined,
  SettingOutlined,
  UserOutlined,
  ShopOutlined,
  MenuFoldOutlined,
  SkinOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Menu, Button, message } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore";
import { axiosClient } from "../libraries/axiosClient";

const admin = [
  { label: "Trang chủ", key: "home", icon: <HomeOutlined /> },
  {
    label: "Quản trị dữ liệu",
    key: "management",
    icon: <DatabaseOutlined />,
    children: [
      {
        label: "Nhân viên",
        key: "management-workforce",
        icon: <UserOutlined />,
        children: [
          { label: "Quản lý tài khoản", key: "management-status" },
          { label: "Thông tin nhân viên", key: "management-employees" },
        ],
      },
      {
        label: "Quản lý sản phẩm",
        key: "product-management",
        icon: <SkinOutlined />,
        children: [
          { label: 'Danh mục', key: 'management-categories' },
          { label: "Sản phẩm", key: "management-products" },
          // { label: 'Màu sản phẩm', key: 'management-colors',},
          { label: "Sản phẩm yêu thích", key: "management-promotion" },
        ],
      },
    ],
  },
  {
    label: "Quản lý bán hàng",
    key: "sales",
    icon: <ShopOutlined />,
    children: [
      {
        label: "Đơn hàng",
        key: "sales-orders-menu",
        icon: <FileTextOutlined />,
        children: [
          {
            label: "Tạo đơn hàng",
            key: "sales-ordersform",
          },
          {
            label: "Tổng hợp đơn hàng",
            key: "sales-orders",
          },
          {
            label: "Đơn hàng ngoại thành",
            key: "sales-suburbanOrders",
          },
          {
            label: "Thông kê theo trạng thái",
            key: "sales-orders-status",
          },
        ],
      },
      {
        label: "Báo cáo",
        key: "sales-report",
        icon: <AreaChartOutlined />,
        children: [
          {
            label: "Doanh thu",
            key: "sales-revenue",
          },
        ],
      },
    ],
  },
  { label: "Cài đặt tài khoản", key: "account", icon: <SettingOutlined /> },
];
const manager = [
  { label: "Trang chủ", key: "home", icon: <HomeOutlined /> },
  {
    label: "Danh sách nhân viên",
    key: "management-status",
    icon: <UserOutlined />,
  },
  {
    label: "Quản lý sản phẩm",
    key: "product-management",
    icon: <SkinOutlined />,
    children: [
      { label: "Danh sách sản phẩm", key: "management-products" },
      { label: "Sản phẩm yêu thích", key: "management-promotion" },
    ],
  },
  {
    label: "Quản lý bán hàng",
    key: "sales",
    icon: <ShopOutlined />,
    children: [
      {
        label: "Đơn hàng",
        key: "sales-orders-menu",
        icon: <FileTextOutlined />,
        children: [
          {
            label: "Tạo đơn hàng",
            key: "sales-ordersform",
          },
          {
            label: "Tổng hợp đơn hàng",
            key: "sales-orders",
          },
          {
            label: "Đơn hàng ngoại thành",
            key: "sales-suburbanOrders",
          },
          {
            label: "Thông kê theo trạng thái",
            key: "sales-orders-status",
          },
        ],
      },
      {
        label: "Báo cáo",
        key: "sales-report",
        icon: <AreaChartOutlined />,
        children: [
          {
            label: "Doanh thu",
            key: "sales-revenue",
          },
        ],
      },
    ],
  },
  { label: "Cài đặt tài khoản", key: "account", icon: <SettingOutlined /> },
];
const csupport = [
  {
    label: "Quản lý sản phẩm",
    key: "product-management",
    icon: <SkinOutlined />,
    children: [
      { label: "Danh sách sản phẩm", key: "management-products" },
      { label: "Sản phẩm yêu thích", key: "management-promotion" },
    ],
  },
  {
    label: "Quản lý bán hàng",
    key: "sales",
    icon: <ShopOutlined />,
    children: [
      {
        label: "Đơn hàng",
        key: "sales-orders-menu",
        icon: <FileTextOutlined />,
        children: [
          {
            label: "Tạo đơn hàng",
            key: "sales-ordersform",
          },
          {
            label: "Tổng hợp đơn hàng",
            key: "sales-orders",
          },
          {
            label: "Đơn hàng ngoại thành",
            key: "sales-suburbanOrders",
          },
          {
            label: "Thông kê theo trạng thái",
            key: "sales-orders-status",
          },
        ],
      },
    ],
  },
  { label: "Cài đặt tài khoản", key: "account", icon: <SettingOutlined /> },
];
const shipper = [
  {
    label: "Đơn chờ lấy hàng",
    key: "sales-confirmedOrders",
    icon: <LoadingOutlined />,
  },
  {
    label: "Đơn đang giao",
    key: "sales-shippingOrders",
    icon: <SendOutlined />,
  },
  {
    label: "Đơn đã hoàn thành",
    key: "sales-completedOrders",
    icon: <ScheduleOutlined />,
  },
  {
    label: "Đơn bị hủy",
    key: "sales-canceledOrders",
    icon: <DeleteOutlined />,
  },
  { label: "Cài đặt tài khoản", key: "account", icon: <SettingOutlined /> },
];

export default function MainMenu() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { auth, logout } = useAuthStore((state) => state);
  const userRole = auth?.loggedInUser?.role;
  const [refresh, setRefresh] = React.useState(0);

  React.useEffect(
    (e) => {
      if (auth) {
        axiosClient
          .get("/login/" + auth?.loggedInUser?._id, e)
          .then((response) => {
            if (response.data.active === false) {
              logout();
              message.error("Tài khoản bị vô hiệu hóa!");
            }
          });
      }
    },
    [auth, logout, refresh]
  );
  React.useEffect(
    (e) => {
      if (auth) {
        const refreshToken = window.localStorage.getItem("refreshToken");
        if (refreshToken) {
          axiosClient.post("/auth/refresh-token", {
            refreshToken: refreshToken,
          });
        }
      }
    },
    [auth, logout, refresh]
  );

  function handleCollapse() {
    setCollapsed(!collapsed);
    setRefresh((f) => f + 1);
  }

  return (
    <div>
      <Button
        onClick={handleCollapse}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button>
      {userRole === "Admin" && (
        <Menu
          theme="dark"
          mode={collapsed ? "vertical" : "inline"}
          onClick={({ key }) => {
            navigate("/" + key.split("-").join("/"));
            setRefresh((f) => f + 1);
          }}
          items={admin}
        />
      )}
      {userRole === "Quản lý" && (
        <Menu
          theme="dark"
          mode={collapsed ? "vertical" : "inline"}
          onClick={({ key }) => {
            navigate("/" + key.split("-").join("/"));
            setRefresh((f) => f + 1);
          }}
          items={manager}
        />
      )}
      {userRole === "Chăm sóc khách hàng" && (
        <Menu
          theme="dark"
          mode={collapsed ? "vertical" : "inline"}
          onClick={({ key }) => {
            navigate("/" + key.split("-").join("/"));
            setRefresh((f) => f + 1);
          }}
          items={csupport}
        />
      )}
      {userRole === "Giao hàng" && (
        <Menu
          theme="dark"
          mode={collapsed ? "vertical" : "inline"}
          onClick={({ key }) => {
            navigate("/" + key.split("-").join("/"));
            setRefresh((f) => f + 1);
          }}
          items={shipper}
        />
      )}
    </div>
  );
}

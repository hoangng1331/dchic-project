import React from "react";
import { Table, Button, Badge } from "antd";
import { MinusCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import Icon from "@ant-design/icons";
import {useAuthStore} from '../../../hooks/useAuthStore'

import { axiosClient } from "../../../libraries/axiosClient";

export default function Status() {
  const [refresh, setRefresh] = React.useState(0);
  const [accountLogin, setAccountLogin] = React.useState([]);
  const { auth, logout } = useAuthStore((state) => state);
  const [key, setKey] = React.useState(Date.now())


  const columns = [
    {
      title: "STT",
      width: "1%",
      render: (text, record, index) => {
        return (
          <div style={{ textAlign: "right" }}>
            <span>{index + 1}</span>
          </div>
        );
      },
      key: "number",
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record, index) => {
        return <strong>{text ?? record?.name.fullName}</strong>;
      },
    },
    {
      title: "Công việc",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text, record, index) => {
        if (record.name === null) {
          return null;
        } else {
          return record.name.phoneNumber;
        }
      },
    },
    {
      title: "Tài khoản",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={status === "Online" ? "success" : "error"}
          text={status}
        />
      ),
    },
    {
      title: "Kích hoạt",
      width: "10%",
      dataIndex: "active",
      key: "active",
      align: "center",
      render: (active) => {
        if (active === false) {
          return (
            <Icon component={MinusCircleOutlined} style={{ color: "red" }} />
          );
        } else if (active === true) {
          return (
            <Icon component={CheckCircleOutlined} style={{ color: "green" }} />
          );
        } else {
          return null;
        }
      },
    },
    {
      title: "",
      key: "actions",
      render: (text, record, index) => {
        return (
          <>
            {auth?.loggedInUser?.role === "Admin" ? (
              <>
              {record.role==="Admin" ? (<></>):( <>
                {record.active === true ? (
                  <Button
                    onClick={() => {
                      setRefresh((f) => f + 1)
                      axiosClient
                        .patch("/login/" + record._id, {
                          active: false,
                        })
                        .then((response) => {
                          setRefresh((f) => f + 1);
                        });
                      setRefresh((f) => f + 1);
                    }}
                  >
                    Hủy kích hoạt
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setRefresh((f) => f + 1)
                      axiosClient
                        .patch("/login/" + record._id, {
                          active: true,
                        })
                        .then((response) => {
                          setRefresh((f) => f + 1);
                        });
                      setRefresh((f) => f + 1);
                    }}
                  >
                    Kích hoạt
                  </Button>
                )}{" "}
              </>
            )}</>
             ) : (
              <></>
            )}
          </>
        );
      },
    },
  ];


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

  React.useEffect(() => {
    axiosClient.get("/login").then((response) => {
      setAccountLogin(response.data);
      setKey(Date.now())
    });
  }, [refresh, key]);

  return <Table rowKey="_id" dataSource={accountLogin} columns={columns} />;
}

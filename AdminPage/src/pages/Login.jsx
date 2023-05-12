import React from "react";
import { Card, Form, Input, Button, Divider } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuthStore } from "../hooks/useAuthStore";
import "./Login.css";

export default function Login() {
  const validateUsername = (rule, value, callback) => {
    const regex = /^[A-Za-z0-9_\.@]+$/;
    if (!value || value.trim() === '' || regex.test(value)) {
      callback(); 
    } else {
      callback('Tên đăng nhập không hợp lệ');
    }
  };
  const { login } = useAuthStore((state) => state);
  const onFinish = (values, e) => {
    const { username, password } = values;
    login({ username, password });
    loginForm.resetFields(["password"])
  };
const [loginForm] = Form.useForm();
  return (
    <div className="card-wrapper"> 
      <Card className="login-card">
      <img src={"/dchic-logo-share-facebook.png"} alt="logo" className="logo" />
        <h3 className="login-title">Đăng nhập</h3>
        <Divider />
        <Form
        form={loginForm}
          name="login-form"
          className="login-form"
          initialValues={{ username: "", password: ""}}
          onFinish={onFinish}
          autoComplete="on"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Tên đăng nhập được để trống" },
              { validator: validateUsername },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Nhập tên đăng nhập"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Mật khẩu không được để trống" },
              {
                min: 1,
                max: 30,
                message: "Độ dài mật khẩu phải nằm trong khoảng 1 đến 30 ký tự",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

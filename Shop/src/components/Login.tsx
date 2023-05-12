import React from "react";
import { Link } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import { useAuthStore } from "../hooks/useAuthStore";
import { Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
function Login() {
  const { login } = useAuthStore((state: any) => state);
  const onSubmit = (values: any) => {
    const { username, password } = values;
    console.log({ username, password });
    login({ username, password });
    loginForm.resetFields(["password"]);
  };
  const [loginForm] = Form.useForm();
  return (
    <>
      <section className="vh-100">
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col col-xl-10">
              <div className="card">
                <div className="row g-0">
                  <div className="col-md-6 col-lg-5 d-none d-md-block">
                    <img
                      src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img1.webp"
                      alt="login form"
                      className="img-fluid"
                    />
                  </div>
                  <div className="col-md-6 col-lg-7 d-flex align-items-center">
                    <div className="card-body p-4 p-lg-5 text-black">
                      <Form
                        form={loginForm}
                        name="login-form"
                        className="login-form"
                        initialValues={{ username: "", password: "" }}
                        onFinish={onSubmit}
                        autoComplete="on"
                      >
                        <div className="d-flex align-items-center mb-3 pb-1">
                          <i className="fas fa-cubes fa-2x me-3"></i>
                          <span className="h1 fw-bold mb-0">
                            Welcome to D.CHIC
                          </span>
                        </div>

                        <h6 className="fw-normal mb-3 pb-3">
                          Đăng nhập vào tài khoản của bạn
                        </h6>

                        <Form.Item
                          className="form-outline mb-4"
                          name="username"
                          rules={[
                            {
                              required: true,
                              message: "Tên đăng nhập được để trống",
                            },
                          ]}
                        >
                          <Input
                            prefix={
                              <UserOutlined className="site-form-item-icon" />
                            }
                            placeholder="Nhập tên đăng nhập"
                          />
                        </Form.Item>

                        <Form.Item
                          name="password"
                          rules={[
                            {
                              required: true,
                              message: "Mật khẩu không được để trống",
                            },
                            {
                              min: 1,
                              max: 30,
                              message:
                                "Độ dài mật khẩu phải nằm trong khoảng 1 đến 30 ký tự",
                            },
                          ]}
                        >
                          <Input.Password
                            prefix={
                              <LockOutlined className="site-form-item-icon" />
                            }
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
                        <p className="mb-5 pb-lg-2">
                          Bạn chưa có tài khoản?
                          <Link
                            to="/register"
                            style={{ color: "#6c757d", padding: "5px" }}
                          >
                            Đăng kí ngay tại đây
                          </Link>
                        </p>
                      </Form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Login;

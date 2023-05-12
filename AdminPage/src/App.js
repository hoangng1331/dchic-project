import { Layout, message } from "antd";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import numeral from "numeral";
import "numeral/locales/vi";
import React from "react";
import { Navigate } from "react-router-dom";
import "./App.css";
import Employees from "./pages/Management/Employees";
import Products from "./pages/Management/Products";
import Products1 from "./pages/Products";
import Home from "./pages/Home";
import MainMenu from "./components/MainMenu";
import SearchOrdersByStatus from "./pages/Sales/Orders/SearchOrdersByStatus";
import Login from "./pages/Login";
import Orders from "./pages/Sales/Orders/Orders";
import Categories from "./pages/Categories";
import Discount from "./pages/Management/Products/Discount";
import ColorForm from "./pages/Colors";
import { useAuthStore } from "./hooks/useAuthStore";
import { axiosClient } from "./libraries/axiosClient";
import OrderForm from "./pages/OrderForm";
import Account from "./pages/Management/Employees/Account";
import ConfirmedOrders from "./pages/Sales/Ship/Confirmed";
import ShippingOrders from "./pages/Sales/Ship/Shipping";
import CompletedOrders from "./pages/Sales/Ship/Completed";
import CanceledOrders from "./pages/Sales/Ship/Canceled";
import SuburbanOrders from "./pages/Sales/Ship/Suburban";
import Promotion from "./pages/Management/Products/Promotion";
import Status from "./pages/Management/Employees/Status";

numeral.locale("vi");

const { Header, Footer, Sider, Content } = Layout;

function App() {
  const { auth, logout } = useAuthStore((state) => state);
  const userRole = auth?.loggedInUser?.role;

  const [name, setName] = React.useState("");
  const [key, setKey] = React.useState(Date.now());
  React.useEffect(
    (e) => {
      if (auth) {
        axiosClient.get("/auth/authentication", e).catch((err) => {
          message.warning(
            "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!"
          );
          logout();
        });
        axiosClient
          .get("/login/" + auth?.loggedInUser?._id, e)
          .then((response) => {
            setName(
              response.data.fullName
                ? response.data.fullName
                : response.data.name.fullName
            );
            if (response.data.active === false) {
              logout();
              message.error(
                "Tài khoản bị vô hiệu hóa, bạn bị cưỡng chế đăng xuất!"
              );
            }
            setKey(Date.now());
          });
      }
    },
    [auth, logout, key]
  );
  React.useEffect(
    (e) => {
      if (auth) {
        const refreshToken = window.localStorage.getItem("refreshToken");
        if (refreshToken) {
          axiosClient
            .post("/auth/refresh-token", {
              refreshToken: refreshToken,
            })
            .catch((err) => {
              axiosClient.get("/auth/authentication", e).catch((err) => {
                message.warning(
                  "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!"
                );
                logout();
              });
            });
        }
      }
    },
    [auth, logout]
  );

  return (
    <div style={{}}>
      <BrowserRouter>
        {!auth && (
          <Content style={{ padding: 24 }}>
            <Routes>
              <Route
                exact
                path="/"
                element={<Navigate to="/login" replace />}
              />

              <Route path="/login" element={<Login />} />
              {/* NO MATCH ROUTE */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Content>
        )}

        {auth && userRole === "Admin" && (
          <Layout>
            <Sider theme="dark" style={{ minHeight: "100vh" }}>
              <MainMenu />
            </Sider>
            <Layout>
              <Header style={{ backgroundColor: "blue" }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  {" "}
                  <div style={{ display: "flex", color: "white" }}>
                    <strong>D.CHIC Online - {auth?.loggedInUser?.role}</strong>
                  </div>
                  <div style={{ display: "flex", color: "white" }}>
                    <strong>{name}</strong>
                    <span style={{ marginInline: 8 }}>|</span>
                    <strong
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        logout();
                      }}
                    >
                      Đăng xuất
                    </strong>
                  </div>
                </div>
              </Header>
              <Content style={{ padding: 24 }}>
                <Routes>
                  <Route
                    exact
                    path="/"
                    element={<Navigate to="/login" replace />}
                  />
                  <Route
                    path="/login"
                    element={<Navigate to="/home" replace />}
                  />
                  <Route path="/home" element={<Home />} />
                  <Route
                    path="/management/categories"
                    element={<Categories />}
                  />
                  <Route
                    path="/categories/:id/products"
                    element={<Products1 />}
                  />
                  <Route path="/management/employees" element={<Employees />} />
                  <Route path="/management/status" element={<Status />} />
                  <Route path="/management/products" element={<Products />} />
                  <Route path="/management/discount" element={<Discount />} />
                  <Route path="/management/colors" element={<ColorForm />} />
                  <Route path="/management/promotion" element={<Promotion />} />
                  {/* SALES */}

                  <Route path="/sales/orders" element={<Orders />} />
                  {/* <Route path='/sales/revenue' element={<Report />} /> */}
                  <Route
                    path="/sales/suburbanOrders"
                    element={<SuburbanOrders />}
                  />
                  <Route path="/sales/ordersform" element={<OrderForm />} />
                  <Route
                    path="/sales/orders/status"
                    element={<SearchOrdersByStatus />}
                  />
                  <Route path="/account" element={<Account />} />
                  {/* NO MATCH ROUTE */}
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </Content>
              <Footer>Footer</Footer>
            </Layout>
          </Layout>
        )}
        {auth && userRole === "Quản lý" && (
          <Layout>
            <Sider theme="dark" style={{ minHeight: "100vh" }}>
              <MainMenu />
            </Sider>
            <Layout>
              <Header style={{ backgroundColor: "blue" }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h1 style={{ color: "white" }}>
                    {" "}
                    D.CHIC Online - {auth?.loggedInUser?.role}
                  </h1>
                  <div style={{ display: "flex", color: "white" }}>
                    <strong>{name}</strong>
                    <span style={{ marginInline: 8 }}>|</span>
                    <strong
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        logout();
                      }}
                    >
                      Đăng xuất
                    </strong>
                  </div>
                </div>
              </Header>
              <Content style={{ padding: 24 }}>
                <Routes>
                  <Route
                    path="/login"
                    element={<Navigate to="/home" replace />}
                  />
                  <Route path="/home" element={<Home />} />
                  <Route path="/management/discount" element={<Discount />} />
                  <Route path="/management/promotion" element={<Promotion />} />
                  <Route path="/management/status" element={<Status />} />
                  <Route path="/management/products" element={<Products />} />
                  {/* SALES */}

                  {/* <Route path='/sales/revenue' element={<Report />} /> */}
                  <Route
                    path="/sales/suburbanOrders"
                    element={<SuburbanOrders />}
                  />
                  <Route path="/sales/orders" element={<Orders />} />
                  <Route path="/sales/ordersform" element={<OrderForm />} />
                  <Route
                    path="/sales/orders/status"
                    element={<SearchOrdersByStatus />}
                  />

                  <Route path="/account" element={<Account />} />
                  {/* NO MATCH ROUTE */}
                  <Route
                    path="*"
                    element={
                      <main style={{ padding: "1rem" }}>
                        <p>404 Page not found</p>
                      </main>
                    }
                  />
                </Routes>
              </Content>
              <Footer>Footer</Footer>
            </Layout>
          </Layout>
        )}
        {auth && userRole === "Chăm sóc khách hàng" && (
          <Layout>
            <Sider theme="dark" style={{ minHeight: "100vh" }}>
              <MainMenu />
            </Sider>
            <Layout>
              <Header style={{ backgroundColor: "blue" }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h1 style={{ color: "white" }}>
                    {" "}
                    D.CHIC Online - {auth?.loggedInUser?.role}
                  </h1>
                  <div style={{ display: "flex", color: "white" }}>
                    <strong>{name}</strong>
                    <span style={{ marginInline: 8 }}>|</span>
                    <strong
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        logout();
                      }}
                    >
                      Đăng xuất
                    </strong>
                  </div>
                </div>
              </Header>
              <Content style={{ padding: 24 }}>
                <Routes>
                  {/* SALES */}
                  <Route
                    path="/login"
                    element={<Navigate to="/sales/orders" replace />}
                  />
                  <Route path="/management/discount" element={<Discount />} />
                  <Route path="/management/promotion" element={<Promotion />} />
                  <Route path="/sales/orders" element={<Orders />} />
                  <Route path="/sales/ordersform" element={<OrderForm />} />
                  <Route
                    path="/sales/orders/status"
                    element={<SearchOrdersByStatus />}
                  />

                  <Route path="/account" element={<Account />} />
                  {/* NO MATCH ROUTE */}
                  <Route
                    path="*"
                    element={
                      <main style={{ padding: "1rem" }}>
                        <p>404 Page not found</p>
                      </main>
                    }
                  />
                </Routes>
              </Content>
              <Footer>Footer</Footer>
            </Layout>
          </Layout>
        )}
        {auth && userRole === "Giao hàng" && (
          <Layout>
            <Sider theme="dark" style={{ minHeight: "100vh" }}>
              <MainMenu />
            </Sider>
            <Layout>
              <Header style={{ backgroundColor: "blue" }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h1 style={{ color: "white" }}>
                    {" "}
                    D.CHIC Online - {auth?.loggedInUser?.role}
                  </h1>
                  <div style={{ display: "flex", color: "white" }}>
                    <strong>{name}</strong>
                    <span style={{ marginInline: 8 }}>|</span>
                    <strong
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        logout();
                      }}
                    >
                      Đăng xuất
                    </strong>
                  </div>
                </div>
              </Header>
              <Content style={{ padding: 24 }}>
                <Routes>
                  <Route
                    path="/login"
                    element={<Navigate to="/sales/confirmedOrders" replace />}
                  />
                  <Route path="/account" element={<Account />} />
                  <Route
                    path="/sales/confirmedOrders"
                    element={<ConfirmedOrders />}
                  />
                  <Route
                    path="/sales/shippingOrders"
                    element={<ShippingOrders />}
                  />
                  <Route
                    path="/sales/completedOrders"
                    element={<CompletedOrders />}
                  />
                  <Route
                    path="/sales/canceledOrders"
                    element={<CanceledOrders />}
                  />

                  {/* NO MATCH ROUTE */}
                  <Route
                    path="*"
                    element={
                      <main style={{ padding: "1rem" }}>
                        <p>404 Page not found</p>
                      </main>
                    }
                  />
                </Routes>
              </Content>
              <Footer>Footer</Footer>
            </Layout>
          </Layout>
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;

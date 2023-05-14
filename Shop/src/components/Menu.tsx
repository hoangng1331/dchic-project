import React, { useEffect, useState } from "react";
import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Products from "./Products";
import Login from "./Login";
import About from "./About";
import Register from "./Register";
import System from "./System";
import { CartProvider } from "./contexts/Cart";
import DetailProduct from "./DetailProduct";
import dchic from "../image/dchic.png";
import OrderProduct from "./OrderProduct";
import "numeral/locales/vi";
import { useDispatch, useSelector } from "react-redux";
import { getCart } from "../redux/cartSlice";
import CartSlice from "./features/CartSlice";
import CartModal from "./features/CartModal";
import CartFull from "./features/CartFull";
import { Button } from "react-bootstrap";
import { Drawer, Layout, theme } from "antd";
import { useAuthStore } from "../hooks/useAuthStore";
import { Navigate } from "react-router-dom";
import CustomerMenu from "./CustomerMenu";
import Information from "../Customer/Information";
import SearchOrdersByStatus from "../Customer/Orders";
import ChangePass from "../Customer/ChangePassword";
const getFromLocalStorage = (key: string) => {
  if (!key || typeof window === "undefined") {
    return "";
  }
  return localStorage.getItem(key);
};
const { Sider, Content } = Layout;
function Menu() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { auth, logout } = useAuthStore((state: any) => state);
  const firstName = auth?.loggedInUser.firstName;
  const [isHomePage, setIsHomePage] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const handleCartClick = () => {
    setShowCartModal(true);
  };
  useEffect(() => {
    setIsHomePage(
      window.location.pathname.includes("/home")
    );
  }, [refresh]);
  const dispatch = useDispatch();
  const cart = useSelector((state: any) => state.cart);

  useEffect(() => {
    let cart = JSON.parse(getFromLocalStorage("cart") as string);
    if (cart as any) {
      dispatch(getCart(cart));
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div
        className="project"
        style={{ position: isHomePage ? "fixed" : "static" }}
      >
        <div className="menu">
          <ul>
            <li>
              <Link
                style={{ color: isHomePage ? "white" : "black" }}
                className="active"
                to="/about"
                onClick={() => setRefresh((f) => f + 1)}
              >
                VỀ CHÚNG TÔI
              </Link>
            </li>
            <li>
              <Link
                className="active"
                style={{ color: isHomePage ? "white" : "black" }}
                to="/products"
                onClick={() => setRefresh((f) => f + 1)}
              >
                SẢN PHẨM
              </Link>
            </li>
            <li>
              <h1 className="logo">
                <Link
                  style={{ color: isHomePage ? "white" : "black" }}
                  to={"/home"}
                  onClick={() => setRefresh((f) => f + 1)}
                >
                  <img
                    src={dchic}
                    alt="logo"
                    style={{
                      width: "100%",
                      height: "25px",
                      marginTop: "13px",
                      filter: isHomePage ? "invert(0%)" : "invert(100%)",
                    }}
                  />
                </Link>{" "}
              </h1>
            </li>
            <li>
              <Link
                style={{ color: isHomePage ? "white" : "black" }}
                className="active"
                to="#"
                onClick={handleCartClick}
              >
                GIỎ HÀNG (
                {cart.reduce(
                  (total: any, item: any) => total + item.quantity,
                  0
                )}
                )
              </Link>
              <Drawer
                style={{
                  background: "#000000a4",
                  color: "white",
                }}
                title={<span style={{ color: "white" }}>Giỏ hàng</span>}
                placement="right"
                onClose={() => setShowCartModal(false)}
                open={showCartModal}
                width={650}
                extra={
                  <Button
                    href="/cartFull"
                    style={{
                      background: "brown",
                      color: "white",
                    }}
                    onClick={() => setShowCartModal(false)}
                  >
                    Xem giỏ hàng
                  </Button>
                }
              >
                <CartModal />
              </Drawer>
            </li>
            <li>
              {!auth ? (
                <Link
                  style={{ color: isHomePage ? "white" : "black" }}
                  className="active"
                  to="/login"
                  onClick={() => setRefresh((f) => f + 1)}
                >
                  ĐĂNG NHẬP
                </Link>
              ) : (
                <div
                  style={{
                    display: "flex",
                    color: isHomePage ? "white" : "black",
                  }}
                >
                  <Link
                    style={{ color: isHomePage ? "white" : "black" }}
                    className="active"
                    to="/customer/information"
                    onClick={() => setRefresh((f) => f + 1)}
                  >
                    {firstName}
                  </Link>
                  <span style={{ marginInline: 8 }}>|</span>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      logout();
                    }}
                  >
                    Đăng xuất
                  </span>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
      <CartProvider>
        <Layout>
          {auth && window.location.pathname.includes("/customer/") && (
            <Sider style={{ background: colorBgContainer }} width={255}>
              <CustomerMenu />
            </Sider>
          )}
          <Content>
            <Routes>
              {!auth && (
                <>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/orderproduct"
                    element={<Navigate to="/login" replace />}
                  />
                  <Route
                    path="/customer/information"
                    element={<Navigate to="/login" replace />}
                  />
                  <Route
                    path="/customer/changePass"
                    element={<Navigate to="/login" replace />}
                  />
                  <Route
                    path="/customer/orders"
                    element={<Navigate to="/login" replace />}
                  />
                </>
              )}
              {auth && (
                <>
                  <Route path="/orderproduct" element={<OrderProduct />} />
                  <Route
                    path="/login"
                    element={<Navigate to="/home" replace/>}
                  />
                  <Route
                    path="/register"
                    element={<Navigate to="/home" replace/>}
                  />

                  <Route
                    path="/customer/information"
                    element={<Information />}
                  />
                  <Route path="/customer/changePass" element={<ChangePass />} />
                  <Route
                    path="/customer/orders"
                    element={<SearchOrdersByStatus />}
                  />
                </>
              )}
              <Route path="/" element={<Navigate to="/home" replace/>} />
              <Route path="/home" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:itemId" element={<DetailProduct />} />

              <Route path="/about" element={<About />} />
              <Route path="/system" element={<System />} />
              <Route path="/cartSlice" element={<CartSlice />} />
              <Route path="/cartFull" element={<CartFull />} />


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
        </Layout>
      </CartProvider>
    </BrowserRouter>
  );
}

export default Menu;

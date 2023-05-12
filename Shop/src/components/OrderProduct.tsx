import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getCart } from "../redux/cartSlice";
import numeral from "numeral";
import { Form, message } from "antd";
import { useAuthStore } from "../hooks/useAuthStore";
import {Button} from "antd"
import { Formik } from "formik";
const getFromLocalStorage = (key: string) => {
  if (!key || typeof window === "undefined") {
    return "";
  }
  return localStorage.getItem(key);
};
interface Variant {
  colorId: any;
  price: number;
  discount: number;
  sizes: Size[];
}

interface Size {
  sizeId: any;
  quantity: number;
}

interface Color {
  name: any;
  hexcode: any[];
}

interface Product {
  _id: any;
  name: string;
  imageUrl: string[];
  variants: Variant[];
  color: Color[];
  size: any[];
  stockByColor: Record<string, number>;
}
interface Customer {
  fullName: string;
  phoneNumber: string;
  email: string
}
function OrderProduct() {
  const dateRef = useRef<HTMLInputElement>(null);
  const { auth } = useAuthStore((state: any) => state);
  const dispatch = useDispatch();
  const cart = useSelector((state: any) => state.cart);
  const [inOut, setInOut] = useState<number | null>();
  const [refresh, setRefresh] = useState<number>(0);
  const [products, setProducts] = React.useState<{ [key: string]: Product }>(
    {}
  );
  const [customer, setCustomer] = React.useState<Customer >(
    {
      fullName: "",
      phoneNumber: "",
      email: "",
    }
  );
  useEffect(()=>{
    axios.get(`http://localhost:5000/customers/${auth.loggedInUser._id}`).then((res)=>{
      setCustomer(res.data)
    })
  },[auth])

  useEffect(() => {
    let cart = JSON.parse(getFromLocalStorage("cart") as string);
    if (cart as any) {
      dispatch(getCart(cart));
    }
  }, [dispatch, refresh]);
  const fetchProducts = async (cart: any) => {
    const productIds = cart.map((item: any) => item.productId);
    try {
      const res = await axios.get<Product[]>("http://localhost:5000/products", {
        params: {
          _id: productIds.join(","),
        },
      });
      const newProducts = res.data.reduce((acc, product) => {
        acc[product._id] = product;
        return acc;
      }, {} as { [key: string]: Product });
      setProducts(newProducts);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu sản phẩm:", err);
    }
  };
  useEffect(() => {
    fetchProducts(cart);
  }, [cart]);
  const subtotal = cart.reduce(
    (acc: number, item: any) => acc + item.quantity * item.price,
    0
  );
  const discount = cart.reduce(
    (acc: number, item: any) => acc + item.quantity * item.price*item.discount/100,
    0
  );
  const onSubmit = async (event: any) => {
    event.preventDefault();
    console.log(auth)
    const customerName = event.target.elements.customerName.value;
    const phoneNumber = event.target.elements.phoneNumber.value;
    const email = event.target.elements.email.value;
    const shippingFee = parseInt(event.target.elements.shippingFee.value);
    const deliveryArea = event.target.elements.deliveryArea?.value??"Ngoại thành";
    const address = event.target.elements.address.value;
    const note = event.target.elements.note?.value;
    const paymentType = event.target.elements.paymentType.value;
    const data ={
      receiverName: customerName,
      phoneNumber: phoneNumber,
      email: email,
      shippingFee: shippingFee,
      deliveryArea: deliveryArea,
      address: address,
      note: note,
      paymentType: paymentType,
      orderDetails: cart,
      customerId: auth.loggedInUser._id
    }
    let more = null;
      
        for (const item of cart) {
          const maxQuantity = await axios.get(`http://localhost:5000/products/${item.productId}/variants/${item.colorId}/sizes/${item.sizeId}/order`);
          if (maxQuantity.data.quantity < item.quantity) {
            more = item;
            break;
          }
        }
      
        if (more) {
          message.error("Số lượng trong giỏ hàng vượt quá số lượng trong kho hàng. Vui lòng chọn lại!");
        } else {
          axios.post("http://localhost:5000/orders", data).then((res)=>{
            cart.forEach(async (orderItem: any) => {
              const remainQuantity = await axios.get(
                `http://localhost:5000/products/${orderItem.productId}/variants/${orderItem.colorId}/sizes/${orderItem.sizeId}/order`
              );
              axios.patch(
                `http://localhost:5000/products/${orderItem.productId}/variants/${orderItem.colorId}/sizes/${orderItem.sizeId}/order`,
                {
                  quantity: remainQuantity.data.quantity - orderItem.quantity,
                }
              ).then((res)=>{
                window.localStorage.removeItem("cart")
                window.location.replace("/customer/orders")
            setRefresh((f)=> f + 1)
              }).catch((err)=>{
                message.error("Vui lòng kiểm tra lại thông tin")
              });
              setRefresh((f) => f + 1);
            });
            
          }).catch((err)=>{
            message.error("Vui lòng kiểm tra lại thông tin")
          })         
        }
  };
  return (
    <div>
      <div className="row">
        <div className="col-5">
          <div className="wrapper rounded bg-white">
            <div className="h3">Thông tin nhận hàng</div>
            <div className="form">

              <form onSubmit={onSubmit} >
                <div className="row">
                  <div className="col-md-6 mt-md-0 mt-3">
                    <label>Người nhận</label>
                    <input
                      type="text"
                      className="form-control"
                      name="customerName"
                      defaultValue={customer.fullName}
                      required
                    />
                  </div>
                  <div className="col-md-6 mt-md-0 mt-3">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phoneNumber"
                      defaultValue={customer.phoneNumber}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mt-md-0 mt-3">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      defaultValue={customer.email}
                      required
                    />
                  </div>
                  <div className="col-md-6 mt-md-0 mt-3">
                    <label>Khu vực nhận hàng</label>
                    <select
                      id="sub"
                      name="shippingFee"
                      required
                      onChange={(v: any) => setInOut(parseInt(v.target.value))}
                    >
                      <option value="" selected hidden>
                        Chọn khu vực
                      </option>
                      <option value={0}>Nội thành Đà Nẵng</option>
                      <option value={40000}>Tỉnh/Thành phố khác</option>
                    </select>
                  </div>
                </div>
                {inOut === 0 && (
                  <div>
                    <label>Khu vực giao hàng</label>
                    <select id="sub" name="deliveryArea" required>
                      <option value="" selected hidden>
                        Chọn khu vực giao hàng
                      </option>
                      <option value="Hòa Vang">Hòa Vang</option>
                      <option value="Hải Châu">Hải Châu</option>
                      <option value="Thanh Khê">Thanh Khê</option>
                      <option value="Liên Chiểu">Liên Chiểu</option>
                      <option value="Ngũ Hành Sơn">Ngũ Hành Sơn</option>
                      <option value="Cẩm Lệ">Cẩm Lệ</option>
                      <option value="Sơn Trà">Sơn Trà</option>
                    </select>
                  </div>
                )}
                <div className="row">
                  <div>
                    <label>Địa chỉ nhận hàng</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ paddingTop: "10px" }}>
                      Ghi chú đính kèm
                    </label>
                    <input type="text" className="form-control" name="note" />
                  </div>
                </div>
                <div className=" my-md-2 my-3">
                  <label>Hình thức thanh toán</label>
                  <select id="sub" name="paymentType" required>
                    <option value="" selected hidden>
                      Chọn hình thức thanh toán
                    </option>
                    <option value="Cash">Tiền mặt</option>
                    <option value="Bank Transfer">
                      Chuyển khoản ngân hàng
                    </option>
                    <option value="Credit Card">Thẻ tín dụng</option>
                  </select>
                </div>
                <div style={{ textAlign: "center" }}>
                  <Button
                    disabled={cart.length<1}
                    className="btn-dark btn-lg btn-block mt-3"
                    htmlType="submit"
                  >
                    Lưu thông tin
                  </Button>
                </div>
              </form>

            </div>
          </div>
        </div>
        <div className="col-7">
          <section
            className="h-100 h-custom"
            style={{ backgroundColor: "#eee", maxWidth: "870px" }}
          >
            <div className="container py-5 h-100">
              <div className="row d-flex justify-content-center align-items-center h-100">
                <div className="col">
                  <div className="card">
                    <div className="card-body p-4">
                      <div className="row">
                        <div className="col-lg-7">
                          <h5 className="mb-3">
                            <Link className="text-body" to="/products">
                              Bạn muốn mua thêm ?
                            </Link>
                          </h5>
                          <hr />

                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                              <p className="mb-1">
                                Bạn đã chọn những sản phẩm bên dưới :
                              </p>
                            </div>
                          </div>
                          <div style={ cart.length> 2 ?{ overflowY: "scroll", maxHeight: "400px" }: {}}>
                          {cart &&
                            cart.map((data: any) => {
                              const product = products[data.productId];
                              const variant = product?.variants.find(
                                (variant) => variant.colorId === data.colorId
                              );
                              const color = product?.color.find(
                                (color: any) => color._id === variant?.colorId
                              );
                              const variantIndex = product?.variants.findIndex(
                                (variant) => variant.colorId === data.colorId
                              );
                              const size = product?.size[variantIndex]?.find(
                                (s: any) => s._id === data.sizeId
                              )?.size;
                              return (
                                <div className="card mb-3">
                                  <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                      <div className="d-flex flex-row align-items-center">
                                        <div>
                                          <img
                                            src={`http://localhost:5000/${data.imageUrl}`}
                                            className="img-fluid rounded-3"
                                            alt=""
                                            style={{ width: "65px" }}
                                          />
                                        </div>
                                        <div className="ms-2">
                                          <div style={{marginTop: 10, marginBottom:5}}>
                                            <span>
                                            <a
                                              className="active"
                                              href={`/products/${data.productId}`}
                                            >
                                              {data.name}
                                            </a>
                                          </span>
                                          </div>
                                          <div className="cart-product-name d-flex mb-2 small mb-0">
                                            <span
                                              className="circle"
                                              style={{
                                                backgroundColor:
                                                  color?.hexcode[0].hex,
                                                width: 17,
                                                height: 17,
                                                marginLeft: 0,
                                                marginRight: 4,
                                              }}
                                            />{" "}
                                            <span className="small">{color?.name}, {size}</span>
                                          </div>
                                          <div className="cart-product-name d-flex justify-content-between mb-2 small mb-0">
                                            <span className="small">Giảm giá:{" "}{numeral(data.discount).format("0,0.0")}%</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="d-flex flex-row align-items-center">
                                        <div style={{ width: "50px" }}>
                                          <h5 className="small fw-normal mb-0">{data.quantity}</h5>
                                        </div>
                                        <div style={{ width: "80px" }}>
                                          <h5 className="small mb-0">{numeral(data.price).format("0,0$")}</h5>
                                        </div>
                                        <a
                                          href="#!"
                                          style={{ color: "#cecece" }}
                                        >
                                          <i className="fas fa-trash-alt"></i>
                                        </a>
                                      </div>                                     
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                        </div>
                        <div className="col-lg-5">
                          <div
                            className="card text-black rounded-3"
                            style={{ backgroundColor: "#9ba878bc" }}
                          >
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-center mb-0">
                                <h5 className="mb-0">Giá trị đơn hàng</h5>
                                <img
                                  src="https://png.pngtree.com/png-vector/20191124/ourlarge/pngtree-shopping-cart-icon-simple-png-image_2028930.jpg"
                                  className="img-fluid rounded-3"
                                  style={{ width: "45px" }}
                                  alt="Avatar"
                                />
                              </div>
                              <a href="#!" type="submit" className="text-white">
                                <i className="fab fa-cc-mastercard fa-2x me-2"></i>
                              </a>
                              <a href="#!" type="submit" className="text-white">
                                <i className="fab fa-cc-visa fa-2x me-2"></i>
                              </a>
                              <a href="#!" type="submit" className="text-white">
                                <i className="fab fa-cc-amex fa-2x me-2"></i>
                              </a>
                              <a href="#!" type="submit" className="text-white">
                                <i className="fab fa-cc-paypal fa-2x"></i>
                              </a>

                              <hr className="my-4" />

                              <div className="d-flex justify-content-between small">
                                <h3 className="mb-2 small">Tổng tiền sản phẩm</h3>
                                <h3 className="mb-2 small">{numeral(subtotal).format("0,0$")}</h3>
                              </div>                    

                              <div className="d-flex justify-content-between small">
                                <h5 className="mb-2 small">Giảm giá</h5>
                                <h5 className="mb-2 small">{numeral(discount).format("0,0$")}</h5>
                              </div>
                              <div className="d-flex justify-content-between small">
                                <h5 className="mb-2 small">Phí vận chuyển</h5>
                                <h5 className="mb-2 small">{numeral(inOut).format("0,0$")}</h5>
                              </div>
                              <div className="d-flex justify-content-between mb-4 small">
                                <h5 className="mb-2 small">Số tiền thanh toán</h5>
                                <h5 className="mb-2 small">{numeral(subtotal-discount+(inOut??0)).format("0,0$")}</h5>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default OrderProduct;

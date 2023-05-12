import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CiCircleRemove } from "react-icons/ci";
import {
  getCart,
  removeCartItem,
  increment,
  decrement,
} from "../../redux/cartSlice";
import numeral from "numeral";
import axios from "axios";
import { message } from "antd";
import { API_URL } from "../../constants/URLS";

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
  imageUrl: string[];
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
  variants: Variant[];
  color: Color[];
  size: any[];
  stockByColor: Record<string, number>;
}

function CartSlice() {
  const dispatch = useDispatch();
  const cart = useSelector((state: any) => state.cart);
  const [products, setProducts] = React.useState<{ [key: string]: Product }>(
    {}
  );
  const [maxQuantity, setMaxQuantity] = React.useState<any>(0)
  const [refresh, setRefresh] = React.useState<any>(0)

  useEffect(() => {
    let cart = JSON.parse(getFromLocalStorage("cart") as string);
    if (cart as any) {
      dispatch(getCart(cart));
    }
  }, [dispatch]);

  const fetchProducts = async (cart: any) => {
    const productIds = cart.map((item: any) => item.productId);
    try {
      const res = await axios.get<Product[]>(API_URL+"/products", {
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
  const fetchMaxQuantities = async (cart:any) => {
    const requests = cart.map((data:any) => axios.get(`${API_URL}/products/${data.productId}/variants/${data.colorId}/sizes/${data.sizeId}/order`));
    const responses = await Promise.all(requests);
    setMaxQuantity(responses.map((res) => res.data.quantity)); //lấy ra thuộc tính quantity của đối tượng trả về
  };
  useEffect(() => {
    fetchProducts(cart);
    fetchMaxQuantities(cart)
  }, [cart, refresh]);
  const removeCart = (index: number) => {
    setRefresh((f: any)=> f + 1)
    dispatch(removeCartItem(index));
  };
  const incrQuantity = async (index:number) =>{
    setRefresh((f: any)=> f + 1)
    const requests = await axios.get(`${API_URL}/products/${cart[index].productId}/variants/${cart[index].colorId}/sizes/${cart[index].sizeId}/order`);
    if (cart[index].quantity+1>requests.data.quantity){
      message.error("Đã thêm toàn bộ số lượng trong kho vào đơn hàng của bạn!")
      setRefresh((f: any)=> f + 1)
    } else {
      setRefresh((f: any)=> f + 1)
      dispatch(increment(index))
    }
  }
  return (
    <div className="wp-cart-item-product">
      <div className="row cart-listing" style={{ overflowY: "scroll", maxHeight: "500px" }}>
        {cart &&
          cart.map((data: any, index: number) => {
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
              <div
                className="col-12 cart_item float-left mb-0"
                data-id={cart.productId}
                key={index}
              >
                <div className="row cart-item-wrap pb-0">
                  <div className=" col-md-3 col-3 img_wp">
                    <a href={`/products/${data.productId}`}>
                      <img
                        src={`${API_URL}/${data.imageUrl}`}
                        alt=""
                        style={{    
                        width: "80%",
                        marginLeft: 20,
                        position: "relative",
                        top: "50%",
                        transform: "translateY(-50%)",}}
                      />
                    </a>
                  </div>
                  <div
                    className="col-md-9 col-9  cart_item_detail"
                    style={{ marginLeft: -10, }}
                  >
                    <div className="text-uppercase d-flex justify-content-between cart-product-name mb-2">
                      <a className="active" href={`/products/${data.productId}`}>{data.name}</a>
                      <button
                        onClick={() => removeCart(index)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          color: "red",
                          cursor: "pointer",
                        }}
                      >
                        <CiCircleRemove />
                      </button>
                    </div>
                    <div className="cart-product-name d-flex justify-content-between mb-2">
                      <span className="d-flex">
                        Màu:
                        <span
                          className="circle"
                          style={{
                            backgroundColor: color?.hexcode[0].hex,
                            width: 17,
                            height: 17,
                            marginLeft: 4,
                            marginRight: 4,
                          }}
                        />{" "}
                        {color?.name}
                      </span>
                      <span>
                        Giá: <b>{numeral(data.price).format("0,0$")}</b>
                      </span>
                    </div>
                    <p className="cart-product-sku mb-2">
                      <span>Size: {size}</span>
                    </p>
                    <p className="cart-product-size mb-3">
                      <span>Số lượng: </span>
                      <span
                        className=""
                        style={{
                          display: "inline-block",
                          height: 30,
                          width: 80,
                          border: "1px solid #ddd",
                          textAlign: "center",
                        }}
                      >
                        <span
                          onClick={() => {dispatch(decrement(index))
                            setRefresh((f: any)=> f + 1)}}
                          className="btn_quantity btn_sub no_select"
                          style={{
                            display: "inline-block",
                            height: 38,
                            width: 15,
                            float: "left",
                            marginLeft: 5,
                            marginTop: 3,
                            cursor: "pointer",
                          }}
                        >
                          -
                        </span>
                        <span
                          className="product_quantity"
                          style={{
                            display: "inline-block",
                            height: 25,
                            width: 15,
                            alignContent: "center",
                            marginLeft: -5,
                            marginTop: 3,
                            border: "none!important",
                            boxShadow: "none!important",
                            outline: "none",
                            background: "none",
                          }}
                        >
                          {data.quantity}
                        </span>
                        <span
                          onClick={() => incrQuantity(index)}
                          className="btn_quantity btn_add no_select"
                          style={{
                            display: "inline-block",
                            height: 38,
                            width: 15,
                            float: "right",
                            marginRight: 5,
                            marginTop: 3,
                            cursor: "pointer",
                          }}
                        >
                          +
                        </span>
                        <input
                          type="hidden"
                          className="product_quantity"
                          name="[0][quantity]"
                          value={data.quantity}
                        />
                      </span>
                    </p>
                    <div className="cart-product-name d-flex justify-content-between mb-2">
                      <span>
                        Giảm giá: {numeral(data.discount).format("0,0.0")}%
                      </span>
                      <span>
                        Tổng:{" "}
                        <b>
                          {numeral(
                            (data.quantity *
                              data.price *
                              (100 - data.discount)) /
                              100
                          ).format("0,0$")}
                        </b>
                      </span>
                    </div>
                    {maxQuantity[index]<data.quantity && (
                      <div className="small" style={{ position: "relative", transform: "translateY(100%)" }}>
                        <h5 className="small" style={{color: "red"}}>Số lượng còn lại không đủ, kho chỉ còn {maxQuantity.quantity} sản phẩm!</h5>
                      </div>
                    )                      
                    }
                    
                  </div>
                </div>
                <hr />
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default CartSlice;

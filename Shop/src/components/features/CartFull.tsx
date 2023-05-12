import React from "react";
import CartSlice from "./CartSlice";
import { useSelector } from "react-redux";
import numeral from "numeral";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../hooks/useAuthStore";
import { API_URL } from "../../constants/URLS";
function CartFull() {
  const cart = useSelector((state: any) => state.cart);
  const { auth } = useAuthStore((state: any) => state);
  let navigate = useNavigate();
    const subtotal = cart.reduce(
        (acc: number, item: any) => acc + item.quantity * item.price,
        0
      );
      const discount = cart.reduce(
        (acc: number, item: any) => acc + item.quantity * item.price*item.discount/100,
        0
      );
      const handleClick = async () => {
        let more = null;
      
        for (const item of cart) {
          const maxQuantity = await axios.get(`${API_URL}/products/${item.productId}/variants/${item.colorId}/sizes/${item.sizeId}/order`);
          if (maxQuantity.data.quantity < item.quantity) {
            more = item;
            break;
          }
        }
      
        if (more) {
          message.error("Số lượng trong giỏ hàng vượt quá số lượng trong kho hàng. Vui lòng chọn lại!");
        } else {
          if (auth) {
            navigate("/orderproduct");
          } else { navigate("/login")}
        }
      };
      
      
  return (
    <div className="row">
      {cart.length>0 ? (
        <>
         <div className="col-md-9">
      <h6
        className="font-weight-bold mb-3"
        style={{
          fontSize: "inherit",
          maxWidth: 200,
          marginTop: 20,
          marginLeft: 20,
        }}
      >
        Giỏ hàng&nbsp;
        <span className="cart-items-total">
          ({cart.reduce((total: any, item: any) => total + item.quantity, 0)})
        </span>
      </h6>
      <hr />
        <CartSlice />
      </div>
      <div className="col-md-3">
        <div className="d-flex justify-content-center">
          <div className="checkout pt-0">
            <h6
              className="font-weight-bold mb-3"
              style={{
                fontSize: "inherit",
                maxWidth: 200,
                marginTop: 20,
                marginLeft: 20,
              }}
            >
              Giá trị đơn hàng
            </h6>
            <hr />
            <div>
            <div className="item-key d-flex justify-content-between form-group">
              <span>Tổng tiền</span>
              <span>{numeral(subtotal).format("0,0$")}</span>
            </div>
            <div className="item-key d-flex justify-content-between form-group">
              <span>Khuyến mại</span>
              <span>{numeral(discount).format("0,0$")}</span>
            </div>
            <div className=" item-key d-flex justify-content-between gap-5 form-group">
              <span>Phí vận chuyển</span>
              <span>
                (Chưa xác định)
              </span>
            </div>
            <div className="item-key d-flex justify-content-between gap-5 form-group">
              <span>Tổng giá trị thanh toán</span>
              <span>
                <strong>{numeral(subtotal-discount).format("0,0$")}</strong>
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <div className="w-100">
                <button
                  onClick={handleClick}
                  id="btn-order"
                  type="button"
                  className="btn btn-dark btn-checkout-general w-100 rounded-0 mt-4"
                >
                  Đặt hàng
                </button>
              </div>
            </div>
            </div>
          
          </div>
        </div>
      </div>
        </>
      ):(
        <span style={{margin: 20}}>Chưa có sản phẩm nào được chọn</span>
      )}     
    </div>
  );
}

export default CartFull;

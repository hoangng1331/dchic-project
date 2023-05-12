import { createSlice, current } from "@reduxjs/toolkit";
import { message } from "antd";
import produce from "immer";
const initialState: any = [];

export const cartSlice = createSlice({
  name: "cart",
  initialState: initialState,
  reducers: {
    addToCart: (state, action) => {
      const data = action.payload;
      const { colorId, sizeId, productId } = data;
    
      // Tìm sản phẩm có cùng colorId, sizeId và productId trong giỏ hàng
      const existingItem = state.find(
        (item:any) =>
          item.colorId === colorId && item.sizeId === sizeId && item.productId === productId
      );
    
      // Nếu sản phẩm đã tồn tại, tăng quantity lên và cập nhật state
      if (existingItem) {
        produce(state, (draftState:any) => {
          existingItem.quantity += data.quantity;
        });
      } else {
        // Nếu sản phẩm chưa tồn tại, thêm vào giỏ hàng
        state.push({ ...data });
      }
    
      // Lưu giỏ hàng mới vào localStorage
      window.localStorage.setItem("cart", JSON.stringify(state));
    },

    getCart: (state, action) => {
      return (state = action.payload);
    },
    removeCartItem: (state, action) => {
      let index = state.findIndex(
        (item: any, index: number) => index === action.payload
      );

      if (index !== -1) {
        state.splice(index, 1);
      }

      const cartStore = window.localStorage.getItem("cart");

      if (cartStore) {
        const data = JSON.parse(cartStore);

        data.splice(index, 1);

        localStorage.setItem("cart", JSON.stringify(data));
      }
    },
    increment: (state, action) => {
      state[action.payload].quantity += 1;
      window.localStorage.setItem("cart", JSON.stringify(current(state)));
    },
    decrement: (state, action) => {
      if (state[action.payload].quantity === 1) {
        message.error("Số lượng tối thiểu là 1");
      } else {
        state[action.payload].quantity -= 1;
        window.localStorage.setItem("cart", JSON.stringify(current(state)));
      }
    },
    resetCart: () => {
      window.localStorage.removeItem("cart");
      return initialState;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  addToCart,
  getCart,
  removeCartItem,
  increment,
  decrement,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import { axiosClient } from '../libraries/axiosClient';
import { message } from 'antd';

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        auth: null,
        login: ({ username, password }) => {
          // AXIOS: Call 1 api login => user
          axiosClient
            .post('/auth/login-jwt', {
              username,
              password,
            })
            .then((response) => {
              if (response.data.loggedInUser.active===true){
                axiosClient
            .patch('/login/'+ response.data.loggedInUser._id, {
              status: "Online"
            })
              return set({ auth: response.data }, false, { type: 'auth/login-success' });
              } else {
                message.error("Tài khoản bị vô hiệu hóa!")
              }
              
            })
            .catch((err) => {
              message.error("Đăng nhập không thành công, vui lòng kiểm tra lại thông tin!")
              return set({ auth: null }, false, { type: 'auth/login-error' });
            });
        },
        logout: () => {      

          // AXIOS: Call 1 api login => user
          axiosClient
            .patch('/login/'+ get().auth.loggedInUser._id, {
              status: "Offline"
            })
          return set({ auth: null }, false, { type: 'auth/logout-success' });
        },
      }),
      {
        name: 'onlineshop-storage', // unique name
        storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      },
    ),
  ),
);

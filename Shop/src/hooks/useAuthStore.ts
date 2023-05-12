import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { message } from 'antd';


export const useAuthStore = create(
  devtools(
    persist(
      (set: any, get: any) => ({
        auth: null,
        login: ({ username, password }: any) => {
          // AXIOS: Call 1 api login => user

          axios
            .post('http://localhost:5000/customerLogin/login-jwt', {
              username,
              password,
            })
            .then((response) => {
              return set({ auth: response.data }, false, { type: 'auth/login-success' });
            })
            .catch((err) => {
              message.error("Tài khoản hoặc mật khẩu không đúng!")
              return set({ auth: null }, false, { type: 'auth/login-error' });
            });
        },
        logout: () => {
          // AXIOS: Call 1 api login => user
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

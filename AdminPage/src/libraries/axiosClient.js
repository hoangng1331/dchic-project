import axios from "axios";
import { API_URL } from "../constants/URLS";
import { useAuthStore } from "../hooks/useAuthStore";

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST
axiosClient.interceptors.request.use(
  (config) => {
    const token = window.localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] =
        "Bearer " + window.localStorage.getItem("token");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE

axiosClient.interceptors.response.use(
  async (response) => {
    const { token, refreshToken } = response.data;
    // LOGIN
    if (token) {
      window.localStorage.setItem("token", token);
    }
    if (refreshToken) {
      window.localStorage.setItem("refreshToken", refreshToken);
    }

    return response;
  },
  async (error) => {
    if (error?.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalConfig = error.config;

    if (error?.response?.status === 401 && !originalConfig.sent) {
      originalConfig.sent = true;
      const { logout } = useAuthStore((state) => state);

      try {
        // Trường hợp không có token thì chuyển sang trang LOGIN
        const token = window.localStorage.getItem("token");
        if (!token) {
          logout()
          return Promise.reject(error);
        }

        const refreshToken = window.localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axiosClient.post("/auth/refresh-token", {
            refreshToken: refreshToken,
          });

          const { token } = response.data;
          if (token) {
            window.localStorage.setItem("token", token);

            originalConfig.headers = {
              ...originalConfig.headers,
              authorization: `Bearer ${token}`,
            };

            return axiosClient(originalConfig);
          } else {
            logout();
          }
        } else {
          return Promise.reject(error);
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }
);

export { axiosClient };

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9999/api", // 可根据环境变量设定
  timeout: 10000 // 请求超时时间
});

// 请求拦截器：可以在请求发送前做一些处理，比如设置 token
// axiosInstance.interceptors.request.use(
//   (config: AxiosRequestConfig) => {
//     const token = localStorage.getItem("token"); // 假设 token 存储在 localStorage 中
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// 响应拦截器：可以处理全局的错误，比如 token 过期
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // 这里可以统一处理错误响应，比如跳转到登录页面等
    if (error.response?.status === 401) {
      // 处理 401 未授权错误
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// 定义常用的请求方法
export const get = <T>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axiosInstance.get<T>(url, { params, ...config });
};

export const post = <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axiosInstance.post<T>(url, data, { ...config });
};

export const put = <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axiosInstance.put<T>(url, data, { ...config });
};

export const del = <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axiosInstance.delete<T>(url, { ...config });
};

export default axiosInstance;

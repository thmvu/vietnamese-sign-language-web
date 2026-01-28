import React, { createContext, useState, useEffect, useContext } from "react";
// Import API thật
import { login as loginAPI, logout as logoutAPI } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Kiểm tra LocalStorage khi F5 (Reload trang)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Error parsing user data", e);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // 2. Hàm Login
  const login = async (email, password) => {
    try {
      // Gọi API thật. Hàm loginAPI trong api.js đã xử lý lưu localStorage.
      const response = await loginAPI({ email, password });

      // response structure từ backend: { success: true, data: { user, ... } }
      // nhưng qua axios interceptor response.data -> data.
      // api.login tôi vừa sửa return response (nguyên bản axios response hoặc data đã unwrap).

      // Kiểm tra lại api.js:
      // api.interceptors.response.use((response) => response.data ...)
      // -> login nhận được { success: true, data: { user, accessToken... } }

      if (response.success) {
        // Token đã được lưu trong loginAPI
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, message: response.message || "Đăng nhập thất bại" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: error.message || "Lỗi kết nối server" };
    }
  };

  // 3. Hàm Logout
  const logout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.error("Logout error", error);
    }
    // Dù API fail cũng xoá local data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook custom để dùng cho gọn
export const useAuth = () => useContext(AuthContext);
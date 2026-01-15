import React, { createContext, useState, useEffect, useContext } from "react";
// Import từ file mockAuth bạn đã tạo ở bước trước
import { loginAPI, getUserProfileAPI } from "../services/mockAuth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Trạng thái tải trang lần đầu

  // 1. Kiểm tra LocalStorage khi F5 (Reload trang)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // 2. Hàm Login
  const login = async (email, password) => {
    try {
      const data = await loginAPI(email, password);
      // Lưu vào Storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      // Cập nhật State
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // 3. Hàm Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook custom để dùng cho gọn
export const useAuth = () => useContext(AuthContext);
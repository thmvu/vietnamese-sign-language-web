import React from 'react';
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // 1. Nếu đang kiểm tra đăng nhập (F5 trang) -> Hiện Loading quay quay
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Nếu không có user (Chưa đăng nhập) -> Đá về trang chủ
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 3. Nếu OK -> Cho phép hiển thị nội dung bên trong (Dashboard, Course...)
  return <Outlet />;
};

export default ProtectedRoute;
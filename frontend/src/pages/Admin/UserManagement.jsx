import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/auth/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.data || []);
        } catch (error) {
            console.error(error);
            alert('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/auth/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Đã xóa thành công');
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi xóa người dùng');
        }
    };

    const handleSave = async (userData) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editingUser) {
                await axios.put(`${API_URL}/auth/users/${editingUser.id}`, userData, config);
                alert('Cập nhật thành công');
            } else {
                await axios.post(`${API_URL}/auth/users`, userData, config);
                alert('Tạo người dùng thành công');
            }
            setShowForm(false);
            setEditingUser(null);
            fetchUsers();
            return true;
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
            return false;
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center py-12">Đang tải...</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">👥 Quản lý Người dùng</h1>
                    <p className="text-slate-500">Tổng số: {users.length} người dùng</p>
                </div>
                <button
                    onClick={() => { setEditingUser(null); setShowForm(true); }}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                >
                    + Thêm Người dùng
                </button>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Người dùng</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Vai trò</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Ngày tạo</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <span className="font-medium text-slate-900">{user.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.role === 'admin'
                                        ? 'bg-purple-100 text-purple-700 border-purple-200'
                                        : 'bg-blue-100 text-blue-700 border-blue-200'
                                        }`}>
                                        {user.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => { setEditingUser(user); setShowForm(true); }}
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                            title="Sửa"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {
                filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-slate-500 bg-white rounded-xl">
                        Không tìm thấy người dùng nào phù hợp.
                    </div>
                )
            }

            {
                showForm && (
                    <UserForm
                        user={editingUser}
                        onClose={() => setShowForm(false)}
                        onSave={handleSave}
                    />
                )
            }
        </div >
    );
};

const UserForm = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: user?.role || 'user'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await onSave(formData);
        if (!success) setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {user ? 'Sửa thông tin' : 'Thêm người dùng'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={!!user} // Không cho sửa email khi edit để tránh lỗi logic username
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            {user ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu *'}
                        </label>
                        <input
                            type="password"
                            required={!user}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder={user ? "********" : "Nhập mật khẩu..."}
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Vai trò</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="user">Học viên (User)</option>
                            <option value="admin">Quản trị viên (Admin)</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang xử lý...' : (user ? 'Cập nhật' : 'Tạo mới')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserManagement;

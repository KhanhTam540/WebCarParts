import React, { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';
import { formatDate } from '../../utils/formatters';
import {
  Users as UsersIcon,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Loader,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Shield,
  UserCog,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    address: '',
    password: '',
    role: 'user'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers();
      console.log('Fetched users:', res.data);
      setUsers(res.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.data?.length || 0,
        totalPages: Math.ceil((res.data.data?.length || 0) / prev.limit)
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminApi.toggleUserStatus(userId, { is_active: !currentStatus });
      toast.success(`Đã ${!currentStatus ? 'mở khóa' : 'khóa'} tài khoản thành công`);
      fetchUsers();
    } catch (error) {
      toast.error('Thao tác thất bại');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Kiểm tra password khi thêm mới
    if (!editingUser && !formData.password) {
      toast.error('Vui lòng nhập mật khẩu');
      return;
    }

    setLoading(true);
    try {
      if (editingUser) {
        // Update user - chỉ gửi các trường được phép cập nhật
        const updateData = {
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          role: formData.role,
          is_active: editingUser.is_active
        };
        await adminApi.updateUser(editingUser.id, updateData);
        toast.success('Cập nhật người dùng thành công');
      } else {
        // Create user - gửi tất cả
        await adminApi.createUser(formData);
        toast.success('Thêm người dùng thành công');
      }
      
      setShowModal(false);
      resetForm();
      fetchUsers(); // Tải lại danh sách
    } catch (error) {
      console.error('Error submitting user:', error);
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    
    try {
      await adminApi.deleteUser(userId);
      toast.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa người dùng thất bại');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      full_name: '',
      phone: '',
      address: '',
      password: '',
      role: 'user'
    });
    setEditingUser(null);
  };

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = searchTerm === '' || 
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-3">
          <UsersIcon className="text-blue-600" />
          QUẢN LÝ NGƯỜI DÙNG
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="grid md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã khóa</option>
          </select>

          {/* Nút THÊM NGƯỜI DÙNG */}
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
          >
            <Plus size={20} />
            THÊM NGƯỜI DÙNG
          </button>

          {/* Nút Xuất Excel */}
          <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-6 py-4 font-medium">Người dùng</th>
                <th className="px-6 py-4 font-medium">Vai trò</th>
                <th className="px-6 py-4 font-medium">Liên hệ</th>
                <th className="px-6 py-4 font-medium">Ngày tham gia</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{user.full_name || user.username}</p>
                        <p className="text-xs text-slate-400">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? <Shield size={12} /> : <UserCog size={12} />}
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="text-slate-400" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-slate-400" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{formatDate(user.created_at)}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        user.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors`}
                    >
                      {user.is_active ? (
                        <CheckCircle size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}
                      {user.is_active ? 'Hoạt động' : 'Đã khóa'}
                    </button>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setViewingUser(user);
                          setShowDetailModal(true);
                        }}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({
                            username: user.username,
                            email: user.email,
                            full_name: user.full_name || '',
                            phone: user.phone || '',
                            address: user.address || '',
                            password: '',
                            role: user.role
                          });
                          setShowModal(true);
                        }}
                        className="p-2 hover:bg-green-50 text-green-600 rounded-xl transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, filteredUsers.length)} / {filteredUsers.length} người dùng
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={18} />
            </button>
            
            {pagination.totalPages > 0 && [...Array(pagination.totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (
                pageNum === 1 ||
                pageNum === pagination.totalPages ||
                (pageNum >= pagination.page - 2 && pageNum <= pagination.page + 2)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    className={`w-10 h-10 rounded-xl ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 hover:bg-slate-100'
                    } transition-colors`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === pagination.page - 3 || pageNum === pagination.page + 3) {
                return <span key={pageNum} className="text-slate-400">...</span>;
              }
              return null;
            })}
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* User Modal - Thêm/Sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-slate-100 rounded-xl"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tên đăng nhập <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={!!editingUser}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vai trò
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Địa chỉ
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {!editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-4 mt-8 pt-8 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <Loader size={16} className="animate-spin" />}
                    {editingUser ? 'CẬP NHẬT' : 'THÊM NGƯỜI DÙNG'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showDetailModal && viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Chi tiết người dùng</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon size={32} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{viewingUser.full_name || viewingUser.username}</h3>
                    <p className="text-slate-500">@{viewingUser.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Email</p>
                    <p className="font-medium">{viewingUser.email}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Số điện thoại</p>
                    <p className="font-medium">{viewingUser.phone || 'Chưa cập nhật'}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Vai trò</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      viewingUser.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {viewingUser.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Trạng thái</p>
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold w-fit ${
                      viewingUser.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {viewingUser.is_active ? (
                        <CheckCircle size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}
                      {viewingUser.is_active ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">Địa chỉ</p>
                  <p className="bg-slate-50 p-4 rounded-xl">
                    {viewingUser.address || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-8 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
                >
                  ĐÓNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
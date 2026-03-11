import React, { createContext, useState, useContext, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Lấy dữ liệu từ localStorage để duy trì trạng thái khi F5
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        console.log('Loaded user from localStorage:', parsedUser);
        return parsedUser;
      }
      return null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  });
  
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    console.log('Loaded token from localStorage:', savedToken ? 'Yes' : 'No');
    return savedToken || null;
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile from API...');
      const res = await authApi.getProfile();
      console.log('Profile API response:', res.data);
      
      const userData = res.data.data;
      console.log('User data from profile API:', userData);
      
      // Kiểm tra role từ API
      console.log('User role from API:', userData.role);
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Token có thể đã hết hạn
      if (error.response?.status === 401) {
        console.log('Token expired, logging out...');
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, userToken) => {
    console.log('Login - userData:', userData);
    console.log('Login - userToken:', userToken);
    console.log('Login - user role:', userData.role);
    
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    console.log('Logging out...');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Các giá trị computed
  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';
  const roleLabel = isAdmin ? 'ADMIN' : 'USER';

  console.log('AuthContext - Current state:', {
    user,
    isAuthenticated,
    isAdmin,
    roleLabel,
    loading,
    userRole: user?.role
  });

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    roleLabel,
    hasRole: (role) => user?.role === role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
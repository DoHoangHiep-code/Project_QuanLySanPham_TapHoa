import { defineStore } from 'pinia';
import { authAPI } from '@/api/auth';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: false
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isStaff: (state) => state.user?.role === 'staff' || state.user?.role === 'admin',
    userFullName: (state) => state.user?.fullName || ''
  },

  actions: {
    setTokens(accessToken, refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    },

    setUser(user) {
      this.user = user;
      this.isAuthenticated = true;
    },

    async login(credentials) {
      try {
        const response = await authAPI.login(credentials);
        const { user, accessToken, refreshToken } = response.data.data;
        
        this.setTokens(accessToken, refreshToken);
        this.setUser(user);
        
        return { success: true };
      } catch (error) {
        console.error('Login error:', error);
        
        let message = 'Đăng nhập thất bại';
        
        if (error.response) {
          message = error.response.data?.error?.message || error.response.data?.message || message;
        } else if (error.request) {
          message = 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.';
        } else {
          message = error.message || message;
        }
        
        return {
          success: false,
          message
        };
      }
    },

    async logout() {
      try {
        if (this.accessToken) {
          await authAPI.logout();
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.user = null;
        this.accessToken = null;
        this.refreshToken = null;
        this.isAuthenticated = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
      }
    },

    async checkAuth() {
      if (!this.accessToken) {
        return false;
      }

      try {
        const response = await authAPI.getMe();
        this.setUser(response.data.data.user);
        return true;
      } catch (error) {
        this.logout();
        return false;
      }
    }
  }
});


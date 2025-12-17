import api from './axios';

export const invoicesAPI = {
  create: (data) => api.post('/invoices', data),
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  updateStatus: (id, status) => api.put(`/invoices/${id}/status`, { status }),
  getTodayStats: () => api.get('/invoices/stats/today'),
  getRevenueByDateRange: (startDate, endDate) => 
    api.get('/invoices/stats/revenue', { params: { startDate, endDate } }),
  getBestSelling: (params) => api.get('/invoices/stats/best-selling', { params })
};


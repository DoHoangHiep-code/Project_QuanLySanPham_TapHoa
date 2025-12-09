import api from './axios';

export const inventoryAPI = {
  adjust: (data) => api.post('/inventory/adjust', data),
  getLogs: (params) => api.get('/inventory/logs', { params }),
  getProductLogs: (productId, limit) => 
    api.get(`/inventory/logs/product/${productId}`, { params: { limit } })
};


import api from './axios';

export const exportAPI = {
  exportRevenue: (startDate, endDate) => {
    return api.get('/export/revenue', {
      params: { startDate, endDate },
      responseType: 'blob'
    });
  },
  exportBestSelling: (startDate, endDate, limit) => {
    return api.get('/export/best-selling', {
      params: { startDate, endDate, limit },
      responseType: 'blob'
    });
  },
  exportInventory: () => {
    return api.get('/export/inventory', {
      responseType: 'blob'
    });
  }
};


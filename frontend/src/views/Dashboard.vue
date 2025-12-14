<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Tổng quan</h1>
      <!-- Export Dropdown -->
      <div class="relative" ref="exportDropdownRef">
        <button
          @click="showExportDropdown = !showExportDropdown"
          class="btn btn-primary flex items-center gap-2"
        >
          <span>📥</span>
          <span>Xuất báo cáo</span>
          <span>▼</span>
        </button>
        <div
          v-if="showExportDropdown"
          class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200"
        >
          <div class="py-1">
            <button
              @click="handleExport('revenue')"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              📊 Báo cáo doanh thu
            </button>
            <button
              @click="handleExport('best-selling')"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              🔥 Báo cáo hàng bán chạy
            </button>
            <button
              @click="handleExport('inventory')"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              📦 Báo cáo tồn kho
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Đang tải...</p>
    </div>
    
    <div v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">Doanh thu hôm nay</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ formatCurrency(stats.todayStats?.totalRevenue || 0) }}
              </p>
            </div>
            <div class="text-3xl">💰</div>
          </div>
        </div>
        
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">Số hóa đơn hôm nay</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ stats.todayStats?.totalInvoices || 0 }}
              </p>
            </div>
            <div class="text-3xl">📄</div>
          </div>
        </div>
        
        <div 
          class="card relative" 
          ref="lowStockCardRef"
          @mouseenter="handleLowStockMouseEnter"
          @mouseleave="showLowStockTooltip = false"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">Sản phẩm sắp hết</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ stats.lowStockProducts?.length || 0 }}
              </p>
            </div>
            <div class="text-3xl">⚠️</div>
          </div>
          <!-- Tooltip Box -->
          <div
            v-if="showLowStockTooltip && stats.lowStockProducts?.length > 0"
            class="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-20 border border-gray-200 p-4"
            @mouseleave="showLowStockTooltip = false"
          >
            <h3 class="font-semibold text-gray-900 mb-3 text-sm">Danh sách sản phẩm sắp hết:</h3>
            <div class="max-h-64 overflow-y-auto">
              <div
                v-for="product in stats.lowStockProducts"
                :key="product._id"
                class="py-2 border-b border-gray-100 last:border-0"
              >
                <p class="text-sm font-medium text-gray-900">{{ product.name }}</p>
                <p class="text-xs text-gray-500">
                  Số lượng: {{ product.quantity }} {{ product.unit }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Revenue Chart -->
      <div class="card mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Doanh thu 7 ngày gần đây</h2>
        <Line :data="chartData" :options="chartOptions" />
      </div>
      
      <!-- Low Stock Products -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Sản phẩm sắp hết hàng</h2>
        <div v-if="stats.lowStockProducts?.length === 0" class="text-center py-8 text-gray-500">
          Không có sản phẩm nào sắp hết hàng
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn vị</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in stats.lowStockProducts" :key="product._id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ product.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ product.quantity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ product.unit }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { dashboardAPI } from '@/api/dashboard';
import { exportAPI } from '@/api/export';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const stats = ref({
  todayStats: {},
  lowStockProducts: [],
  revenueLast7Days: []
});

const loading = ref(true);
const showExportDropdown = ref(false);
const showLowStockTooltip = ref(false);
const exportDropdownRef = ref(null);
const lowStockCardRef = ref(null);

const chartData = computed(() => ({
  labels: stats.value.revenueLast7Days?.map(item => {
    const date = new Date(item.date);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  }) || [],
  datasets: [{
    label: 'Doanh thu (VNĐ)',
    data: stats.value.revenueLast7Days?.map(item => item.revenue) || [],
    borderColor: 'rgb(3, 105, 161)',
    backgroundColor: 'rgba(3, 105, 161, 0.1)',
    tension: 0.4
  }]
}));

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
};

const fetchStats = async () => {
  try {
    loading.value = true;
    const response = await dashboardAPI.getStats();
    stats.value = response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    if (window.$toast) {
      window.$toast('Không thể tải dữ liệu tổng quan', 'error');
    }
  } finally {
    loading.value = false;
  }
};

const handleExport = async (type) => {
  try {
    showExportDropdown.value = false;
    
    let response;
    let filename;
    
    switch (type) {
      case 'revenue': {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        response = await exportAPI.exportRevenue(startDateStr, endDate);
        filename = `bao-cao-doanh-thu-${Date.now()}.csv`;
        break;
      }
      case 'best-selling': {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        response = await exportAPI.exportBestSelling(startDateStr, endDate, 100);
        filename = `bao-cao-hang-ban-chay-${Date.now()}.csv`;
        break;
      }
      case 'inventory': {
        response = await exportAPI.exportInventory();
        filename = `bao-cao-ton-kho-${Date.now()}.csv`;
        break;
      }
    }
    
    // Tạo blob và tải xuống
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (window.$toast) {
      window.$toast('Xuất báo cáo thành công', 'success');
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    if (window.$toast) {
      window.$toast('Không thể xuất báo cáo', 'error');
    }
  }
};

const handleClickOutside = (event) => {
  if (exportDropdownRef.value && !exportDropdownRef.value.contains(event.target)) {
    showExportDropdown.value = false;
  }
};

const handleLowStockMouseEnter = () => {
  if (stats.value.lowStockProducts?.length > 0) {
    showLowStockTooltip.value = true;
  }
};

onMounted(() => {
  fetchStats();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.card.relative:hover {
  cursor: pointer;
}
</style>


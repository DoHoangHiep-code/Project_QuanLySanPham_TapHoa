<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Báo cáo</h1>
    
    <!-- Date Range Filter -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
          <input
            v-model="dateRange.startDate"
            type="date"
            class="input"
            @change="fetchReports"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
          <input
            v-model="dateRange.endDate"
            type="date"
            class="input"
            @change="fetchReports"
          />
        </div>
        <div class="flex items-end">
          <button @click="setDefaultDateRange" class="btn btn-secondary w-full">
            7 ngày gần đây
          </button>
        </div>
      </div>
    </div>
    
    <!-- Revenue Chart -->
    <div class="card mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo tháng</h2>
      <Bar v-if="revenueChartData.labels.length > 0" :data="revenueChartData" :options="chartOptions" />
      <div v-else class="text-center py-8 text-gray-500">Chọn khoảng thời gian để xem báo cáo</div>
    </div>
    
    <!-- Best Selling Products -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Sản phẩm bán chạy</h2>
      <div v-if="loading" class="text-center py-12 text-gray-500">
        Đang tải...
      </div>
      <div v-else-if="bestSelling.length === 0" class="text-center py-8 text-gray-500">
        Không có dữ liệu
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số lượng bán</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(product, index) in bestSelling" :key="product._id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ index + 1 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ product.productName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {{ product.totalQuantity }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {{ formatCurrency(product.totalRevenue) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { invoicesAPI } from '@/api/invoices';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const loading = ref(false);
const bestSelling = ref([]);
const revenueData = ref([]);

const dateRange = ref({
  startDate: '',
  endDate: ''
});

const revenueChartData = computed(() => {
  if (revenueData.value.length === 0) {
    return { labels: [], datasets: [] };
  }
  
  return {
    labels: revenueData.value.map(item => item._id),
    datasets: [{
      label: 'Doanh thu (VNĐ)',
      data: revenueData.value.map(item => item.revenue),
      backgroundColor: 'rgba(3, 105, 161, 0.5)',
      borderColor: 'rgb(3, 105, 161)',
      borderWidth: 1
    }]
  };
});

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

const setDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  
  dateRange.value.startDate = start.toISOString().split('T')[0];
  dateRange.value.endDate = end.toISOString().split('T')[0];
  
  fetchReports();
};

const fetchReports = async () => {
  if (!dateRange.value.startDate || !dateRange.value.endDate) {
    return;
  }
  
  try {
    loading.value = true;
    
    const [revenueResponse, bestSellingResponse] = await Promise.all([
      invoicesAPI.getRevenueByDateRange(dateRange.value.startDate, dateRange.value.endDate),
      invoicesAPI.getBestSelling({ 
        limit: 10,
        startDate: dateRange.value.startDate,
        endDate: dateRange.value.endDate
      })
    ]);
    
    revenueData.value = revenueResponse.data.data;
    bestSelling.value = bestSellingResponse.data.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    if (window.$toast) {
      window.$toast('Không thể tải báo cáo', 'error');
    }
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
};

onMounted(() => {
  setDefaultDateRange();
});
</script>


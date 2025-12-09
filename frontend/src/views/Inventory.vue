<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Quản lý tồn kho</h1>
    
    <!-- Adjust Inventory Form -->
    <div class="card mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Điều chỉnh tồn kho</h2>
      <form @submit.prevent="handleAdjust" class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sản phẩm *</label>
          <select v-model="adjustForm.productId" required class="input">
            <option value="">Chọn sản phẩm</option>
            <option v-for="product in products" :key="product._id" :value="product._id">
              {{ product.name }} ({{ product.quantity }} {{ product.unit }})
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Thao tác *</label>
          <select v-model="adjustForm.action" required class="input">
            <option value="increase">Tăng</option>
            <option value="decrease">Giảm</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Số lượng *</label>
          <input
            v-model.number="adjustForm.quantity"
            type="number"
            required
            min="1"
            class="input"
            placeholder="0"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Lý do *</label>
          <select v-model="adjustForm.reason" required class="input">
            <option value="import">Nhập hàng</option>
            <option value="adjustment">Điều chỉnh</option>
            <option value="return">Trả hàng</option>
            <option value="damaged">Hư hỏng</option>
            <option value="expired">Hết hạn</option>
          </select>
        </div>
        
        <div class="flex items-end">
          <button type="submit" :disabled="loading" class="btn btn-primary w-full">
            Áp dụng
          </button>
        </div>
      </form>
    </div>
    
    <!-- Inventory Logs -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Lịch sử thay đổi</h2>
      <DataTable
        :columns="logColumns"
        :data="logs"
        :loading="loadingLogs"
        :pagination="logPagination"
        @page-change="handleLogPageChange"
      >
        <template #action="{ row }">
          <span :class="row.action === 'increase' ? 'text-green-600' : 'text-red-600'">
            {{ row.action === 'increase' ? 'Tăng' : 'Giảm' }}
          </span>
        </template>
        <template #performedBy="{ row }">
          {{ row.performedBy?.fullName || row.performedBy?.username || 'N/A' }}
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '@/components/DataTable.vue';
import { inventoryAPI } from '@/api/inventory';
import { productsAPI } from '@/api/products';

const products = ref([]);
const logs = ref([]);
const loading = ref(false);
const loadingLogs = ref(false);
const logPagination = ref(null);

const adjustForm = ref({
  productId: '',
  action: 'increase',
  quantity: 1,
  reason: 'import',
  notes: ''
});

const logColumns = [
  { key: 'productName', label: 'Sản phẩm' },
  { key: 'action', label: 'Thao tác' },
  { key: 'quantity', label: 'Số lượng' },
  { key: 'previousQuantity', label: 'Tồn trước' },
  { key: 'newQuantity', label: 'Tồn sau' },
  { key: 'reason', label: 'Lý do' },
  { key: 'performedBy', label: 'Người thực hiện' },
  { key: 'createdAt', label: 'Thời gian' }
];

const fetchProducts = async () => {
  try {
    const response = await productsAPI.getAll({ limit: 1000 });
    products.value = response.data.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

const fetchLogs = async (page = 1) => {
  try {
    loadingLogs.value = true;
    const response = await inventoryAPI.getLogs({ page, limit: 10 });
    logs.value = response.data.data.map(log => ({
      ...log,
      createdAt: new Date(log.createdAt).toLocaleString('vi-VN')
    }));
    logPagination.value = response.data.pagination;
  } catch (error) {
    console.error('Error fetching logs:', error);
    if (window.$toast) {
      window.$toast('Không thể tải lịch sử', 'error');
    }
  } finally {
    loadingLogs.value = false;
  }
};

const handleAdjust = async () => {
  try {
    loading.value = true;
    await inventoryAPI.adjust(adjustForm.value);
    if (window.$toast) {
      window.$toast('Điều chỉnh tồn kho thành công', 'success');
    }
    adjustForm.value = {
      productId: '',
      action: 'increase',
      quantity: 1,
      reason: 'import',
      notes: ''
    };
    fetchProducts();
    fetchLogs();
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    if (window.$toast) {
      window.$toast(
        error.response?.data?.error?.message || 'Không thể điều chỉnh tồn kho',
        'error'
      );
    }
  } finally {
    loading.value = false;
  }
};

const handleLogPageChange = (page) => {
  fetchLogs(page);
};

onMounted(() => {
  fetchProducts();
  fetchLogs();
});
</script>


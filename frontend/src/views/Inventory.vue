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
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Lịch sử thay đổi</h2>
        <button
          class="btn btn-secondary"
          @click="showLogFilters = !showLogFilters"
        >
          {{ showLogFilters ? 'Ẩn bộ lọc' : 'Bộ lọc nâng cao' }}
        </button>
      </div>

      <div v-if="showLogFilters" class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Sản phẩm</label>
            <select v-model="logFilters.productId" class="input">
              <option value="">Tất cả</option>
              <option v-for="p in products" :key="p._id" :value="p._id">
                {{ p.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Thao tác</label>
            <select v-model="logFilters.action" class="input">
              <option value="">Tất cả</option>
              <option value="increase">Tăng</option>
              <option value="decrease">Giảm</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Lý do</label>
            <select v-model="logFilters.reason" class="input">
              <option value="">Tất cả</option>
              <option value="import">Nhập hàng</option>
              <option value="adjustment">Điều chỉnh</option>
              <option value="return">Trả hàng</option>
              <option value="damaged">Hư hỏng</option>
              <option value="expired">Hết hạn</option>
              <option value="sale">Bán hàng</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input v-model="logFilters.startDate" type="date" class="input" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input v-model="logFilters.endDate" type="date" class="input" />
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-3">
          <button class="btn btn-secondary" @click="resetLogFilters" :disabled="loadingLogs">
            Xóa bộ lọc
          </button>
          <button class="btn btn-primary" @click="applyLogFilters" :disabled="loadingLogs">
            Áp dụng
          </button>
        </div>
      </div>

      <DataTable
        :columns="logColumns"
        :data="logs"
        :loading="loadingLogs"
        :pagination="logPagination"
        :actions="true"
        @page-change="handleLogPageChange"
      >
        <template #action="{ row }">
          <span :class="row.action === 'increase' ? 'text-green-600' : 'text-red-600'">
            {{ row.action === 'increase' ? 'Tăng' : 'Giảm' }}
          </span>
        </template>
        <template #reason="{ row }">
          {{ getReasonLabel(row.reason) }}
        </template>
        <template #performedBy="{ row }">
          {{ row.performedBy?.fullName || row.performedBy?.username || 'N/A' }}
        </template>
        <template #actions="{ row }">
          <button
            class="text-primary-600 hover:text-primary-800"
            @click="openProductLogs(row.productId?._id || row.productId)"
          >
            Xem chi tiết
          </button>
        </template>
      </DataTable>
    </div>

    <Modal v-model="showProductLogsModal" title="Lịch sử tồn kho sản phẩm" :showFooter="false">
      <div class="space-y-3">
        <div class="text-sm text-gray-600">
          {{ productLogsTitle }}
        </div>

        <div class="border rounded-lg overflow-hidden">
          <div class="max-h-[55vh] overflow-y-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="text-left py-2 px-3">Thời gian</th>
                  <th class="text-left py-2 px-3">Thao tác</th>
                  <th class="text-right py-2 px-3">Số lượng</th>
                  <th class="text-right py-2 px-3">Tồn trước</th>
                  <th class="text-right py-2 px-3">Tồn sau</th>
                  <th class="text-left py-2 px-3">Lý do</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loadingProductLogs">
                  <td colspan="6" class="py-6 text-center text-gray-500">Đang tải...</td>
                </tr>
                <tr v-else-if="productLogs.length === 0">
                  <td colspan="6" class="py-6 text-center text-gray-500">Không có dữ liệu</td>
                </tr>
                <tr v-else v-for="log in productLogs" :key="log._id" class="border-b last:border-0">
                  <td class="py-2 px-3 whitespace-nowrap">{{ formatDateTime(log.createdAt) }}</td>
                  <td class="py-2 px-3 whitespace-nowrap">
                    <span :class="log.action === 'increase' ? 'text-green-600' : 'text-red-600'">
                      {{ log.action === 'increase' ? 'Tăng' : 'Giảm' }}
                    </span>
                  </td>
                  <td class="py-2 px-3 text-right">{{ log.quantity }}</td>
                  <td class="py-2 px-3 text-right">{{ log.previousQuantity }}</td>
                  <td class="py-2 px-3 text-right">{{ log.newQuantity }}</td>
                  <td class="py-2 px-3">{{ getReasonLabel(log.reason) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex justify-end">
          <button class="btn btn-secondary" @click="showProductLogsModal = false">Đóng</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '@/components/DataTable.vue';
import Modal from '@/components/Modal.vue';
import { inventoryAPI } from '@/api/inventory';
import { productsAPI } from '@/api/products';

const products = ref([]);
const logs = ref([]);
const loading = ref(false);
const loadingLogs = ref(false);
const logPagination = ref(null);
const showLogFilters = ref(false);
const logFilters = ref({
  productId: '',
  action: '',
  reason: '',
  startDate: '',
  endDate: ''
});

const showProductLogsModal = ref(false);
const loadingProductLogs = ref(false);
const productLogs = ref([]);
const productLogsTitle = ref('');

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
    const params = {
      page,
      limit: 10,
      ...logFilters.value
    };

    if (!params.productId) delete params.productId;
    if (!params.action) delete params.action;
    if (!params.reason) delete params.reason;
    if (!params.startDate) delete params.startDate;
    if (!params.endDate) delete params.endDate;

    const response = await inventoryAPI.getLogs(params);
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

const applyLogFilters = () => {
  fetchLogs(1);
};

const resetLogFilters = () => {
  logFilters.value = {
    productId: '',
    action: '',
    reason: '',
    startDate: '',
    endDate: ''
  };
  fetchLogs(1);
};

const formatDateTime = (value) => {
  return new Date(value).toLocaleString('vi-VN');
};

const getReasonLabel = (reason) => {
  switch (reason) {
    case 'import': return 'Nhập hàng';
    case 'adjustment': return 'Điều chỉnh';
    case 'return': return 'Trả hàng';
    case 'damaged': return 'Hư hỏng';
    case 'expired': return 'Hết hạn';
    case 'sale': return 'Bán hàng';
    default: return reason || 'N/A';
  }
};

const openProductLogs = async (productId) => {
  if (!productId) return;

  try {
    loadingProductLogs.value = true;
    showProductLogsModal.value = true;
    productLogs.value = [];

    const product = products.value.find(p => p._id === productId);
    productLogsTitle.value = product ? `Sản phẩm: ${product.name}` : 'Chi tiết sản phẩm';

    const response = await inventoryAPI.getProductLogs(productId, 50);
    productLogs.value = response.data.data || [];
  } catch (error) {
    console.error('Error fetching product logs:', error);
    if (window.$toast) {
      window.$toast('Không thể tải lịch sử theo sản phẩm', 'error');
    }
    showProductLogsModal.value = false;
  } finally {
    loadingProductLogs.value = false;
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


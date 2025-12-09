<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Danh sách hóa đơn</h1>
    
    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="input"
            @change="fetchInvoices"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="input"
            @change="fetchInvoices"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <select v-model="filters.status" class="input" @change="fetchInvoices">
            <option value="">Tất cả</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
            <option value="refunded">Đã hoàn</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="resetFilters" class="btn btn-secondary w-full">Xóa bộ lọc</button>
        </div>
      </div>
    </div>
    
    <!-- Invoices Table -->
    <div class="card">
      <DataTable
        :columns="columns"
        :data="invoices"
        :loading="loading"
        :pagination="pagination"
        :actions="true"
        @page-change="handlePageChange"
      >
        <template #total="{ row }">
          {{ formatCurrency(row.total) }}
        </template>
        <template #createdBy="{ row }">
          {{ row.createdBy?.fullName || row.createdBy?.username || 'N/A' }}
        </template>
        <template #createdAt="{ row }">
          {{ new Date(row.createdAt).toLocaleString('vi-VN') }}
        </template>
        <template #actions="{ row }">
          <button
            @click="viewInvoice(row)"
            class="text-primary-600 hover:text-primary-800 mr-3"
          >
            Xem
          </button>
        </template>
      </DataTable>
    </div>
    
    <!-- Invoice Detail Modal -->
    <Modal v-model="showDetailModal" title="Chi tiết hóa đơn">
      <div v-if="selectedInvoice" class="space-y-4">
        <div>
          <p class="text-sm text-gray-500">Số hóa đơn</p>
          <p class="font-semibold">{{ selectedInvoice.invoiceNumber }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Khách hàng</p>
          <p class="font-semibold">{{ selectedInvoice.customerName }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Thời gian</p>
          <p class="font-semibold">{{ new Date(selectedInvoice.createdAt).toLocaleString('vi-VN') }}</p>
        </div>
        
        <div class="border-t pt-4">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-2">Sản phẩm</th>
                <th class="text-right py-2">SL</th>
                <th class="text-right py-2">Giá</th>
                <th class="text-right py-2">Tổng</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in selectedInvoice.items" :key="index" class="border-b">
                <td class="py-2">{{ item.productName }}</td>
                <td class="text-right py-2">{{ item.quantity }}</td>
                <td class="text-right py-2">{{ formatCurrency(item.price) }}</td>
                <td class="text-right py-2">{{ formatCurrency(item.subtotal) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="font-bold text-lg">
                <td colspan="3" class="py-2">Tổng cộng:</td>
                <td class="text-right py-2">{{ formatCurrency(selectedInvoice.total) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '@/components/DataTable.vue';
import Modal from '@/components/Modal.vue';
import { invoicesAPI } from '@/api/invoices';

const invoices = ref([]);
const loading = ref(false);
const pagination = ref(null);
const showDetailModal = ref(false);
const selectedInvoice = ref(null);

const filters = ref({
  startDate: '',
  endDate: '',
  status: '',
  page: 1,
  limit: 10,
  sort: '-createdAt'
});

const columns = [
  { key: 'invoiceNumber', label: 'Số hóa đơn' },
  { key: 'customerName', label: 'Khách hàng' },
  { key: 'total', label: 'Tổng tiền' },
  { key: 'createdBy', label: 'Người tạo' },
  { key: 'createdAt', label: 'Thời gian' }
];

const fetchInvoices = async () => {
  try {
    loading.value = true;
    const params = {
      ...filters.value
    };
    
    if (!params.startDate) delete params.startDate;
    if (!params.endDate) delete params.endDate;
    if (!params.status) delete params.status;
    
    const response = await invoicesAPI.getAll(params);
    invoices.value = response.data.data;
    pagination.value = response.data.pagination;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    if (window.$toast) {
      window.$toast('Không thể tải danh sách hóa đơn', 'error');
    }
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => {
  filters.value.page = page;
  fetchInvoices();
};

const resetFilters = () => {
  filters.value = {
    startDate: '',
    endDate: '',
    status: '',
    page: 1,
    limit: 10,
    sort: '-createdAt'
  };
  fetchInvoices();
};

const viewInvoice = async (invoice) => {
  try {
    const response = await invoicesAPI.getById(invoice._id);
    selectedInvoice.value = response.data.data;
    showDetailModal.value = true;
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    if (window.$toast) {
      window.$toast('Không thể tải chi tiết hóa đơn', 'error');
    }
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
};

onMounted(() => {
  fetchInvoices();
});
</script>


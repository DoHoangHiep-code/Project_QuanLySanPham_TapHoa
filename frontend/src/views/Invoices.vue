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
        <template #status="{ row }">
          <span :class="getStatusBadgeClass(row.status)">
            {{ getStatusLabel(row.status) }}
          </span>
        </template>
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
          <p class="text-sm text-gray-500">Trạng thái</p>
          <div class="flex items-center justify-between gap-3">
            <span :class="getStatusBadgeClass(selectedInvoice.status)">
              {{ getStatusLabel(selectedInvoice.status) }}
            </span>
            <div class="flex items-center gap-2">
              <select v-model="statusToUpdate" class="input">
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
                <option value="refunded">Đã hoàn</option>
              </select>
              <button
                class="btn btn-primary"
                :disabled="updatingStatus"
                @click="handleUpdateStatus"
              >
                {{ updatingStatus ? 'Đang cập nhật...' : 'Cập nhật' }}
              </button>
            </div>
          </div>
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
const statusToUpdate = ref('completed');
const updatingStatus = ref(false);

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
  { key: 'status', label: 'Trạng thái' },
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
    statusToUpdate.value = selectedInvoice.value.status || 'completed';
    showDetailModal.value = true;
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    if (window.$toast) {
      window.$toast('Không thể tải chi tiết hóa đơn', 'error');
    }
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'completed': return 'Hoàn thành';
    case 'cancelled': return 'Đã hủy';
    case 'refunded': return 'Đã hoàn';
    default: return status || 'N/A';
  }
};

const getStatusBadgeClass = (status) => {
  const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium';
  switch (status) {
    case 'completed':
      return `${base} bg-green-100 text-green-800`;
    case 'cancelled':
      return `${base} bg-red-100 text-red-800`;
    case 'refunded':
      return `${base} bg-yellow-100 text-yellow-800`;
    default:
      return `${base} bg-gray-100 text-gray-800`;
  }
};

const handleUpdateStatus = async () => {
  if (!selectedInvoice.value?._id) return;

  try {
    updatingStatus.value = true;
    const response = await invoicesAPI.updateStatus(selectedInvoice.value._id, statusToUpdate.value);
    const updated = response.data.data;

    // Update modal data
    selectedInvoice.value.status = updated.status;

    // Sync list data
    const idx = invoices.value.findIndex(i => i._id === selectedInvoice.value._id);
    if (idx > -1) {
      invoices.value[idx] = { ...invoices.value[idx], status: updated.status };
    }

    if (window.$toast) {
      window.$toast('Cập nhật trạng thái hóa đơn thành công', 'success');
    }
  } catch (error) {
    console.error('Error updating invoice status:', error);
    if (window.$toast) {
      window.$toast(
        error.response?.data?.error?.message || 'Không thể cập nhật trạng thái hóa đơn',
        'error'
      );
    }
  } finally {
    updatingStatus.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
};

onMounted(() => {
  fetchInvoices();
});
</script>


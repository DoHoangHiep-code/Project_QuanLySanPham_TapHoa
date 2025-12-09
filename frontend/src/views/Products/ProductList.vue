<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Danh sách sản phẩm</h1>
      <router-link to="/products/create" class="btn btn-primary">
        + Thêm sản phẩm
      </router-link>
    </div>
    
    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Tìm kiếm..."
          class="input"
          @input="handleSearch"
        />
        <select v-model="filters.categoryId" class="input" @change="fetchProducts">
          <option value="">Tất cả danh mục</option>
          <option v-for="category in categories" :key="category._id" :value="category._id">
            {{ category.name }}
          </option>
        </select>
        <select v-model="filters.isLowStock" class="input" @change="fetchProducts">
          <option value="">Tất cả</option>
          <option value="true">Sắp hết hàng</option>
        </select>
        <button @click="resetFilters" class="btn btn-secondary">Xóa bộ lọc</button>
      </div>
    </div>
    
    <!-- Products Table -->
    <div class="card">
      <DataTable
        :columns="columns"
        :data="products"
        :loading="loading"
        :pagination="pagination"
        :actions="true"
        @page-change="handlePageChange"
      >
        <template #categoryId="{ row }">
          {{ row.categoryId?.name || 'N/A' }}
        </template>
        
        <template #price="{ row }">
          {{ formatCurrency(row.price) }}
        </template>
        
        <template #quantity="{ row }">
          <span :class="row.quantity <= row.lowStockThreshold ? 'text-red-600 font-medium' : ''">
            {{ row.quantity }}
          </span>
        </template>
        
        <template #actions="{ row }">
          <router-link
            :to="`/products/${row._id}/edit`"
            class="text-primary-600 hover:text-primary-800 mr-3"
          >
            Sửa
          </router-link>
          <button
            @click="handleDelete(row)"
            class="text-red-600 hover:text-red-800"
          >
            Xóa
          </button>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '@/components/DataTable.vue';
import { productsAPI } from '@/api/products';
import { categoriesAPI } from '@/api/categories';

const router = useRouter();

const products = ref([]);
const categories = ref([]);
const loading = ref(false);
const pagination = ref(null);

const filters = ref({
  search: '',
  categoryId: '',
  isLowStock: '',
  page: 1,
  limit: 10,
  sort: '-createdAt'
});

const columns = [
  { key: 'name', label: 'Tên sản phẩm', sortable: true },
  { key: 'categoryId', label: 'Danh mục' },
  { key: 'price', label: 'Giá bán', sortable: true },
  { key: 'quantity', label: 'Số lượng', sortable: true },
  { key: 'unit', label: 'Đơn vị' },
  { key: 'barcode', label: 'Mã vạch' }
];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
};

const fetchProducts = async () => {
  try {
    loading.value = true;
    const params = {
      ...filters.value,
      page: filters.value.page,
      limit: filters.value.limit
    };
    
    if (!params.search) delete params.search;
    if (!params.categoryId) delete params.categoryId;
    if (!params.isLowStock) delete params.isLowStock;
    
    const response = await productsAPI.getAll(params);
    products.value = response.data.data;
    pagination.value = response.data.pagination;
  } catch (error) {
    console.error('Error fetching products:', error);
    if (window.$toast) {
      window.$toast('Không thể tải danh sách sản phẩm', 'error');
    }
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await categoriesAPI.getAll();
    categories.value = response.data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

const handleSearch = debounce(() => {
  filters.value.page = 1;
  fetchProducts();
}, 500);

const handlePageChange = (page) => {
  filters.value.page = page;
  fetchProducts();
};

const resetFilters = () => {
  filters.value = {
    search: '',
    categoryId: '',
    isLowStock: '',
    page: 1,
    limit: 10,
    sort: '-createdAt'
  };
  fetchProducts();
};

const handleDelete = async (product) => {
  if (!window.$confirm) {
    if (confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
      await deleteProduct(product._id);
    }
    return;
  }
  
  const confirmed = await window.$confirm({
    title: 'Xác nhận xóa',
    message: `Bạn có chắc muốn xóa sản phẩm "${product.name}"?`,
    confirmText: 'Xóa'
  });
  
  if (confirmed) {
    await deleteProduct(product._id);
  }
};

const deleteProduct = async (id) => {
  try {
    await productsAPI.delete(id);
    if (window.$toast) {
      window.$toast('Xóa sản phẩm thành công', 'success');
    }
    fetchProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    if (window.$toast) {
      window.$toast('Không thể xóa sản phẩm', 'error');
    }
  }
};

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

onMounted(() => {
  fetchCategories();
  fetchProducts();
});
</script>


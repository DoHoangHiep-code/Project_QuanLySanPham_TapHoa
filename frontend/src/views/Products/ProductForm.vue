<template>
  <div>
    <div class="mb-6">
      <router-link to="/products" class="text-primary-600 hover:text-primary-800 mb-4 inline-block">
        ← Quay lại
      </router-link>
      <h1 class="text-2xl font-bold text-gray-900">
        {{ isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới' }}
      </h1>
    </div>
    
    <div class="card max-w-2xl">
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="input"
              placeholder="Nhập tên sản phẩm"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Giá bán (VNĐ) *
              </label>
              <input
                v-model.number="form.price"
                type="number"
                required
                min="0"
                class="input"
                placeholder="0"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Giá nhập (VNĐ) *
              </label>
              <input
                v-model.number="form.importPrice"
                type="number"
                required
                min="0"
                class="input"
                placeholder="0"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Số lượng *
              </label>
              <input
                v-model.number="form.quantity"
                type="number"
                required
                min="0"
                class="input"
                placeholder="0"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị *
              </label>
              <input
                v-model="form.unit"
                type="text"
                required
                class="input"
                placeholder="cái, kg, chai..."
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Danh mục *
            </label>
            <select v-model="form.categoryId" required class="input">
              <option value="">Chọn danh mục</option>
              <option v-for="category in categories" :key="category._id" :value="category._id">
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Mã vạch
            </label>
            <input
              v-model="form.barcode"
              type="text"
              class="input"
              placeholder="Để trống để tự động tạo"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Ngưỡng cảnh báo tồn kho
            </label>
            <input
              v-model.number="form.lowStockThreshold"
              type="number"
              min="0"
              class="input"
              placeholder="10"
            />
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-3">
          <router-link to="/products" class="btn btn-secondary">
            Hủy
          </router-link>
          <button type="submit" :disabled="loading" class="btn btn-primary">
            {{ loading ? 'Đang lưu...' : 'Lưu' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { productsAPI } from '@/api/products';
import { categoriesAPI } from '@/api/categories';

const route = useRoute();
const router = useRouter();

const isEdit = computed(() => !!route.params.id);

const form = ref({
  name: '',
  price: 0,
  importPrice: 0,
  quantity: 0,
  unit: 'cái',
  categoryId: '',
  barcode: '',
  lowStockThreshold: 10
});

const categories = ref([]);
const loading = ref(false);

const fetchCategories = async () => {
  try {
    const response = await categoriesAPI.getAll();
    categories.value = response.data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

const fetchProduct = async () => {
  if (!isEdit.value) return;
  
  try {
    loading.value = true;
    const response = await productsAPI.getById(route.params.id);
    const product = response.data.data;
    form.value = {
      name: product.name,
      price: product.price,
      importPrice: product.importPrice,
      quantity: product.quantity,
      unit: product.unit,
      categoryId: product.categoryId._id || product.categoryId,
      barcode: product.barcode || '',
      lowStockThreshold: product.lowStockThreshold || 10
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    if (window.$toast) {
      window.$toast('Không thể tải thông tin sản phẩm', 'error');
    }
    router.push('/products');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    
    const data = {
      ...form.value,
      barcode: form.value.barcode || undefined
    };
    
    if (isEdit.value) {
      await productsAPI.update(route.params.id, data);
      if (window.$toast) {
        window.$toast('Cập nhật sản phẩm thành công', 'success');
      }
    } else {
      await productsAPI.create(data);
      if (window.$toast) {
        window.$toast('Tạo sản phẩm thành công', 'success');
      }
    }
    
    router.push('/products');
  } catch (error) {
    console.error('Error saving product:', error);
    if (window.$toast) {
      window.$toast(
        error.response?.data?.error?.message || 'Không thể lưu sản phẩm',
        'error'
      );
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
  if (isEdit.value) {
    fetchProduct();
  }
});
</script>


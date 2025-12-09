<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Danh mục sản phẩm</h1>
      <button @click="showModal = true" class="btn btn-primary">
        + Thêm danh mục
      </button>
    </div>
    
    <div class="card">
      <div v-if="loading" class="text-center py-12 text-gray-500">
        Đang tải...
      </div>
      <div v-else-if="categories.length === 0" class="text-center py-12 text-gray-500">
        Chưa có danh mục nào
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="category in categories"
          :key="category._id"
          class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ category.name }}</h3>
          <p class="text-sm text-gray-500 mb-3">{{ category.description || 'Không có mô tả' }}</p>
          <div class="flex space-x-2">
            <button
              @click="editCategory(category)"
              class="text-primary-600 hover:text-primary-800 text-sm"
            >
              Sửa
            </button>
            <button
              @click="handleDelete(category)"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal -->
    <Modal v-model="showModal" :title="editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'">
      <form id="categoryForm" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Tên danh mục *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="input"
              placeholder="Nhập tên danh mục"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              v-model="form.description"
              class="input"
              rows="3"
              placeholder="Nhập mô tả"
            ></textarea>
          </div>
        </div>
      </form>

      <template #footer>
        <button type="button" @click="showModal = false" class="btn btn-secondary">
          Hủy
        </button>
        <button type="submit" form="categoryForm" :disabled="loading" class="btn btn-primary">
          {{ loading ? 'Đang lưu...' : 'Lưu' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Modal from '@/components/Modal.vue';
import { categoriesAPI } from '@/api/categories';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const isAdmin = authStore.isAdmin;

const categories = ref([]);
const loading = ref(false);
const showModal = ref(false);
const editingCategory = ref(null);

const form = ref({
  name: '',
  description: ''
});

const fetchCategories = async () => {
  try {
    loading.value = true;
    const response = await categoriesAPI.getAll();
    categories.value = response.data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    if (window.$toast) {
      window.$toast('Không thể tải danh sách danh mục', 'error');
    }
  } finally {
    loading.value = false;
  }
};

const editCategory = (category) => {
  editingCategory.value = category;
  form.value = {
    name: category.name,
    description: category.description || ''
  };
  showModal.value = true;
};

const handleSubmit = async () => {
  if (!isAdmin) {
    if (window.$toast) {
      window.$toast('Chỉ quản trị viên mới có quyền thực hiện', 'error');
    }
    return;
  }
  
  try {
    loading.value = true;
    
    if (editingCategory.value) {
      await categoriesAPI.update(editingCategory.value._id, form.value);
      if (window.$toast) {
        window.$toast('Cập nhật danh mục thành công', 'success');
      }
    } else {
      await categoriesAPI.create(form.value);
      if (window.$toast) {
        window.$toast('Tạo danh mục thành công', 'success');
      }
    }
    
    showModal.value = false;
    editingCategory.value = null;
    form.value = { name: '', description: '' };
    fetchCategories();
  } catch (error) {
    console.error('Error saving category:', error);
    if (window.$toast) {
      window.$toast('Không thể lưu danh mục', 'error');
    }
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (category) => {
  if (!isAdmin) {
    if (window.$toast) {
      window.$toast('Chỉ quản trị viên mới có quyền xóa', 'error');
    }
    return;
  }
  
  if (!window.$confirm) {
    if (confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      await deleteCategory(category._id);
    }
    return;
  }
  
  const confirmed = await window.$confirm({
    title: 'Xác nhận xóa',
    message: `Bạn có chắc muốn xóa danh mục "${category.name}"?`,
    confirmText: 'Xóa'
  });
  
  if (confirmed) {
    await deleteCategory(category._id);
  }
};

const deleteCategory = async (id) => {
  try {
    await categoriesAPI.delete(id);
    if (window.$toast) {
      window.$toast('Xóa danh mục thành công', 'success');
    }
    fetchCategories();
  } catch (error) {
    console.error('Error deleting category:', error);
    if (window.$toast) {
      window.$toast(
        error.response?.data?.error?.message || 'Không thể xóa danh mục',
        'error'
      );
    }
  }
};

onMounted(() => {
  fetchCategories();
});
</script>


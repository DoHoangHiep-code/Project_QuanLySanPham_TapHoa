<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <div class="flex-1 max-w-xl">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          class="input w-full"
          v-model="searchQuery"
          @keyup.enter="handleSearch"
        />
      </div>
      
      <div class="flex items-center space-x-4 ml-4">
        <div class="text-right">
          <p class="text-sm font-medium text-gray-900">{{ authStore.userFullName }}</p>
          <p class="text-xs text-gray-500">{{ authStore.user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên' }}</p>
        </div>
        <button
          @click="handleLogout"
          class="btn btn-secondary text-sm"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const searchQuery = ref('');

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/products', query: { search: searchQuery.value } });
  }
};

const handleLogout = async () => {
  await authStore.logout();
};
</script>


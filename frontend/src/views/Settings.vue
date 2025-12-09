<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h1>
    
    <div class="card max-w-2xl">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản</h2>
      
      <div v-if="user" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
          <input
            :value="user.username"
            type="text"
            disabled
            class="input bg-gray-100"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            :value="user.email"
            type="email"
            disabled
            class="input bg-gray-100"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
          <input
            :value="user.fullName"
            type="text"
            disabled
            class="input bg-gray-100"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
          <input
            :value="user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'"
            type="text"
            disabled
            class="input bg-gray-100"
          />
        </div>
      </div>
      
      <div class="mt-6 pt-6 border-t border-gray-200">
        <button
          @click="handleLogout"
          class="btn btn-danger"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const handleLogout = async () => {
  await authStore.logout();
};
</script>


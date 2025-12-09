<template>
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
    <div class="p-6 border-b border-gray-200">
      <h1 class="text-xl font-bold text-primary-700">Tiệm Tạp Hoá</h1>
      <p class="text-sm text-gray-500">Quản lý bán hàng</p>
    </div>
    
    <nav class="flex-1 p-4 space-y-1">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex items-center px-4 py-3 rounded-lg transition-colors',
          $route.path === item.path || $route.path.startsWith(item.path + '/')
            ? 'bg-primary-50 text-primary-700 font-medium'
            : 'text-gray-700 hover:bg-gray-100'
        ]"
      >
        <span class="mr-3">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
const menuItems = [
  { path: '/dashboard', label: 'Tổng quan', icon: '📊' },
  { path: '/products', label: 'Sản phẩm', icon: '📦' },
  { path: '/categories', label: 'Danh mục', icon: '📁' },
  { path: '/inventory', label: 'Tồn kho', icon: '📋' },
  { path: '/pos', label: 'Bán hàng', icon: '🛒' },
  { path: '/invoices', label: 'Hóa đơn', icon: '🧾' },
  { path: '/reports', label: 'Báo cáo', icon: '📈' },
  { path: '/settings', label: 'Cài đặt', icon: '⚙️' }
];
</script>


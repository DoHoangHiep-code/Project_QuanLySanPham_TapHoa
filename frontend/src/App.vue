<template>
  <router-view />
  <LoadingOverlay v-if="loading" />
  <ToastContainer />
  <ConfirmDialog ref="confirmDialogRef" />
</template>

<script setup>
import { ref, provide, onMounted } from 'vue';
import LoadingOverlay from '@/components/LoadingOverlay.vue';
import ToastContainer from '@/components/ToastContainer.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const loading = ref(false);
const confirmDialogRef = ref(null);

provide('setLoading', (value) => {
  loading.value = value;
});

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.$confirm = async (options) => {
      if (confirmDialogRef.value) {
        return await confirmDialogRef.value.show(options);
      }
      return Promise.resolve(confirm(options.message || 'Xác nhận?'));
    };
  }
});
</script>


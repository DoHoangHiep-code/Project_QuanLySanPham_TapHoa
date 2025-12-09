<template>
  <Modal v-model="isOpen" :title="dialogProps.title" :show-footer="true">
    <p class="text-gray-700 mb-4">{{ dialogProps.message }}</p>
    <template #footer>
      <button @click="handleCancel" class="btn btn-secondary">Hủy</button>
      <button @click="handleConfirm" :class="['btn', dialogProps.confirmButtonClass]">
        {{ dialogProps.confirmText }}
      </button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, reactive } from 'vue';
import Modal from './Modal.vue';

const isOpen = ref(false);
let resolvePromise = null;

const dialogProps = reactive({
  title: 'Xác nhận',
  message: 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText: 'Xác nhận',
  confirmButtonClass: 'btn-danger'
});

const show = (options = {}) => {
  Object.assign(dialogProps, {
    title: options.title || 'Xác nhận',
    message: options.message || 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText: options.confirmText || 'Xác nhận',
    confirmButtonClass: options.confirmButtonClass || 'btn-danger'
  });
  
  isOpen.value = true;
  return new Promise((resolve) => {
    resolvePromise = resolve;
  });
};

const handleConfirm = () => {
  isOpen.value = false;
  if (resolvePromise) {
    resolvePromise(true);
    resolvePromise = null;
  }
};

const handleCancel = () => {
  isOpen.value = false;
  if (resolvePromise) {
    resolvePromise(false);
    resolvePromise = null;
  }
};

defineExpose({ show });
</script>


<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('update:modelValue', false)">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-900">{{ title }}</h3>
              <button
                @click="$emit('update:modelValue', false)"
                class="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <slot />
            <div v-if="showFooter" class="flex justify-end space-x-2 mt-6">
              <slot name="footer">
                <button
                  @click="$emit('update:modelValue', false)"
                  class="btn btn-secondary"
                >
                  Đóng
                </button>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: String,
  showFooter: {
    type: Boolean,
    default: true
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>


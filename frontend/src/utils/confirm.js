import { createApp } from 'vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

let dialogInstance = null;

export const confirm = (options = {}) => {
  return new Promise((resolve) => {
    if (!dialogInstance) {
      const div = document.createElement('div');
      document.body.appendChild(div);
      
      const app = createApp(ConfirmDialog, {
        ...options,
        onConfirm: () => {
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        }
      });
      
      dialogInstance = app.mount(div);
    }
    
    dialogInstance.show().then(resolve);
  });
};


if (typeof window !== 'undefined') {
  window.$confirm = confirm;
}


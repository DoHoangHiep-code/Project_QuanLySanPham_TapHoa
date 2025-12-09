import { ref, createApp, h } from 'vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

let confirmApp = null;
let confirmInstance = null;

export const useConfirm = () => {
  if (!confirmApp) {
    const div = document.createElement('div');
    document.body.appendChild(div);
    
    confirmApp = createApp({
      setup() {
        const dialogRef = ref(null);
        
        const show = async (options = {}) => {
          return new Promise((resolve) => {
            if (dialogRef.value) {
              dialogRef.value.show().then(resolve);
            }
          });
        };
        
        if (typeof window !== 'undefined') {
          window.$confirm = show;
        }
        
        return () => h(ConfirmDialog, {
          ref: dialogRef,
          ...options
        });
      }
    });
    
    confirmInstance = confirmApp.mount(div);
  }
  
  return window.$confirm || ((options) => {
    return Promise.resolve(confirm(options.message || 'Xác nhận?'));
  });
};


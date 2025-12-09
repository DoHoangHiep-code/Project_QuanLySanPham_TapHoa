<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Bán hàng (POS)</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Products Selection -->
      <div class="lg:col-span-2">
        <div class="card">
          <div class="mb-4">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              class="input"
              @input="handleSearch"
            />
          </div>
          
          <div v-if="loadingProducts" class="text-center py-12 text-gray-500">
            Đang tải...
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
            <div
              v-for="product in availableProducts"
              :key="product._id"
              @click="addToCart(product)"
              :class="[
                'p-4 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow',
                product.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              <h3 class="font-semibold text-gray-900 mb-1">{{ product.name }}</h3>
              <p class="text-sm text-gray-500 mb-2">Tồn: {{ product.quantity }} {{ product.unit }}</p>
              <p class="text-lg font-bold text-primary-700">{{ formatCurrency(product.price) }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Cart -->
      <div class="lg:col-span-1">
        <div class="card sticky top-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Giỏ hàng</h2>
          
          <div v-if="cart.length === 0" class="text-center py-8 text-gray-500">
            Chưa có sản phẩm
          </div>
          <div v-else class="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
            <div
              v-for="(item, index) in cart"
              :key="index"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex-1">
                <p class="font-medium text-sm">{{ item.name }}</p>
                <p class="text-xs text-gray-500">{{ formatCurrency(item.price) }} × {{ item.quantity }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="decreaseQuantity(index)"
                  class="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"
                >
                  -
                </button>
                <span class="w-8 text-center">{{ item.quantity }}</span>
                <button
                  @click="increaseQuantity(index)"
                  class="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"
                >
                  +
                </button>
                <button
                  @click="removeFromCart(index)"
                  class="text-red-600 hover:text-red-800 ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
          
          <div class="border-t border-gray-200 pt-4 space-y-3">
            <div class="flex justify-between text-lg font-semibold">
              <span>Tổng cộng:</span>
              <span class="text-primary-700">{{ formatCurrency(total) }}</span>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
              <input
                v-model="customerName"
                type="text"
                class="input"
                placeholder="Khách lẻ"
              />
            </div>
            
            <button
              @click="handleCheckout"
              :disabled="cart.length === 0 || loading"
              class="w-full btn btn-primary"
            >
              {{ loading ? 'Đang xử lý...' : 'Thanh toán' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { productsAPI } from '@/api/products';
import { invoicesAPI } from '@/api/invoices';

const products = ref([]);
const searchQuery = ref('');
const loadingProducts = ref(false);
const loading = ref(false);
const cart = ref([]);
const customerName = ref('');

const availableProducts = computed(() => {
  let filtered = products.value.filter(p => p.isActive);
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.barcode?.toLowerCase().includes(query)
    );
  }
  
  return filtered;
});

const total = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const fetchProducts = async () => {
  try {
    loadingProducts.value = true;
    const response = await productsAPI.getAll({ limit: 1000 });
    products.value = response.data.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    if (window.$toast) {
      window.$toast('Không thể tải danh sách sản phẩm', 'error');
    }
  } finally {
    loadingProducts.value = false;
  }
};

const handleSearch = () => {
  // Search is handled by computed property
};

const addToCart = (product) => {
  if (product.quantity === 0) {
    if (window.$toast) {
      window.$toast('Sản phẩm đã hết hàng', 'warning');
    }
    return;
  }
  
  const existingIndex = cart.value.findIndex(item => item.productId === product._id);
  
  if (existingIndex > -1) {
    if (cart.value[existingIndex].quantity >= product.quantity) {
      if (window.$toast) {
        window.$toast('Không đủ số lượng trong kho', 'warning');
      }
      return;
    }
    cart.value[existingIndex].quantity++;
  } else {
    cart.value.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }
};

const increaseQuantity = (index) => {
  const item = cart.value[index];
  const product = products.value.find(p => p._id === item.productId);
  
  if (item.quantity >= product.quantity) {
    if (window.$toast) {
      window.$toast('Không đủ số lượng trong kho', 'warning');
    }
    return;
  }
  
  item.quantity++;
};

const decreaseQuantity = (index) => {
  if (cart.value[index].quantity > 1) {
    cart.value[index].quantity--;
  } else {
    removeFromCart(index);
  }
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1);
};

const handleCheckout = async () => {
  try {
    loading.value = true;
    
    const items = cart.value.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    
    const invoiceData = {
      items,
      customerName: customerName.value || 'Khách lẻ'
    };
    
    await invoicesAPI.create(invoiceData);
    
    if (window.$toast) {
      window.$toast('Thanh toán thành công!', 'success');
    }
    
    cart.value = [];
    customerName.value = '';
    fetchProducts();
  } catch (error) {
    console.error('Error creating invoice:', error);
    if (window.$toast) {
      window.$toast(
        error.response?.data?.error?.message || 'Không thể thanh toán',
        'error'
      );
    }
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
};

onMounted(() => {
  fetchProducts();
});
</script>


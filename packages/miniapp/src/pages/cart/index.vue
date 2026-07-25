<template>
  <view class="page">
    <view class="nav-bar">
      <text class="nav-title">购物车</text>
    </view>

    <scroll-view
      v-if="cartGroups.length > 0"
      class="cart-scroll"
      scroll-y
      @scrolltolower="onScrollToLower">
      <view
        v-for="group in cartGroups"
        :key="group.supplierId"
        class="supplier-group">
        <view class="supplier-header" @click="toggleSupplier(group.supplierId)">
          <view
            class="checkbox"
            :class="{ checked: isSupplierChecked(group.supplierId) }">
            <text v-if="isSupplierChecked(group.supplierId)" class="check-icon">✓</text>
          </view>
          <text class="supplier-name">供应商 {{ group.supplierId }}</text>
          <text class="supplier-arrow">›</text>
        </view>

        <view
          v-for="item in group.items"
          :key="item.id"
          class="cart-item">
          <view class="checkbox-wrap" @click="toggleItem(item.id)">
            <view
              class="checkbox"
              :class="{ checked: checkedIds.includes(item.id) }">
              <text v-if="checkedIds.includes(item.id)" class="check-icon">✓</text>
            </view>
          </view>

          <image
            class="item-image"
            :src="item.product?.mainImages?.[0] || placeholderImg"
            mode="aspectFill" />

          <view class="item-info">
            <text class="item-name">{{ item.product?.name || '商品' }}</text>
            <text class="item-spec">{{ item.sku?.skuName || '' }}</text>
            <view class="item-bottom">
              <text class="item-price">¥{{ item.price?.toFixed(2) || '0.00' }}</text>
              <view class="quantity-control">
                <view class="qty-btn" @click="decreaseQty(item)">-</view>
                <text class="qty-value">{{ item.quantity }}</text>
                <view class="qty-btn" @click="increaseQty(item)">+</view>
              </view>
            </view>
          </view>

          <view class="delete-btn" @click="handleDelete(item.id)">
            <text class="delete-icon">🗑</text>
          </view>
        </view>
      </view>
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <view v-else class="empty-state">
      <text class="empty-icon">🛒</text>
      <text class="empty-text">购物车空空如也</text>
      <button class="go-shop-btn" @click="goHome">去逛逛</button>
    </view>

    <view v-if="cartGroups.length > 0" class="bottom-bar">
      <view class="select-all" @click="toggleSelectAll">
        <view class="checkbox" :class="{ checked: isAllChecked }">
          <text v-if="isAllChecked" class="check-icon">✓</text>
        </view>
        <text class="select-all-text">全选</text>
      </view>

      <view class="total-wrap">
        <text class="total-label">合计：</text>
        <text class="total-price">¥{{ totalPrice.toFixed(2) }}</text>
      </view>

      <view class="checkout-btn" @click="goCheckout">
        <text class="checkout-text">去结算</text>
        <view v-if="checkedCount > 0" class="checkout-badge">
          <text class="badge-text">{{ checkedCount }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getCart, updateCartQuantity, removeCartItem } from '@/api/cart';

const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7nlJ/npL7lj4rlkI08L3RleHQ+PC9zdmc+';

const cartGroups = ref<any[]>([]);
const checkedIds = ref<number[]>([]);

const allItemIds = computed(() => {
  const ids: number[] = [];
  cartGroups.value.forEach((group) => {
    group.items.forEach((item: any) => ids.push(item.id));
  });
  return ids;
});

const isAllChecked = computed(() => {
  if (allItemIds.value.length === 0) return false;
  return allItemIds.value.every((id) => checkedIds.value.includes(id));
});

const checkedItems = computed(() => {
  const items: any[] = [];
  cartGroups.value.forEach((group) => {
    group.items.forEach((item: any) => {
      if (checkedIds.value.includes(item.id)) {
        items.push(item);
      }
    });
  });
  return items;
});

const totalPrice = computed(() => {
  return checkedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const checkedCount = computed(() => checkedItems.value.length);

function isSupplierChecked(supplierId: number) {
  const group = cartGroups.value.find((g) => g.supplierId === supplierId);
  if (!group || group.items.length === 0) return false;
  return group.items.every((item: any) => checkedIds.value.includes(item.id));
}

function toggleSupplier(supplierId: number) {
  const group = cartGroups.value.find((g) => g.supplierId === supplierId);
  if (!group) return;
  const groupIds = group.items.map((item: any) => item.id);
  const allChecked = groupIds.every((id: number) => checkedIds.value.includes(id));
  if (allChecked) {
    checkedIds.value = checkedIds.value.filter((id) => !groupIds.includes(id));
  } else {
    groupIds.forEach((id: number) => {
      if (!checkedIds.value.includes(id)) {
        checkedIds.value.push(id);
      }
    });
  }
}

function toggleItem(id: number) {
  const idx = checkedIds.value.indexOf(id);
  if (idx > -1) {
    checkedIds.value.splice(idx, 1);
  } else {
    checkedIds.value.push(id);
  }
}

function toggleSelectAll() {
  if (isAllChecked.value) {
    checkedIds.value = [];
  } else {
    checkedIds.value = [...allItemIds.value];
  }
}

async function loadCart() {
  try {
    const data = await getCart();
    cartGroups.value = data || [];
  } catch (e) {
    console.error('加载购物车失败', e);
  }
}

async function increaseQty(item: any) {
  try {
    await updateCartQuantity(item.id, item.quantity + 1);
    item.quantity++;
  } catch (e) {}
}

async function decreaseQty(item: any) {
  if (item.quantity <= 1) return;
  try {
    await updateCartQuantity(item.id, item.quantity - 1);
    item.quantity--;
  } catch (e) {}
}

async function handleDelete(id: number) {
  uni.showModal({
    title: '提示',
    content: '确定删除该商品吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await removeCartItem(id);
          checkedIds.value = checkedIds.value.filter((i) => i !== id);
          await loadCart();
          uni.showToast({ title: '已删除', icon: 'success' });
        } catch (e) {}
      }
    },
  });
}

function goHome() {
  uni.switchTab({ url: '/pages/index/index' });
}

function goCheckout() {
  if (checkedItems.value.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' });
    return;
  }
  const items = checkedItems.value.map((item) => ({
    cartItemId: item.id,
    productId: item.productId,
    skuId: item.skuId,
    quantity: item.quantity,
  }));
  uni.navigateTo({
    url: `/pages/order/confirm?items=${encodeURIComponent(JSON.stringify(items))}`,
  });
}

function onScrollToLower() {}

onMounted(() => {
  loadCart();
});
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.nav-bar {
  height: 88rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1rpx solid #f0f0f0;
  padding-top: var(--status-bar-height, 0);

  .nav-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #333;
  }
}

.cart-scroll {
  flex: 1;
}

.supplier-group {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.supplier-header {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid #f5f5f5;

  .supplier-name {
    flex: 1;
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-left: 16rpx;
  }

  .supplier-arrow {
    font-size: 32rpx;
    color: #ccc;
  }
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.checked {
    background: #2e7d32;
    border-color: #2e7d32;
  }

  .check-icon {
    color: #fff;
    font-size: 24rpx;
    font-weight: bold;
  }
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  position: relative;

  &:not(:last-child) {
    border-bottom: 1rpx solid #f5f5f5;
  }
}

.checkbox-wrap {
  padding: 8rpx;
  margin-right: 8rpx;
}

.item-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #f0f0f0;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  min-width: 0;

  .item-name {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .item-spec {
    font-size: 24rpx;
    color: #999;
    margin-top: 8rpx;
  }

  .item-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16rpx;

    .item-price {
      font-size: 32rpx;
      font-weight: 700;
      color: #e53935;
    }
  }
}

.quantity-control {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8rpx;

  .qty-btn {
    width: 56rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    color: #666;

    &:active {
      background: #e8e8e8;
    }
  }

  .qty-value {
    width: 64rpx;
    text-align: center;
    font-size: 28rpx;
    color: #333;
  }
}

.delete-btn {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  padding: 8rpx;

  .delete-icon {
    font-size: 32rpx;
    opacity: 0.5;
  }
}

.bottom-placeholder {
  height: 140rpx;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 32rpx;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 30rpx;
    color: #999;
    margin-bottom: 48rpx;
  }

  .go-shop-btn {
    padding: 0 64rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: #2e7d32;
    color: #fff;
    font-size: 30rpx;
    border-radius: 40rpx;
    border: none;
  }
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f0f0f0;

  .select-all {
    display: flex;
    align-items: center;
    padding: 8rpx 16rpx 8rpx 8rpx;

    .select-all-text {
      font-size: 28rpx;
      color: #333;
      margin-left: 12rpx;
    }
  }

  .total-wrap {
    flex: 1;
    text-align: right;
    margin-right: 24rpx;

    .total-label {
      font-size: 26rpx;
      color: #666;
    }

    .total-price {
      font-size: 36rpx;
      font-weight: 700;
      color: #e53935;
    }
  }

  .checkout-btn {
    position: relative;
    padding: 0 48rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: #2e7d32;
    border-radius: 40rpx;

    .checkout-text {
      color: #fff;
      font-size: 30rpx;
      font-weight: 500;
    }

    .checkout-badge {
      position: absolute;
      top: -8rpx;
      right: -8rpx;
      min-width: 36rpx;
      height: 36rpx;
      background: #e53935;
      border-radius: 18rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8rpx;

      .badge-text {
        color: #fff;
        font-size: 22rpx;
        font-weight: 600;
      }
    }
  }
}
</style>

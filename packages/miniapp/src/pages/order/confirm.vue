<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">确认订单</text>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="address-section" @click="goAddressList">
        <view v-if="address" class="address-info">
          <view class="address-row">
            <text class="address-name">{{ address.name }}</text>
            <text class="address-phone">{{ address.phone }}</text>
          </view>
          <text class="address-detail">
            {{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}
          </text>
        </view>
        <view v-else class="address-empty">
          <text class="empty-text">请选择收货地址</text>
        </view>
        <text class="address-arrow">›</text>
      </view>

      <view
        v-for="group in orderGroups"
        :key="group.supplierId"
        class="supplier-card">
        <view class="supplier-title">
          <text class="supplier-name">供应商 {{ group.supplierId }}</text>
        </view>
        <view
          v-for="item in group.items"
          :key="item.skuId"
          class="product-item">
          <image
            class="product-image"
            :src="item.mainImage || placeholderImg"
            mode="aspectFill" />
          <view class="product-info">
            <text class="product-name">{{ item.name || '商品' }}</text>
            <text class="product-spec">{{ item.spec || '' }}</text>
            <view class="product-bottom">
              <text class="product-price">¥{{ item.price?.toFixed(2) || '0.00' }}</text>
              <text class="product-qty">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">配送时效</view>
        <view class="delivery-options">
          <view
            v-for="opt in deliveryOptions"
            :key="opt.value"
            class="delivery-item"
            :class="{ active: deliveryTimeType === opt.value }"
            @click="deliveryTimeType = opt.value">
            <view class="delivery-radio">
              <view v-if="deliveryTimeType === opt.value" class="radio-inner"></view>
            </view>
            <view class="delivery-info">
              <text class="delivery-name">{{ opt.label }}</text>
              <text class="delivery-desc">{{ opt.desc }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">订单备注</view>
        <textarea
          class="remark-input"
          v-model="remark"
          placeholder="选填，有什么想对商家说的..."
          placeholder-class="remark-placeholder"
          maxlength="200" />
      </view>

      <view class="section-card">
        <view class="section-title">费用明细</view>
        <view class="fee-row">
          <text class="fee-label">商品金额</text>
          <text class="fee-value">¥{{ productAmount.toFixed(2) }}</text>
        </view>
        <view class="fee-row">
          <text class="fee-label">运费</text>
          <text class="fee-value" :class="{ free: deliveryFee === 0 }">
            {{ deliveryFee === 0 ? '免运费' : `¥${deliveryFee.toFixed(2)}` }}
          </text>
        </view>
        <view class="fee-tip" v-if="productAmount < 99">
          再购 ¥{{ (99 - productAmount).toFixed(2) }} 免运费
        </view>
        <view class="fee-divider"></view>
        <view class="fee-row total">
          <text class="fee-label">实付</text>
          <text class="fee-value total-price">¥{{ actualAmount.toFixed(2) }}</text>
        </view>
      </view>

      <view class="bottom-placeholder"></view>
    </scroll-view>

    <view class="submit-bar">
      <view class="submit-total">
        <text class="submit-label">实付：</text>
        <text class="submit-price">¥{{ actualAmount.toFixed(2) }}</text>
      </view>
      <view class="submit-btn" @click="handleSubmit">
        <text class="submit-text">提交订单</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getAddressList } from '@/api/address';
import { createOrder } from '@/api/order';

const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7nlJ/npL7lj4rlkI08L3RleHQ+PC9zdmc+';

const address = ref<any>(null);
const orderItems = ref<any[]>([]);
const deliveryTimeType = ref('same_day');
const remark = ref('');

const deliveryOptions = [
  { value: 'same_day', label: '当日达', desc: '今日送达' },
  { value: 'next_day', label: '次日达', desc: '明日送达' },
];

const orderGroups = computed(() => {
  const groups: Record<number, any> = {};
  orderItems.value.forEach((item) => {
    const sid = item.supplierId || 0;
    if (!groups[sid]) {
      groups[sid] = { supplierId: sid, items: [] };
    }
    groups[sid].items.push(item);
  });
  return Object.values(groups);
});

const productAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
});

const deliveryFee = computed(() => {
  return productAmount.value >= 99 ? 0 : 5;
});

const actualAmount = computed(() => {
  return productAmount.value + deliveryFee.value;
});

function goBack() {
  uni.navigateBack();
}

function goAddressList() {
  uni.navigateTo({ url: '/pages/address/list?select=1' });
}

async function loadDefaultAddress() {
  try {
    const list = await getAddressList();
    if (list && list.length > 0) {
      address.value = list.find((a: any) => a.isDefault) || list[0];
    }
  } catch (e) {
    console.error('加载地址失败', e);
  }
}

function parseItemsFromQuery() {
  const pages = getCurrentPages();
  const currentPage: any = pages[pages.length - 1];
  const options = currentPage?.options || {};
  if (options.items) {
    try {
      const items = JSON.parse(decodeURIComponent(options.items));
      orderItems.value = items.map((item: any) => ({
        ...item,
        name: item.name || '商品',
        spec: item.spec || item.skuName || '',
        price: item.price || 0,
        quantity: item.quantity || 1,
        mainImage: item.mainImage || '',
      }));
    } catch (e) {
      console.error('解析商品参数失败', e);
    }
  }
}

async function handleSubmit() {
  if (!address.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' });
    return;
  }
  if (orderItems.value.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' });
    return;
  }

  try {
    uni.showLoading({ title: '提交中...' });
    const data = {
      addressId: address.value.id,
      deliveryTimeType: deliveryTimeType.value,
      remark: remark.value,
      items: orderItems.value.map((item) => ({
        productId: item.productId,
        skuId: item.skuId,
        quantity: item.quantity,
      })),
    };
    const result = await createOrder(data);
    uni.hideLoading();
    uni.showToast({ title: '下单成功', icon: 'success' });
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/order/list' });
    }, 1500);
  } catch (e) {
    uni.hideLoading();
  }
}

onMounted(() => {
  parseItemsFromQuery();
  loadDefaultAddress();
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
  padding: 0 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  padding-top: var(--status-bar-height, 0);

  .nav-back {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .back-icon {
      font-size: 48rpx;
      color: #333;
    }
  }

  .nav-title {
    flex: 1;
    text-align: center;
    font-size: 34rpx;
    font-weight: 600;
    color: #333;
    margin-right: 60rpx;
  }
}

.content {
  flex: 1;
}

.address-section {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;

  .address-info {
    flex: 1;

    .address-row {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;

      .address-name {
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
        margin-right: 24rpx;
      }

      .address-phone {
        font-size: 28rpx;
        color: #666;
      }
    }

    .address-detail {
      font-size: 26rpx;
      color: #666;
      line-height: 1.5;
    }
  }

  .address-empty {
    flex: 1;

    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }

  .address-arrow {
    font-size: 36rpx;
    color: #ccc;
    margin-left: 16rpx;
  }
}

.supplier-card {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  overflow: hidden;

  .supplier-title {
    padding: 24rpx 28rpx;
    border-bottom: 1rpx solid #f5f5f5;

    .supplier-name {
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
    }
  }
}

.product-item {
  display: flex;
  padding: 24rpx 28rpx;

  &:not(:last-child) {
    border-bottom: 1rpx solid #f5f5f5;
  }

  .product-image {
    width: 140rpx;
    height: 140rpx;
    border-radius: 12rpx;
    background: #f0f0f0;
    flex-shrink: 0;
  }

  .product-info {
    flex: 1;
    margin-left: 20rpx;
    display: flex;
    flex-direction: column;

    .product-name {
      font-size: 28rpx;
      color: #333;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .product-spec {
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
    }

    .product-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;

      .product-price {
        font-size: 30rpx;
        font-weight: 700;
        color: #e53935;
      }

      .product-qty {
        font-size: 26rpx;
        color: #999;
      }
    }
  }
}

.section-card {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  padding: 28rpx;

  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.delivery-options {
  .delivery-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;

    &:not(:last-child) {
      border-bottom: 1rpx solid #f5f5f5;
    }

    .delivery-radio {
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      border: 2rpx solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .radio-inner {
        width: 24rpx;
        height: 24rpx;
        border-radius: 50%;
        background: #2e7d32;
      }
    }

    &.active .delivery-radio {
      border-color: #2e7d32;
    }

    .delivery-info {
      margin-left: 20rpx;
      flex: 1;

      .delivery-name {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }

      .delivery-desc {
        font-size: 24rpx;
        color: #999;
        margin-top: 4rpx;
        display: block;
      }
    }
  }
}

.remark-input {
  width: 100%;
  height: 160rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.remark-placeholder {
  color: #999;
}

.fee-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 0;

  .fee-label {
    font-size: 28rpx;
    color: #666;
  }

  .fee-value {
    font-size: 28rpx;
    color: #333;

    &.free {
      color: #2e7d32;
    }
  }

  &.total {
    padding-top: 20rpx;

    .fee-label {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
    }

    .total-price {
      font-size: 36rpx;
      font-weight: 700;
      color: #e53935;
    }
  }
}

.fee-tip {
  font-size: 24rpx;
  color: #ff9800;
  margin-top: 8rpx;
}

.fee-divider {
  height: 1rpx;
  background: #f0f0f0;
  margin: 12rpx 0;
}

.bottom-placeholder {
  height: 140rpx;
}

.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f0f0f0;

  .submit-total {
    flex: 1;

    .submit-label {
      font-size: 26rpx;
      color: #666;
    }

    .submit-price {
      font-size: 36rpx;
      font-weight: 700;
      color: #e53935;
    }
  }

  .submit-btn {
    padding: 0 64rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: #2e7d32;
    border-radius: 40rpx;

    .submit-text {
      color: #fff;
      font-size: 30rpx;
      font-weight: 500;
    }
  }
}
</style>

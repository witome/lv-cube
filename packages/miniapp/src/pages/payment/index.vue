<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">订单支付</text>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="order-card">
        <view class="order-info-row">
          <text class="order-label">订单号</text>
          <text class="order-value">{{ orderId }}</text>
        </view>
      </view>

      <view class="amount-card">
          <text class="amount-label">支付金额</text>
          <view class="amount-value">
            <text class="currency">¥</text>
            <text class="amount-number">{{ orderAmount.toFixed(2) }}</text>
          </view>
      </view>

      <view class="goods-card" v-if="orderItems.length > 0">
        <view class="goods-title">商品清单</view>
        <view
          v-for="item in orderItems"
          :key="item.skuId || item.id"
          class="goods-item">
          <image
            class="goods-image"
            :src="item.mainImage || placeholderImg"
            mode="aspectFill" />
          <view class="goods-info">
            <text class="goods-name">{{ item.name }}</text>
            <text class="goods-spec">{{ item.spec || '' }}</text>
          </view>
          <view class="goods-right">
            <text class="goods-price">¥{{ (item.price || 0).toFixed(2) }}</text>
            <text class="goods-qty">x{{ item.quantity || 1 }}</text>
          </view>
        </view>
      </view>

      <view class="pay-method-card">
        <view class="pay-method-title">支付方式</view>
        <view class="pay-method-item" :class="{ active: payMethod === 'wechat' }" @click="payMethod = 'wechat'">
          <view class="pay-method-icon">💳</view>
          <text class="pay-method-name">微信支付</text>
          <view class="pay-method-radio">
            <view v-if="payMethod === 'wechat'" class="radio-inner"></view>
          </view>
        </view>
      </view>

      <view class="bottom-placeholder"></view>
    </scroll-view>

    <view class="pay-bar">
      <view class="pay-total">
        <text class="pay-label">实付：</text>
        <text class="pay-price">¥{{ orderAmount.toFixed(2) }}</text>
      </view>
      <view class="pay-btn" :class="{ disabled: paying }" @click="handlePay">
        <text class="pay-text">{{ paying ? '支付中...' : '立即支付' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { payOrder } from '@/api/payment';
import { getOrderDetail } from '@/api/order';

const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7nlJ/npL7lj4rlkI08L3RleHQ+PC9zdmc+';

const orderId = ref<number>(0);
const orderAmount = ref<number>(0);
const orderItems = ref<any[]>([]);
const payMethod = ref('wechat');
const paying = ref(false);

function goBack() {
  uni.navigateBack();
}

async function loadOrderDetail(id: number) {
  try {
    const detail: any = await getOrderDetail(id);
    orderAmount.value = detail.actualAmount || detail.totalAmount || 0;
    orderItems.value = detail.orderItems || [];
  } catch (e) {
    console.error('加载订单详情失败', e);
  }
}

async function handlePay() {
  if (paying.value) return;
  if (!orderId.value) {
    uni.showToast({ title: '订单信息异常', icon: 'none' });
    return;
  }
  try {
    paying.value = true;
    uni.showLoading({ title: '支付中...' });
    const result: any = await payOrder({ orderId: orderId.value });
    uni.hideLoading();
    if (result.mock || result.message?.includes('成功') || result.paymentId) {
      uni.showToast({ title: '支付成功', icon: 'success' });
      setTimeout(() => {
        uni.redirectTo({ url: `/pages/order/detail?id=${orderId.value}` });
      }, 1500);
    } else {
      uni.showToast({ title: '支付失败，请重试', icon: 'none' });
    }
  } catch (e: any) {
    uni.hideLoading();
    uni.showToast({ title: e?.message || '支付失败', icon: 'none' });
  } finally {
    paying.value = false;
  }
}

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage: any = pages[pages.length - 1];
  const options = currentPage?.options || {};
  if (options.orderId) {
    orderId.value = Number(options.orderId);
    loadOrderDetail(orderId.value);
  }
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

.order-card {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  padding: 28rpx;

  .order-info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .order-label {
      font-size: 28rpx;
      color: #666;
    }

    .order-value {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
    }
  }
}

.amount-card {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  padding: 48rpx 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .amount-label {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 20rpx;
  }

  .amount-value {
    display: flex;
    align-items: baseline;

    .currency {
      font-size: 36rpx;
      font-weight: 700;
      color: #e53935;
    }

    .amount-number {
      font-size: 72rpx;
      font-weight: 700;
      color: #e53935;
      margin-left: 4rpx;
    }
  }
}

.goods-card {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  padding: 28rpx;

  .goods-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;

  &:not(:last-child) {
    border-bottom: 1rpx solid #f5f5f5;
  }

  .goods-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    background: #f0f0f0;
    flex-shrink: 0;
  }

  .goods-info {
    flex: 1;
    margin-left: 20rpx;

    .goods-name {
      font-size: 28rpx;
      color: #333;
      line-height: 1.4;
      display: block;
    }

    .goods-spec {
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
      display: block;
    }
  }

  .goods-right {
    text-align: right;

    .goods-price {
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
      display: block;
    }

    .goods-qty {
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
      display: block;
    }
  }
}

.pay-method-card {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  padding: 28rpx;

  .pay-method-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.pay-method-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;

  .pay-method-icon {
    font-size: 40rpx;
    margin-right: 16rpx;
  }

  .pay-method-name {
    flex: 1;
    font-size: 30rpx;
    color: #333;
  }

  .pay-method-radio {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    border: 2rpx solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;

    .radio-inner {
      width: 24rpx;
      height: 24rpx;
      border-radius: 50%;
      background: #2e7d32;
    }
  }

  &.active .pay-method-radio {
    border-color: #2e7d32;
  }
}

.bottom-placeholder {
  height: 160rpx;
}

.pay-bar {
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

  .pay-total {
    flex: 1;

    .pay-label {
      font-size: 26rpx;
      color: #666;
    }

    .pay-price {
      font-size: 36rpx;
      font-weight: 700;
      color: #e53935;
    }
  }

  .pay-btn {
    padding: 0 72rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: #2e7d32;
    border-radius: 40rpx;

    &.disabled {
      opacity: 0.6;
    }

    .pay-text {
      color: #fff;
      font-size: 30rpx;
      font-weight: 500;
    }
  }
}
</style>

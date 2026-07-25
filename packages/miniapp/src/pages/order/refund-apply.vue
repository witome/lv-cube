<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">申请退款</text>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="section-card">
        <view class="info-row">
          <text class="info-label">订单号</text>
          <text class="info-value">{{ orderNo }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">订单金额</text>
          <text class="info-value amount">¥{{ orderAmount?.toFixed(2) }}</text>
        </view>
      </view>

      <view class="section-card">
        <view class="form-item">
          <view class="form-label">
            <text class="required">*</text>退款金额
          </view>
          <input
            class="form-input"
            type="digit"
            v-model="refundAmount"
            placeholder="请输入退款金额" />
          <text class="form-tip">最多可退 ¥{{ orderAmount?.toFixed(2) }}</text>
        </view>

        <view class="form-item">
          <view class="form-label">
            <text class="required">*</text>退款原因
          </view>
          <view class="reason-list">
            <view
              v-for="item in reasonOptions"
              :key="item"
              class="reason-item"
              :class="{ active: selectedReason === item }"
              @click="selectedReason = item">
              {{ item }}
            </view>
          </view>
        </view>

        <view class="form-item">
          <view class="form-label">详细说明</view>
          <textarea
            class="form-textarea"
            v-model="description"
            placeholder="请输入详细说明（选填）"
            maxlength="500" />
        </view>
      </view>

      <view class="bottom-placeholder"></view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="submit-btn" :class="{ disabled: !canSubmit }" @click="handleSubmit">
        提交申请
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { applyRefund } from '@/api/refund';

const orderId = ref<number>(0);
const orderNo = ref('');
const orderAmount = ref<number>(0);
const refundAmount = ref('');
const selectedReason = ref('');
const description = ref('');

const reasonOptions = ['商品质量问题', '发错货', '不想要了', '其他'];

const canSubmit = computed(() => {
  const amount = parseFloat(refundAmount.value);
  return (
    !isNaN(amount) &&
    amount > 0 &&
    amount <= orderAmount.value &&
    selectedReason.value !== ''
  );
});

function goBack() {
  uni.navigateBack();
}

function handleSubmit() {
  if (!canSubmit.value) return;
  uni.showModal({
    title: '提示',
    content: '确认提交退款申请？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const amount = parseFloat(refundAmount.value);
          const reason = description.value
            ? `${selectedReason.value}：${description.value}`
            : selectedReason.value;
          await applyRefund(orderId.value, reason, amount);
          uni.showToast({ title: '申请已提交', icon: 'success' });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (e) {}
      }
    },
  });
}

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage: any = pages[pages.length - 1];
  const options = currentPage?.options || {};
  orderId.value = Number(options.id) || 0;
  orderNo.value = options.orderNo || '';
  orderAmount.value = parseFloat(options.amount) || 0;
  refundAmount.value = orderAmount.value.toFixed(2);
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

.section-card {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  padding: 28rpx;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 0;

  .info-label {
    font-size: 28rpx;
    color: #666;
  }

  .info-value {
    font-size: 28rpx;
    color: #333;

    &.amount {
      color: #e53935;
      font-weight: 600;
    }
  }
}

.form-item {
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .form-label {
    font-size: 30rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 16rpx;

    .required {
      color: #e53935;
      margin-right: 4rpx;
    }
  }

  .form-input {
    width: 100%;
    height: 88rpx;
    padding: 0 24rpx;
    background: #f8f8f8;
    border-radius: 12rpx;
    font-size: 30rpx;
    color: #333;
    box-sizing: border-box;
  }

  .form-tip {
    display: block;
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #999;
  }

  .form-textarea {
    width: 100%;
    height: 200rpx;
    padding: 20rpx 24rpx;
    background: #f8f8f8;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;
  }
}

.reason-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.reason-item {
  padding: 16rpx 28rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #666;
  border: 2rpx solid transparent;

  &.active {
    background: #e8f5e9;
    color: #2e7d32;
    border-color: #2e7d32;
  }
}

.bottom-placeholder {
  height: 140rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f0f0f0;

  .submit-btn {
    width: 100%;
    height: 88rpx;
    background: #2e7d32;
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &.disabled {
      background: #ccc;
    }
  }
}
</style>

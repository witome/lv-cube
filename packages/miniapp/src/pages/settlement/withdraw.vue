<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">申请提现</text>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="balance-card">
        <text class="balance-label">可提现余额（元）</text>
        <text class="balance-value">{{ balance.toFixed(2) }}</text>
      </view>

      <view class="section-card">
        <view class="section-title">提现金额</view>
        <view class="amount-input-wrap">
          <text class="amount-prefix">¥</text>
          <input
            class="amount-input"
            type="digit"
            v-model="amountStr"
            placeholder="请输入提现金额"
            placeholder-class="amount-placeholder"
            @input="onAmountInput" />
        </view>
        <view class="quick-amounts">
          <view
            v-for="q in quickAmounts"
            :key="q"
            class="quick-item"
            @click="setQuickAmount(q)">
            <text class="quick-text">{{ q === 'all' ? '全部' : q }}</text>
          </view>
        </view>
        <view class="min-tip" v-if="showMinTip">
          <text class="tip-icon">!</text>
          <text class="tip-text">最低提现金额 50 元</text>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">提现方式</view>
        <view class="method-item" :class="{ active: withdrawMethod === 'wechat' }" @click="withdrawMethod = 'wechat'">
          <view class="method-icon">💳</view>
          <text class="method-name">微信</text>
          <view class="method-radio">
            <view v-if="withdrawMethod === 'wechat'" class="radio-inner"></view>
          </view>
        </view>
      </view>

      <view class="notice-card">
        <text class="notice-title">温馨提示</text>
        <text class="notice-text">• 最低提现金额 50 元</text>
        <text class="notice-text">• 提现申请提交后 1-3 个工作日到账</text>
        <text class="notice-text">• 如有疑问请联系客服</text>
      </view>

      <view class="bottom-placeholder"></view>
    </scroll-view>

    <view class="submit-bar">
      <view class="submit-btn" :class="{ disabled: !canSubmit || submitting }" @click="handleSubmit">
        <text class="submit-text">{{ submitting ? '提交中...' : '确认提现' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getAccount, applyWithdraw } from '@/api/settlement';

const balance = ref(0);
const amountStr = ref('');
const withdrawMethod = ref('wechat');
const submitting = ref(false);

const quickAmounts = [50, 100, 500, 'all'];

const showMinTip = computed(() => {
  const val = parseFloat(amountStr.value);
  return amountStr.value && !isNaN(val) && val < 50;
});

const canSubmit = computed(() => {
  const val = parseFloat(amountStr.value);
  return !isNaN(val) && val >= 50 && val <= balance.value;
});

function goBack() {
  uni.navigateBack();
}

function onAmountInput() {
  let val = amountStr.value.replace(/[^\d.]/g, '');
  const parts = val.split('.');
  if (parts.length > 2) {
    val = parts[0] + '.' + parts.slice(1).join('');
  }
  if (parts[1] && parts[1].length > 2) {
    val = parts[0] + '.' + parts[1].slice(0, 2);
  }
  amountStr.value = val;
}

function setQuickAmount(q: number | string) {
  if (q === 'all') {
    amountStr.value = balance.value.toFixed(2);
  } else {
    const val = Math.min(q as number, balance.value);
    amountStr.value = val.toFixed(2);
  }
}

async function loadAccount() {
  try {
    const data: any = await getAccount();
    balance.value = data?.balance || 0;
  } catch (e) {
    console.error('加载账户信息失败', e);
  }
}

async function handleSubmit() {
  if (!canSubmit.value || submitting.value) return;
  const amount = parseFloat(amountStr.value);
  if (amount < 50) {
    uni.showToast({ title: '最低提现金额 50 元', icon: 'none' });
    return;
  }
  if (amount > balance.value) {
    uni.showToast({ title: '提现金额不能超过余额', icon: 'none' });
    return;
  }
  try {
    submitting.value = true;
    uni.showLoading({ title: '提交中...' });
    await applyWithdraw({ amount });
    uni.hideLoading();
    uni.showToast({ title: '提现申请提交成功', icon: 'success' });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (e: any) {
    uni.hideLoading();
    uni.showToast({ title: e?.message || '提交失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadAccount();
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
  background: #2e7d32;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  padding-top: var(--status-bar-height, 0);

  .nav-back {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .back-icon {
      font-size: 48rpx;
      color: #fff;
    }
  }

  .nav-title {
    flex: 1;
    text-align: center;
    font-size: 34rpx;
    font-weight: 600;
    color: #fff;
    margin-right: 60rpx;
  }
}

.content {
  flex: 1;
}

.balance-card {
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  padding: 40rpx 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .balance-label {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 12rpx;
  }

  .balance-value {
    font-size: 64rpx;
    font-weight: 700;
    color: #fff;
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
    margin-bottom: 24rpx;
  }
}

.amount-input-wrap {
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #e0e0e0;
  padding-bottom: 16rpx;

  .amount-prefix {
    font-size: 48rpx;
    font-weight: 600;
    color: #333;
    margin-right: 12rpx;
  }

  .amount-input {
    flex: 1;
    font-size: 48rpx;
    font-weight: 600;
    color: #333;
  }

  .amount-placeholder {
    color: #ccc;
    font-size: 32rpx;
    font-weight: 400;
  }
}

.quick-amounts {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;

  .quick-item {
    flex: 1;
    height: 64rpx;
    line-height: 64rpx;
    text-align: center;
    background: #f5f5f5;
    border-radius: 8rpx;

    .quick-text {
      font-size: 26rpx;
      color: #666;
    }

    &:active {
      background: #e8f5e9;
    }
  }
}

.min-tip {
  display: flex;
  align-items: center;
  margin-top: 20rpx;

  .tip-icon {
    width: 32rpx;
    height: 32rpx;
    line-height: 32rpx;
    text-align: center;
    background: #e53935;
    color: #fff;
    font-size: 22rpx;
    border-radius: 50%;
    margin-right: 8rpx;
  }

  .tip-text {
    font-size: 24rpx;
    color: #e53935;
  }
}

.method-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;

  .method-icon {
    font-size: 40rpx;
    margin-right: 16rpx;
  }

  .method-name {
    flex: 1;
    font-size: 30rpx;
    color: #333;
  }

  .method-radio {
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

  &.active .method-radio {
    border-color: #2e7d32;
  }
}

.notice-card {
  background: #fff8e1;
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;

  .notice-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #f57c00;
    margin-bottom: 12rpx;
    display: block;
  }

  .notice-text {
    font-size: 24rpx;
    color: #f57c00;
    line-height: 1.8;
    display: block;
  }
}

.bottom-placeholder {
  height: 160rpx;
}

.submit-bar {
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
    line-height: 88rpx;
    text-align: center;
    background: #2e7d32;
    border-radius: 44rpx;

    &.disabled {
      background: #a5d6a7;
    }

    .submit-text {
      color: #fff;
      font-size: 32rpx;
      font-weight: 600;
    }
  }
}
</style>

<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">结算中心</text>
    </view>

    <scroll-view class="content" scroll-y @scrolltolower="loadMore">
      <view class="account-card">
        <view class="account-item">
          <text class="account-label">账户余额（元）</text>
          <text class="account-value">{{ (account.balance || 0).toFixed(2) }}</text>
          <text class="account-desc">可提现金额</text>
        </view>
        <view class="account-divider"></view>
        <view class="account-item">
          <text class="account-label">待结算金额（元）</text>
          <text class="account-value pending">{{ (account.pendingBalance || 0).toFixed(2) }}</text>
          <text class="account-desc">T+1 自动结算</text>
        </view>
      </view>

      <view class="action-bar">
        <view class="withdraw-btn" @click="goWithdraw">
          <text class="withdraw-text">去提现</text>
        </view>
      </view>

      <view class="tab-bar">
        <view
          class="tab-item"
          :class="{ active: activeTab === 'settlement' }"
          @click="switchTab('settlement')">
          <text class="tab-text">结算记录</text>
          <view v-if="activeTab === 'settlement'" class="tab-line"></view>
        </view>
        <view
          class="tab-item"
          :class="{ active: activeTab === 'withdrawal' }"
          @click="switchTab('withdrawal')">
          <text class="tab-text">提现记录</text>
          <view v-if="activeTab === 'withdrawal'" class="tab-line"></view>
        </view>
      </view>

      <view v-if="activeTab === 'settlement'" class="list-section">
        <view v-if="settlementList.length === 0 && !loading" class="empty-state">
          <text class="empty-icon">📋</text>
          <text class="empty-text">暂无结算记录</text>
        </view>
        <view
          v-for="item in settlementList"
          :key="item.id"
          class="record-card">
          <view class="record-header">
            <text class="record-title">订单结算</text>
            <text class="record-status" :class="getStatusClass(item.status)">
              {{ getStatusText(item.status) }}
            </text>
          </view>
          <view class="record-row">
            <text class="record-label">订单编号</text>
            <text class="record-value">{{ item.orderId }}</text>
          </view>
          <view class="record-row">
            <text class="record-label">订单金额</text>
            <text class="record-value">¥{{ (item.orderAmount || 0).toFixed(2) }}</text>
          </view>
          <view class="record-row">
            <text class="record-label">平台佣金</text>
            <text class="record-value">-¥{{ (item.commissionAmount || 0).toFixed(2) }}</text>
          </view>
          <view class="record-row total">
            <text class="record-label">结算金额</text>
            <text class="record-value amount">+¥{{ (item.supplierAmount || 0).toFixed(2) }}</text>
          </view>
          <view class="record-time">{{ formatTime(item.createdAt) }}</view>
        </view>
      </view>

      <view v-if="activeTab === 'withdrawal'" class="list-section">
        <view v-if="withdrawalList.length === 0 && !loading" class="empty-state">
          <text class="empty-icon">💰</text>
          <text class="empty-text">暂无提现记录</text>
        </view>
        <view
          v-for="item in withdrawalList"
          :key="item.id"
          class="record-card">
          <view class="record-header">
            <text class="record-title">提现申请</text>
            <text class="record-status" :class="getWithdrawStatusClass(item.status)">
              {{ getWithdrawStatusText(item.status) }}
            </text>
          </view>
          <view class="record-row">
            <text class="record-label">提现方式</text>
            <text class="record-value">{{ item.withdrawMethod === 'wechat' ? '微信' : item.withdrawMethod }}</text>
          </view>
          <view class="record-row total">
            <text class="record-label">提现金额</text>
            <text class="record-value amount">-¥{{ (item.amount || 0).toFixed(2) }}</text>
          </view>
          <view class="record-time">{{ formatTime(item.createdAt) }}</view>
        </view>
      </view>

      <view v-if="loading" class="loading-tip">
        <text class="loading-text">加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAccount, getSettlementList, getWithdrawalList } from '@/api/settlement';

const account = ref<any>({ balance: 0, pendingBalance: 0 });
const activeTab = ref('settlement');
const settlementList = ref<any[]>([]);
const withdrawalList = ref<any[]>([]);
const loading = ref(false);
const settlementPage = ref(1);
const withdrawalPage = ref(1);
const pageSize = 20;

function goBack() {
  uni.navigateBack();
}

function goWithdraw() {
  uni.navigateTo({ url: '/pages/settlement/withdraw' });
}

function switchTab(tab: string) {
  activeTab.value = tab;
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待结算',
    settled: '已结算',
  };
  return map[status] || status;
}

function getStatusClass(status: string) {
  return status === 'settled' ? 'success' : 'pending';
}

function getWithdrawStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '处理中',
    success: '提现成功',
    failed: '提现失败',
  };
  return map[status] || status;
}

function getWithdrawStatusClass(status: string) {
  if (status === 'success') return 'success';
  if (status === 'failed') return 'failed';
  return 'pending';
}

function formatTime(time: string) {
  if (!time) return '';
  const d = new Date(time);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

async function loadAccount() {
  try {
    const data = await getAccount();
    account.value = data || { balance: 0, pendingBalance: 0 };
  } catch (e) {
    console.error('加载账户信息失败', e);
  }
}

async function loadSettlements(reset = false) {
  if (loading.value) return;
  if (reset) settlementPage.value = 1;
  loading.value = true;
  try {
    const data: any = await getSettlementList({ page: settlementPage.value, pageSize });
    if (reset) {
      settlementList.value = data.list || [];
    } else {
      settlementList.value = [...settlementList.value, ...(data.list || [])];
    }
  } catch (e) {
    console.error('加载结算记录失败', e);
  } finally {
    loading.value = false;
  }
}

async function loadWithdrawals(reset = false) {
  if (loading.value) return;
  if (reset) withdrawalPage.value = 1;
  loading.value = true;
  try {
    const data: any = await getWithdrawalList({ page: withdrawalPage.value, pageSize });
    if (reset) {
      withdrawalList.value = data.list || [];
    } else {
      withdrawalList.value = [...withdrawalList.value, ...(data.list || [])];
    }
  } catch (e) {
    console.error('加载提现记录失败', e);
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  if (activeTab.value === 'settlement') {
    settlementPage.value++;
    loadSettlements();
  } else {
    withdrawalPage.value++;
    loadWithdrawals();
  }
}

onMounted(() => {
  loadAccount();
  loadSettlements(true);
  loadWithdrawals(true);
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

.account-card {
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  padding: 40rpx 28rpx;
  display: flex;
  align-items: center;

  .account-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    .account-label {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
    }

    .account-value {
      font-size: 48rpx;
      font-weight: 700;
      color: #fff;
      margin: 12rpx 0;

      &.pending {
        color: #ffeb3b;
      }
    }

    .account-desc {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.6);
    }
  }

  .account-divider {
    width: 1rpx;
    height: 80rpx;
    background: rgba(255, 255, 255, 0.3);
  }
}

.action-bar {
  margin: 0 24rpx 20rpx;

  .withdraw-btn {
    background: #fff;
    border-radius: 12rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx solid #2e7d32;

    .withdraw-text {
      font-size: 30rpx;
      font-weight: 600;
      color: #2e7d32;
    }
  }
}

.tab-bar {
  background: #fff;
  display: flex;
  margin: 0 24rpx;
  border-radius: 16rpx 16rpx 0 0;
  border-bottom: 1rpx solid #f0f0f0;

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28rpx 0;
    position: relative;

    .tab-text {
      font-size: 28rpx;
      color: #666;
    }

    .tab-line {
      position: absolute;
      bottom: 0;
      width: 60rpx;
      height: 4rpx;
      background: #2e7d32;
      border-radius: 2rpx;
    }

    &.active .tab-text {
      color: #2e7d32;
      font-weight: 600;
    }
  }
}

.list-section {
  margin: 0 24rpx 24rpx;
}

.empty-state {
  background: #fff;
  border-radius: 0 0 16rpx 16rpx;
  padding: 80rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

.record-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx 28rpx;
  margin-top: 16rpx;

  .record-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;

    .record-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
    }

    .record-status {
      font-size: 26rpx;

      &.success {
        color: #2e7d32;
      }

      &.pending {
        color: #ff9800;
      }

      &.failed {
        color: #e53935;
      }
    }
  }

  .record-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8rpx 0;

    .record-label {
      font-size: 26rpx;
      color: #666;
    }

    .record-value {
      font-size: 26rpx;
      color: #333;

      &.amount {
        font-weight: 600;
        color: #2e7d32;
      }
    }

    &.total {
      padding-top: 12rpx;
      margin-top: 8rpx;
      border-top: 1rpx solid #f5f5f5;
    }
  }

  .record-time {
    font-size: 22rpx;
    color: #999;
    margin-top: 12rpx;
  }
}

.loading-tip {
  padding: 32rpx 0;
  display: flex;
  justify-content: center;

  .loading-text {
    font-size: 26rpx;
    color: #999;
  }
}
</style>

<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">退款记录</text>
    </view>

    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="switchTab(tab.value)">
        {{ tab.label }}
      </view>
    </view>

    <scroll-view class="content" scroll-y @scrolltolower="loadMore">
      <view v-if="list.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无退款记录</text>
      </view>

      <view v-else class="refund-list">
        <view
          v-for="item in list"
          :key="item.id"
          class="refund-card"
          @click="goDetail(item)">
          <view class="card-header">
            <text class="order-no">订单号：{{ item.orderNo }}</text>
            <text class="status" :class="getStatusClass(item.status)">
              {{ getStatusText(item.status) }}
            </text>
          </view>
          <view class="card-body">
            <view class="info-row">
              <text class="info-label">退款金额</text>
              <text class="info-value amount">¥{{ item.amount?.toFixed(2) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">退款原因</text>
              <text class="info-value reason">{{ item.reason }}</text>
            </view>
          </view>
          <view class="card-footer">
            <text class="time">{{ formatDate(item.createdAt) }}</text>
          </view>
        </view>
      </view>

      <view v-if="loading" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>

      <view class="bottom-placeholder"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getRefundList } from '@/api/refund';

const tabs = [
  { value: '', label: '全部' },
  { value: 'pending', label: '处理中' },
  { value: 'approved', label: '已同意' },
  { value: 'rejected', label: '已拒绝' },
];

const currentTab = ref('');
const list = ref<any[]>([]);
const loading = ref(false);

const statusMap: Record<string, { text: string; class: string }> = {
  pending: { text: '处理中', class: 'status-pending' },
  approved: { text: '已同意', class: 'status-approved' },
  rejected: { text: '已拒绝', class: 'status-rejected' },
};

function getStatusText(status: string) {
  return statusMap[status]?.text || status;
}

function getStatusClass(status: string) {
  return statusMap[status]?.class || '';
}

function goBack() {
  uni.navigateBack();
}

function goDetail(item: any) {
  uni.navigateTo({ url: `/pages/order/detail?id=${item.orderId}` });
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function loadList() {
  loading.value = true;
  try {
    const data = await getRefundList(currentTab.value || undefined);
    list.value = data as any[];
  } catch (e) {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

function switchTab(tab: string) {
  currentTab.value = tab;
  loadList();
}

function loadMore() {}

onMounted(() => {
  loadList();
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

.tab-bar {
  display: flex;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 28rpx 0;
    font-size: 28rpx;
    color: #666;
    position: relative;

    &.active {
      color: #2e7d32;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 48rpx;
        height: 4rpx;
        background: #2e7d32;
        border-radius: 2rpx;
      }
    }
  }
}

.content {
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

.refund-list {
  padding: 20rpx 24rpx;
}

.refund-card {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;

  &:active {
    background: #f9f9f9;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 28rpx;
    border-bottom: 1rpx solid #f5f5f5;

    .order-no {
      font-size: 26rpx;
      color: #666;
    }

    .status {
      font-size: 26rpx;
      font-weight: 500;

      &.status-pending {
        color: #ff9800;
      }

      &.status-approved {
        color: #2e7d32;
      }

      &.status-rejected {
        color: #e53935;
      }
    }
  }

  .card-body {
    padding: 20rpx 28rpx;

    .info-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 8rpx 0;

      .info-label {
        font-size: 28rpx;
        color: #666;
        flex-shrink: 0;
      }

      .info-value {
        font-size: 28rpx;
        color: #333;
        text-align: right;
        margin-left: 24rpx;
        flex: 1;

        &.amount {
          color: #e53935;
          font-weight: 600;
        }

        &.reason {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
    }
  }

  .card-footer {
    padding: 16rpx 28rpx;
    background: #fafafa;

    .time {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.loading-more {
  padding: 32rpx;
  text-align: center;

  .loading-text {
    font-size: 26rpx;
    color: #999;
  }
}

.bottom-placeholder {
  height: 40rpx;
}
</style>

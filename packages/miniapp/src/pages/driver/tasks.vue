<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">我的任务</text>
      <view class="nav-placeholder"></view>
    </view>

    <view class="tab-bar">
      <view class="tab-list">
        <view
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: currentTab === tab.value }"
          @click="switchTab(tab.value)">
          <text class="tab-text">{{ tab.label }}</text>
          <view v-if="currentTab === tab.value" class="tab-underline"></view>
        </view>
      </view>
    </view>

    <scroll-view
      v-if="taskList.length > 0"
      class="task-scroll"
      scroll-y>
      <view
        v-for="item in taskList"
        :key="item.id"
        class="task-card">
        <view class="card-header">
          <text class="order-no">订单号：{{ item.order?.orderNo || '---' }}</text>
          <view class="status-tag" :class="getStatusClass(item.status)">
            {{ getStatusText(item.status) }}
          </view>
        </view>

        <view class="address-section">
          <view class="address-row pickup">
            <view class="dot pickup-dot"></view>
            <view class="address-info">
              <text class="address-label">取货地址</text>
              <text class="address-text">{{ item.pickupAddress || '供应商仓库' }}</text>
            </view>
          </view>
          <view class="address-line"></view>
          <view class="address-row delivery">
            <view class="dot delivery-dot"></view>
            <view class="address-info">
              <text class="address-label">送货地址</text>
              <text class="address-text">{{ item.deliveryAddress || '---' }}</text>
            </view>
          </view>
        </view>

        <view v-if="currentTab === 'delivering'" class="receiver-section">
          <text class="receiver-label">收货人电话：</text>
          <text class="receiver-phone">{{ item.order?.receiverPhone || '---' }}</text>
        </view>

        <view v-if="currentTab === 'completed'" class="completed-info">
          <view class="info-row">
            <text class="info-label">收入</text>
            <text class="info-value fee">¥{{ item.fee?.toFixed(2) || '0.00' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">完成时间</text>
            <text class="info-value">{{ formatTime(item.deliveredAt) }}</text>
          </view>
        </view>

        <view v-if="currentTab !== 'completed'" class="card-footer">
          <view v-if="currentTab === 'accepted'" class="action-btn pickup-btn" @click="handlePickUp(item)">
            确认取货
          </view>
          <view v-if="currentTab === 'picked_up'" class="action-btn deliver-btn" @click="handleDeliver(item)">
            确认送达
          </view>
        </view>
      </view>
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <view v-else-if="!loading" class="empty-state">
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无{{ getCurrentTabLabel() }}任务</text>
    </view>

    <view v-else class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMyDeliveries, markPickedUp, markDelivered } from '@/api/delivery';

const tabs = [
  { value: 'accepted', label: '待取货' },
  { value: 'picked_up', label: '配送中' },
  { value: 'delivered', label: '已完成' },
];

const currentTab = ref('accepted');
const taskList = ref<any[]>([]);
const loading = ref(false);

const statusMap: Record<string, { text: string; class: string }> = {
  accepted: { text: '待取货', class: 'status-accepted' },
  picked_up: { text: '配送中', class: 'status-picked' },
  delivered: { text: '已完成', class: 'status-delivered' },
};

function goBack() {
  uni.navigateBack();
}

function getStatusText(status: string) {
  return statusMap[status]?.text || status;
}

function getStatusClass(status: string) {
  return statusMap[status]?.class || '';
}

function getCurrentTabLabel() {
  return tabs.find(t => t.value === currentTab.value)?.label || '';
}

function formatTime(time: string) {
  if (!time) return '---';
  const d = new Date(time);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function switchTab(value: string) {
  if (currentTab.value === value) return;
  currentTab.value = value;
  taskList.value = [];
  loadTasks();
}

async function loadTasks() {
  loading.value = true;
  try {
    const data = await getMyDeliveries(currentTab.value);
    taskList.value = data || [];
  } catch (e) {
    console.error('加载任务失败', e);
  } finally {
    loading.value = false;
  }
}

async function handlePickUp(item: any) {
  uni.showModal({
    title: '提示',
    content: '确认已取货吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await markPickedUp(item.id);
          uni.showToast({ title: '已确认取货', icon: 'success' });
          loadTasks();
        } catch (e) {}
      }
    },
  });
}

async function handleDeliver(item: any) {
  uni.showModal({
    title: '提示',
    content: '确认已送达吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await markDelivered(item.id);
          uni.showToast({ title: '已确认送达', icon: 'success' });
          loadTasks();
        } catch (e) {}
      }
    },
  });
}

onMounted(() => {
  loadTasks();
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
  }

  .nav-placeholder {
    width: 60rpx;
  }
}

.tab-bar {
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;

  .tab-list {
    display: flex;

    .tab-item {
      position: relative;
      flex: 1;
      padding: 24rpx 0;
      text-align: center;

      .tab-text {
        font-size: 28rpx;
        color: #666;
      }

      &.active .tab-text {
        color: #2e7d32;
        font-weight: 600;
      }

      .tab-underline {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background: #2e7d32;
        border-radius: 2rpx;
      }
    }
  }
}

.task-scroll {
  flex: 1;
}

.task-card {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  overflow: hidden;

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

    .status-tag {
      font-size: 24rpx;
      font-weight: 500;
      padding: 6rpx 16rpx;
      border-radius: 20rpx;

      &.status-accepted {
        color: #ff9800;
        background: #fff3e0;
      }

      &.status-picked {
        color: #2196f3;
        background: #e3f2fd;
      }

      &.status-delivered {
        color: #2e7d32;
        background: #e8f5e9;
      }
    }
  }

  .address-section {
    padding: 20rpx 28rpx;

    .address-row {
      display: flex;
      align-items: flex-start;

      .dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        margin-top: 8rpx;
        margin-right: 16rpx;
        flex-shrink: 0;

        &.pickup-dot {
          background: #2e7d32;
        }

        &.delivery-dot {
          background: #ff9800;
        }
      }

      .address-info {
        flex: 1;
        display: flex;
        flex-direction: column;

        .address-label {
          font-size: 22rpx;
          color: #999;
          margin-bottom: 4rpx;
        }

        .address-text {
          font-size: 28rpx;
          color: #333;
          line-height: 1.4;
        }
      }

      &.pickup {
        padding-bottom: 12rpx;
      }

      &.delivery {
        padding-top: 12rpx;
      }
    }

    .address-line {
      width: 2rpx;
      height: 24rpx;
      background: #e0e0e0;
      margin-left: 7rpx;
    }
  }

  .receiver-section {
    display: flex;
    align-items: center;
    padding: 16rpx 28rpx;
    border-top: 1rpx solid #f5f5f5;

    .receiver-label {
      font-size: 26rpx;
      color: #999;
    }

    .receiver-phone {
      font-size: 28rpx;
      color: #2e7d32;
      font-weight: 500;
    }
  }

  .completed-info {
    padding: 16rpx 28rpx;
    border-top: 1rpx solid #f5f5f5;

    .info-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8rpx 0;

      .info-label {
        font-size: 26rpx;
        color: #999;
      }

      .info-value {
        font-size: 28rpx;
        color: #333;

        &.fee {
          color: #e53935;
          font-weight: 700;
          font-size: 32rpx;
        }
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: flex-end;
    padding: 20rpx 28rpx;
    border-top: 1rpx solid #f5f5f5;

    .action-btn {
      padding: 16rpx 48rpx;
      border-radius: 32rpx;
      font-size: 28rpx;
      font-weight: 500;

      &.pickup-btn {
        background: #2e7d32;
        color: #fff;
      }

      &.deliver-btn {
        background: #2e7d32;
        color: #fff;
      }

      &:active {
        opacity: 0.85;
      }
    }
  }
}

.bottom-placeholder {
  height: 40rpx;
}

.empty-state,
.loading-state {
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

  .empty-text,
  .loading-text {
    font-size: 30rpx;
    color: #999;
  }
}
</style>

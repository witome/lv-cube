<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">消息中心</text>
      <view class="nav-action" @click="handleMarkAllRead">
        <text class="action-text">全部已读</text>
      </view>
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
      <view v-if="filteredList.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">💬</text>
        <text class="empty-text">暂无消息</text>
      </view>

      <view v-else class="message-list">
        <view
          v-for="item in filteredList"
          :key="item.id"
          class="message-item"
          @click="handleRead(item)">
          <view class="message-left">
            <view class="message-icon" :class="getTypeClass(item.type)">
              {{ getTypeIcon(item.type) }}
            </view>
            <view v-if="!item.isRead" class="unread-dot"></view>
          </view>
          <view class="message-content">
            <view class="message-header">
              <text class="message-title">{{ item.title }}</text>
              <text class="message-time">{{ formatTime(item.createdAt) }}</text>
            </view>
            <text class="message-summary">{{ item.content }}</text>
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
import { ref, computed, onMounted } from 'vue';
import { getMessageList, markMessageRead, markAllMessagesRead } from '@/api/message';

const tabs = [
  { value: '', label: '全部' },
  { value: 'order', label: '订单' },
  { value: 'payment', label: '支付' },
  { value: 'settlement', label: '结算' },
  { value: 'delivery', label: '配送' },
  { value: 'system', label: '系统' },
];

const currentTab = ref('');
const list = ref<any[]>([]);
const loading = ref(false);

const filteredList = computed(() => {
  if (!currentTab.value) return list.value;
  return list.value.filter((item) => item.type === currentTab.value);
});

const typeIconMap: Record<string, string> = {
  order: '📋',
  payment: '💰',
  settlement: '💳',
  delivery: '🚚',
  system: '🔔',
};

function getTypeIcon(type: string) {
  return typeIconMap[type] || '📬';
}

function getTypeClass(type: string) {
  return `type-${type}`;
}

function goBack() {
  uni.navigateBack();
}

function formatTime(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (isToday) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function handleRead(item: any) {
  if (!item.isRead) {
    try {
      await markMessageRead(item.id);
      item.isRead = true;
    } catch (e) {}
  }
}

async function handleMarkAllRead() {
  try {
    await markAllMessagesRead();
    list.value.forEach((item) => {
      item.isRead = true;
    });
    uni.showToast({ title: '已全部标记已读', icon: 'success' });
  } catch (e) {}
}

async function loadList() {
  loading.value = true;
  try {
    const data = await getMessageList(1, 50);
    list.value = data as any[];
  } catch (e) {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

function switchTab(tab: string) {
  currentTab.value = tab;
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
  }

  .nav-action {
    width: 60rpx;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .action-text {
      font-size: 26rpx;
      color: #2e7d32;
      white-space: nowrap;
    }
  }
}

.tab-bar {
  display: flex;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  overflow-x: auto;

  .tab-item {
    flex-shrink: 0;
    padding: 28rpx 32rpx;
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

.message-list {
  background: #fff;
}

.message-item {
  display: flex;
  align-items: flex-start;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:active {
    background: #f9f9f9;
  }

  .message-left {
    position: relative;
    margin-right: 20rpx;

    .message-icon {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36rpx;
      background: #e8f5e9;

      &.type-order {
        background: #e3f2fd;
      }

      &.type-payment {
        background: #fff3e0;
      }

      &.type-settlement {
        background: #f3e5f5;
      }

      &.type-delivery {
        background: #e0f2f1;
      }

      &.type-system {
        background: #e8f5e9;
      }
    }

    .unread-dot {
      position: absolute;
      top: -4rpx;
      right: -4rpx;
      width: 16rpx;
      height: 16rpx;
      background: #e53935;
      border-radius: 50%;
    }
  }

  .message-content {
    flex: 1;
    min-width: 0;

    .message-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8rpx;

      .message-title {
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        margin-right: 16rpx;
      }

      .message-time {
        font-size: 24rpx;
        color: #999;
        flex-shrink: 0;
      }
    }

    .message-summary {
      font-size: 26rpx;
      color: #666;
      line-height: 1.5;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
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

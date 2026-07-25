<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">附近抢单</text>
      <view class="nav-refresh" @click="loadPool">
        <text class="refresh-icon" :class="{ spinning: loading }">↻</text>
      </view>
    </view>

    <scroll-view
      v-if="poolList.length > 0"
      class="pool-scroll"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh">
      <view
        v-for="item in poolList"
        :key="item.id"
        class="pool-card">
        <view class="card-header">
          <text class="order-no">订单号：{{ item.order?.orderNo || '---' }}</text>
          <text class="distance">{{ item.distance ? item.distance + 'km' : '附近' }}</text>
        </view>

        <view class="address-section">
          <view class="address-row pickup">
            <view class="dot pickup-dot"></view>
            <view class="address-info">
              <text class="address-label">取货</text>
              <text class="address-text">{{ item.pickupAddress || '供应商仓库' }}</text>
            </view>
          </view>
          <view class="address-line"></view>
          <view class="address-row delivery">
            <view class="dot delivery-dot"></view>
            <view class="address-info">
              <text class="address-label">送货</text>
              <text class="address-text">{{ item.deliveryAddress || '---' }}</text>
            </view>
          </view>
        </view>

        <view class="card-footer">
          <view class="fee-info">
            <text class="fee-label">预估收入</text>
            <text class="fee-value">¥{{ item.fee?.toFixed(2) || '0.00' }}</text>
          </view>
          <view class="grab-btn" @click="handleGrab(item)">
            立即抢单
          </view>
        </view>
      </view>
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <view v-else-if="!loading" class="empty-state">
      <text class="empty-icon">📦</text>
      <text class="empty-text">暂无抢单任务</text>
      <text class="empty-tip">下拉刷新获取最新订单</text>
    </view>

    <view v-else class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getDeliveryPool, acceptDelivery } from '@/api/delivery';

const poolList = ref<any[]>([]);
const loading = ref(false);
const refreshing = ref(false);

function goBack() {
  uni.navigateBack();
}

async function loadPool() {
  loading.value = true;
  try {
    const data = await getDeliveryPool();
    poolList.value = data || [];
  } catch (e) {
    console.error('加载抢单池失败', e);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

function onRefresh() {
  refreshing.value = true;
  loadPool();
}

async function handleGrab(item: any) {
  uni.showModal({
    title: '提示',
    content: '确定抢这个订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await acceptDelivery(item.id);
          uni.showToast({ title: '抢单成功', icon: 'success' });
          loadPool();
        } catch (e) {}
      }
    },
  });
}

onMounted(() => {
  loadPool();
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

  .nav-refresh {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .refresh-icon {
      font-size: 36rpx;
      color: #2e7d32;

      &.spinning {
        animation: spin 1s linear infinite;
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.pool-scroll {
  flex: 1;
}

.pool-card {
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

    .distance {
      font-size: 24rpx;
      color: #2e7d32;
      background: #e8f5e9;
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
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

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 28rpx;
    border-top: 1rpx solid #f5f5f5;

    .fee-info {
      display: flex;
      align-items: baseline;
      gap: 8rpx;

      .fee-label {
        font-size: 24rpx;
        color: #999;
      }

      .fee-value {
        font-size: 36rpx;
        font-weight: 700;
        color: #e53935;
      }
    }

    .grab-btn {
      padding: 16rpx 40rpx;
      background: #2e7d32;
      color: #fff;
      font-size: 28rpx;
      font-weight: 500;
      border-radius: 32rpx;

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

  .empty-text {
    font-size: 30rpx;
    color: #999;
    margin-bottom: 12rpx;
  }

  .empty-tip {
    font-size: 24rpx;
    color: #bbb;
  }

  .loading-text {
    font-size: 30rpx;
    color: #999;
  }
}
</style>

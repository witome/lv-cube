<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">我的订单</text>
    </view>

    <view class="tab-bar">
      <scroll-view class="tab-scroll" scroll-x>
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
      </scroll-view>
    </view>

    <scroll-view
      v-if="orderList.length > 0"
      class="order-scroll"
      scroll-y
      @scrolltolower="loadMore">
      <view
        v-for="order in orderList"
        :key="order.id"
        class="order-card"
        @click="goDetail(order.id)">
        <view class="order-header">
          <text class="order-no">订单号：{{ order.orderNo }}</text>
          <view class="order-status" :class="getStatusClass(order.status)">
            {{ getStatusText(order.status) }}
          </view>
        </view>

        <view class="order-products">
          <view
            v-for="(item, idx) in order.orderItems?.slice(0, 3)"
            :key="idx"
            class="product-item">
            <image
              class="product-image"
              :src="placeholderImg"
              mode="aspectFill" />
            <view class="product-info">
              <text class="product-name">{{ item.productName }}</text>
              <text class="product-spec">{{ item.skuName }}</text>
              <view class="product-bottom">
                <text class="product-price">¥{{ item.price?.toFixed(2) }}</text>
                <text class="product-qty">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>
          <view
            v-if="order.orderItems && order.orderItems.length > 3"
            class="more-products">
            共 {{ order.orderItems.length }} 件商品
          </view>
        </view>

        <view class="order-footer">
          <text class="order-amount">
            实付：<text class="amount-value">¥{{ order.actualAmount?.toFixed(2) }}</text>
          </text>
          <view class="order-actions">
            <view
              v-if="canCancel(order.status)"
              class="action-btn cancel"
              @click.stop="handleCancel(order)">
              取消订单
            </view>
            <view
              v-if="canConfirm(order.status)"
              class="action-btn confirm"
              @click.stop="handleConfirm(order)">
              确认收货
            </view>
            <view class="action-btn detail" @click.stop="goDetail(order.id)">
              查看详情
            </view>
          </view>
        </view>
      </view>
      <view v-if="loading" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>
      <view v-if="!hasMore && orderList.length > 0" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <view v-else-if="!loading" class="empty-state">
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无订单</text>
      <button class="go-shop-btn" @click="goHome">去逛逛</button>
    </view>

    <view v-else class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getBuyerOrders, cancelOrder, confirmOrder } from '@/api/order';

const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7nlJ/npL7lj4rlkI08L3RleHQ+PC9zdmc+';

const tabs = [
  { value: '', label: '全部' },
  { value: 'pending_accept', label: '待接单' },
  { value: 'preparing', label: '备货中' },
  { value: 'delivering', label: '配送中' },
  { value: 'waiting_confirm', label: '待收货' },
  { value: 'completed', label: '已完成' },
];

const currentTab = ref('');
const orderList = ref<any[]>([]);
const page = ref(1);
const pageSize = 10;
const loading = ref(false);
const hasMore = ref(true);

const statusMap: Record<string, { text: string; class: string }> = {
  pending_accept: { text: '待接单', class: 'status-pending' },
  preparing: { text: '备货中', class: 'status-preparing' },
  delivering: { text: '配送中', class: 'status-delivering' },
  waiting_confirm: { text: '待收货', class: 'status-waiting' },
  completed: { text: '已完成', class: 'status-completed' },
  cancelled: { text: '已取消', class: 'status-cancelled' },
};

function getStatusText(status: string) {
  return statusMap[status]?.text || status;
}

function getStatusClass(status: string) {
  return statusMap[status]?.class || '';
}

function canCancel(status: string) {
  return ['pending_accept', 'preparing'].includes(status);
}

function canConfirm(status: string) {
  return ['delivering', 'waiting_confirm'].includes(status);
}

function goBack() {
  uni.navigateBack();
}

function goHome() {
  uni.switchTab({ url: '/pages/index/index' });
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/order/detail?id=${id}` });
}

function switchTab(value: string) {
  if (currentTab.value === value) return;
  currentTab.value = value;
  page.value = 1;
  orderList.value = [];
  hasMore.value = true;
  loadOrders();
}

async function loadOrders() {
  if (loading.value) return;
  loading.value = true;
  try {
    const params: any = { page: page.value, pageSize };
    if (currentTab.value) params.status = currentTab.value;
    const data = await getBuyerOrders(params);
    if (data?.list) {
      if (page.value === 1) {
        orderList.value = data.list;
      } else {
        orderList.value = [...orderList.value, ...data.list];
      }
      hasMore.value = data.list.length >= pageSize;
    }
  } catch (e) {
    console.error('加载订单失败', e);
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) return;
  page.value++;
  loadOrders();
}

async function handleCancel(order: any) {
  uni.showModal({
    title: '提示',
    content: '确定取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelOrder(order.id, '用户取消');
          uni.showToast({ title: '已取消', icon: 'success' });
          page.value = 1;
          orderList.value = [];
          loadOrders();
        } catch (e) {}
      }
    },
  });
}

async function handleConfirm(order: any) {
  uni.showModal({
    title: '提示',
    content: '确定已收到货物吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await confirmOrder(order.id);
          uni.showToast({ title: '已确认收货', icon: 'success' });
          page.value = 1;
          orderList.value = [];
          loadOrders();
        } catch (e) {}
      }
    },
  });
}

onMounted(() => {
  loadOrders();
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
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;

  .tab-scroll {
    white-space: nowrap;
  }

  .tab-list {
    display: inline-flex;
    padding: 0 12rpx;

    .tab-item {
      position: relative;
      padding: 24rpx 24rpx;

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

.order-scroll {
  flex: 1;
}

.order-card {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  overflow: hidden;

  .order-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 28rpx;
    border-bottom: 1rpx solid #f5f5f5;

    .order-no {
      font-size: 26rpx;
      color: #666;
    }

    .order-status {
      font-size: 26rpx;
      font-weight: 500;

      &.status-pending {
        color: #ff9800;
      }

      &.status-preparing {
        color: #2196f3;
      }

      &.status-delivering {
        color: #9c27b0;
      }

      &.status-waiting {
        color: #ff5722;
      }

      &.status-completed {
        color: #2e7d32;
      }

      &.status-cancelled {
        color: #999;
      }
    }
  }

  .order-products {
    padding: 16rpx 28rpx;

    .product-item {
      display: flex;
      padding: 12rpx 0;

      .product-image {
        width: 120rpx;
        height: 120rpx;
        border-radius: 8rpx;
        background: #f0f0f0;
        flex-shrink: 0;
      }

      .product-info {
        flex: 1;
        margin-left: 20rpx;
        display: flex;
        flex-direction: column;

        .product-name {
          font-size: 26rpx;
          color: #333;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        .product-spec {
          font-size: 22rpx;
          color: #999;
          margin-top: 6rpx;
        }

        .product-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;

          .product-price {
            font-size: 26rpx;
            color: #333;
          }

          .product-qty {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
    }

    .more-products {
      text-align: center;
      font-size: 24rpx;
      color: #999;
      padding: 12rpx 0;
    }
  }

  .order-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 28rpx;
    border-top: 1rpx solid #f5f5f5;

    .order-amount {
      font-size: 26rpx;
      color: #666;

      .amount-value {
        font-size: 32rpx;
        font-weight: 700;
        color: #e53935;
      }
    }

    .order-actions {
      display: flex;
      gap: 16rpx;

      .action-btn {
        padding: 12rpx 28rpx;
        border-radius: 28rpx;
        font-size: 26rpx;

        &.cancel {
          border: 1rpx solid #ccc;
          color: #666;
        }

        &.confirm {
          background: #2e7d32;
          color: #fff;
        }

        &.detail {
          border: 1rpx solid #2e7d32;
          color: #2e7d32;
        }
      }
    }
  }
}

.loading-more,
.no-more {
  text-align: center;
  padding: 24rpx;

  .loading-text,
  .no-more-text {
    font-size: 24rpx;
    color: #999;
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
</style>

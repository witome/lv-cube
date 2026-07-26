<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">订单详情</text>
    </view>

    <scroll-view v-if="order" class="content" scroll-y>
      <view class="timeline-section">
        <view class="status-banner" :class="getStatusClass(order.status)">
          <text class="status-text">{{ getStatusText(order.status) }}</text>
        </view>
        <view class="timeline">
          <view
            v-for="(step, idx) in timelineSteps"
            :key="step.value"
            class="timeline-item"
            :class="{ active: isStepActive(step.value, idx), done: isStepDone(step.value, idx) }">
            <view class="timeline-dot"></view>
            <view class="timeline-content">
              <text class="timeline-label">{{ step.label }}</text>
            </view>
            <view v-if="idx < timelineSteps.length - 1" class="timeline-line"></view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">买家信息</view>
        <view class="buyer-detail">
          <view class="buyer-row">
            <text class="buyer-label">昵称</text>
            <text class="buyer-value">{{ order.buyer?.nickname || '未知用户' }}</text>
          </view>
          <view class="buyer-row" @click="handleCallBuyer">
            <text class="buyer-label">联系电话</text>
            <view class="buyer-phone-wrap">
              <text class="buyer-value phone">{{ order.buyer?.phone || '-' }}</text>
              <text class="phone-icon">📞</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-card address-section">
        <view class="section-icon">📍</view>
        <view class="address-content">
          <view class="address-row">
            <text class="address-name">{{ order.receiverName }}</text>
            <text class="address-phone">{{ order.receiverPhone }}</text>
          </view>
          <text class="address-detail">
            {{ order.receiverProvince }}{{ order.receiverCity }}{{ order.receiverDistrict }}{{ order.receiverDetail }}
          </text>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">商品清单</view>
        <view
          v-for="(item, idx) in order.orderItems"
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
              <view class="product-qty-wrap">
                <text class="product-qty">x{{ item.quantity }}</text>
                <text class="product-subtotal">¥{{ item.subtotal?.toFixed(2) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">配送信息</view>
        <view class="info-row">
          <text class="info-label">配送时效</text>
          <text class="info-value">{{ getDeliveryText(order.deliveryTimeType) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">预计送达</text>
          <text class="info-value">{{ getExpectedTime(order.deliveryTimeType) }}</text>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">订单信息</view>
        <view class="info-row">
          <text class="info-label">订单号</text>
          <text class="info-value">{{ order.orderNo }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">下单时间</text>
          <text class="info-value">{{ formatDate(order.createdAt) }}</text>
        </view>
        <view v-if="order.remark" class="info-row">
          <text class="info-label">买家备注</text>
          <text class="info-value">{{ order.remark }}</text>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">费用明细</view>
        <view class="fee-row">
          <text class="fee-label">商品金额</text>
          <text class="fee-value">¥{{ order.totalAmount?.toFixed(2) }}</text>
        </view>
        <view class="fee-row">
          <text class="fee-label">运费</text>
          <text class="fee-value" :class="{ free: order.deliveryFee === 0 }">
            {{ order.deliveryFee === 0 ? '免运费' : `¥${order.deliveryFee?.toFixed(2)}` }}
          </text>
        </view>
        <view class="fee-divider"></view>
        <view class="fee-row total">
          <text class="fee-label">实付</text>
          <text class="fee-value total-price">¥{{ order.actualAmount?.toFixed(2) }}</text>
        </view>
      </view>

      <view class="bottom-placeholder"></view>
    </scroll-view>

    <view v-if="order" class="bottom-bar">
      <view
        v-if="order.status === 'pending_accept'"
        class="action-btn reject"
        @click="handleReject">
        拒单
      </view>
      <view
        v-if="order.status === 'pending_accept'"
        class="action-btn accept"
        @click="handleAccept">
        接单
      </view>
      <view
        v-if="order.status === 'preparing'"
        class="action-btn ship"
        @click="handleShip">
        发平台派单
      </view>
    </view>

    <view v-if="!order && !showDriverModal" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getOrderDetail, acceptOrder, rejectOrder, shipOrder } from '@/api/order';

const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7nlJ/npL7lj4rlkI08L3RleHQ+PC9zdmc+';

const order = ref<any>(null);

const timelineSteps = [
  { value: 'pending_accept', label: '待接单' },
  { value: 'preparing', label: '备货中' },
  { value: 'delivering', label: '配送中' },
  { value: 'waiting_confirm', label: '待收货' },
  { value: 'completed', label: '已完成' },
];

const statusOrder = ['pending_accept', 'preparing', 'delivering', 'waiting_confirm', 'completed'];

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

function isStepActive(stepValue: string, idx: number) {
  if (!order.value) return false;
  const currentIdx = statusOrder.indexOf(order.value.status);
  return currentIdx === idx;
}

function isStepDone(stepValue: string, idx: number) {
  if (!order.value) return false;
  const currentIdx = statusOrder.indexOf(order.value.status);
  return idx < currentIdx;
}

function getDeliveryText(type: string) {
  const map: Record<string, string> = {
    same_day: '当日达',
    next_day: '次日达',
    scheduled: '定时达',
  };
  return map[type] || type;
}

function getExpectedTime(type: string) {
  const map: Record<string, string> = {
    same_day: '今日送达',
    next_day: '明日送达',
    scheduled: '约定时间送达',
  };
  return map[type] || '';
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function goBack() {
  uni.navigateBack();
}

async function loadDetail() {
  const pages = getCurrentPages();
  const currentPage: any = pages[pages.length - 1];
  const options = currentPage?.options || {};
  const id = options.id;
  if (!id) {
    uni.showToast({ title: '订单不存在', icon: 'none' });
    return;
  }
  try {
    const data = await getOrderDetail(Number(id));
    order.value = data;
  } catch (e) {
    console.error('加载订单详情失败', e);
  }
}

async function handleAccept() {
  uni.showModal({
    title: '提示',
    content: '确定接单吗？',
    success: async (res) => {
      if (res.confirm && order.value) {
        try {
          await acceptOrder(order.value.id);
          uni.showToast({ title: '已接单', icon: 'success' });
          loadDetail();
        } catch (e) {}
      }
    },
  });
}

function handleReject() {
  uni.showModal({
    title: '拒单原因',
    editable: true,
    placeholderText: '请输入拒单原因',
    success: async (res) => {
      if (res.confirm && res.content && order.value) {
        try {
          await rejectOrder(order.value.id, res.content);
          uni.showToast({ title: '已拒单', icon: 'success' });
          loadDetail();
        } catch (e) {}
      } else if (res.confirm && !res.content) {
        uni.showToast({ title: '请输入拒单原因', icon: 'none' });
      }
    },
  });
}

async function handleShip() {
  uni.showModal({
    title: '提示',
    content: '确定发平台派单吗？',
    success: async (res) => {
      if (res.confirm && order.value) {
        try {
          await shipOrder(order.value.id);
          uni.showToast({ title: '已发货，平台派单中', icon: 'success' });
          loadDetail();
        } catch (e) {}
      }
    },
  });
}

function handleCallBuyer() {
  const phone = order.value?.buyer?.phone;
  if (phone) {
    uni.showModal({
      title: '联系买家',
      content: `是否拨打 ${phone}？`,
      success: (res) => {
        if (res.confirm) {
          uni.makePhoneCall({ phoneNumber: phone });
        }
      },
    });
  } else {
    uni.showToast({ title: '暂无联系方式', icon: 'none' });
  }
}

onMounted(() => {
  loadDetail();
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

.timeline-section {
  background: #fff;
  margin-bottom: 20rpx;

  .status-banner {
    padding: 40rpx 32rpx;

    &.status-pending {
      background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
    }

    &.status-preparing {
      background: linear-gradient(135deg, #2196f3 0%, #64b5f6 100%);
    }

    &.status-delivering {
      background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%);
    }

    &.status-waiting {
      background: linear-gradient(135deg, #ff5722 0%, #ff8a65 100%);
    }

    &.status-completed {
      background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
    }

    &.status-cancelled {
      background: linear-gradient(135deg, #757575 0%, #9e9e9e 100%);
    }

    .status-text {
      font-size: 36rpx;
      font-weight: 600;
      color: #fff;
    }
  }

  .timeline {
    padding: 24rpx 32rpx;
    position: relative;

    .timeline-item {
      display: flex;
      align-items: flex-start;
      position: relative;
      padding-bottom: 32rpx;

      &:last-child {
        padding-bottom: 0;
      }

      .timeline-dot {
        width: 20rpx;
        height: 20rpx;
        border-radius: 50%;
        background: #e0e0e0;
        margin-top: 6rpx;
        flex-shrink: 0;
        z-index: 1;
      }

      .timeline-content {
        margin-left: 20rpx;
        flex: 1;

        .timeline-label {
          font-size: 28rpx;
          color: #999;
        }
      }

      .timeline-line {
        position: absolute;
        left: 9rpx;
        top: 32rpx;
        bottom: 0;
        width: 2rpx;
        background: #e0e0e0;
      }

      &.done {
        .timeline-dot {
          background: #2e7d32;
        }

        .timeline-content .timeline-label {
          color: #2e7d32;
        }

        .timeline-line {
          background: #2e7d32;
        }
      }

      &.active {
        .timeline-dot {
          background: #2e7d32;
          width: 24rpx;
          height: 24rpx;
          margin-top: 4rpx;
          margin-left: -2rpx;
        }

        .timeline-content .timeline-label {
          color: #2e7d32;
          font-weight: 600;
        }
      }
    }
  }
}

.section-card {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  padding: 28rpx;

  &.address-section {
    display: flex;
    align-items: flex-start;

    .section-icon {
      font-size: 40rpx;
      margin-right: 16rpx;
      flex-shrink: 0;
    }

    .address-content {
      flex: 1;

      .address-row {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;

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
  }

  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.buyer-detail {
  .buyer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12rpx 0;

    .buyer-label {
      font-size: 28rpx;
      color: #666;
      flex-shrink: 0;
    }

    .buyer-value {
      font-size: 28rpx;
      color: #333;

      &.phone {
        color: #2e7d32;
      }
    }

    .buyer-phone-wrap {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .phone-icon {
        font-size: 28rpx;
      }
    }
  }
}

.product-item {
  display: flex;
  padding: 16rpx 0;

  &:not(:last-child) {
    border-bottom: 1rpx solid #f5f5f5;
  }

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

      .product-qty-wrap {
        text-align: right;

        .product-qty {
          font-size: 24rpx;
          color: #999;
          display: block;
        }

        .product-subtotal {
          font-size: 26rpx;
          color: #333;
          font-weight: 500;
        }
      }
    }
  }
}

.info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12rpx 0;

  .info-label {
    font-size: 28rpx;
    color: #666;
    flex-shrink: 0;
  }

  .info-value {
    font-size: 28rpx;
    color: #333;
    text-align: right;
    flex: 1;
    margin-left: 24rpx;
    word-break: break-all;
  }
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

.fee-divider {
  height: 1rpx;
  background: #f0f0f0;
  margin: 12rpx 0;
}

.bottom-placeholder {
  height: 140rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f0f0f0;

  .action-btn {
    padding: 16rpx 36rpx;
    border-radius: 32rpx;
    font-size: 28rpx;

    &.reject {
      border: 1rpx solid #e53935;
      color: #e53935;
    }

    &.accept {
      background: #2e7d32;
      color: #fff;
    }

    &.ship {
      background: #2e7d32;
      color: #fff;
    }

    &.assign-driver {
      border: 1rpx solid #2e7d32;
      color: #2e7d32;
      background: #fff;
    }
  }
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .modal-content {
    width: 600rpx;
    max-height: 80vh;
    background: #fff;
    border-radius: 20rpx;
    padding: 40rpx;
    display: flex;
    flex-direction: column;

    .modal-title {
      font-size: 34rpx;
      font-weight: 600;
      color: #333;
      text-align: center;
      margin-bottom: 32rpx;
    }

    .driver-list {
      max-height: 500rpx;
      margin-bottom: 24rpx;

      .driver-option {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24rpx;
        border-radius: 12rpx;
        border: 2rpx solid #f0f0f0;
        margin-bottom: 16rpx;

        &.selected {
          border-color: #2e7d32;
          background: #e8f5e9;
        }

        .driver-opt-info {
          .driver-opt-name {
            font-size: 30rpx;
            font-weight: 600;
            color: #333;
            display: block;
          }

          .driver-opt-phone {
            font-size: 26rpx;
            color: #666;
            margin-top: 6rpx;
            display: block;
          }
        }

        .driver-check {
          width: 44rpx;
          height: 44rpx;
          border-radius: 50%;
          background: #2e7d32;
          color: #fff;
          font-size: 28rpx;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .driver-empty {
      padding: 60rpx 0;
      text-align: center;

      .empty-text {
        font-size: 28rpx;
        color: #999;
      }
    }

    .modal-actions {
      display: flex;
      gap: 24rpx;

      .modal-btn {
        flex: 1;
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        border-radius: 40rpx;
        font-size: 28rpx;

        &.cancel {
          background: #f5f5f5;
          color: #666;
        }

        &.confirm {
          background: #2e7d32;
          color: #fff;
        }
      }
    }
  }
}

.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  .loading-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>

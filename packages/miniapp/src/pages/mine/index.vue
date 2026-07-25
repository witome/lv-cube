<template>
  <view class="container">
    <view class="header">
      <view v-if="userStore.isLoggedIn" class="user-info">
        <view class="avatar">
          {{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}
        </view>
        <view class="user-detail">
          <view class="nickname">{{ userStore.userInfo?.nickname || '用户' }}</view>
          <view class="phone">{{ userStore.userInfo?.phone || '' }}</view>
        </view>
      </view>
      <view v-else class="user-info">
        <view class="avatar">?</view>
        <view class="user-detail">
          <view class="nickname">未登录</view>
          <button class="login-btn" @click="goLogin">去登录</button>
        </view>
      </view>
    </view>

    <view v-if="userStore.isLoggedIn" class="role-section">
      <view class="section-title">角色切换</view>
      <view class="role-list">
        <view
          v-for="role in roles" :key="role.value"
          class="role-item" :class="{ active: userStore.currentRole === role.value }"
          @click="handleSwitchRole(role.value)">
          <view class="role-icon">{{ role.icon }}</view>
          <view class="role-name">{{ role.label }}</view>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-item" @click="goMessage">
        <view class="menu-icon-wrap">
          <view class="menu-icon">💬</view>
          <view v-if="unreadCount > 0" class="unread-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
        </view>
        <view class="menu-text">消息中心</view>
        <view class="menu-arrow">›</view>
      </view>
      <view v-if="userStore.isLoggedIn && userStore.currentRole === 'supplier'" class="menu-item" @click="goOrderList">
        <view class="menu-icon">📋</view>
        <view class="menu-text">订单管理</view>
        <view class="menu-arrow">›</view>
      </view>
      <view v-if="userStore.isLoggedIn && userStore.currentRole === 'supplier'" class="menu-item" @click="goProductList">
        <view class="menu-icon">📦</view>
        <view class="menu-text">商品管理</view>
        <view class="menu-arrow">›</view>
      </view>
      <view v-if="userStore.isLoggedIn && userStore.currentRole === 'supplier'" class="menu-item" @click="goDriverManage">
        <view class="menu-icon">🚚</view>
        <view class="menu-text">司机管理</view>
        <view class="menu-arrow">›</view>
      </view>
      <view v-if="userStore.isLoggedIn && userStore.currentRole === 'buyer'" class="menu-item" @click="goApply('supplier')">
        <view class="menu-icon">🏪</view>
        <view class="menu-text">供应商入驻</view>
        <view class="menu-arrow">›</view>
      </view>
      <view v-if="userStore.isLoggedIn && userStore.currentRole === 'buyer'" class="menu-item" @click="goApply('driver')">
        <view class="menu-icon">🚚</view>
        <view class="menu-text">司机入驻</view>
        <view class="menu-arrow">›</view>
      </view>
      <view v-if="userStore.isLoggedIn && userStore.currentRole === 'driver'" class="menu-item" @click="goPool">
        <view class="menu-icon">🎯</view>
        <view class="menu-text">抢单池</view>
        <view class="menu-arrow">›</view>
      </view>
      <view v-if="userStore.isLoggedIn && userStore.currentRole === 'driver'" class="menu-item" @click="goTasks">
        <view class="menu-icon">📦</view>
        <view class="menu-text">我的任务</view>
        <view class="menu-arrow">›</view>
      </view>
      <view v-if="userStore.isLoggedIn && (userStore.currentRole === 'supplier' || userStore.currentRole === 'driver')" class="menu-item" @click="goSettlement">
        <view class="menu-icon">💰</view>
        <view class="menu-text">我的钱包</view>
        <view class="menu-arrow">›</view>
      </view>
      <view class="menu-item" @click="goAddress">
        <view class="menu-icon">📍</view>
        <view class="menu-text">地址管理</view>
        <view class="menu-arrow">›</view>
      </view>
      <view class="menu-item" @click="goOrderList">
        <view class="menu-icon">📋</view>
        <view class="menu-text">我的订单</view>
        <view class="menu-arrow">›</view>
      </view>
      <view class="menu-item" @click="handlePlaceholder('设置')">
        <view class="menu-icon">⚙️</view>
        <view class="menu-text">设置</view>
        <view class="menu-arrow">›</view>
      </view>
    </view>

    <view v-if="userStore.isLoggedIn" class="logout-section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';
import { switchRole as apiSwitchRole } from '@/api/user';
import { getUnreadCount } from '@/api/message';

const userStore = useUserStore();
const unreadCount = ref(0);

const roles = [
  { value: 'buyer', label: '采购商', icon: '🛒' },
  { value: 'supplier', label: '供应商', icon: '🏪' },
  { value: 'driver', label: '司机', icon: '🚚' },
];

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' });
}

function goMessage() {
  uni.navigateTo({ url: '/pages/message/index' });
}

async function loadUnreadCount() {
  if (!userStore.isLoggedIn) {
    unreadCount.value = 0;
    return;
  }
  try {
    const data: any = await getUnreadCount();
    unreadCount.value = data?.count || 0;
  } catch (e) {
    unreadCount.value = 0;
  }
}

async function handleSwitchRole(role: string) {
  try {
    await apiSwitchRole(role);
    userStore.switchRole(role);
    uni.showToast({ title: '角色切换成功', icon: 'success' });
  } catch (e) {
    userStore.switchRole(role);
  }
}

function goApply(type: string) {
  uni.navigateTo({ url: `/pages/apply/${type}` });
}

function goAddress() {
  uni.navigateTo({ url: '/pages/address/list' });
}

function goPool() {
  uni.navigateTo({ url: '/pages/driver/pool' });
}

function goTasks() {
  uni.navigateTo({ url: '/pages/driver/tasks' });
}

function goSettlement() {
  uni.navigateTo({ url: '/pages/settlement/index' });
}

function goProductList() {
  uni.navigateTo({ url: '/pages/supplier/product-list' });
}

function goDriverManage() {
  uni.navigateTo({ url: '/pages/supplier/driver-manage' });
}

function goOrderList() {
  if (userStore.currentRole === 'supplier') {
    uni.navigateTo({ url: '/pages/supplier/order-list' });
  } else {
    uni.navigateTo({ url: '/pages/order/list' });
  }
}

function handlePlaceholder(text: string) {
  uni.showToast({ title: `${text}功能开发中`, icon: 'none' });
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout();
        uni.showToast({ title: '已退出登录', icon: 'success' });
      }
    },
  });
}

onMounted(() => {
  loadUnreadCount();
});

onShow(() => {
  loadUnreadCount();
});
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.header {
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  padding: 60rpx 40rpx 80rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #fff;
  color: #2e7d32;
  font-size: 48rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-detail {
  margin-left: 24rpx;
  flex: 1;
}

.nickname {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
}

.phone {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.login-btn {
  margin-top: 12rpx;
  padding: 0 32rpx;
  height: 56rpx;
  line-height: 56rpx;
  background: #fff;
  color: #2e7d32;
  font-size: 26rpx;
  border-radius: 28rpx;
  display: inline-block;
}

.role-section {
  background: #fff;
  margin: -40rpx 24rpx 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.role-list {
  display: flex;
  gap: 20rpx;
}

.role-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0;
  border-radius: 12rpx;
  background: #f5f5f5;
  border: 2rpx solid transparent;
  transition: all 0.2s;

  &.active {
    background: #e8f5e9;
    border-color: #2e7d32;
  }
}

.role-icon {
  font-size: 44rpx;
  margin-bottom: 8rpx;
}

.role-name {
  font-size: 26rpx;
  color: #333;
}

.menu-section {
  background: #fff;
  margin: 0 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f9f9f9;
  }
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-icon-wrap {
  position: relative;
  margin-right: 20rpx;

  .menu-icon {
    margin-right: 0;
  }

  .unread-badge {
    position: absolute;
    top: -8rpx;
    right: -16rpx;
    min-width: 32rpx;
    height: 32rpx;
    line-height: 32rpx;
    padding: 0 8rpx;
    background: #e53935;
    color: #fff;
    font-size: 20rpx;
    border-radius: 16rpx;
    text-align: center;
  }
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 36rpx;
  color: #ccc;
}

.logout-section {
  padding: 48rpx 24rpx 0;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background: #fff;
  color: #e53935;
  font-size: 30rpx;
  border-radius: 12rpx;
  border: none;
  line-height: 88rpx;
}
</style>

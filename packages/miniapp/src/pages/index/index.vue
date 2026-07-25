<template>
  <view class="container">
    <view class="header">
      <view class="title">绿立方</view>
      <view class="subtitle">农批交易平台</view>
    </view>

    <view v-if="!userStore.isLoggedIn" class="login-prompt">
      <view class="prompt-text">欢迎使用绿立方，请先登录</view>
      <button class="login-btn" @click="goLogin">去登录</button>
    </view>

    <view v-else class="welcome">
      <view class="welcome-text">欢迎回来，{{ userStore.userInfo?.nickname || '用户' }} 👋</view>
      <view class="role-badge">当前角色：{{ roleLabel }}</view>
    </view>

    <view class="status">
      <text class="status-text">项目初始化完成 ✅</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

const roleLabel = computed(() => {
  const map: Record<string, string> = {
    buyer: '采购商',
    supplier: '供应商',
    driver: '司机',
  };
  return map[userStore.currentRole] || '采购商';
});

onMounted(async () => {
  console.log('首页加载完成');
  if (userStore.isLoggedIn && !userStore.userInfo) {
    await userStore.fetchProfile();
  }
});

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' });
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: 40rpx;
  box-sizing: border-box;
}

.header {
  text-align: center;
  padding: 60rpx 0;

  .title {
    font-size: 48rpx;
    font-weight: bold;
    color: #2e7d32;
  }

  .subtitle {
    font-size: 28rpx;
    color: #666;
    margin-top: 16rpx;
  }
}

.login-prompt {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.prompt-text {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 24rpx;
}

.login-btn {
  padding: 0 48rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #2e7d32;
  color: #fff;
  font-size: 30rpx;
  border-radius: 40rpx;
  border: none;
  display: inline-block;
}

.welcome {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.welcome-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.role-badge {
  display: inline-block;
  margin-top: 16rpx;
  padding: 8rpx 20rpx;
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 24rpx;
  border-radius: 20rpx;
}

.status {
  margin-top: 80rpx;
  padding: 40rpx;
  background: #e8f5e9;
  border-radius: 16rpx;
  text-align: center;

  .status-text {
    font-size: 30rpx;
    color: #2e7d32;
  }
}
</style>

<template>
  <view class="container">
    <view class="header">
      <view class="title">绿立方</view>
      <view class="subtitle">农批交易平台</view>
    </view>
    <view class="status">
      <text class="status-text">项目初始化完成 ✅</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  console.log('首页加载完成');
});
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

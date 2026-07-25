<template>
  <view class="container">
    <view class="header">
      <view class="logo">
        <view class="logo-icon">🍀</view>
        <view class="logo-text">绿立方</view>
        <view class="logo-subtitle">农批交易平台</view>
      </view>
    </view>

    <view class="form">
      <view class="tabs">
        <view
          class="tab" :class="{ active: mode === 'login' }" @click="mode = 'login'">
          登录
        </view>
        <view
          class="tab" :class="{ active: mode === 'register' }" @click="mode = 'register'">
          注册
        </view>
      </view>

      <view class="input-group">
        <view class="input-item">
          <text class="input-label">手机号</text>
          <input
            v-model="form.phone" class="input" type="number" placeholder="请输入手机号" />
        </view>
        <view class="input-item">
          <text class="input-label">密码</text>
          <input
            v-model="form.password" class="input" type="password" placeholder="请输入密码" />
        </view>
        <view v-if="mode === 'register'" class="input-item">
          <text class="input-label">昵称</text>
          <input
            v-model="form.nickname" class="input" type="text" placeholder="请输入昵称（选填）" />
        </view>
      </view>

      <button
        class="submit-btn" :loading="loading" @click="handleSubmit">
        {{ mode === 'login' ? '登录' : '注册' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

const mode = ref<'login' | 'register'>('login');
const loading = ref(false);

const form = reactive({
  phone: '',
  password: '',
  nickname: '',
});

async function handleSubmit() {
  if (!form.phone || !form.password) {
    uni.showToast({ title: '请填写手机号和密码', icon: 'none' });
    return;
  }

  loading.value = true;
  try {
    if (mode.value === 'login') {
      await userStore.login(form.phone, form.password);
    } else {
      await userStore.register(form.phone, form.password, form.nickname || undefined);
    }
    uni.showToast({ title: mode.value === 'login' ? '登录成功' : '注册成功', icon: 'success' });
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' });
    }, 1000);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f5e9 0%, #ffffff 40%);
  padding: 0 40rpx;
}

.header {
  padding: 120rpx 0 80rpx;
  text-align: center;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.logo-text {
  font-size: 56rpx;
  font-weight: bold;
  color: #2e7d32;
}

.logo-subtitle {
  font-size: 28rpx;
  color: #666;
  margin-top: 12rpx;
}

.form {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
}

.tabs {
  display: flex;
  margin-bottom: 48rpx;
  border-bottom: 1rpx solid #eee;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 32rpx;
  color: #999;
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
      width: 60rpx;
      height: 4rpx;
      background: #2e7d32;
      border-radius: 2rpx;
    }
  }
}

.input-group {
  margin-bottom: 48rpx;
}

.input-item {
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.input-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 30rpx;
  box-sizing: border-box;

  &:focus {
    border-color: #2e7d32;
  }
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: #2e7d32;
  color: #fff;
  font-size: 32rpx;
  border-radius: 12rpx;
  border: none;
  line-height: 88rpx;

  &:active {
    opacity: 0.9;
  }
}
</style>

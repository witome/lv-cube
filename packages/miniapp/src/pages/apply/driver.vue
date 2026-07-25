<template>
  <view class="container">
    <view v-if="submitted" class="success-page">
      <view class="success-icon">✅</view>
      <view class="success-title">提交成功</view>
      <view class="success-desc">审核中，请等待平台审核</view>
      <button class="back-btn" @click="goBack">返回</button>
    </view>

    <view v-else class="form-page">
      <view class="form-header">
        <view class="form-title">司机入驻申请</view>
        <view class="form-subtitle">请填写司机信息，提交后等待平台审核</view>
      </view>

      <view class="form">
        <view class="input-item">
          <text class="input-label">司机姓名 <text class="required">*</text></text>
          <input
            v-model="form.driverName"
            class="input" type="text" placeholder="请输入司机姓名" />
        </view>

        <view class="input-item">
          <text class="input-label">驾驶证号 <text class="required">*</text></text>
          <input
            v-model="form.licenseNo"
            class="input" type="text" placeholder="请输入驾驶证号" />
        </view>

        <view class="input-item">
          <text class="input-label">车牌号 <text class="required">*</text></text>
          <input
            v-model="form.plateNo"
            class="input" type="text" placeholder="请输入车牌号" />
        </view>

        <view class="input-item">
          <text class="input-label">车辆类型 <text class="required">*</text></text>
          <view class="vehicle-types">
            <view
              v-for="vt in vehicleTypes" :key="vt"
              class="vehicle-type" :class="{ active: form.vehicleType === vt }"
              @click="form.vehicleType = vt">
              {{ vt }}
            </view>
          </view>
        </view>

        <view class="input-item">
          <text class="input-label">载重（吨） <text class="required">*</text></text>
          <input
            v-model="form.loadCapacity"
            class="input" type="digit" placeholder="请输入载重，如：2.5" />
        </view>
      </view>

      <view class="footer">
        <button class="submit-btn" :loading="loading" @click="handleSubmit">提交申请</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { applyDriver } from '@/api/user';

const loading = ref(false);
const submitted = ref(false);

const vehicleTypes = ['面包车', '货车', '冷藏车'];

const form = reactive({
  driverName: '',
  licenseNo: '',
  plateNo: '',
  vehicleType: '',
  loadCapacity: '',
});

async function handleSubmit() {
  if (!form.driverName || !form.licenseNo || !form.plateNo || !form.vehicleType || !form.loadCapacity) {
    uni.showToast({ title: '请填写所有必填项', icon: 'none' });
    return;
  }

  loading.value = true;
  try {
    await applyDriver(form);
    submitted.value = true;
  } catch (e) {
    submitted.value = true;
  } finally {
    loading.value = false;
  }
}

function goBack() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.success-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 40rpx;
}

.success-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.success-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.success-desc {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 60rpx;
}

.back-btn {
  padding: 0 60rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #2e7d32;
  color: #fff;
  font-size: 30rpx;
  border-radius: 40rpx;
  border: none;
}

.form-page {
  padding-bottom: 160rpx;
}

.form-header {
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  padding: 60rpx 40rpx 80rpx;
}

.form-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #fff;
}

.form-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 12rpx;
}

.form {
  background: #fff;
  margin: -40rpx 24rpx 0;
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.input-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.input-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.required {
  color: #e53935;
}

.input {
  width: 100%;
  height: 80rpx;
  padding: 0 16rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background: #fafafa;

  &:focus {
    border-color: #2e7d32;
    background: #fff;
  }
}

.vehicle-types {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.vehicle-type {
  padding: 16rpx 32rpx;
  background: #f5f5f5;
  border: 2rpx solid transparent;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #333;

  &.active {
    background: #e8f5e9;
    border-color: #2e7d32;
    color: #2e7d32;
  }
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 32rpx;
  background: #fff;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.04);
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

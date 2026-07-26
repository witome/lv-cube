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
        <view class="form-title">供应商入驻申请</view>
        <view class="form-subtitle">请填写店铺信息，提交后等待平台审核</view>
      </view>

      <view class="form">
        <view class="input-item">
          <text class="input-label">店铺名称 <text class="required">*</text></text>
          <input
            v-model="form.shopName"
            class="input" type="text" placeholder="请输入店铺名称" />
        </view>

        <view class="input-item">
          <text class="input-label">店铺简介 <text class="required">*</text></text>
          <textarea
            v-model="form.shopIntro"
            class="textarea" placeholder="请输入店铺简介" />
        </view>

        <view class="input-item">
          <text class="input-label">营业执照（选填）</text>
          <view v-if="form.businessLicense" class="license-preview">
            <image class="license-image" :src="form.businessLicense" mode="aspectFill" />
            <view class="license-remove" @click="form.businessLicense = ''">删除</view>
          </view>
          <view v-else class="license-upload" @click="chooseBusinessLicense">
            <text class="upload-plus">+</text>
            <text>{{ uploadingLicense ? '上传中...' : '上传营业执照' }}</text>
          </view>
        </view>

        <view class="input-item">
          <text class="input-label">食品经营许可证</text>
          <input
            v-model="form.foodLicense"
            class="input" type="text" placeholder="请输入食品经营许可证图片链接（选填）" />
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
import { applySupplier } from '@/api/user';
import { uploadImage } from '@/api/upload';

const loading = ref(false);
const submitted = ref(false);
const uploadingLicense = ref(false);

const form = reactive({
  shopName: '',
  shopIntro: '',
  businessLicense: '',
  foodLicense: '',
});

async function handleSubmit() {
  if (!form.shopName || !form.shopIntro) {
    uni.showToast({ title: '请填写必填项', icon: 'none' });
    return;
  }

  loading.value = true;
  try {
    await applySupplier(form);
    submitted.value = true;
  } catch (e) {
    console.error('供应商申请提交失败', e);
  } finally {
    loading.value = false;
  }
}

async function chooseBusinessLicense() {
  if (uploadingLicense.value) return;
  try {
    const result: any = await new Promise((resolve, reject) => {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: resolve,
        fail: reject,
      });
    });
    uploadingLicense.value = true;
    const uploaded = await uploadImage(result.tempFilePaths[0]);
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/api$/, '');
    form.businessLicense = uploaded.url.startsWith('http')
      ? uploaded.url
      : `${baseUrl}${uploaded.url}`;
  } catch (e) {
    console.error('营业执照上传失败', e);
  } finally {
    uploadingLicense.value = false;
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

.textarea {
  width: 100%;
  height: 200rpx;
  padding: 16rpx;
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

.input-hint {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.license-upload {
  height: 180rpx;
  border: 2rpx dashed #bdbdbd;
  border-radius: 12rpx;
  color: #777;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.upload-plus {
  font-size: 56rpx;
  color: #2e7d32;
}

.license-preview {
  position: relative;
  width: 240rpx;
  height: 180rpx;
}

.license-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.license-remove {
  position: absolute;
  right: 8rpx;
  top: 8rpx;
  padding: 6rpx 14rpx;
  border-radius: 20rpx;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  font-size: 22rpx;
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

<template>
  <view class="container">
    <view class="header">
      <view class="header-content">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="header-title">{{ isEdit ? '编辑地址' : '新增地址' }}</view>
        <view class="placeholder"></view>
      </view>
    </view>

    <view class="form">
      <view class="input-item">
        <text class="input-label">收货人 <text class="required">*</text></text>
        <input
          v-model="form.name"
          class="input" type="text" placeholder="请输入收货人姓名" />
      </view>

      <view class="input-item">
        <text class="input-label">手机号 <text class="required">*</text></text>
        <input
          v-model="form.phone"
          class="input" type="number" maxlength="11" placeholder="请输入11位手机号" />
      </view>

      <view class="input-item">
        <text class="input-label">所在地区 <text class="required">*</text></text>
        <picker mode="region" :value="regionValue" @change="handleRegionChange">
          <view class="region-picker" :class="{ placeholder: !regionText }">
            <text>{{ regionText || '请选择省/市/区' }}</text>
            <text class="region-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="input-item">
        <text class="input-label">详细地址 <text class="required">*</text></text>
        <textarea
          v-model="form.detail"
          class="textarea" placeholder="请输入详细地址，如街道、门牌号等" />
      </view>

      <view class="switch-item">
        <text class="switch-label">设为默认地址</text>
        <switch
          :checked="form.isDefault"
          color="#2e7d32"
          @change="handleSwitchChange" />
      </view>

      <view v-if="isEdit" class="delete-item" @click="handleDelete">
        <text class="delete-text">删除此地址</text>
      </view>
    </view>

    <view class="footer">
      <button class="save-btn" :loading="loading" @click="handleSave">保存</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { createAddress, updateAddress, deleteAddress } from '@/api/address';
import { isChinaMobile } from '@lv-cube/shared';

const loading = ref(false);
const isEdit = ref(false);
const addressId = ref<number | null>(null);

const form = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
});
const regionValue = computed(() => [form.province, form.city, form.district]);
const regionText = computed(() => regionValue.value.filter(Boolean).join(' '));

function goBack() {
  uni.navigateBack();
}

function handleSwitchChange(e: any) {
  form.isDefault = e.detail.value;
}

function handleRegionChange(e: any) {
  const [province = '', city = '', district = ''] = e.detail.value || [];
  form.province = province;
  form.city = city;
  form.district = district;
}

function validateForm() {
  if (!form.name.trim()) {
    uni.showToast({ title: '请输入收货人姓名', icon: 'none' });
    return false;
  }
  if (!form.phone.trim()) {
    uni.showToast({ title: '请输入手机号', icon: 'none' });
    return false;
  }
  if (!isChinaMobile(form.phone)) {
    uni.showToast({ title: '请输入11位中国大陆手机号', icon: 'none' });
    return false;
  }
  if (!form.province.trim() || !form.city.trim() || !form.district.trim()) {
    uni.showToast({ title: '请填写完整的省市区', icon: 'none' });
    return false;
  }
  if (!form.detail.trim()) {
    uni.showToast({ title: '请输入详细地址', icon: 'none' });
    return false;
  }
  return true;
}

async function handleSave() {
  if (!validateForm()) return;

  loading.value = true;
  try {
    const data = {
      type: 'shipping',
      name: form.name,
      phone: form.phone,
      province: form.province,
      city: form.city,
      district: form.district,
      detail: form.detail,
      isDefault: form.isDefault,
    };

    if (isEdit.value && addressId.value) {
      await updateAddress(addressId.value, data);
    } else {
      await createAddress(data);
    }

    uni.$emit('addressRefresh');
    uni.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      uni.navigateBack();
    }, 500);
  } catch (e) {
    console.error('保存地址失败', e);
  } finally {
    loading.value = false;
  }
}

function handleDelete() {
  uni.showModal({
    title: '提示',
    content: '确定删除该地址吗？',
    success: async (res) => {
      if (res.confirm && addressId.value) {
        try {
          await deleteAddress(addressId.value);
          uni.$emit('addressRefresh');
          uni.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => {
            uni.navigateBack();
          }, 500);
        } catch (e) {
          uni.$emit('addressRefresh');
          uni.navigateBack();
        }
      }
    },
  });
}

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  const options = currentPage?.options || {};

  if (options.id) {
    isEdit.value = true;
    addressId.value = Number(options.id);

    const eventChannel = (currentPage as any)?.getOpenerEventChannel?.();
    if (eventChannel) {
      eventChannel.on('addressData', (data: any) => {
        if (data) {
          form.name = data.name || '';
          form.phone = data.phone || '';
          form.province = data.province || '';
          form.city = data.city || '';
          form.district = data.district || '';
          form.detail = data.detail || '';
          form.isDefault = !!data.isDefault;
        }
      });
    }
  }
});
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 160rpx;
}

.header {
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  padding-top: 60rpx;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
}

.header-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
}

.placeholder {
  width: 60rpx;
}

.form {
  background: #fff;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 0 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.input-item {
  padding: 28rpx 0;
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
  font-weight: 500;
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

.region-picker {
  height: 80rpx;
  padding: 0 16rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &.placeholder {
    color: #999;
  }
}

.region-arrow {
  color: #999;
  font-size: 40rpx;
}

.textarea {
  width: 100%;
  height: 160rpx;
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

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.switch-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.delete-item {
  padding: 32rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.7;
  }
}

.delete-text {
  font-size: 28rpx;
  color: #e53935;
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

.save-btn {
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

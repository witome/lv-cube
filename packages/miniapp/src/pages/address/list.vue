<template>
  <view class="container">
    <view class="header">
      <view class="header-content">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="header-title">收货地址</view>
        <view class="add-btn" @click="goAdd">
          <text class="add-text">新增</text>
        </view>
      </view>
    </view>

    <view v-if="list.length === 0" class="empty-state">
      <view class="empty-icon">📍</view>
      <view class="empty-text">暂无收货地址</view>
      <button class="empty-add-btn" @click="goAdd">添加收货地址</button>
    </view>

    <view v-else class="address-list">
      <view
        v-for="item in list"
        :key="item.id"
        class="address-item"
        @click="isSelectMode ? handleSelect(item) : handleSetDefault(item)">
        <view class="address-main">
          <view class="address-top">
            <text class="name">{{ item.name }}</text>
            <text class="phone">{{ item.phone }}</text>
            <view v-if="item.isDefault" class="default-tag">默认</view>
          </view>
          <view class="address-detail">
            {{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}
          </view>
        </view>
        <view class="edit-btn" @click.stop="goEdit(item)">
          <text class="edit-text">编辑</text>
        </view>
      </view>
    </view>

    <view v-if="list.length > 0" class="footer">
      <button class="add-address-btn" @click="goAdd">+ 新增收货地址</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAddressList, setDefaultAddress, deleteAddress } from '@/api/address';

const list = ref<any[]>([]);
const isSelectMode = ref(false);

async function fetchList() {
  try {
    const data: any = await getAddressList();
    list.value = data || [];
  } catch (e) {
    list.value = [];
  }
}

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage: any = pages[pages.length - 1];
  isSelectMode.value = currentPage?.options?.select === '1';
  fetchList();
});

function goBack() {
  uni.navigateBack();
}

function goAdd() {
  uni.navigateTo({ url: '/pages/address/edit' });
}

function handleSelect(item: any) {
  const pages = getCurrentPages();
  const prevPage = pages[pages.length - 2];
  if (prevPage) {
    prevPage.$vm && prevPage.$vm.onAddressSelect && prevPage.$vm.onAddressSelect(item);
  }
  uni.navigateBack();
}

function goEdit(item: any) {
  uni.navigateTo({ url: `/pages/address/edit?id=${item.id}` });
}

async function handleSetDefault(item: any) {
  if (item.isDefault) return;
  try {
    await setDefaultAddress(item.id);
    uni.showToast({ title: '已设为默认', icon: 'success' });
    fetchList();
  } catch (e) {
    // mock fallback
    list.value = list.value.map((i) => ({
      ...i,
      isDefault: i.id === item.id,
    }));
  }
}

function handleDelete(item: any) {
  uni.showModal({
    title: '提示',
    content: '确定删除该地址吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteAddress(item.id);
          uni.showToast({ title: '已删除', icon: 'success' });
          fetchList();
        } catch (e) {
          list.value = list.value.filter((i) => i.id !== item.id);
        }
      }
    },
  });
}

onMounted(() => {
  fetchList();
});

uni.$on('addressRefresh', () => {
  fetchList();
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

.add-btn {
  height: 60rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-text {
  font-size: 28rpx;
  color: #fff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
  margin-bottom: 48rpx;
}

.empty-add-btn {
  padding: 0 60rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #2e7d32;
  color: #fff;
  font-size: 30rpx;
  border-radius: 40rpx;
  border: none;
}

.address-list {
  padding: 24rpx;
}

.address-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  &:active {
    background: #f9f9f9;
  }
}

.address-main {
  flex: 1;
}

.address-top {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-right: 20rpx;
}

.phone {
  font-size: 28rpx;
  color: #666;
}

.default-tag {
  margin-left: 16rpx;
  padding: 4rpx 16rpx;
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 22rpx;
  border-radius: 8rpx;
}

.address-detail {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

.edit-btn {
  padding: 16rpx 24rpx;
  margin-left: 16rpx;
}

.edit-text {
  font-size: 28rpx;
  color: #2e7d32;
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

.add-address-btn {
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

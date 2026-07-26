<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">自有司机管理</text>
      <view class="nav-add" @click="openAddModal">
        <text class="add-icon">+</text>
      </view>
    </view>

    <scroll-view v-if="drivers.length > 0" class="driver-scroll" scroll-y>
      <view
        v-for="driver in drivers"
        :key="driver.id"
        class="driver-card">
        <view class="driver-info">
          <view class="driver-avatar">
            {{ driver.name?.charAt(0) || '司' }}
          </view>
          <view class="driver-detail">
            <text class="driver-name">{{ driver.name }}</text>
            <text class="driver-phone">{{ driver.phone }}</text>
            <text class="driver-time">创建时间：{{ formatDate(driver.createdAt) }}</text>
          </view>
        </view>
        <view class="driver-action">
          <view class="delete-btn" @click="handleDelete(driver)">删除</view>
        </view>
      </view>
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <view v-else-if="!loading" class="empty-state">
      <text class="empty-icon">🚚</text>
      <text class="empty-text">暂无司机</text>
      <view class="empty-btn" @click="openAddModal">添加司机</view>
    </view>

    <view v-else class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-if="showAddModal" class="modal-mask" @click="closeAddModal">
      <view class="modal-content" @click.stop>
        <view class="modal-title">添加司机</view>
        <view class="form-item">
          <text class="form-label">姓名</text>
          <input
            class="form-input"
            v-model="addForm.name"
            placeholder="请输入司机姓名" />
        </view>
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input
            class="form-input"
            v-model="addForm.phone"
            type="number"
            maxlength="11"
            placeholder="请输入11位手机号" />
        </view>
        <view class="modal-actions">
          <view class="modal-btn cancel" @click="closeAddModal">取消</view>
          <view class="modal-btn confirm" @click="handleAdd">确认添加</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getOwnDrivers, addOwnDriver, removeOwnDriver } from '@/api/delivery';
import { isChinaMobile } from '@lv-cube/shared';

const drivers = ref<any[]>([]);
const loading = ref(false);
const showAddModal = ref(false);
const addForm = ref({ name: '', phone: '' });

function goBack() {
  uni.navigateBack();
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function loadDrivers() {
  loading.value = true;
  try {
    const data = await getOwnDrivers();
    drivers.value = data || [];
  } catch (e) {
    console.error('加载司机列表失败', e);
  } finally {
    loading.value = false;
  }
}

function openAddModal() {
  addForm.value = { name: '', phone: '' };
  showAddModal.value = true;
}

function closeAddModal() {
  showAddModal.value = false;
}

async function handleAdd() {
  if (!addForm.value.name.trim()) {
    uni.showToast({ title: '请输入姓名', icon: 'none' });
    return;
  }
  if (!addForm.value.phone.trim()) {
    uni.showToast({ title: '请输入手机号', icon: 'none' });
    return;
  }
  if (!isChinaMobile(addForm.value.phone)) {
    uni.showToast({ title: '请输入11位中国大陆手机号', icon: 'none' });
    return;
  }
  try {
    await addOwnDriver(addForm.value);
    uni.showToast({ title: '添加成功', icon: 'success' });
    closeAddModal();
    loadDrivers();
  } catch (e) {}
}

function handleDelete(driver: any) {
  uni.showModal({
    title: '提示',
    content: `确定删除司机「${driver.name}」吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await removeOwnDriver(driver.id);
          uni.showToast({ title: '已删除', icon: 'success' });
          loadDrivers();
        } catch (e) {}
      }
    },
  });
}

onMounted(() => {
  loadDrivers();
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
  }

  .nav-add {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .add-icon {
      font-size: 40rpx;
      color: #2e7d32;
      font-weight: 600;
    }
  }
}

.driver-scroll {
  flex: 1;
}

.driver-card {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .driver-info {
    display: flex;
    align-items: center;
    flex: 1;

    .driver-avatar {
      width: 88rpx;
      height: 88rpx;
      border-radius: 50%;
      background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
      color: #fff;
      font-size: 36rpx;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .driver-detail {
      margin-left: 24rpx;
      flex: 1;

      .driver-name {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        display: block;
      }

      .driver-phone {
        font-size: 28rpx;
        color: #666;
        margin-top: 8rpx;
        display: block;
      }

      .driver-time {
        font-size: 24rpx;
        color: #999;
        margin-top: 8rpx;
        display: block;
      }
    }
  }

  .driver-action {
    .delete-btn {
      padding: 12rpx 28rpx;
      border-radius: 28rpx;
      border: 1rpx solid #e53935;
      color: #e53935;
      font-size: 26rpx;
    }
  }
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
  }

  .empty-btn {
    margin-top: 32rpx;
    padding: 20rpx 48rpx;
    background: #2e7d32;
    color: #fff;
    font-size: 28rpx;
    border-radius: 32rpx;
  }
}

.bottom-placeholder {
  height: 40rpx;
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
    background: #fff;
    border-radius: 20rpx;
    padding: 40rpx;

    .modal-title {
      font-size: 34rpx;
      font-weight: 600;
      color: #333;
      text-align: center;
      margin-bottom: 32rpx;
    }

    .form-item {
      margin-bottom: 28rpx;

      .form-label {
        font-size: 28rpx;
        color: #666;
        display: block;
        margin-bottom: 12rpx;
      }

      .form-input {
        width: 100%;
        height: 80rpx;
        border: 1rpx solid #e0e0e0;
        border-radius: 12rpx;
        padding: 0 24rpx;
        font-size: 28rpx;
        box-sizing: border-box;
      }
    }

    .modal-actions {
      display: flex;
      gap: 24rpx;
      margin-top: 16rpx;

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
</style>

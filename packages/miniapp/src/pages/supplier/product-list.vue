<template>
  <view class="page">
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: activeTab === tab.value }"
        @click="switchTab(tab.value)">
        {{ tab.label }}
      </view>
    </view>

    <scroll-view
      class="product-list"
      scroll-y
      @scrolltolower="loadMore">
      <view
        v-for="item in productList"
        :key="item.id"
        class="product-card">
        <image
          class="product-image"
          :src="item.mainImages && item.mainImages[0] ? item.mainImages[0] : placeholderImg"
          mode="aspectFill" />
        <view class="product-info">
          <view class="product-header">
            <text class="product-name">{{ item.name }}</text>
            <view class="status-tag" :class="item.status">
              {{ item.status === 'up' ? '出售中' : '已下架' }}
            </view>
          </view>
          <view class="product-meta">
            <text class="product-price">¥{{ item.minPrice }}</text>
            <text class="product-stock">库存{{ getTotalStock(item.skus) }}</text>
          </view>
          <view class="product-actions">
            <view class="action-btn edit" @click="goEdit(item.id)">编辑</view>
            <view
              class="action-btn toggle"
              @click="handleToggleStatus(item)">
              {{ item.status === 'up' ? '下架' : '上架' }}
            </view>
            <view class="action-btn delete" @click="handleDelete(item)">删除</view>
          </view>
        </view>
      </view>

      <view v-if="!loading && productList.length === 0" class="empty">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无商品</text>
        <view class="empty-btn" @click="goAdd">去发布</view>
      </view>

      <view v-if="loading" class="loading">
        <text>加载中...</text>
      </view>

      <view v-if="!loading && hasMore && productList.length > 0" class="load-more">
        <text>上拉加载更多</text>
      </view>

      <view v-if="!loading && !hasMore && productList.length > 0" class="no-more">
        <text>已经到底了</text>
      </view>
    </scroll-view>

    <view class="fab" @click="goAdd">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getProductList } from '@/api/product';
import { updateProductStatus, deleteProduct } from '@/api/supplier-product';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7nlJ/npL7lj4rlkI08L3RleHQ+PC9zdmc+';

const tabs = [
  { value: '', label: '全部' },
  { value: 'up', label: '出售中' },
  { value: 'down', label: '已下架' },
];

const activeTab = ref('');
const productList = ref<any[]>([]);
const page = ref(1);
const pageSize = 20;
const total = ref(0);
const loading = ref(false);

const hasMore = computed(() => productList.value.length < total.value);

onMounted(() => {
  refreshList();
});

function switchTab(value: string) {
  activeTab.value = value;
  refreshList();
}

async function refreshList() {
  page.value = 1;
  productList.value = [];
  await fetchList();
}

async function fetchList() {
  loading.value = true;
  try {
    const params: any = {
      page: page.value,
      pageSize,
      supplierId: userStore.userInfo?.id,
    };
    if (activeTab.value) {
      params.status = activeTab.value;
    }
    const res = await getProductList(params);
    const list = res?.list || [];
    if (page.value === 1) {
      productList.value = list;
    } else {
      productList.value = [...productList.value, ...list];
    }
    total.value = res?.total || 0;
  } catch (e) {
    console.error('加载商品失败', e);
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  if (loading.value || !hasMore.value) return;
  page.value++;
  await fetchList();
}

function getTotalStock(skus: any[]) {
  if (!skus || skus.length === 0) return 0;
  return skus.reduce((sum, sku) => sum + (sku.stock || 0), 0);
}

function goAdd() {
  uni.navigateTo({ url: '/pages/supplier/product-edit' });
}

function goEdit(id: number) {
  uni.navigateTo({ url: `/pages/supplier/product-edit?productId=${id}` });
}

function handleToggleStatus(item: any) {
  const newStatus = item.status === 'up' ? 'down' : 'up';
  const actionText = newStatus === 'up' ? '上架' : '下架';
  uni.showModal({
    title: '提示',
    content: `确定${actionText}该商品吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await updateProductStatus(item.id, newStatus);
          item.status = newStatus;
          uni.showToast({ title: `${actionText}成功`, icon: 'success' });
        } catch (e) {
          console.error(e);
        }
      }
    },
  });
}

function handleDelete(item: any) {
  uni.showModal({
    title: '提示',
    content: '确定删除该商品吗？删除后不可恢复。',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteProduct(item.id);
          productList.value = productList.value.filter((p) => p.id !== item.id);
          uni.showToast({ title: '删除成功', icon: 'success' });
        } catch (e) {
          console.error(e);
        }
      }
    },
  });
}
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.tab-bar {
  display: flex;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;

  .tab-item {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    font-size: 28rpx;
    color: #666;
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
        width: 48rpx;
        height: 4rpx;
        background: #2e7d32;
        border-radius: 2rpx;
      }
    }
  }
}

.product-list {
  flex: 1;
  padding: 16rpx;
  padding-bottom: 140rpx;

  .product-card {
    display: flex;
    background: #fff;
    border-radius: 12rpx;
    padding: 20rpx;
    margin-bottom: 16rpx;

    .product-image {
      width: 180rpx;
      height: 180rpx;
      border-radius: 8rpx;
      background: #f0f0f0;
      flex-shrink: 0;
    }

    .product-info {
      flex: 1;
      margin-left: 20rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .product-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12rpx;

        .product-name {
          flex: 1;
          font-size: 28rpx;
          font-weight: 500;
          color: #333;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .status-tag {
          flex-shrink: 0;
          padding: 4rpx 16rpx;
          border-radius: 4rpx;
          font-size: 22rpx;

          &.up {
            background: #e8f5e9;
            color: #2e7d32;
          }

          &.down {
            background: #f5f5f5;
            color: #999;
          }
        }
      }

      .product-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 8rpx;

        .product-price {
          font-size: 32rpx;
          font-weight: 600;
          color: #e53935;
        }

        .product-stock {
          font-size: 24rpx;
          color: #999;
        }
      }

      .product-actions {
        display: flex;
        gap: 12rpx;
        margin-top: 12rpx;

        .action-btn {
          flex: 1;
          height: 56rpx;
          line-height: 56rpx;
          text-align: center;
          border-radius: 28rpx;
          font-size: 24rpx;
          border: 1rpx solid #e0e0e0;
          color: #666;
          background: #fff;

          &.edit {
            color: #2e7d32;
            border-color: #2e7d32;
          }

          &.toggle {
            color: #ff9800;
            border-color: #ff9800;
          }

          &.delete {
            color: #e53935;
            border-color: #e53935;
          }

          &:active {
            opacity: 0.7;
          }
        }
      }
    }
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;

  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 24rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 32rpx;
  }

  .empty-btn {
    padding: 16rpx 64rpx;
    background: #2e7d32;
    color: #fff;
    font-size: 28rpx;
    border-radius: 40rpx;
  }
}

.loading {
  padding: 40rpx 0;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}

.load-more {
  padding: 32rpx 0;
  text-align: center;
  color: #999;
  font-size: 24rpx;
}

.no-more {
  padding: 32rpx 0;
  text-align: center;
  color: #ccc;
  font-size: 24rpx;
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(46, 125, 50, 0.4);
  z-index: 99;

  &:active {
    transform: scale(0.95);
  }

  .fab-icon {
    font-size: 56rpx;
    color: #fff;
    line-height: 1;
    font-weight: 300;
  }
}
</style>

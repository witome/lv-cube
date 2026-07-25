<template>
  <view class="page">
    <view class="search-bar">
      <view class="search-input" @click="goSearch">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索商品</text>
      </view>
    </view>

    <view class="content">
      <scroll-view class="sidebar" scroll-y>
        <view
          v-for="cat in categoryTree"
          :key="cat.id"
          class="sidebar-item"
          :class="{ active: activeCategoryId === cat.id }"
          @click="selectCategory(cat)">
          {{ cat.name }}
        </view>
      </scroll-view>

      <scroll-view class="main" scroll-y>
        <view v-if="activeCategory" class="section">
          <view class="section-title">
            {{ activeCategory.name }}
          </view>

          <view v-if="activeCategory.children && activeCategory.children.length" class="sub-grid">
            <view
              v-for="sub in activeCategory.children"
              :key="sub.id"
              class="sub-item"
              @click="goProductList(sub.id)">
              <view class="sub-icon">🥬</view>
              <text class="sub-name">{{ sub.name }}</text>
            </view>
          </view>
        </view>

        <view class="section">
          <view class="section-title">热门商品</view>
          <view class="product-grid">
            <view
              v-for="item in productList"
              :key="item.id"
              class="product-card"
              @click="goProductDetail(item.id)">
              <image
                class="product-image"
                :src="item.mainImages && item.mainImages[0] ? item.mainImages[0] : placeholderImg"
                mode="aspectFill" />
              <view class="product-info">
                <view class="product-name">{{ item.name }}</view>
                <view class="product-price-row">
                  <text class="product-price">¥{{ item.minPrice }}</text>
                  <text class="product-sales">销量{{ item.salesCount || 0 }}</text>
                </view>
              </view>
            </view>
          </view>

          <view v-if="!loading && productList.length === 0" class="empty">
            <text>暂无商品</text>
          </view>

          <view v-if="loading" class="loading">
            <text>加载中...</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getCategoryTree } from '@/api/category';
import { getProductList } from '@/api/product';

const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7nlJ/npL7lj4rlkI08L3RleHQ+PC9zdmc+';

const categoryTree = ref<any[]>([]);
const activeCategoryId = ref<number | null>(null);
const productList = ref<any[]>([]);
const loading = ref(false);

const activeCategory = computed(() => {
  return categoryTree.value.find((c) => c.id === activeCategoryId.value);
});

onMounted(async () => {
  await loadCategories();
  await loadProducts();
});

async function loadCategories() {
  try {
    const data = await getCategoryTree();
    categoryTree.value = data || [];
    if (categoryTree.value.length > 0 && !activeCategoryId.value) {
      activeCategoryId.value = categoryTree.value[0].id;
    }
  } catch (e) {
    console.error('加载品类失败', e);
  }
}

async function loadProducts() {
  loading.value = true;
  try {
    const params: any = { page: 1, pageSize: 20 };
    if (activeCategoryId.value) {
      params.categoryId = activeCategoryId.value;
    }
    const res = await getProductList(params);
    productList.value = res?.list || [];
  } catch (e) {
    console.error('加载商品失败', e);
  } finally {
    loading.value = false;
  }
}

function selectCategory(cat: any) {
  activeCategoryId.value = cat.id;
  loadProducts();
}

function goSearch() {
  uni.navigateTo({ url: '/pages/product/list' });
}

function goProductList(categoryId?: number) {
  const url = categoryId
    ? `/pages/product/list?categoryId=${categoryId}`
    : '/pages/product/list';
  uni.navigateTo({ url });
}

function goProductDetail(id: number) {
  uni.navigateTo({ url: `/pages/product/detail?id=${id}` });
}
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.search-bar {
  background: #fff;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .search-input {
    display: flex;
    align-items: center;
    height: 72rpx;
    background: #f5f5f5;
    border-radius: 36rpx;
    padding: 0 24rpx;

    .search-icon {
      font-size: 28rpx;
      margin-right: 12rpx;
    }

    .search-placeholder {
      font-size: 28rpx;
      color: #999;
    }
  }
}

.content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 200rpx;
  background: #fafafa;
  height: 100%;

  .sidebar-item {
    height: 100rpx;
    line-height: 100rpx;
    text-align: center;
    font-size: 28rpx;
    color: #666;
    border-left: 6rpx solid transparent;

    &.active {
      background: #fff;
      color: #2e7d32;
      font-weight: 600;
      border-left-color: #2e7d32;
    }
  }
}

.main {
  flex: 1;
  height: 100%;
  padding: 24rpx;
  box-sizing: border-box;
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.sub-grid {
  display: flex;
  flex-wrap: wrap;

  .sub-item {
    width: 33.33%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 0;

    .sub-icon {
      width: 80rpx;
      height: 80rpx;
      background: #e8f5e9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36rpx;
      margin-bottom: 12rpx;
    }

    .sub-name {
      font-size: 24rpx;
      color: #333;
    }
  }
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  .product-card {
    width: calc(50% - 8rpx);
    background: #fafafa;
    border-radius: 12rpx;
    overflow: hidden;

    .product-image {
      width: 100%;
      height: 240rpx;
      background: #f0f0f0;
    }

    .product-info {
      padding: 16rpx;

      .product-name {
        font-size: 26rpx;
        color: #333;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        min-height: 72rpx;
      }

      .product-price-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12rpx;

        .product-price {
          font-size: 30rpx;
          font-weight: 600;
          color: #e53935;
        }

        .product-sales {
          font-size: 22rpx;
          color: #999;
        }
      }
    }
  }
}

.empty {
  padding: 80rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.loading {
  padding: 40rpx 0;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}
</style>

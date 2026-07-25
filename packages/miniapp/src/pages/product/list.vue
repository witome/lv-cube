<template>
  <view class="page">
    <view class="header">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索商品"
          confirm-type="search"
          @confirm="handleSearch" />
      </view>
    </view>

    <view class="filter-bar">
      <view class="filter-item" @click="toggleCategoryPicker">
        <text class="filter-label">{{ selectedCategoryName || '全部分类' }}</text>
        <text class="filter-arrow">▼</text>
      </view>
      <view class="filter-divider"></view>
      <view class="filter-item" @click="togglePriceFilter">
        <text class="filter-label">价格</text>
        <text class="filter-arrow">▼</text>
      </view>
      <view class="filter-divider"></view>
      <view class="filter-item" @click="toggleSortPicker">
        <text class="filter-label">{{ sortLabel }}</text>
        <text class="filter-arrow">▼</text>
      </view>
    </view>

    <view v-if="showCategoryPicker" class="picker-mask" @click="showCategoryPicker = false">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择分类</text>
          <text class="picker-close" @click="showCategoryPicker = false">✕</text>
        </view>
        <scroll-view class="picker-body" scroll-y>
          <view
            class="picker-option"
            :class="{ active: !filterCategoryId }"
            @click="selectCategory(null)">
            全部分类
          </view>
          <view
            v-for="cat in categoryTree"
            :key="cat.id"
            class="picker-option"
            :class="{ active: filterCategoryId === cat.id }"
            @click="selectCategory(cat.id)">
            {{ cat.name }}
          </view>
        </scroll-view>
      </view>
    </view>

    <view v-if="showPriceFilter" class="picker-mask" @click="showPriceFilter = false">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">价格区间</text>
          <text class="picker-close" @click="showPriceFilter = false">✕</text>
        </view>
        <view class="price-input-row">
          <input
            class="price-input"
            type="digit"
            v-model="minPrice"
            placeholder="最低价" />
          <text class="price-sep">-</text>
          <input
            class="price-input"
            type="digit"
            v-model="maxPrice"
            placeholder="最高价" />
        </view>
        <button class="price-confirm-btn" @click="applyPriceFilter">确定</button>
      </view>
    </view>

    <view v-if="showSortPicker" class="picker-mask" @click="showSortPicker = false">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">排序方式</text>
          <text class="picker-close" @click="showSortPicker = false">✕</text>
        </view>
        <scroll-view class="picker-body" scroll-y>
          <view
            v-for="opt in sortOptions"
            :key="opt.value"
            class="picker-option"
            :class="{ active: sort === opt.value }"
            @click="selectSort(opt.value)">
            {{ opt.label }}
          </view>
        </scroll-view>
      </view>
    </view>

    <scroll-view
      class="product-list"
      scroll-y
      @scrolltolower="loadMore">
      <view
        v-for="item in productList"
        :key="item.id"
        class="product-card"
        @click="goDetail(item.id)">
        <image
          class="product-image"
          :src="item.mainImages && item.mainImages[0] ? item.mainImages[0] : placeholderImg"
          mode="aspectFill" />
        <view class="product-info">
          <view class="product-name">{{ item.name }}</view>
          <view v-if="item.subtitle" class="product-subtitle">{{ item.subtitle }}</view>
          <view class="product-meta">
            <text class="product-price">¥{{ item.minPrice }}</text>
            <text class="product-sales">销量{{ item.salesCount || 0 }}</text>
          </view>
          <view class="product-supplier">
            {{ item.supplier?.user?.nickname || '供应商' }}
          </view>
        </view>
      </view>

      <view v-if="!loading && productList.length === 0" class="empty">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无商品</text>
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
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getProductList } from '@/api/product';
import { getCategoryTree } from '@/api/category';

const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7nlJ/npL7lj4rlkI08L3RleHQ+PC9zdmc+';

const keyword = ref('');
const categoryTree = ref<any[]>([]);
const filterCategoryId = ref<number | null>(null);
const minPrice = ref('');
const maxPrice = ref('');
const sort = ref('default');
const productList = ref<any[]>([]);
const page = ref(1);
const pageSize = 20;
const total = ref(0);
const loading = ref(false);

const showCategoryPicker = ref(false);
const showPriceFilter = ref(false);
const showSortPicker = ref(false);

const sortOptions = [
  { value: 'default', label: '默认排序' },
  { value: 'sales', label: '销量优先' },
  { value: 'priceAsc', label: '价格从低到高' },
  { value: 'priceDesc', label: '价格从高到低' },
];

const sortLabel = computed(() => {
  const opt = sortOptions.find((o) => o.value === sort.value);
  return opt ? opt.label : '默认排序';
});

const selectedCategoryName = computed(() => {
  if (!filterCategoryId.value) return '';
  const cat = categoryTree.value.find((c) => c.id === filterCategoryId.value);
  return cat ? cat.name : '';
});

const hasMore = computed(() => {
  return productList.value.length < total.value;
});

onMounted(async () => {
  const pages = getCurrentPages();
  const currentPage: any = pages[pages.length - 1];
  const options = currentPage?.options || {};
  if (options.categoryId) {
    filterCategoryId.value = Number(options.categoryId);
  }
  if (options.keyword) {
    keyword.value = options.keyword;
  }
  await loadCategories();
  await refreshList();
});

async function loadCategories() {
  try {
    const data = await getCategoryTree();
    categoryTree.value = data || [];
  } catch (e) {
    console.error('加载品类失败', e);
  }
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
      sort: sort.value,
    };
    if (keyword.value) params.keyword = keyword.value;
    if (filterCategoryId.value) params.categoryId = filterCategoryId.value;
    if (minPrice.value) params.minPrice = Number(minPrice.value);
    if (maxPrice.value) params.maxPrice = Number(maxPrice.value);

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

function handleSearch() {
  refreshList();
}

function toggleCategoryPicker() {
  showCategoryPicker.value = !showCategoryPicker.value;
}

function selectCategory(id: number | null) {
  filterCategoryId.value = id;
  showCategoryPicker.value = false;
  refreshList();
}

function togglePriceFilter() {
  showPriceFilter.value = !showPriceFilter.value;
}

function applyPriceFilter() {
  showPriceFilter.value = false;
  refreshList();
}

function toggleSortPicker() {
  showSortPicker.value = !showSortPicker.value;
}

function selectSort(value: string) {
  sort.value = value;
  showSortPicker.value = false;
  refreshList();
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/product/detail?id=${id}` });
}
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .search-bar {
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

    .search-input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }
  }
}

.filter-bar {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .filter-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80rpx;
    font-size: 26rpx;
    color: #333;

    .filter-label {
      max-width: 160rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .filter-arrow {
      font-size: 20rpx;
      color: #999;
      margin-left: 8rpx;
    }
  }

  .filter-divider {
    width: 1rpx;
    height: 32rpx;
    background: #e0e0e0;
  }
}

.picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;

  .picker-content {
    width: 100%;
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    max-height: 70vh;
    display: flex;
    flex-direction: column;

    .picker-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 32rpx;
      border-bottom: 1rpx solid #f0f0f0;

      .picker-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }

      .picker-close {
        font-size: 36rpx;
        color: #999;
        padding: 8rpx;
      }
    }

    .picker-body {
      flex: 1;
      max-height: 50vh;

      .picker-option {
        padding: 28rpx 32rpx;
        font-size: 28rpx;
        color: #333;
        border-bottom: 1rpx solid #f5f5f5;

        &.active {
          color: #2e7d32;
          font-weight: 600;
        }
      }
    }
  }
}

.price-input-row {
  display: flex;
  align-items: center;
  padding: 32rpx;
  gap: 16rpx;

  .price-input {
    flex: 1;
    height: 72rpx;
    border: 1rpx solid #e0e0e0;
    border-radius: 8rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
  }

  .price-sep {
    font-size: 28rpx;
    color: #999;
  }
}

.price-confirm-btn {
  margin: 0 32rpx 32rpx;
  height: 80rpx;
  background: #2e7d32;
  color: #fff;
  font-size: 30rpx;
  border-radius: 40rpx;
  border: none;
  line-height: 80rpx;
}

.product-list {
  flex: 1;
  padding: 16rpx;

  .product-card {
    display: flex;
    background: #fff;
    border-radius: 12rpx;
    padding: 20rpx;
    margin-bottom: 16rpx;

    .product-image {
      width: 200rpx;
      height: 200rpx;
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

      .product-name {
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

      .product-subtitle {
        font-size: 24rpx;
        color: #999;
        margin-top: 8rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .product-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 12rpx;

        .product-price {
          font-size: 32rpx;
          font-weight: 600;
          color: #e53935;
        }

        .product-sales {
          font-size: 22rpx;
          color: #999;
        }
      }

      .product-supplier {
        font-size: 22rpx;
        color: #999;
        margin-top: 8rpx;
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
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
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
</style>

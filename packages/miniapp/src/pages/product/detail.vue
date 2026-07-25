<template>
  <view class="page">
    <scroll-view class="content" scroll-y v-if="product">
      <swiper class="banner" indicator-dots autoplay circular>
        <swiper-item v-for="(img, idx) in product.mainImages" :key="idx">
          <image class="banner-image" :src="img" mode="aspectFill" />
        </swiper-item>
        <swiper-item v-if="!product.mainImages || product.mainImages.length === 0">
          <image class="banner-image" :src="placeholderImg" mode="aspectFill" />
        </swiper-item>
      </swiper>

      <view class="price-section">
        <view class="price-row">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ product.minPrice }}</text>
          <text class="sales-count">销量{{ product.salesCount || 0 }}</text>
        </view>
        <view class="product-name">{{ product.name }}</view>
        <view v-if="product.subtitle" class="product-subtitle">{{ product.subtitle }}</view>
      </view>

      <view class="section" @click="showSkuPopup = true">
        <view class="section-row">
          <text class="section-label">规格</text>
          <view class="section-value">
            <text class="value-text">{{ selectedSkuText || '请选择规格' }}</text>
            <text class="section-arrow">›</text>
          </view>
        </view>
      </view>

      <view v-if="attrEntries.length" class="section">
        <view class="section-title">商品属性</view>
        <view class="attr-grid">
          <view v-for="[key, value] in attrEntries" :key="key" class="attr-item">
            <text class="attr-key">{{ key }}</text>
            <text class="attr-value">{{ formatAttrValue(value) }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-row" @click="contactSupplier">
          <text class="section-label">供应商</text>
          <view class="section-value supplier-info">
            <view class="supplier-name">{{ product.supplier?.user?.nickname || '供应商' }}</view>
            <text class="section-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-row">
          <text class="section-label">配送</text>
          <view class="section-value">
            <text class="value-text">预计 1-3 天送达</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">商品详情</view>
        <view class="description">{{ product.description || '暂无商品描述' }}</view>
      </view>

      <view class="bottom-placeholder"></view>
    </scroll-view>

    <view v-else class="loading-wrap">
      <text>加载中...</text>
    </view>

    <view class="bottom-bar">
      <button class="btn-cart" @click="handleAddCart">加入购物车</button>
      <button class="btn-buy" @click="handleBuyNow">立即购买</button>
    </view>

    <view v-if="showSkuPopup" class="sku-mask" @click="showSkuPopup = false">
      <view class="sku-popup" @click.stop>
        <view class="sku-header">
          <image
            class="sku-thumb"
            :src="product?.mainImages?.[0] || placeholderImg"
            mode="aspectFill" />
          <view class="sku-info">
            <text class="sku-price">¥{{ selectedSku?.price || product?.minPrice }}</text>
            <text class="sku-stock">库存{{ selectedSku?.stock || '充足' }}</text>
            <text class="sku-selected">已选：{{ selectedSkuText || '请选择' }}</text>
          </view>
          <text class="sku-close" @click="showSkuPopup = false">✕</text>
        </view>

        <scroll-view class="sku-body" scroll-y>
          <view class="sku-group">
            <view class="sku-group-title">规格选择</view>
            <view class="sku-list">
              <view
                v-for="sku in product?.skus || []"
                :key="sku.id"
                class="sku-item"
                :class="{ active: selectedSku?.id === sku.id }"
                @click="selectSku(sku)">
                {{ sku.skuName }}
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="sku-footer">
          <button class="sku-confirm-btn" @click="confirmSku">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getProductDetail } from '@/api/product';

const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7nlJ/npL7lj4rlkI08L3RleHQ+PC9zdmc+';

const product = ref<any>(null);
const selectedSku = ref<any>(null);
const showSkuPopup = ref(false);

const selectedSkuText = computed(() => {
  if (!selectedSku.value) return '';
  return selectedSku.value.skuName;
});

const attrEntries = computed(() => {
  if (!product.value?.attrValues) return [];
  return Object.entries(product.value.attrValues);
});

onMounted(async () => {
  const pages = getCurrentPages();
  const currentPage: any = pages[pages.length - 1];
  const options = currentPage?.options || {};
  const id = options.id;
  if (!id) {
    uni.showToast({ title: '商品不存在', icon: 'none' });
    return;
  }
  await loadDetail(Number(id));
});

async function loadDetail(id: number) {
  try {
    const data = await getProductDetail(id);
    product.value = data;
    if (data?.skus && data.skus.length > 0) {
      selectedSku.value = data.skus[0];
    }
  } catch (e) {
    console.error('加载商品详情失败', e);
  }
}

function selectSku(sku: any) {
  selectedSku.value = sku;
}

function confirmSku() {
  showSkuPopup.value = false;
}

function formatAttrValue(value: any): string {
  if (Array.isArray(value)) return value.join('、');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function contactSupplier() {
  const phone = product.value?.supplier?.user?.phone;
  if (phone) {
    uni.showModal({
      title: '联系供应商',
      content: `是否拨打 ${phone}？`,
      success: (res) => {
        if (res.confirm) {
          uni.makePhoneCall({ phoneNumber: phone });
        }
      },
    });
  } else {
    uni.showToast({ title: '暂无联系方式', icon: 'none' });
  }
}

function handleAddCart() {
  if (!selectedSku.value && product.value?.skus?.length) {
    showSkuPopup.value = true;
    return;
  }
  uni.showToast({ title: '已加入购物车', icon: 'success' });
}

function handleBuyNow() {
  if (!selectedSku.value && product.value?.skus?.length) {
    showSkuPopup.value = true;
    return;
  }
  uni.showToast({ title: '立即购买功能开发中', icon: 'none' });
}
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.content {
  flex: 1;
}

.loading-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 28rpx;
}

.banner {
  width: 100%;
  height: 600rpx;

  .banner-image {
    width: 100%;
    height: 100%;
    background: #f0f0f0;
  }
}

.price-section {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .price-row {
    display: flex;
    align-items: baseline;
    margin-bottom: 16rpx;

    .price-symbol {
      font-size: 28rpx;
      color: #e53935;
      font-weight: 600;
    }

    .price-value {
      font-size: 48rpx;
      color: #e53935;
      font-weight: 700;
      margin-right: 20rpx;
    }

    .sales-count {
      font-size: 24rpx;
      color: #999;
    }
  }

  .product-name {
    font-size: 34rpx;
    font-weight: 600;
    color: #333;
    line-height: 1.4;
  }

  .product-subtitle {
    font-size: 26rpx;
    color: #999;
    margin-top: 12rpx;
  }
}

.section {
  background: #fff;
  margin-bottom: 20rpx;

  .section-title {
    padding: 28rpx 32rpx 0;
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
  }

  .section-row {
    display: flex;
    align-items: center;
    padding: 28rpx 32rpx;

    .section-label {
      font-size: 28rpx;
      color: #666;
      width: 120rpx;
    }

    .section-value {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .value-text {
        font-size: 28rpx;
        color: #333;
      }

      .section-arrow {
        font-size: 36rpx;
        color: #ccc;
        margin-left: 8rpx;
      }

      .supplier-info {
        .supplier-name {
          font-size: 28rpx;
          color: #333;
        }
      }
    }
  }
}

.attr-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 16rpx 32rpx 28rpx;

  .attr-item {
    width: 50%;
    display: flex;
    padding: 12rpx 0;
    font-size: 26rpx;

    .attr-key {
      color: #999;
      margin-right: 16rpx;
      flex-shrink: 0;
    }

    .attr-value {
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.description {
  padding: 20rpx 32rpx 32rpx;
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.bottom-placeholder {
  height: 140rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
  gap: 20rpx;

  .btn-cart {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    background: #fff;
    color: #2e7d32;
    border: 2rpx solid #2e7d32;
    border-radius: 40rpx;
    font-size: 28rpx;
    padding: 0;
  }

  .btn-buy {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    background: #2e7d32;
    color: #fff;
    border: none;
    border-radius: 40rpx;
    font-size: 28rpx;
    padding: 0;
  }
}

.sku-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.sku-popup {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  .sku-header {
    display: flex;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    position: relative;

    .sku-thumb {
      width: 160rpx;
      height: 160rpx;
      border-radius: 12rpx;
      background: #f0f0f0;
    }

    .sku-info {
      flex: 1;
      margin-left: 24rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-around;

      .sku-price {
        font-size: 36rpx;
        font-weight: 700;
        color: #e53935;
      }

      .sku-stock {
        font-size: 24rpx;
        color: #999;
      }

      .sku-selected {
        font-size: 26rpx;
        color: #333;
      }
    }

    .sku-close {
      position: absolute;
      top: 24rpx;
      right: 24rpx;
      font-size: 36rpx;
      color: #999;
      padding: 8rpx;
    }
  }

  .sku-body {
    flex: 1;
    max-height: 50vh;

    .sku-group {
      padding: 28rpx 32rpx;

      .sku-group-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 20rpx;
      }

      .sku-list {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;

        .sku-item {
          padding: 16rpx 28rpx;
          background: #f5f5f5;
          border-radius: 8rpx;
          font-size: 26rpx;
          color: #333;
          border: 2rpx solid transparent;

          &.active {
            background: #e8f5e9;
            color: #2e7d32;
            border-color: #2e7d32;
          }
        }
      }
    }
  }

  .sku-footer {
    padding: 20rpx 32rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid #f0f0f0;

    .sku-confirm-btn {
      width: 100%;
      height: 80rpx;
      line-height: 80rpx;
      background: #2e7d32;
      color: #fff;
      font-size: 30rpx;
      border-radius: 40rpx;
      border: none;
      padding: 0;
    }
  }
}
</style>

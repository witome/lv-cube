<template>
  <view class="page">
    <view class="stepper">
      <view
        v-for="(step, index) in steps"
        :key="index"
        class="step-item"
        :class="{ active: currentStep >= index, done: currentStep > index }">
        <view class="step-circle">
          <text v-if="currentStep > index" class="step-check">✓</text>
          <text v-else class="step-num">{{ index + 1 }}</text>
        </view>
        <text class="step-label">{{ step.label }}</text>
        <view v-if="index < steps.length - 1" class="step-line"></view>
      </view>
    </view>

    <scroll-view class="form-body" scroll-y>
      <view v-if="currentStep === 0" class="step-content">
        <view class="section-title">选择品类</view>
        <view v-if="selectedCategoryPath.length > 0" class="selected-path">
          <text
            v-for="(cat, idx) in selectedCategoryPath"
            :key="cat.id"
            class="path-item">
            {{ cat.name }}
            <text v-if="idx < selectedCategoryPath.length - 1" class="path-sep">›</text>
          </text>
        </view>
        <view class="category-picker">
          <scroll-view class="category-col" scroll-y>
            <view
              v-for="cat in categoryTree"
              :key="cat.id"
              class="category-item"
              :class="{ active: selectedLevel1 === cat.id }"
              @click="selectLevel1(cat)">
              {{ cat.name }}
            </view>
          </scroll-view>
          <scroll-view v-if="level2List.length > 0" class="category-col" scroll-y>
            <view
              v-for="cat in level2List"
              :key="cat.id"
              class="category-item"
              :class="{ active: selectedLevel2 === cat.id }"
              @click="selectLevel2(cat)">
              {{ cat.name }}
            </view>
          </scroll-view>
          <scroll-view v-if="level3List.length > 0" class="category-col" scroll-y>
            <view
              v-for="cat in level3List"
              :key="cat.id"
              class="category-item"
              :class="{ active: selectedLevel3 === cat.id }"
              @click="selectLevel3(cat)">
              {{ cat.name }}
            </view>
          </scroll-view>
        </view>
      </view>

      <view v-if="currentStep === 1" class="step-content">
        <view class="section-title">基本信息</view>
        <view class="form-item">
          <view class="form-label required">商品名称</view>
          <input
            class="form-input"
            v-model="formData.name"
            placeholder="请输入商品名称" />
        </view>
        <view class="form-item">
          <view class="form-label">副标题</view>
          <input
            class="form-input"
            v-model="formData.subtitle"
            placeholder="请输入商品副标题（选填）" />
        </view>
        <view class="form-item">
          <view class="form-label required">主图列表</view>
          <view class="image-list">
            <view
              v-for="(img, idx) in formData.mainImages"
              :key="idx"
              class="image-item">
              <image class="image-preview" :src="img" mode="aspectFill" />
              <view class="image-remove" @click="removeImage(idx)">×</view>
            </view>
            <view v-if="formData.mainImages.length < 5" class="image-add" @click="chooseAndUploadImage">
              <text class="add-icon">+</text>
              <text class="add-text">{{ uploading ? '上传中...' : '添加图片' }}</text>
            </view>
          </view>
        </view>
        <view class="form-item">
          <view class="form-label">商品描述</view>
          <textarea
            class="form-textarea"
            v-model="formData.description"
            placeholder="请输入商品描述（选填）" />
        </view>
      </view>

      <view v-if="currentStep === 2" class="step-content">
        <view class="section-title">品类属性</view>
        <view v-if="attrTemplate.length === 0" class="empty-tip">
          当前品类暂无属性配置
        </view>
        <view v-else>
          <view
            v-for="(field, idx) in attrTemplate"
            :key="idx"
            class="form-item">
            <view class="form-label" :class="{ required: field.required }">
              {{ field.name }}
            </view>
            <input
              v-if="field.type === 'text'"
              class="form-input"
              v-model="formData.attrValues[field.name]"
              :placeholder="`请输入${field.name}`" />
            <input
              v-else-if="field.type === 'number'"
              class="form-input"
              type="digit"
              v-model="formData.attrValues[field.name]"
              :placeholder="`请输入${field.name}`" />
            <view v-else-if="field.type === 'select'" class="select-wrapper">
              <picker
                :range="field.options || []"
                @change="(e: any) => formData.attrValues[field.name] = field.options[e.detail.value]">
                <view class="form-input picker-input">
                  {{ formData.attrValues[field.name] || `请选择${field.name}` }}
                </view>
              </picker>
            </view>
            <view v-else-if="field.type === 'multiselect'" class="multi-select">
              <view
                v-for="opt in field.options"
                :key="opt"
                class="multi-option"
                :class="{ active: (formData.attrValues[field.name] || []).includes(opt) }"
                @click="toggleMultiSelect(field.name, opt)">
                {{ opt }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="currentStep === 3" class="step-content">
        <view class="section-title">
          SKU 规格
          <text class="sku-add" @click="addSku">+ 新增 SKU</text>
        </view>
        <view
          v-for="(sku, idx) in formData.skus"
          :key="idx"
          class="sku-card">
          <view class="sku-header">
            <text class="sku-title">SKU {{ idx + 1 }}</text>
            <text v-if="formData.skus.length > 1" class="sku-remove" @click="removeSku(idx)">删除</text>
          </view>
          <view class="form-item">
            <view class="form-label required">规格名称</view>
            <input
              class="form-input"
              v-model="sku.skuName"
              placeholder="如：500g/份" />
          </view>
          <view class="form-row">
            <view class="form-item half">
              <view class="form-label required">价格</view>
              <input
                class="form-input"
                type="digit"
                v-model="sku.price"
                placeholder="0.00" />
            </view>
            <view class="form-item half">
              <view class="form-label">原价</view>
              <input
                class="form-input"
                type="digit"
                v-model="sku.originalPrice"
                placeholder="0.00" />
            </view>
          </view>
          <view class="form-row">
            <view class="form-item half">
              <view class="form-label required">库存</view>
              <input
                class="form-input"
                type="number"
                v-model="sku.stock"
                placeholder="0" />
            </view>
            <view class="form-item half">
              <view class="form-label">重量(kg)</view>
              <input
                class="form-input"
                type="digit"
                v-model="sku.weight"
                placeholder="0.00" />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="footer-bar">
      <view v-if="currentStep > 0" class="footer-btn prev" @click="prevStep">
        上一步
      </view>
      <view v-if="currentStep < steps.length - 1" class="footer-btn next" @click="nextStep">
        下一步
      </view>
      <view v-if="currentStep === steps.length - 1" class="footer-btn submit" @click="handleSubmit">
        提交保存
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { getCategoryTree } from '@/api/category';
import { getProductDetail } from '@/api/product';
import { createProduct, updateProduct } from '@/api/supplier-product';
import { uploadImage } from '@/api/upload';

const steps = [
  { label: '选择品类' },
  { label: '基本信息' },
  { label: '品类属性' },
  { label: '设置 SKU' },
];

const productId = ref<number | null>(null);
const currentStep = ref(0);
const categoryTree = ref<any[]>([]);
const selectedLevel1 = ref<number | null>(null);
const selectedLevel2 = ref<number | null>(null);
const selectedLevel3 = ref<number | null>(null);
const uploading = ref(false);

const formData = reactive({
  categoryId: 0,
  name: '',
  subtitle: '',
  mainImages: [] as string[],
  description: '',
  attrValues: {} as Record<string, any>,
  skus: [
    { skuName: '', price: '', originalPrice: '', stock: '', weight: '' },
  ] as any[],
});

const level2List = computed(() => {
  const cat = categoryTree.value.find((c) => c.id === selectedLevel1.value);
  return cat?.children || [];
});

const level3List = computed(() => {
  const l2 = level2List.value.find((c) => c.id === selectedLevel2.value);
  return l2?.children || [];
});

const selectedCategoryPath = computed(() => {
  const path: any[] = [];
  const l1 = categoryTree.value.find((c) => c.id === selectedLevel1.value);
  if (l1) path.push(l1);
  const l2 = level2List.value.find((c) => c.id === selectedLevel2.value);
  if (l2) path.push(l2);
  const l3 = level3List.value.find((c) => c.id === selectedLevel3.value);
  if (l3) path.push(l3);
  return path;
});

const attrTemplate = computed(() => {
  const leaf = selectedCategoryPath.value[selectedCategoryPath.value.length - 1];
  return leaf?.attrTemplate || [];
});

onMounted(async () => {
  const pages = getCurrentPages();
  const currentPage: any = pages[pages.length - 1];
  const options = currentPage?.options || {};
  if (options.productId) {
    productId.value = Number(options.productId);
    await loadProductDetail();
  }
  await loadCategories();
});

async function loadCategories() {
  try {
    const data = await getCategoryTree();
    categoryTree.value = data || [];
  } catch (e) {
    console.error('加载品类失败', e);
  }
}

async function loadProductDetail() {
  if (!productId.value) return;
  try {
    const data = await getProductDetail(productId.value);
    formData.categoryId = data.categoryId;
    formData.name = data.name;
    formData.subtitle = data.subtitle || '';
    formData.mainImages = data.mainImages || [];
    formData.description = data.description || '';
    formData.attrValues = data.attrValues || {};
    formData.skus = data.skus?.length > 0
      ? data.skus.map((s: any) => ({
          skuName: s.skuName,
          price: s.price,
          originalPrice: s.originalPrice || '',
          stock: s.stock,
          weight: s.weight || '',
        }))
      : [{ skuName: '', price: '', originalPrice: '', stock: '', weight: '' }];
  } catch (e) {
    console.error('加载商品详情失败', e);
  }
}

function selectLevel1(cat: any) {
  selectedLevel1.value = cat.id;
  selectedLevel2.value = null;
  selectedLevel3.value = null;
  formData.categoryId = cat.id;
}

function selectLevel2(cat: any) {
  selectedLevel2.value = cat.id;
  selectedLevel3.value = null;
  formData.categoryId = cat.id;
}

function selectLevel3(cat: any) {
  selectedLevel3.value = cat.id;
  formData.categoryId = cat.id;
}

async function chooseAndUploadImage() {
  if (uploading.value) return;
  const remaining = 5 - formData.mainImages.length;
  if (remaining <= 0) {
    uni.showToast({ title: '最多上传5张图片', icon: 'none' });
    return;
  }
  try {
    const res: any = await new Promise((resolve, reject) => {
      uni.chooseImage({
        count: remaining,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: resolve,
        fail: reject,
      });
    });
    uploading.value = true;
    for (const path of res.tempFilePaths) {
      const result = await uploadImage(path);
      const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/api$/, '');
      const fullUrl = result.url.startsWith('http') ? result.url : `${BASE_URL}${result.url}`;
      formData.mainImages.push(fullUrl);
    }
    uni.showToast({ title: '上传成功', icon: 'success' });
  } catch (e) {
    console.error('上传图片失败', e);
  } finally {
    uploading.value = false;
  }
}

function removeImage(idx: number) {
  formData.mainImages.splice(idx, 1);
}

function toggleMultiSelect(fieldName: string, opt: string) {
  if (!formData.attrValues[fieldName]) {
    formData.attrValues[fieldName] = [];
  }
  const arr = formData.attrValues[fieldName];
  const i = arr.indexOf(opt);
  if (i > -1) {
    arr.splice(i, 1);
  } else {
    arr.push(opt);
  }
}

function addSku() {
  formData.skus.push({ skuName: '', price: '', originalPrice: '', stock: '', weight: '' });
}

function removeSku(idx: number) {
  formData.skus.splice(idx, 1);
}

function validateStep(): boolean {
  if (currentStep.value === 0) {
    if (!formData.categoryId) {
      uni.showToast({ title: '请选择品类', icon: 'none' });
      return false;
    }
  }
  if (currentStep.value === 1) {
    if (!formData.name.trim()) {
      uni.showToast({ title: '请输入商品名称', icon: 'none' });
      return false;
    }
    if (formData.mainImages.length === 0) {
      uni.showToast({ title: '请至少添加一张主图', icon: 'none' });
      return false;
    }
  }
  if (currentStep.value === 2) {
    for (const field of attrTemplate.value) {
      if (field.required) {
        const val = formData.attrValues[field.name];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          uni.showToast({ title: `请填写${field.name}`, icon: 'none' });
          return false;
        }
      }
    }
  }
  if (currentStep.value === 3) {
    for (const sku of formData.skus) {
      if (!sku.skuName.trim()) {
        uni.showToast({ title: '请填写规格名称', icon: 'none' });
        return false;
      }
      if (!sku.price || Number(sku.price) <= 0) {
        uni.showToast({ title: '请填写有效价格', icon: 'none' });
        return false;
      }
      if (sku.stock === '' || Number(sku.stock) < 0) {
        uni.showToast({ title: '请填写有效库存', icon: 'none' });
        return false;
      }
    }
  }
  return true;
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

function nextStep() {
  if (!validateStep()) return;
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
}

async function handleSubmit() {
  if (!validateStep()) return;
  try {
    const skus = formData.skus.map((sku: any) => ({
      skuName: sku.skuName,
      price: Number(sku.price),
      originalPrice: sku.originalPrice ? Number(sku.originalPrice) : undefined,
      stock: Number(sku.stock),
      weight: sku.weight ? Number(sku.weight) : undefined,
    }));
    const payload: any = {
      categoryId: formData.categoryId,
      name: formData.name,
      subtitle: formData.subtitle,
      mainImages: formData.mainImages,
      description: formData.description,
      attrValues: formData.attrValues,
      skus,
      status: 'down',
    };
    if (productId.value) {
      await updateProduct(productId.value, payload);
      uni.showToast({ title: '修改成功', icon: 'success' });
    } else {
      await createProduct(payload);
      uni.showToast({ title: '发布成功', icon: 'success' });
    }
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (e) {
    console.error('提交失败', e);
  }
}
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .step-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    .step-circle {
      width: 56rpx;
      height: 56rpx;
      border-radius: 50%;
      background: #e0e0e0;
      color: #999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26rpx;
      font-weight: 600;
      z-index: 1;
    }

    .step-label {
      margin-top: 8rpx;
      font-size: 22rpx;
      color: #999;
    }

    .step-line {
      position: absolute;
      top: 28rpx;
      left: 50%;
      width: 100%;
      height: 4rpx;
      background: #e0e0e0;
      z-index: 0;
    }

    &.active {
      .step-circle {
        background: #2e7d32;
        color: #fff;
      }
      .step-label {
        color: #2e7d32;
        font-weight: 600;
      }
    }

    &.done {
      .step-circle {
        background: #2e7d32;
        color: #fff;
      }
      .step-label {
        color: #2e7d32;
      }
      .step-line {
        background: #2e7d32;
      }
      .step-check {
        font-size: 28rpx;
      }
    }
  }
}

.form-body {
  flex: 1;
  padding: 24rpx;
  padding-bottom: 140rpx;
}

.step-content {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .sku-add {
    font-size: 26rpx;
    color: #2e7d32;
    font-weight: 500;
  }
}

.selected-path {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 16rpx 20rpx;
  background: #e8f5e9;
  border-radius: 8rpx;
  margin-bottom: 24rpx;

  .path-item {
    font-size: 26rpx;
    color: #2e7d32;

    .path-sep {
      margin: 0 8rpx;
      color: #999;
    }
  }
}

.category-picker {
  display: flex;
  height: 600rpx;
  border: 1rpx solid #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;

  .category-col {
    flex: 1;
    background: #fafafa;

    &:not(:first-child) {
      border-left: 1rpx solid #f0f0f0;
      background: #fff;
    }

    .category-item {
      padding: 24rpx 20rpx;
      font-size: 26rpx;
      color: #333;
      border-bottom: 1rpx solid #f5f5f5;

      &.active {
        background: #e8f5e9;
        color: #2e7d32;
        font-weight: 600;
      }
    }
  }
}

.form-item {
  margin-bottom: 28rpx;

  &.half {
    flex: 1;
  }

  .form-label {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 12rpx;

    &.required::before {
      content: '*';
      color: #e53935;
      margin-right: 4rpx;
    }
  }

  .form-input {
    height: 80rpx;
    line-height: 80rpx;
    padding: 0 20rpx;
    border: 1rpx solid #e0e0e0;
    border-radius: 8rpx;
    font-size: 28rpx;
    color: #333;
    background: #fff;

    &.picker-input {
      display: flex;
      align-items: center;
      color: #333;

      &:empty::before {
        content: attr(placeholder);
        color: #999;
      }
    }
  }

  .form-textarea {
    width: 100%;
    min-height: 160rpx;
    padding: 16rpx 20rpx;
    border: 1rpx solid #e0e0e0;
    border-radius: 8rpx;
    font-size: 28rpx;
    color: #333;
    background: #fff;
    box-sizing: border-box;
  }
}

.form-row {
  display: flex;
  gap: 20rpx;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  .image-item {
    position: relative;
    width: 160rpx;
    height: 160rpx;

    .image-preview {
      width: 100%;
      height: 100%;
      border-radius: 8rpx;
      background: #f5f5f5;
    }

    .image-remove {
      position: absolute;
      top: -12rpx;
      right: -12rpx;
      width: 40rpx;
      height: 40rpx;
      line-height: 40rpx;
      text-align: center;
      border-radius: 50%;
      background: #e53935;
      color: #fff;
      font-size: 28rpx;
    }
  }

  .image-add {
    width: 160rpx;
    height: 160rpx;
    border: 2rpx dashed #ccc;
    border-radius: 8rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .add-icon {
      font-size: 48rpx;
      color: #999;
      line-height: 1;
    }

    .add-text {
      font-size: 22rpx;
      color: #999;
      margin-top: 8rpx;
    }
  }
}

.image-tip {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #999;
}

.empty-tip {
  padding: 80rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.select-wrapper {
  .picker-input {
    color: #333;
  }
}

.multi-select {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  .multi-option {
    padding: 12rpx 28rpx;
    border: 1rpx solid #e0e0e0;
    border-radius: 32rpx;
    font-size: 26rpx;
    color: #666;
    background: #fff;

    &.active {
      background: #e8f5e9;
      border-color: #2e7d32;
      color: #2e7d32;
    }
  }
}

.sku-card {
  background: #fafafa;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  .sku-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .sku-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
    }

    .sku-remove {
      font-size: 24rpx;
      color: #e53935;
    }
  }
}

.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f0f0f0;

  .footer-btn {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: 500;

    &.prev {
      background: #f5f5f5;
      color: #666;
    }

    &.next {
      background: #2e7d32;
      color: #fff;
    }

    &.submit {
      background: #2e7d32;
      color: #fff;
    }

    &:active {
      opacity: 0.8;
    }
  }
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;

  .modal-content {
    width: 600rpx;
    background: #fff;
    border-radius: 16rpx;
    padding: 32rpx;

    .modal-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 24rpx;
      text-align: center;
    }

    .modal-actions {
      display: flex;
      gap: 20rpx;
      margin-top: 24rpx;

      .modal-btn {
        flex: 1;
        height: 72rpx;
        line-height: 72rpx;
        text-align: center;
        border-radius: 36rpx;
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

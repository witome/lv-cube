<template>
  <div class="product-list">
    <el-card class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="商品名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="品类">
          <el-tree-select
            v-model="searchForm.categoryId"
            :data="categoryTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="全部"
            clearable
            check-strictly
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="上架" value="up" />
            <el-option label="下架" value="down" />
          </el-select>
        </el-form-item>
        <el-form-item label="供应商">
          <el-input
            v-model="searchForm.supplier"
            placeholder="供应商名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column label="主图" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.mainImages?.[0]"
              :preview-src-list="row.mainImages"
              fit="cover"
              class="product-image"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="品类" width="120">
          <template #default="{ row }">
            {{ row.category?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="供应商" width="140">
          <template #default="{ row }">
            {{ row.supplier?.user?.nickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="价格区间" width="140">
          <template #default="{ row }">
            <span class="price">
              ¥{{ getPriceRange(row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="salesCount" label="销量" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'up' ? 'success' : 'info'">
              {{ row.status === 'up' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'up' ? '下架' : '上架' }}
            </el-button>
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-popconfirm
              title="确定删除该商品吗？"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </el-card>

    <el-dialog v-model="detailVisible" title="商品详情" width="680px">
      <div v-if="detailData" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品名称">{{ detailData.name }}</el-descriptions-item>
          <el-descriptions-item label="品类">{{ detailData.category?.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ detailData.supplier?.user?.nickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detailData.status === 'up' ? 'success' : 'info'">
              {{ detailData.status === 'up' ? '上架' : '下架' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="销量">{{ detailData.salesCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="副标题" :span="2">{{ detailData.subtitle || '-' }}</el-descriptions-item>
        </el-descriptions>
        <div v-if="detailData.mainImages?.length" class="detail-images">
          <h4>主图</h4>
          <el-image
            v-for="(img, idx) in detailData.mainImages"
            :key="idx"
            :src="img"
            :preview-src-list="detailData.mainImages"
            fit="cover"
            class="detail-image"
          />
        </div>
        <div v-if="detailData.description" class="detail-desc">
          <h4>商品描述</h4>
          <p>{{ detailData.description }}</p>
        </div>
        <div v-if="detailData.skus?.length" class="detail-skus">
          <h4>SKU 列表</h4>
          <el-table :data="detailData.skus" border size="small">
            <el-table-column prop="skuName" label="SKU 名称" />
            <el-table-column prop="price" label="价格" width="100">
              <template #default="{ row }">¥{{ row.price }}</template>
            </el-table-column>
            <el-table-column prop="originalPrice" label="原价" width="100">
              <template #default="{ row }">{{ row.originalPrice ? '¥' + row.originalPrice : '-' }}</template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="80" />
            <el-table-column prop="weight" label="重量(kg)" width="100">
              <template #default="{ row }">{{ row.weight || '-' }}</template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getProductList,
  getProductDetail,
  updateProductStatus,
  deleteProduct,
} from '@/api/product';
import { getCategoryTree } from '@/api/category';

const loading = ref(false);
const tableData = ref<any[]>([]);
const categoryTree = ref<any[]>([]);

const searchForm = reactive({
  keyword: '',
  categoryId: null as number | null,
  status: '',
  supplier: '',
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const detailVisible = ref(false);
const detailData = ref<any>(null);

function getPriceRange(row: any) {
  if (!row.skus?.length) return '-';
  const prices = row.skus.map((s: any) => s.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? min.toFixed(2) : `${min.toFixed(2)} ~ ${max.toFixed(2)}`;
}

async function fetchCategoryTree() {
  try {
    categoryTree.value = (await getCategoryTree()) || [];
  } catch (_) {}
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await getProductList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      categoryId: searchForm.categoryId || undefined,
      status: searchForm.status || undefined,
    });
    tableData.value = res.list || [];
    pagination.total = res.total || 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.page = 1;
  fetchList();
}

function handleReset() {
  searchForm.keyword = '';
  searchForm.categoryId = null;
  searchForm.status = '';
  searchForm.supplier = '';
  handleSearch();
}

async function handleToggleStatus(row: any) {
  const newStatus = row.status === 'up' ? 'down' : 'up';
  try {
    await updateProductStatus(row.id, newStatus);
    ElMessage.success(`已${newStatus === 'up' ? '上架' : '下架'}`);
    fetchList();
  } catch (_) {}
}

async function handleView(row: any) {
  try {
    detailData.value = await getProductDetail(row.id);
    detailVisible.value = true;
  } catch (_) {}
}

async function handleDelete(row: any) {
  try {
    await deleteProduct(row.id);
    ElMessage.success('删除成功');
    fetchList();
  } catch (_) {}
}

onMounted(() => {
  fetchCategoryTree();
  fetchList();
});
</script>

<style lang="scss" scoped>
.product-list {
  .search-bar {
    margin-bottom: 16px;
  }

  .product-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
  }

  .price {
    color: #f56c6c;
    font-weight: 500;
  }

  .table-card {
    .pagination {
      margin-top: 16px;
      justify-content: flex-end;
      display: flex;
    }
  }

  .detail-content {
    .detail-images {
      margin-top: 20px;

      h4 {
        margin-bottom: 12px;
      }

      .detail-image {
        width: 100px;
        height: 100px;
        margin-right: 12px;
        border-radius: 4px;
        display: inline-block;
      }
    }

    .detail-desc {
      margin-top: 20px;

      h4 {
        margin-bottom: 8px;
      }

      p {
        color: #666;
        line-height: 1.6;
      }
    }

    .detail-skus {
      margin-top: 20px;

      h4 {
        margin-bottom: 12px;
      }
    }
  }
}
</style>

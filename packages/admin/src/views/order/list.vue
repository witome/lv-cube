<template>
  <div class="order-list">
    <el-card class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="买家">
          <el-input
            v-model="searchForm.buyer"
            placeholder="请输入买家"
            clearable
            disabled
          />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input
            v-model="searchForm.supplier"
            placeholder="请输入供应商"
            clearable
            disabled
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="待接单" value="pending_accept" />
            <el-option label="备货中" value="preparing" />
            <el-option label="配送中" value="delivering" />
            <el-option label="待收货" value="waiting_confirm" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
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
        <el-table-column label="订单号" min-width="180">
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">
              {{ row.orderNo }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="买家" width="140">
          <template #default="{ row }">
            {{ row.buyer?.nickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="供应商" width="140">
          <template #default="{ row }">
            {{ row.supplier?.user?.nickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="商品" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <template v-if="row.orderItems?.length">
              {{ row.orderItems[0].productName }} × {{ row.orderItems[0].quantity }}
              <span v-if="row.orderItems.length > 1" class="more">
                +{{ row.orderItems.length - 1 }}件
              </span>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.actualAmount?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看详情
            </el-button>
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

    <el-dialog v-model="detailVisible" title="订单详情" width="720px">
      <div v-if="detailData" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ detailData.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(detailData.status)">
              {{ statusText(detailData.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="买家">{{ detailData.buyer?.nickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ detailData.supplier?.user?.nickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ detailData.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="配送时效">{{ deliveryTimeText(detailData.deliveryTimeType) }}</el-descriptions-item>
          <el-descriptions-item label="收货人" :span="2">
            {{ detailData.receiverName }} {{ detailData.receiverPhone }}
          </el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            {{ detailData.receiverProvince }}{{ detailData.receiverCity }}{{ detailData.receiverDistrict }}{{ detailData.receiverDetail }}
          </el-descriptions-item>
          <el-descriptions-item label="商品金额">¥{{ detailData.totalAmount?.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="配送费">¥{{ detailData.deliveryFee?.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="实付金额" :span="2">
            <span class="amount">¥{{ detailData.actualAmount?.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-items">
          <h4>商品清单</h4>
          <el-table :data="detailData.orderItems" border size="small">
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="skuName" label="规格" width="140" />
            <el-table-column prop="price" label="单价" width="100">
              <template #default="{ row }">¥{{ row.price?.toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="subtotal" label="小计" width="110">
              <template #default="{ row }">¥{{ row.subtotal?.toFixed(2) }}</template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { getOrderList, getOrderDetail } from '@/api/order';

const loading = ref(false);
const tableData = ref<any[]>([]);

const searchForm = reactive({
  orderNo: '',
  buyer: '',
  supplier: '',
  status: '',
  dateRange: [] as string[],
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const detailVisible = ref(false);
const detailData = ref<any>(null);

const statusMap: Record<string, { text: string; type: string }> = {
  pending_accept: { text: '待接单', type: 'warning' },
  preparing: { text: '备货中', type: 'primary' },
  delivering: { text: '配送中', type: 'info' },
  waiting_confirm: { text: '待收货', type: 'warning' },
  completed: { text: '已完成', type: 'success' },
  cancelled: { text: '已取消', type: 'info' },
};

function statusText(status: string) {
  return statusMap[status]?.text || status || '-';
}

function statusTagType(status: string) {
  return (statusMap[status]?.type as any) || 'info';
}

function deliveryTimeText(type: string) {
  const map: Record<string, string> = {
    same_day: '当日达',
    next_day: '次日达',
    scheduled: '定时达',
  };
  return map[type] || type || '-';
}

async function fetchList() {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    if (searchForm.orderNo) params.orderNo = searchForm.orderNo;
    if (searchForm.status) params.status = searchForm.status;
    if (searchForm.dateRange?.length === 2) {
      params.startDate = searchForm.dateRange[0];
      params.endDate = searchForm.dateRange[1];
    }
    const res = await getOrderList(params);
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
  searchForm.orderNo = '';
  searchForm.buyer = '';
  searchForm.supplier = '';
  searchForm.status = '';
  searchForm.dateRange = [];
  handleSearch();
}

async function handleView(row: any) {
  try {
    detailData.value = await getOrderDetail(row.id);
    detailVisible.value = true;
  } catch (_) {}
}

onMounted(() => {
  fetchList();
});
</script>

<style lang="scss" scoped>
.order-list {
  .search-bar {
    margin-bottom: 16px;
  }

  .amount {
    color: #f56c6c;
    font-weight: 500;
  }

  .more {
    color: #909399;
    margin-left: 4px;
  }

  .table-card {
    .pagination {
      margin-top: 16px;
      justify-content: flex-end;
      display: flex;
    }
  }

  .detail-content {
    .detail-items {
      margin-top: 20px;

      h4 {
        margin-bottom: 12px;
      }
    }
  }
}
</style>

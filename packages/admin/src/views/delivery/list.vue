<template>
  <div class="delivery-list">
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
        <el-form-item label="司机">
          <el-input
            v-model="searchForm.driver"
            placeholder="请输入司机"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="配送状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="待接单" value="pending" />
            <el-option label="已接单" value="accepted" />
            <el-option label="取货中" value="picking" />
            <el-option label="配送中" value="delivering" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="配送类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable>
            <el-option label="平台" value="platform" />
            <el-option label="自有" value="self" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
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
          <el-button class="btn-primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column label="订单号" min-width="180">
          <template #default="{ row }">
            {{ row.orderNo || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="供应商" width="140">
          <template #default="{ row }">
            {{ row.supplier?.user?.nickname || row.supplierName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="司机" width="120">
          <template #default="{ row }">
            {{ row.driver?.user?.nickname || row.driverName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="配送类型" width="100">
          <template #default="{ row }">
            <el-tag :type="deliveryTypeTagType(row.type)">
              {{ deliveryTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="取货地址" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.pickupAddress || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="送货地址" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.deliveryAddress || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="acceptedAt" label="接单时间" width="180">
          <template #default="{ row }">
            {{ row.acceptedAt || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="pickedAt" label="取货时间" width="180">
          <template #default="{ row }">
            {{ row.pickedAt || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="deliveredAt" label="送达时间" width="180">
          <template #default="{ row }">
            {{ row.deliveredAt || '-' }}
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { getDeliveryList } from '@/api/delivery';

const loading = ref(false);
const tableData = ref<any[]>([]);

const searchForm = reactive({
  orderNo: '',
  driver: '',
  status: '',
  type: '',
  dateRange: [] as string[],
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const statusMap: Record<string, { text: string; type: string }> = {
  pending: { text: '待接单', type: 'warning' },
  accepted: { text: '已接单', type: 'primary' },
  picking: { text: '取货中', type: 'info' },
  delivering: { text: '配送中', type: 'info' },
  completed: { text: '已完成', type: 'success' },
};

const deliveryTypeMap: Record<string, { text: string; type: string }> = {
  platform: { text: '平台', type: 'success' },
  self: { text: '自有', type: 'warning' },
};

function statusText(status: string) {
  return statusMap[status]?.text || status || '-';
}

function statusTagType(status: string) {
  return (statusMap[status]?.type as any) || 'info';
}

function deliveryTypeText(type: string) {
  return deliveryTypeMap[type]?.text || type || '-';
}

function deliveryTypeTagType(type: string) {
  return (deliveryTypeMap[type]?.type as any) || 'info';
}

async function fetchList() {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    if (searchForm.orderNo) params.orderNo = searchForm.orderNo;
    if (searchForm.driver) params.driver = searchForm.driver;
    if (searchForm.status) params.status = searchForm.status;
    if (searchForm.type) params.type = searchForm.type;
    if (searchForm.dateRange?.length === 2) {
      params.startDate = searchForm.dateRange[0];
      params.endDate = searchForm.dateRange[1];
    }
    const res = await getDeliveryList(params);
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
  searchForm.driver = '';
  searchForm.status = '';
  searchForm.type = '';
  searchForm.dateRange = [];
  handleSearch();
}

onMounted(() => {
  fetchList();
});
</script>

<style lang="scss" scoped>
.delivery-list {
  .search-bar {
    margin-bottom: 16px;
  }

  .btn-primary {
    background-color: #2e7d32;
    border-color: #2e7d32;
    color: #fff;

    &:hover {
      background-color: #388e3c;
      border-color: #388e3c;
    }
  }

  .table-card {
    .pagination {
      margin-top: 16px;
      justify-content: flex-end;
      display: flex;
    }
  }
}
</style>

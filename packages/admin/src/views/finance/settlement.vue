<template>
  <div class="settlement-page">
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
        <el-form-item label="供应商">
          <el-input
            v-model="searchForm.supplier"
            placeholder="请输入供应商"
            clearable
          />
        </el-form-item>
        <el-form-item label="结算状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="待结算" value="pending" />
            <el-option label="已结算" value="settled" />
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
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column label="订单号" min-width="180">
          <template #default="{ row }">
            {{ row.orderNo || row.orderId || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="供应商" width="140">
          <template #default="{ row }">
            {{ row.supplier?.user?.nickname || row.supplierName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="订单金额" width="120">
          <template #default="{ row }">
            ¥{{ (row.orderAmount || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="佣金(2%)" width="120">
          <template #default="{ row }">
            <span class="commission">¥{{ (row.commissionAmount || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="供应商应得" width="130">
          <template #default="{ row }">
            <span class="amount">¥{{ (row.supplierAmount || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结算状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="结算时间" width="180">
          <template #default="{ row }">
            {{ row.settledAt || row.createdAt || '-' }}
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
import { getSettlementList } from '@/api/settlement';

const loading = ref(false);
const tableData = ref<any[]>([]);

const searchForm = reactive({
  orderNo: '',
  supplier: '',
  status: '',
  dateRange: [] as string[],
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const statusMap: Record<string, { text: string; type: string }> = {
  pending: { text: '待结算', type: 'warning' },
  settled: { text: '已结算', type: 'success' },
};

function statusText(status: string) {
  return statusMap[status]?.text || status || '-';
}

function statusTagType(status: string) {
  return (statusMap[status]?.type as any) || 'info';
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
    const res: any = await getSettlementList(params);
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
  searchForm.supplier = '';
  searchForm.status = '';
  searchForm.dateRange = [];
  handleSearch();
}

onMounted(() => {
  fetchList();
});
</script>

<style lang="scss" scoped>
.settlement-page {
  .search-bar {
    margin-bottom: 16px;
  }

  .amount {
    color: #f56c6c;
    font-weight: 500;
  }

  .commission {
    color: #e6a23c;
    font-weight: 500;
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

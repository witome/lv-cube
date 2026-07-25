<template>
  <div class="refund-list">
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
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="退款状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="处理中" value="processing" />
            <el-option label="已同意" value="approved" />
            <el-option label="已拒绝" value="rejected" />
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
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column label="买家" width="140">
          <template #default="{ row }">
            {{ row.buyer?.nickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="退款金额" width="130">
          <template #default="{ row }">
            <span class="amount">¥{{ row.refundAmount?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="退款原因" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="180" />
        <el-table-column prop="handledAt" label="处理时间" width="180" />
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
import { getRefundList } from '@/api/refund';

const loading = ref(false);
const tableData = ref<any[]>([]);

const searchForm = reactive({
  orderNo: '',
  buyer: '',
  status: '',
  dateRange: [] as string[],
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const statusMap: Record<string, { text: string; type: string }> = {
  processing: { text: '处理中', type: 'warning' },
  approved: { text: '已同意', type: 'success' },
  rejected: { text: '已拒绝', type: 'danger' },
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
    if (searchForm.buyer) params.buyer = searchForm.buyer;
    if (searchForm.status) params.status = searchForm.status;
    if (searchForm.dateRange?.length === 2) {
      params.startDate = searchForm.dateRange[0];
      params.endDate = searchForm.dateRange[1];
    }
    const res = await getRefundList(params);
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
  searchForm.status = '';
  searchForm.dateRange = [];
  handleSearch();
}

onMounted(() => {
  fetchList();
});
</script>

<style lang="scss" scoped>
.refund-list {
  .search-bar {
    margin-bottom: 16px;
  }

  .btn-primary {
    background: #2e7d32;
    border-color: #2e7d32;
    color: white;

    &:hover {
      background: #388e3c;
      border-color: #388e3c;
    }
  }

  .amount {
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
}
</style>

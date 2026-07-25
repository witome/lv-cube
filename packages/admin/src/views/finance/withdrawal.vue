<template>
  <div class="withdrawal-page">
    <el-card class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户">
          <el-input
            v-model="searchForm.user"
            placeholder="请输入用户"
            clearable
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="全部" clearable>
            <el-option label="供应商" value="supplier" />
            <el-option label="司机" value="driver" />
          </el-select>
        </el-form-item>
        <el-form-item label="提现状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
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
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column label="用户" width="140">
          <template #default="{ row }">
            {{ row.user?.nickname || row.userName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="roleTagType(row.role)">
              {{ roleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提现金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ (row.amount || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="手续费" width="100">
          <template #default="{ row }">
            ¥{{ (row.fee || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="实际到账" width="120">
          <template #default="{ row }">
            <span class="actual">¥{{ (row.actualAmount || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提现方式" width="100">
          <template #default="{ row }">
            {{ withdrawMethodText(row.withdrawMethod) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="180">
          <template #default="{ row }">
            {{ row.createdAt || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button link type="success" size="small" @click="handleApprove(row)">
                通过
              </el-button>
              <el-button link type="danger" size="small" @click="handleReject(row)">
                拒绝
              </el-button>
            </template>
            <span v-else class="no-action">-</span>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { getWithdrawalList } from '@/api/settlement';

const loading = ref(false);
const tableData = ref<any[]>([]);

const searchForm = reactive({
  user: '',
  role: '',
  status: '',
  dateRange: [] as string[],
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const statusMap: Record<string, { text: string; type: string }> = {
  pending: { text: '待审核', type: 'warning' },
  approved: { text: '已通过', type: 'success' },
  rejected: { text: '已拒绝', type: 'danger' },
};

function statusText(status: string) {
  return statusMap[status]?.text || status || '-';
}

function statusTagType(status: string) {
  return (statusMap[status]?.type as any) || 'info';
}

function roleText(role: string) {
  const map: Record<string, string> = {
    supplier: '供应商',
    driver: '司机',
  };
  return map[role] || role || '-';
}

function roleTagType(role: string) {
  const map: Record<string, string> = {
    supplier: 'primary',
    driver: 'success',
  };
  return (map[role] as any) || 'info';
}

function withdrawMethodText(method: string) {
  const map: Record<string, string> = {
    wechat: '微信',
    bank: '银行卡',
    alipay: '支付宝',
  };
  return map[method] || method || '-';
}

async function fetchList() {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    if (searchForm.role) params.role = searchForm.role;
    if (searchForm.status) params.status = searchForm.status;
    if (searchForm.dateRange?.length === 2) {
      params.startDate = searchForm.dateRange[0];
      params.endDate = searchForm.dateRange[1];
    }
    const res: any = await getWithdrawalList(params);
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
  searchForm.user = '';
  searchForm.role = '';
  searchForm.status = '';
  searchForm.dateRange = [];
  handleSearch();
}

async function handleApprove(row: any) {
  try {
    await ElMessageBox.confirm(`确认通过该提现申请？金额：¥${row.amount?.toFixed(2)}`, '提示', {
      confirmButtonText: '确认通过',
      cancelButtonText: '取消',
      type: 'success',
    });
    ElMessage.success('已通过（MVP 占位功能）');
    fetchList();
  } catch (_) {}
}

async function handleReject(row: any) {
  try {
    await ElMessageBox.confirm(`确认拒绝该提现申请？金额：¥${row.amount?.toFixed(2)}`, '提示', {
      confirmButtonText: '确认拒绝',
      cancelButtonText: '取消',
      type: 'warning',
    });
    ElMessage.success('已拒绝（MVP 占位功能）');
    fetchList();
  } catch (_) {}
}

onMounted(() => {
  fetchList();
});
</script>

<style lang="scss" scoped>
.withdrawal-page {
  .search-bar {
    margin-bottom: 16px;
  }

  .amount {
    color: #f56c6c;
    font-weight: 500;
  }

  .actual {
    color: #67c23a;
    font-weight: 500;
  }

  .no-action {
    color: #c0c4cc;
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

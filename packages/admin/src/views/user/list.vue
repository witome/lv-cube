<template>
  <div class="user-list">
    <el-card class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="手机号/昵称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="全部" clearable>
            <el-option label="管理员" value="admin" />
            <el-option label="供应商" value="supplier" />
            <el-option label="司机" value="driver" />
            <el-option label="采购商" value="buyer" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :src="row.avatar" :size="36" />
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">{{ getRoleText(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180" />
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
import { getUserList } from '@/api/user';

const loading = ref(false);
const tableData = ref<any[]>([]);

const searchForm = reactive({
  keyword: '',
  role: '',
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

function getRoleText(role: string) {
  const map: Record<string, string> = {
    admin: '管理员',
    supplier: '供应商',
    driver: '司机',
    buyer: '采购商',
  };
  return map[role] || role;
}

function getRoleTagType(role: string) {
  const map: Record<string, string> = {
    admin: 'danger',
    supplier: 'primary',
    driver: 'warning',
    buyer: 'success',
  };
  return map[role] || 'info';
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await getUserList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      role: searchForm.role || undefined,
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
  searchForm.role = '';
  handleSearch();
}

onMounted(fetchList);
</script>

<style lang="scss" scoped>
.user-list {
  .search-bar {
    margin-bottom: 16px;
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

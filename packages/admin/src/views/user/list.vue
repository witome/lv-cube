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
          <el-button type="success" @click="openCreateDialog">添加用户</el-button>
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
        <el-table-column label="角色" width="180">
          <template #default="{ row }">
            <div v-for="r in getUserRoles(row.roles)" :key="r" class="role-tag">
              <el-tag :type="getRoleTagType(r)" size="small">{{ getRoleText(r) }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openRoleDialog(row)">角色</el-button>
            <el-button
              size="small"
              :type="row.status === 'active' ? 'warning' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
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

    <el-dialog v-model="roleDialogVisible" title="编辑角色" width="400px">
      <el-form label-width="80px">
        <el-form-item label="角色">
          <el-checkbox-group v-model="editRoles">
            <el-checkbox label="admin">管理员</el-checkbox>
            <el-checkbox label="supplier">供应商</el-checkbox>
            <el-checkbox label="driver">司机</el-checkbox>
            <el-checkbox label="buyer">采购商</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRoles">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="createDialogVisible" title="添加用户" width="400px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="手机号" required>
          <el-input v-model="createForm.phone" maxlength="11" placeholder="请输入11位手机号" />
        </el-form-item>
        <el-form-item label="昵称" required>
          <el-input v-model="createForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="createForm.password" placeholder="默认123456" show-password />
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group v-model="createForm.roles">
            <el-checkbox label="admin">管理员</el-checkbox>
            <el-checkbox label="supplier">供应商</el-checkbox>
            <el-checkbox label="driver">司机</el-checkbox>
            <el-checkbox label="buyer">采购商</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateUser">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getUserList,
  updateUserStatus,
  updateUserRoles,
  deleteUser,
  createUser,
} from '@/api/user';
import { isChinaMobile } from '@lv-cube/shared';

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

const roleDialogVisible = ref(false);
const editRoles = ref<string[]>([]);
let editingUserId: number | null = null;

const createDialogVisible = ref(false);
const createForm = reactive({
  phone: '',
  nickname: '',
  password: '123456',
  roles: ['buyer'] as string[],
});

function getUserRoles(rolesStr: string) {
  try {
    return JSON.parse(rolesStr || '["buyer"]');
  } catch {
    return ['buyer'];
  }
}

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

function openRoleDialog(row: any) {
  editingUserId = row.id;
  editRoles.value = [...getUserRoles(row.roles)];
  roleDialogVisible.value = true;
}

async function handleSaveRoles() {
  if (!editingUserId) return;
  try {
    await updateUserRoles(editingUserId, editRoles.value);
    ElMessage.success('角色更新成功');
    roleDialogVisible.value = false;
    fetchList();
  } catch (e: any) {
    ElMessage.error(e?.message || '更新失败');
  }
}

async function handleToggleStatus(row: any) {
  const newStatus = row.status === 'active' ? 'disabled' : 'active';
  try {
    await ElMessageBox.confirm(
      `确定要${newStatus === 'active' ? '启用' : '禁用'}用户 ${row.nickname} 吗？`,
      '提示',
      { type: 'warning' },
    );
    await updateUserStatus(row.id, newStatus);
    ElMessage.success('状态更新成功');
    fetchList();
  } catch {
    // cancel
  }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${row.nickname} 吗？此操作不可恢复！`,
      '警告',
      { type: 'error' },
    );
    await deleteUser(row.id);
    ElMessage.success('删除成功');
    fetchList();
  } catch {
    // cancel
  }
}

function openCreateDialog() {
  createForm.phone = '';
  createForm.nickname = '';
  createForm.password = '123456';
  createForm.roles = ['buyer'];
  createDialogVisible.value = true;
}

async function handleCreateUser() {
  if (!createForm.phone || !createForm.nickname) {
    ElMessage.warning('请填写手机号和昵称');
    return;
  }
  if (!isChinaMobile(createForm.phone)) {
    ElMessage.warning('请输入11位中国大陆手机号');
    return;
  }
  try {
    await createUser({
      phone: createForm.phone,
      nickname: createForm.nickname,
      password: createForm.password,
      roles: createForm.roles,
    });
    ElMessage.success('创建成功');
    createDialogVisible.value = false;
    fetchList();
  } catch (e: any) {
    ElMessage.error(e?.message || '创建失败');
  }
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

    .role-tag {
      display: inline-block;
      margin-right: 4px;
      margin-bottom: 4px;
    }
  }
}
</style>

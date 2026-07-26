<template>
  <div class="supplier-review">
    <el-card>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="createdAt" label="申请时间" width="180" />
        <el-table-column prop="shopName" label="店铺名称" />
        <el-table-column label="营业执照" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.businessLicense"
              :src="row.businessLicense"
              :preview-src-list="[row.businessLicense]"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px;"
            />
            <span v-else style="color: #999;">暂无</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="success" size="small" @click="handleApprove(row)">通过</el-button>
            <el-button type="danger" size="small" @click="handleReject(row)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="approveDialogVisible" title="确认通过" width="400px">
      <p>确定要通过该供应商的入驻申请吗？</p>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmApprove">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rejectDialogVisible" title="拒绝原因" width="400px">
      <el-input
        v-model="rejectRemark"
        type="textarea"
        :rows="4"
        placeholder="请输入拒绝原因"
      />
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="catDialogVisible" title="设置可售分类" width="500px">
      <p style="margin-bottom: 16px; color: #666;">为该供应商选择可销售的商品分类：</p>
      <el-tree
        :data="categoryTree"
        :props="{ label: 'name', children: 'children' }"
        show-checkbox
        node-key="id"
        :default-checked-keys="checkedCategories"
        @check-change="handleCategoryChange"
        ref="treeRef"
      />
      <template #footer>
        <el-button @click="catDialogVisible = false; fetchList()">跳过</el-button>
        <el-button type="primary" @click="confirmCategories">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getPendingSuppliers, reviewSupplier, getSupplierCategories, setSupplierCategories } from '@/api/user';
import { getCategoryTree } from '@/api/category';

const loading = ref(false);
const tableData = ref<any[]>([]);
const approveDialogVisible = ref(false);
const rejectDialogVisible = ref(false);
const catDialogVisible = ref(false);
const currentRow = ref<any>(null);
const rejectRemark = ref('');
const categoryTree = ref<any[]>([]);
const checkedCategories = ref<number[]>([]);
const treeRef = ref<any>(null);

async function fetchList() {
  loading.value = true;
  try {
    const res = await getPendingSuppliers();
    tableData.value = res || [];
  } finally {
    loading.value = false;
  }
}

async function loadCategoryTree() {
  try {
    const res = await getCategoryTree();
    categoryTree.value = res || [];
  } catch {}
}

function handleApprove(row: any) {
  currentRow.value = row;
  approveDialogVisible.value = true;
}

async function confirmApprove() {
  try {
    await reviewSupplier(currentRow.value.id, { approved: true });
    ElMessage.success('已通过审核');
    approveDialogVisible.value = false;
    // 弹出分类选择
    const cats = await getSupplierCategories(currentRow.value.id);
    checkedCategories.value = cats || [];
    await loadCategoryTree();
    catDialogVisible.value = true;
  } catch {
    // error handled in interceptor
  }
}

async function confirmCategories() {
  try {
    const checked = treeRef.value?.getCheckedKeys() || [];
    await setSupplierCategories(currentRow.value.id, checked);
    ElMessage.success('分类授权已保存');
    catDialogVisible.value = false;
    fetchList();
  } catch {}
}

function handleCategoryChange() {}

function handleReject(row: any) {
  currentRow.value = row;
  rejectRemark.value = '';
  rejectDialogVisible.value = true;
}

async function confirmReject() {
  if (!rejectRemark.value.trim()) {
    ElMessage.warning('请输入拒绝原因');
    return;
  }
  try {
    await reviewSupplier(currentRow.value.id, {
      approved: false,
      remark: rejectRemark.value,
    });
    ElMessage.success('已拒绝');
    rejectDialogVisible.value = false;
    fetchList();
  } catch {
    // error handled in interceptor
  }
}

onMounted(fetchList);
</script>

<style lang="scss" scoped>
.supplier-review {
}
</style>

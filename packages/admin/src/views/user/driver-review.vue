<template>
  <div class="driver-review">
    <el-card>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="createdAt" label="申请时间" width="180" />
        <el-table-column prop="driverName" label="司机姓名" />
        <el-table-column prop="licenseNumber" label="驾驶证号" />
        <el-table-column prop="plateNumber" label="车牌号" />
        <el-table-column prop="vehicleType" label="车辆类型" />
        <el-table-column prop="loadCapacity" label="载重(吨)" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="success" size="small" @click="handleApprove(row)">通过</el-button>
            <el-button type="danger" size="small" @click="handleReject(row)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="approveDialogVisible" title="确认通过" width="400px">
      <p>确定要通过该司机的入驻申请吗？</p>
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getPendingDrivers, reviewDriver } from '@/api/user';

const loading = ref(false);
const tableData = ref<any[]>([]);
const approveDialogVisible = ref(false);
const rejectDialogVisible = ref(false);
const currentRow = ref<any>(null);
const rejectRemark = ref('');

async function fetchList() {
  loading.value = true;
  try {
    const res = await getPendingDrivers();
    tableData.value = res || [];
  } finally {
    loading.value = false;
  }
}

function handleApprove(row: any) {
  currentRow.value = row;
  approveDialogVisible.value = true;
}

async function confirmApprove() {
  try {
    await reviewDriver(currentRow.value.id, { approved: true });
    ElMessage.success('已通过审核');
    approveDialogVisible.value = false;
    fetchList();
  } catch {
    // error handled in interceptor
  }
}

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
    await reviewDriver(currentRow.value.id, {
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
.driver-review {
}
</style>

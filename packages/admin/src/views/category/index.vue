<template>
  <div class="category-page">
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>品类树</span>
              <el-button type="primary" size="small" @click="handleAddRoot">
                <el-icon><Plus /></el-icon>
                新增根品类
              </el-button>
            </div>
          </template>
          <el-tree
            ref="treeRef"
            :data="treeData"
            v-loading="loading"
            node-key="id"
            :default-expand-all="true"
            :expand-on-click-node="false"
          >
            <template #default="{ data }">
              <div class="tree-node">
                <span class="node-label">
                  <el-icon v-if="data.icon"><component :is="data.icon" /></el-icon>
                  {{ data.name }}
                </span>
                <span class="node-actions">
                  <el-button link type="primary" size="small" @click.stop="handleAddChild(data)">
                    <el-icon><Plus /></el-icon>
                  </el-button>
                  <el-button link type="primary" size="small" @click.stop="handleEdit(data)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-popconfirm
                    title="确定删除该品类吗？"
                    confirm-button-text="确定"
                    cancel-button-text="取消"
                    @confirm="handleDelete(data)"
                  >
                    <template #reference>
                      <el-button link type="danger" size="small" @click.stop>
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </template>
                  </el-popconfirm>
                </span>
              </div>
            </template>
          </el-tree>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>{{ formData.id ? '编辑品类' : '新增品类' }}</span>
          </template>
          <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
            <el-form-item label="名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入品类名称" />
            </el-form-item>
            <el-form-item label="父级">
              <el-tree-select
                v-model="formData.parentId"
                :data="treeData"
                :props="{ label: 'name', value: 'id', children: 'children' }"
                placeholder="无（根品类）"
                clearable
                check-strictly
                :disabled="!!formData.id"
              />
            </el-form-item>
            <el-form-item label="层级">
              <el-input v-model="formData.level" disabled />
            </el-form-item>
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="formData.sort" :min="0" :max="9999" />
            </el-form-item>
            <el-form-item label="图标">
              <el-input v-model="formData.icon" placeholder="请输入图标名称" />
            </el-form-item>
            <el-form-item label="状态">
              <el-switch v-model="formData.status" active-value="1" inactive-value="0" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSubmit">保存</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import {
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/api/category';

const loading = ref(false);
const treeData = ref<any[]>([]);
const treeRef = ref();
const formRef = ref();

const formData = reactive<any>({
  id: null,
  name: '',
  parentId: null,
  level: 1,
  sort: 0,
  icon: '',
  status: '1',
});

const formRules = {
  name: [{ required: true, message: '请输入品类名称', trigger: 'blur' }],
};

async function fetchTree() {
  loading.value = true;
  try {
    treeData.value = (await getCategoryTree()) || [];
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  formData.id = null;
  formData.name = '';
  formData.parentId = null;
  formData.level = 1;
  formData.sort = 0;
  formData.icon = '';
  formData.status = '1';
  formRef.value?.clearValidate();
}

function handleAddRoot() {
  resetForm();
}

function handleAddChild(data: any) {
  resetForm();
  formData.parentId = data.id;
  formData.level = data.level + 1;
}

function handleEdit(data: any) {
  formData.id = data.id;
  formData.name = data.name;
  formData.parentId = data.parentId;
  formData.level = data.level;
  formData.sort = data.sort ?? 0;
  formData.icon = data.icon || '';
  formData.status = data.status ?? '1';
}

async function handleSubmit() {
  await formRef.value?.validate();
  try {
    const payload = {
      name: formData.name,
      parentId: formData.parentId || undefined,
      sort: formData.sort,
      icon: formData.icon || undefined,
      status: formData.status,
    };
    if (formData.id) {
      await updateCategory(formData.id, payload);
      ElMessage.success('更新成功');
    } else {
      await createCategory(payload);
      ElMessage.success('创建成功');
    }
    resetForm();
    fetchTree();
  } catch (_) {}
}

function handleReset() {
  resetForm();
}

async function handleDelete(data: any) {
  try {
    await deleteCategory(data.id);
    ElMessage.success('删除成功');
    resetForm();
    fetchTree();
  } catch (_) {}
}

onMounted(fetchTree);
</script>

<style lang="scss" scoped>
.category-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tree-node {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding-right: 8px;

    .node-label {
      flex: 1;

      .el-icon {
        margin-right: 6px;
      }
    }

    .node-actions {
      display: none;
    }

    &:hover .node-actions {
      display: inline-flex;
    }
  }
}
</style>

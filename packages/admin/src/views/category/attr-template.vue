<template>
  <div class="attr-template-page">
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>选择品类</span>
          </template>
          <el-tree
            :data="treeData"
            v-loading="loading"
            node-key="id"
            :default-expand-all="true"
            :highlight-current="true"
            @node-click="handleNodeClick"
          >
            <template #default="{ data }">
              <span>{{ data.name }}</span>
            </template>
          </el-tree>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>属性模板{{ selectedCategory ? ' - ' + selectedCategory.name : '' }}</span>
              <el-button
                type="primary"
                size="small"
                :disabled="!selectedCategory"
                @click="handleSave"
              >
                保存
              </el-button>
            </div>
          </template>
          <div v-if="!selectedCategory" class="empty-tip">
            请先从左侧选择一个品类
          </div>
          <div v-else class="attr-list">
            <div
              v-for="(field, index) in attrFields"
              :key="index"
              class="attr-row"
            >
              <el-form-item label="字段名" label-width="80px" class="attr-item">
                <el-input v-model="field.name" placeholder="字段名" />
              </el-form-item>
              <el-form-item label="类型" label-width="60px" class="attr-item">
                <el-select v-model="field.type" placeholder="类型">
                  <el-option label="文本" value="text" />
                  <el-option label="数字" value="number" />
                  <el-option label="单选" value="select" />
                  <el-option label="多选" value="multiselect" />
                </el-select>
              </el-form-item>
              <el-form-item label="必填" label-width="60px" class="attr-item">
                <el-switch v-model="field.required" />
              </el-form-item>
              <el-form-item
                v-if="field.type === 'select' || field.type === 'multiselect'"
                label="选项"
                label-width="60px"
                class="attr-item attr-options"
              >
                <el-input
                  v-model="field.optionsStr"
                  placeholder="多个选项用逗号分隔"
                />
              </el-form-item>
              <div class="row-actions">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="handleAddRow(index)"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
                <el-button
                  link
                  type="danger"
                  size="small"
                  :disabled="attrFields.length <= 1"
                  @click="handleRemoveRow(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <el-button type="primary" plain @click="handleAddRow(attrFields.length - 1)">
              <el-icon><Plus /></el-icon>
              新增属性
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import { getCategoryTree, updateCategory, getCategoryList } from '@/api/category';

interface AttrField {
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect';
  required: boolean;
  options?: string[];
  optionsStr?: string;
}

const loading = ref(false);
const treeData = ref<any[]>([]);
const categoryList = ref<any[]>([]);
const selectedCategory = ref<any>(null);
const attrFields = reactive<AttrField[]>([
  { name: '', type: 'text', required: false },
]);

function createEmptyField(): AttrField {
  return { name: '', type: 'text', required: false };
}

async function fetchData() {
  loading.value = true;
  try {
    const [tree, list] = await Promise.all([
      getCategoryTree(),
      getCategoryList(),
    ]);
    treeData.value = tree || [];
    categoryList.value = list || [];
  } finally {
    loading.value = false;
  }
}

function handleNodeClick(data: any) {
  selectedCategory.value = data;
  loadAttrTemplate(data);
}

function loadAttrTemplate(category: any) {
  const full = categoryList.value.find((c) => c.id === category.id);
  const template = full?.attrTemplate || category.attrTemplate || [];
  attrFields.length = 0;
  if (template.length > 0) {
    template.forEach((f: any) => {
      attrFields.push({
        name: f.name || '',
        type: f.type || 'text',
        required: !!f.required,
        options: f.options || [],
        optionsStr: f.options ? f.options.join(',') : '',
      });
    });
  } else {
    attrFields.push(createEmptyField());
  }
}

function handleAddRow(index: number) {
  attrFields.splice(index + 1, 0, createEmptyField());
}

function handleRemoveRow(index: number) {
  if (attrFields.length > 1) {
    attrFields.splice(index, 1);
  }
}

async function handleSave() {
  if (!selectedCategory.value) return;
  const valid = attrFields.every((f) => f.name.trim());
  if (!valid) {
    ElMessage.warning('请填写所有属性字段名');
    return;
  }
  const template = attrFields.map((f) => ({
    name: f.name.trim(),
    type: f.type,
    required: f.required,
    options:
      f.type === 'select' || f.type === 'multiselect'
        ? (f.optionsStr || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
  }));
  try {
    await updateCategory(selectedCategory.value.id, {
      attrTemplate: template,
    });
    ElMessage.success('保存成功');
  } catch (_) {}
}

onMounted(fetchData);
</script>

<style lang="scss" scoped>
.attr-template-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .empty-tip {
    padding: 60px 0;
    text-align: center;
    color: #999;
  }

  .attr-list {
    .attr-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px;
      margin-bottom: 12px;
      background: #fafafa;
      border-radius: 4px;

      .attr-item {
        margin-bottom: 0;
        flex: 1;
        min-width: 0;

        &.attr-options {
          flex: 1.5;
        }

        :deep(.el-form-item__content) {
          min-width: 0;
        }
      }

      .row-actions {
        display: flex;
        align-items: center;
        padding-top: 6px;
        gap: 4px;
      }
    }
  }
}
</style>

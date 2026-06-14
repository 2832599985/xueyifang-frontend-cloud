<template>
  <div class="resource-page resource-page--professional">
    <section class="resource-page__header">
      <div>
        <h2 class="resource-page__title">专业管理</h2>
        <p class="resource-page__subtitle">维护平台可选专业字典数据</p>
      </div>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        新增专业
      </el-button>
    </section>

    <el-card class="resource-page__card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="专业名称">
          <el-input
            v-model="query.nameLike"
            placeholder="输入专业名称进行搜索"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="resource-page__card" shadow="never">
      <div v-if="loading" class="resource-page__loading">
        <el-skeleton :rows="6" animated />
      </div>
      <el-empty v-else-if="list.length === 0" description="暂无专业数据" />
      <template v-else>
        <el-table :data="list" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="professionalName" label="专业名称" min-width="200" />
          <el-table-column prop="description" label="描述" min-width="260" show-overflow-tooltip />
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="resource-page__pagination" v-if="total > query.pageSize">
          <el-pagination
            v-model:current-page="query.pageNum"
            :page-size="query.pageSize"
            :total="total"
            layout="total, prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </template>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="520px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="专业名称" prop="professionalName">
          <el-input v-model="form.professionalName" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            placeholder="可填写专业简介或说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { addProfessional, deleteProfessional, listProfessionals, updateProfessional } from '@/api/professional'
import type { Professional } from '@/types/dict'
import type { ProfessionalForm } from '@/api/professional'

const loading = ref(false)
const saving = ref(false)
const list = ref<Professional[]>([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  nameLike: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增专业')
const formRef = ref<FormInstance>()
const form = reactive<ProfessionalForm>({
  id: undefined,
  professionalName: '',
  description: ''
})

const rules: FormRules = {
  professionalName: [
    { required: true, message: '请输入专业名称', trigger: 'blur' },
    { min: 2, max: 50, message: '专业名称长度为2-50个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述不超过500个字符', trigger: 'blur' }
  ]
}

const loadData = async () => {
  try {
    loading.value = true
    const res = await listProfessionals({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      nameLike: query.nameLike || undefined
    })
    list.value = res.records
    total.value = res.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载专业列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  query.pageNum = 1
  loadData()
}

const handleReset = () => {
  query.pageNum = 1
  query.nameLike = ''
  loadData()
}

const handlePageChange = (page: number) => {
  query.pageNum = page
  loadData()
}

const openAddDialog = () => {
  dialogTitle.value = '新增专业'
  form.id = undefined
  form.professionalName = ''
  form.description = ''
  dialogVisible.value = true
}

const openEditDialog = (row: Professional) => {
  dialogTitle.value = '编辑专业'
  form.id = row.id
  form.professionalName = row.professionalName
  form.description = row.description || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    saving.value = true
    if (form.id) {
      await updateProfessional(form)
      ElMessage.success('专业已更新')
    } else {
      await addProfessional(form)
      ElMessage.success('专业已新增')
    }
    dialogVisible.value = false
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = (row: Professional) => {
  ElMessageBox.confirm(
    `确认删除专业「${row.professionalName}」吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteProfessional(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {
    // 用户取消
  })
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.resource-page {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  &__title {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    color: #111827;
  }

  &__subtitle {
    margin: 6px 0 0;
    color: #6b7280;
    font-size: 14px;
  }

  &__card {
    border-radius: 12px;
  }

  &__loading {
    padding: 12px;
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
  }
}
</style>

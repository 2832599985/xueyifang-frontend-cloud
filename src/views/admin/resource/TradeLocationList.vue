<template>
  <div class="resource-page resource-page--trade-location">
    <section class="resource-page__header">
      <div>
        <h2 class="resource-page__title">地点管理</h2>
        <p class="resource-page__subtitle">管理线下交易地点与可用状态</p>
      </div>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        新增地点
      </el-button>
    </section>

    <el-card class="resource-page__card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="地点名称">
          <el-input
            v-model="query.nameLike"
            placeholder="输入地点名称进行搜索"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="可用状态">
          <el-select v-model="query.isAvailable" placeholder="全部" clearable style="width: 160px">
            <el-option label="可用" :value="1" />
            <el-option label="不可用" :value="0" />
          </el-select>
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
      <el-empty v-else-if="list.length === 0" description="暂无地点数据" />
      <template v-else>
        <el-table :data="list" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="locationName" label="地点名称" min-width="180" />
          <el-table-column prop="locationAddress" label="地址" min-width="220" show-overflow-tooltip />
          <el-table-column prop="locationDescription" label="描述" min-width="220" show-overflow-tooltip />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isAvailable === 1 ? 'success' : 'info'">
                {{ row.isAvailable === 1 ? '可用' : '不可用' }}
              </el-tag>
            </template>
          </el-table-column>
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
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="地点名称" prop="locationName">
          <el-input v-model="form.locationName" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="详细地址" prop="locationAddress">
          <el-input v-model="form.locationAddress" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="描述" prop="locationDescription">
          <el-input
            v-model="form.locationDescription"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="可用状态" prop="isAvailable">
          <el-switch
            v-model="form.isAvailable"
            :active-value="1"
            :inactive-value="0"
            active-text="可用"
            inactive-text="不可用"
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
import { addTradeLocation, deleteTradeLocation, listTradeLocations, updateTradeLocation } from '@/api/tradeLocation'
import type { TradeLocation } from '@/types/dict'
import type { TradeLocationForm } from '@/api/tradeLocation'

const loading = ref(false)
const saving = ref(false)
const list = ref<TradeLocation[]>([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  nameLike: '',
  isAvailable: null as number | null
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增地点')
const formRef = ref<FormInstance>()
const form = reactive<TradeLocationForm>({
  id: undefined,
  locationName: '',
  locationAddress: '',
  locationDescription: '',
  isAvailable: 1
})

const rules: FormRules = {
  locationName: [
    { required: true, message: '请输入地点名称', trigger: 'blur' },
    { min: 2, max: 100, message: '地点名称长度为2-100个字符', trigger: 'blur' }
  ],
  locationAddress: [
    { max: 200, message: '详细地址不超过200个字符', trigger: 'blur' }
  ],
  locationDescription: [
    { max: 500, message: '描述不超过500个字符', trigger: 'blur' }
  ]
}

const loadData = async () => {
  try {
    loading.value = true
    const res = await listTradeLocations({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      nameLike: query.nameLike || undefined,
      isAvailable: query.isAvailable
    })
    list.value = res.records
    total.value = res.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载地点列表失败')
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
  query.isAvailable = null
  loadData()
}

const handlePageChange = (page: number) => {
  query.pageNum = page
  loadData()
}

const openAddDialog = () => {
  dialogTitle.value = '新增地点'
  form.id = undefined
  form.locationName = ''
  form.locationAddress = ''
  form.locationDescription = ''
  form.isAvailable = 1
  dialogVisible.value = true
}

const openEditDialog = (row: TradeLocation) => {
  dialogTitle.value = '编辑地点'
  form.id = row.id
  form.locationName = row.locationName
  form.locationAddress = row.locationAddress || ''
  form.locationDescription = row.locationDescription || ''
  form.isAvailable = row.isAvailable ?? 1
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    saving.value = true
    if (form.id) {
      await updateTradeLocation(form)
      ElMessage.success('地点已更新')
    } else {
      await addTradeLocation(form)
      ElMessage.success('地点已新增')
    }
    dialogVisible.value = false
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = (row: TradeLocation) => {
  ElMessageBox.confirm(
    `确认删除地点「${row.locationName}」吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteTradeLocation(row.id)
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

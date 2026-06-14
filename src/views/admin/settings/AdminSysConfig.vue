<template>
  <div class="admin-settings-content">
    <!-- Key Summary Card -->
    <el-card class="summary-card" shadow="never" v-loading="summaryLoading">
      <template #header>
        <div class="card-header">
          <span class="header-title">核心配置一览</span>
          <el-button text type="primary" @click="loadKeySummary">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="审核模式 (REVIEW_MODE)">
          <el-tag :type="keySummary.REVIEW_MODE === '2' ? 'success' : 'warning'">
            {{ formatReviewMode(keySummary.REVIEW_MODE) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单未支付超时 (小时)">
          <span class="summary-value">{{ keySummary.ORDER_UNPAID_TIMEOUT_HOURS || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="卖家处理退款超时 (天)">
          <span class="summary-value">{{ keySummary.SELLER_REFUND_TIMEOUT_DAYS || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="自动确认收货时间 (天)">
          <span class="summary-value">{{ keySummary.AUTO_CONFIRM_RECEIPT_DAYS || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="自助注册开关 (REGISTER_ENABLED)">
          <el-tag :type="keySummary.REGISTER_ENABLED === '1' ? 'success' : 'danger'">
            {{ keySummary.REGISTER_ENABLED === '1' ? '开启' : '关闭' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- Bulk User Import Card -->
    <el-card class="import-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="header-title">📥 批量导入学生</span>
        </div>
      </template>
      <div class="import-content">
        <div class="import-form">
          <el-upload
            ref="uploadRef"
            class="upload-area"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :on-exceed="handleExceed"
            accept=".xlsx,.xls,.csv"
            drag
          >
            <el-icon class="el-icon--upload"><Upload /></el-icon>
            <div class="el-upload__text">
              拖拽文件到这里，或 <em>点击上传</em>
            </div>
            <div class="el-upload__tip">
              支持 .xlsx、.xls、.csv 格式，CSV 请使用 UTF-8 编码
            </div>
          </el-upload>

          <div class="import-actions">
            <el-dropdown @command="downloadTemplate" trigger="click">
              <el-button :icon="Download">
                下载模板 <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="xlsx">Excel 模板 (.xlsx)</el-dropdown-item>
                  <el-dropdown-item command="csv">CSV 模板 (.csv)</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button
              type="primary"
              @click="handleImport"
              :loading="importing"
              :disabled="!selectedFile"
            >
              开始导入
            </el-button>
          </div>
        </div>

        <!-- Import Result -->
        <div v-if="importResult" class="import-result">
          <el-divider />
          <h4>导入结果</h4>
          <el-descriptions :column="4" border size="small">
            <el-descriptions-item label="总数">
              <span class="result-value">{{ importResult.totalCount }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="成功">
              <span class="result-value success">{{ importResult.successCount }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="跳过（已存在）">
              <span class="result-value warning">{{ importResult.skippedCount }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="失败">
              <span class="result-value danger">{{ importResult.failedCount }}</span>
            </el-descriptions-item>
          </el-descriptions>

          <!-- Failed Rows Table -->
          <div v-if="importResult.failedRows.length > 0" class="failed-rows">
            <h5>失败明细：</h5>
            <el-table :data="importResult.failedRows" size="small" max-height="200">
              <el-table-column prop="rowNum" label="行号" width="70" />
              <el-table-column prop="studentId" label="学号" width="120" />
              <el-table-column prop="reason" label="失败原因" />
            </el-table>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Filter Card -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="配置键">
          <el-input
            v-model="query.keyLike"
            placeholder="按 configKey 模糊搜索，如 REVIEW / ORDER"
            clearable
            style="width: 320px"
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

    <!-- Config List Card -->
    <el-card class="table-card" shadow="never">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- Empty State -->
      <el-empty
        v-else-if="list.length === 0"
        description="暂无配置项"
      />

      <!-- Config Table -->
      <template v-else>
        <el-table :data="list" style="width: 100%">
          <el-table-column prop="id" label="ID" width="70" />

          <el-table-column prop="configKey" label="配置键" min-width="220">
            <template #default="{ row }">
              <span class="config-key">{{ row.configKey }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="configValue" label="配置值" min-width="120">
            <template #default="{ row }">
              <el-tag v-if="row.configKey === 'REVIEW_MODE'" :type="row.configValue === '2' ? 'success' : 'warning'" size="small">
                {{ formatReviewMode(row.configValue) }}
              </el-tag>
              <span v-else class="config-value">{{ row.configValue }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="description" label="描述" min-width="260" show-overflow-tooltip />

          <el-table-column label="启用状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getEnabledTagType(row.isEnabled)" size="small">
                {{ getEnabledText(row.isEnabled) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="updateTime" label="更新时间" min-width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.updateTime) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openEditDialog(row)">
                编辑
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- Pagination -->
        <div class="pagination-container" v-if="total > query.pageSize!">
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

    <!-- Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑配置"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="editForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="配置键">
          <el-input :model-value="currentConfig?.configKey" disabled />
        </el-form-item>

        <el-form-item label="配置值" prop="configValue">
          <el-input v-model="editForm.configValue" placeholder="请输入配置值" />
          <div class="form-tip" v-if="currentConfig?.configKey === 'REVIEW_MODE'">
            1 = 全部审核，2 = 免审核
          </div>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入配置描述"
          />
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch
            v-model="editForm.isEnabled"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadInstance, UploadFile, UploadRawFile } from 'element-plus'
import { Search, Refresh, Upload, Download, ArrowDown } from '@element-plus/icons-vue'
import { listSysConfigs, updateSysConfig, getSysConfigKeyValues, importUsers, getImportTemplateUrl } from '@/api/sysConfig'
import type { SysConfig, SysConfigQueryRequest, SysConfigUpdateRequest } from '@/types/sysConfig'
import { IMPORTANT_CONFIG_KEYS, formatReviewMode, getEnabledText, getEnabledTagType } from '@/types/sysConfig'
import type { UserImportResultVO } from '@/types/userImport'

// List data
const loading = ref(true)
const list = ref<SysConfig[]>([])
const total = ref(0)

const query = reactive<SysConfigQueryRequest>({
  pageNum: 1,
  pageSize: 10,
  keyLike: ''
})

// Key summary data
const summaryLoading = ref(false)
const keySummary = ref<Record<string, string>>({})

// Edit dialog
const dialogVisible = ref(false)
const currentConfig = ref<SysConfig | null>(null)
const formRef = ref<FormInstance>()
const saving = ref(false)

const editForm = reactive<SysConfigUpdateRequest>({
  id: 0,
  configValue: '',
  description: '',
  isEnabled: 1
})

const formRules: FormRules = {
  configValue: [
    { required: true, message: '配置值不能为空', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述长度不能超过 200 字', trigger: 'blur' }
  ]
}

// Methods
const loadList = async () => {
  loading.value = true
  try {
    const res = await listSysConfigs(query)
    list.value = res.records
    total.value = res.total
  } catch (error: any) {
    console.error('Failed to fetch config list:', error)
    ElMessage.error(error.message || '获取配置列表失败')
  } finally {
    loading.value = false
  }
}

const loadKeySummary = async () => {
  summaryLoading.value = true
  try {
    keySummary.value = await getSysConfigKeyValues([...IMPORTANT_CONFIG_KEYS])
  } catch (error: any) {
    console.error('Failed to fetch key summary:', error)
    ElMessage.error(error.message || '获取核心配置失败')
  } finally {
    summaryLoading.value = false
  }
}

const handleSearch = () => {
  query.pageNum = 1
  loadList()
}

const handleReset = () => {
  query.keyLike = ''
  query.pageNum = 1
  loadList()
}

const handlePageChange = (page: number) => {
  query.pageNum = page
  loadList()
}

const openEditDialog = (config: SysConfig) => {
  currentConfig.value = config
  editForm.id = config.id
  editForm.configValue = config.configValue
  editForm.description = config.description
  editForm.isEnabled = config.isEnabled
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    saving.value = true
    try {
      await updateSysConfig(editForm)
      ElMessage.success('配置已更新')
      dialogVisible.value = false
      // Refresh both list and summary
      loadList()
      loadKeySummary()
    } catch (error: any) {
      console.error('Failed to update config:', error)
      ElMessage.error(error.message || '更新配置失败')
    } finally {
      saving.value = false
    }
  })
}

const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

// ==================== User Import ====================
const uploadRef = ref<UploadInstance>()
const selectedFile = ref<File | null>(null)
const importing = ref(false)
const importResult = ref<UserImportResultVO | null>(null)

const handleFileChange = (uploadFile: UploadFile) => {
  selectedFile.value = uploadFile.raw || null
  // Clear previous result
  importResult.value = null
}

const handleExceed = () => {
  ElMessage.warning('只能选择一个文件')
}

const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  importing.value = true
  importResult.value = null

  try {
    const result = await importUsers(selectedFile.value)
    importResult.value = result

    if (result.failedCount === 0 && result.skippedCount === 0) {
      ElMessage.success(`导入成功！共导入 ${result.successCount} 名学生`)
    } else if (result.successCount > 0) {
      ElMessage.warning(`导入完成：成功 ${result.successCount}，跳过 ${result.skippedCount}，失败 ${result.failedCount}`)
    } else {
      ElMessage.error('导入失败，请检查错误明细')
    }

    // Clear file selection
    uploadRef.value?.clearFiles()
    selectedFile.value = null
  } catch (error: any) {
    console.error('Import failed:', error)
    ElMessage.error(error.message || '导入失败')
  } finally {
    importing.value = false
  }
}

const downloadTemplate = (format: string = 'xlsx') => {
  // 获取 token
  const token = localStorage.getItem('token')
  // 使用与 axios 一致的 baseURL: /api，添加 format 参数
  const templateUrl = `/api${getImportTemplateUrl()}?format=${format}`

  // 添加 token 到请求头（通过 fetch）
  fetch(templateUrl, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      return res.blob()
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `user_import_template.${format}`
      link.click()
      window.URL.revokeObjectURL(url)
    })
    .catch(err => {
      console.error('Download template failed:', err)
      ElMessage.error('下载模板失败')
    })
}

// Lifecycle
onMounted(() => {
  // 权限检查已由路由守卫处理
  loadList()
  loadKeySummary()
})
</script>

<style scoped lang="scss">
.admin-settings-content {
  // Summary Card
  .summary-card {
    border-radius: 16px;
    border: none;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;

    :deep(.el-card__header) {
      padding: 16px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    :deep(.el-card__body) {
      padding: 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .summary-value {
      font-weight: 600;
      color: #4f46e5;
      font-size: 16px;
    }

    :deep(.el-descriptions__label) {
      font-weight: 500;
      color: #6b7280;
      background: #f9fafb;
    }

    :deep(.el-descriptions__content) {
      color: #303133;
    }
  }

  // Import Card
  .import-card {
    border-radius: 16px;
    border: none;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;

    :deep(.el-card__header) {
      padding: 16px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    :deep(.el-card__body) {
      padding: 24px;
    }

    .card-header {
      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .import-content {
      .import-form {
        display: flex;
        gap: 24px;
        align-items: flex-start;

        .upload-area {
          flex: 1;
          max-width: 400px;

          :deep(.el-upload-dragger) {
            padding: 30px 20px;
            border: 2px dashed #dcdfe6;
            border-radius: 8px;
            transition: border-color 0.3s;

            &:hover {
              border-color: #4f46e5;
            }
          }

          .el-icon--upload {
            font-size: 40px;
            color: #c0c4cc;
            margin-bottom: 8px;
          }

          .el-upload__text {
            color: #606266;
            font-size: 14px;

            em {
              color: #4f46e5;
            }
          }

          .el-upload__tip {
            color: #909399;
            font-size: 12px;
            margin-top: 8px;
          }
        }

        .import-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .el-button--primary {
            background: #4f46e5;
            border-color: #4f46e5;

            &:hover:not(:disabled) {
              background: #4338ca;
              border-color: #4338ca;
            }
          }
        }
      }

      .import-result {
        margin-top: 16px;

        h4 {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          margin: 16px 0 12px;
        }

        .result-value {
          font-weight: 600;
          font-size: 16px;

          &.success {
            color: #10b981;
          }

          &.warning {
            color: #f59e0b;
          }

          &.danger {
            color: #ef4444;
          }
        }

        .failed-rows {
          margin-top: 16px;

          h5 {
            font-size: 13px;
            font-weight: 500;
            color: #6b7280;
            margin: 0 0 8px;
          }
        }
      }
    }
  }

  // Filter Card
  .filter-card {
    border-radius: 16px;
    border: none;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;

    :deep(.el-card__body) {
      padding: 20px 24px;
    }

    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 16px;
    }

    :deep(.el-button--primary) {
      background: #4f46e5;
      border-color: #4f46e5;

      &:hover:not(:disabled) {
        background: #4338ca;
        border-color: #4338ca;
      }
    }
  }

  // Table Card
  .table-card {
    border-radius: 16px;
    border: none;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  // Loading
  .loading-container {
    padding: 20px 0;
  }

  // Table
  :deep(.el-table) {
    .el-table__header th {
      background: #f9fafb;
      color: #6b7280;
      font-weight: 600;
    }

    .el-table__row {
      &:hover > td {
        background: #f9fafb;
      }
    }
  }

  .config-key {
    font-family: monospace;
    color: #4f46e5;
    font-weight: 500;
  }

  .config-value {
    font-family: monospace;
  }

  // Pagination
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 24px;

    :deep(.el-pagination) {
      .el-pager li.is-active {
        background: #4f46e5;
        color: white;
      }

      .el-pager li:hover:not(.is-active) {
        color: #4f46e5;
      }
    }
  }
}

// Dialog styles
:deep(.el-dialog) {
  border-radius: 16px;

  .el-dialog__header {
    border-bottom: 1px solid #e5e7eb;
    padding: 20px 24px;
    margin: 0;
  }

  .el-dialog__title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    border-top: 1px solid #e5e7eb;
    padding: 16px 24px;
  }

  .el-button--primary {
    background: #4f46e5;
    border-color: #4f46e5;

    &:hover:not(:disabled) {
      background: #4338ca;
      border-color: #4338ca;
    }
  }
}

.form-tip {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}
</style>

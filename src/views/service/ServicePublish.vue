<template>
  <div class="service-publish-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">发布新服务</h1>
        <p class="page-subtitle">发布你的技能服务，让同学们找到你</p>
      </div>

      <!-- Main Card -->
      <el-card class="publish-card" shadow="never">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="publish-form"
        >
          <!-- Basic Information Section -->
          <div class="form-section">
            <h2 class="section-title">基础信息</h2>

            <!-- Service Title -->
            <el-form-item label="服务标题" prop="serviceTitle">
              <el-input
                v-model="form.serviceTitle"
                maxlength="50"
                show-word-limit
                placeholder="一句话描述你的服务，例如：Java一对一辅导"
                size="large"
                class="custom-input"
              />
            </el-form-item>

            <!-- Two Columns Layout -->
            <el-row :gutter="24">
              <!-- Service Category -->
              <el-col :xs="24" :sm="12">
                <el-form-item label="服务分类" prop="tagId">
                  <el-select
                    v-model="form.tagId"
                    placeholder="请选择分类"
                    size="large"
                    class="w-full"
                  >
                    <el-option
                      v-for="tag in serviceTags"
                      :key="tag.tagId"
                      :label="tag.tagName"
                      :value="tag.tagId"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <!-- Service Price -->
              <el-col :xs="24" :sm="12">
                <el-form-item label="服务价格 (元)" prop="price">
                  <el-input-number
                    v-model="form.price"
                    :min="0.01"
                    :max="99999"
                    :precision="2"
                    :step="10"
                    size="large"
                    class="w-full"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- Trade Type Selection -->
            <el-form-item label="交易方式" prop="tradeType">
              <div class="trade-type-selector">
                <div
                  :class="['trade-type-card', { active: form.tradeType === 2 }]"
                  @click="form.tradeType = 2"
                >
                  <el-icon :size="24"><CreditCard /></el-icon>
                  <div class="card-content">
                    <h4>线上担保交易</h4>
                    <p>平台担保，安全可靠</p>
                  </div>
                </div>
                <div
                  :class="['trade-type-card', { active: form.tradeType === 1 }]"
                  @click="form.tradeType = 1"
                >
                  <el-icon :size="24"><Location /></el-icon>
                  <div class="card-content">
                    <h4>线下见面交易</h4>
                    <p>面对面交易，即时交付</p>
                  </div>
                </div>
              </div>
            </el-form-item>

            <!-- Trade Location (for offline) -->
            <el-form-item
              v-if="form.tradeType === 1"
              label="交易地点"
              prop="tradeLocationId"
            >
              <el-select
                v-model="form.tradeLocationId"
                placeholder="请选择交易地点"
                size="large"
                class="w-full"
              >
                <el-option
                  v-for="location in tradeLocations"
                  :key="location.id"
                  :label="location.locationName"
                  :value="location.id"
                >
                  <div class="location-option">
                    <span class="location-name">{{ location.locationName }}</span>
                    <span class="location-address">{{ location.locationAddress }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <!-- Purchase Limit and Physical Type -->
            <el-row :gutter="24">
              <el-col :xs="24" :sm="12">
                <el-form-item label="限购次数" prop="maxPurchases">
                  <el-input-number
                    v-model="form.maxPurchases"
                    :min="-1"
                    :max="9999"
                    size="large"
                    class="w-full"
                    controls-position="right"
                  />
                  <div class="form-tip">设置为 -1 表示不限制</div>
                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="12">
                <el-form-item label="商品类型" prop="isPhysical">
                  <el-radio-group v-model="form.isPhysical" size="large">
                    <el-radio-button :label="0">虚拟服务</el-radio-button>
                    <el-radio-button :label="1">实物商品</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- Service Description Section -->
          <div class="form-section">
            <h2 class="section-title">服务描述</h2>

            <el-form-item label="详细描述" prop="serviceDescription">
              <div class="editor-wrapper">
                <div class="editor-toolbar">
                  <el-button-group>
                    <el-button text :icon="Edit" disabled>编辑</el-button>
                    <el-button text :icon="Picture" disabled>图片</el-button>
                    <el-button text :icon="Link" disabled>链接</el-button>
                  </el-button-group>
                </div>
                <el-input
                  v-model="form.serviceDescription"
                  type="textarea"
                  :rows="8"
                  maxlength="2000"
                  show-word-limit
                  placeholder="详细介绍你的服务内容、服务流程、注意事项等..."
                  class="editor-textarea"
                />
              </div>
            </el-form-item>
          </div>

          <!-- Image Upload Section -->
          <div class="form-section">
            <h2 class="section-title">服务图片</h2>
            <p class="section-desc">上传服务相关图片，第一张将作为封面（最多10张）</p>

            <el-form-item prop="images">
              <el-upload
                v-model:file-list="fileList"
                :action="uploadUrl"
                :headers="uploadHeaders"
                list-type="picture-card"
                :limit="10"
                :on-success="handleUploadSuccess"
                :on-error="handleUploadError"
                :on-exceed="handleExceed"
                :on-remove="handleRemove"
                class="service-upload"
              >
                <el-icon class="upload-icon"><Plus /></el-icon>
                <template #file="{ file }">
                  <div class="upload-item">
                    <img class="upload-image" :src="file.url" alt="" />
                    <span v-if="fileList[0]?.uid === file.uid" class="cover-badge">封面</span>
                    <span class="upload-actions">
                      <span class="upload-action" @click.stop="handlePreview(file)">
                        <el-icon><ZoomIn /></el-icon>
                      </span>
                      <span class="upload-action" @click.stop="handleRemove(file)">
                        <el-icon><Delete /></el-icon>
                      </span>
                    </span>
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <el-button size="large" @click="handleCancel">取消</el-button>
            <el-button size="large" @click="handleSaveDraft">保存草稿</el-button>
            <el-button
              type="primary"
              size="large"
              @click="handlePublish"
              :loading="submitting"
              class="publish-button"
            >
              立即发布
            </el-button>
          </div>
        </el-form>
      </el-card>

      <!-- Permission Alert (if no permission) -->
      <el-card v-if="!hasPublishPermission" class="permission-alert" shadow="never">
        <div class="alert-content">
          <el-icon :size="48" color="#f59e0b"><Warning /></el-icon>
          <h3>暂无发布权限</h3>
          <p>您当前还没有发布服务的权限，请先申请权限</p>
          <el-button type="primary" @click="goApplyPermission">申请权限</el-button>
        </div>
      </el-card>
    </div>

    <!-- Image Preview Dialog -->
    <el-dialog
      v-model="previewVisible"
      title="图片预览"
      width="800px"
      append-to-body
    >
      <img :src="previewUrl" style="width: 100%" alt="Preview" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadFile, UploadFiles } from 'element-plus'
import {
  Edit,
  Picture,
  Link,
  Plus,
  ZoomIn,
  Delete,
  CreditCard,
  Location,
  Warning
} from '@element-plus/icons-vue'
import { publishService } from '@/api/service'
import { getPermissionStatus } from '@/api/permission'
import type { ServiceFormData } from '@/types/service'
import type { ServiceTag, TradeLocation } from '@/types/dict'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useDictStore } from '@/stores/dict'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const dictStore = useDictStore()

// Form ref
const formRef = ref<FormInstance>()

// Permission check (default false, check from API)
const hasPublishPermission = ref(false)
const permissionLoading = ref(true)

// Form data
const form = reactive<ServiceFormData>({
  serviceTitle: '',
  serviceDescription: '',
  tagId: undefined as unknown as number,
  price: undefined as unknown as number,
  tradeType: 2, // Default to online escrow
  tradeLocationId: undefined, // Add this field for offline trade
  maxPurchases: -1, // Default to unlimited
  isPhysical: 0, // Default to virtual service
  images: []
})

// Form validation rules
const rules: FormRules = {
  serviceTitle: [
    { required: true, message: '请输入服务标题', trigger: 'blur' },
    { min: 1, max: 50, message: '标题长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  tagId: [
    { required: true, message: '请选择服务分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入服务价格', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '价格必须大于0', trigger: 'blur' }
  ],
  tradeType: [
    { required: true, message: '请选择交易方式', trigger: 'change' }
  ],
  tradeLocationId: [
    {
      required: false, // Not always required
      message: '请选择交易地点',
      trigger: 'change',
      validator: (rule, value, callback) => {
        // Only validate when trade type is offline
        if (form.tradeType === 1 && !value) {
          callback(new Error('线下交易必须选择交易地点'))
        } else {
          callback()
        }
      }
    }
  ],
  serviceDescription: [
    { required: true, message: '请输入服务描述', trigger: 'blur' },
    { min: 10, max: 2000, message: '描述长度在 10 到 2000 个字符', trigger: 'blur' }
  ],
  images: [
    {
      required: true,
      message: '请至少上传一张服务图片',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (!form.images || form.images.length === 0) {
          callback(new Error('请至少上传一张服务图片'))
        } else {
          callback()
        }
      }
    }
  ]
}

// Data (now using computed from dictStore)
const serviceTags = computed(() => dictStore.serviceTags || [])
const tradeLocations = computed(() => dictStore.availableLocations || [])
const submitting = ref(false)
const fileList = ref<UploadFile[]>([])
const previewVisible = ref(false)
const previewUrl = ref('')

// Upload config
const uploadUrl = '/backend/api/file/upload?biz=service_image' // Use correct biz type from backend enum
const uploadHeaders = {
  Authorization: `Bearer ${appStore.token}`
}

// Methods
const loadDictData = async () => {
  try {
    await Promise.all([
      dictStore.fetchServiceTags(),
      dictStore.fetchTradeLocations()
    ])
  } catch (error) {
    console.error('Failed to fetch dict data:', error)
    ElMessage.error('获取基础数据失败')
  }
}

const handleUploadSuccess = (response: any, file: UploadFile) => {
  if (response.code === 0 && response.data) {
    // Add URL to images array
    form.images.push(response.data)
  } else {
    ElMessage.error('图片上传失败')
    // Remove failed file from list
    const index = fileList.value.findIndex(f => f.uid === file.uid)
    if (index > -1) {
      fileList.value.splice(index, 1)
    }
  }
}

const handleUploadError = () => {
  ElMessage.error('图片上传失败，请重试')
}

const handleExceed = () => {
  ElMessage.warning('最多只能上传10张图片')
}

const handleRemove = (file: UploadFile) => {
  // Get the file path from the upload response (stored as response.data)
  const filePath = (file as any).response?.data
  if (filePath) {
    const index = form.images.indexOf(filePath)
    if (index > -1) {
      form.images.splice(index, 1)
    }
  }
  // Also remove from fileList (for custom template manual removal)
  const fileListIndex = fileList.value.findIndex(f => f.uid === file.uid)
  if (fileListIndex > -1) {
    fileList.value.splice(fileListIndex, 1)
  }
}

const handlePreview = (file: UploadFile) => {
  previewUrl.value = file.url!
  previewVisible.value = true
}

const handleCancel = () => {
  ElMessageBox.confirm('确定要取消发布吗？已填写的内容将不会保存。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '继续编辑',
    type: 'warning'
  }).then(() => {
    router.back()
  }).catch(() => {
    // Continue editing
  })
}

const handleSaveDraft = () => {
  ElMessage.info('草稿功能开发中...')
}

const handlePublish = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    appStore.setLoading(true)

    try {
      const serviceId = await publishService(form)

      ElMessage.success('服务发布成功！')

      // Navigate to service detail or my services
      setTimeout(() => {
        router.push(`/services/${serviceId}`)
      }, 1000)
    } catch (error: any) {
      console.error('Failed to publish service:', error)
      ElMessage.error(error.message || '服务发布失败')
    } finally {
      submitting.value = false
      appStore.setLoading(false)
    }
  })
}

const goApplyPermission = () => {
  router.push('/user/center')
}

// Check user's publish permission
const checkPermission = async () => {
  permissionLoading.value = true
  try {
    const permission = await getPermissionStatus()
    hasPublishPermission.value = permission.publishPermission === 1
    if (!hasPublishPermission.value) {
      ElMessage.warning('您暂无发布权限，请先申请')
    }
  } catch (error) {
    console.error('Failed to check permission:', error)
    hasPublishPermission.value = false
  } finally {
    permissionLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Check permission first
  checkPermission()

  // Fetch required data from dict store (cached)
  loadDictData()
})
</script>

<style scoped lang="scss">
.service-publish-page {
  min-height: 100vh;
  background: #f9fafb;
  padding: 24px 0 60px;

  .page-container {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 20px;
  }

  // Page Header
  .page-header {
    text-align: center;
    margin-bottom: 32px;

    .page-title {
      font-size: 32px;
      font-weight: 700;
      color: #303133;
      margin: 0 0 8px;
    }

    .page-subtitle {
      font-size: 16px;
      color: #4b5563;
    }
  }

  // Main Card
  .publish-card {
    border-radius: 16px;
    border: none;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    padding: 40px;

    @media (max-width: 768px) {
      padding: 24px;
    }
  }

  // Form Sections
  .form-section {
    margin-bottom: 40px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .section-desc {
      font-size: 14px;
      color: #6b7280;
      margin: -12px 0 16px;
    }
  }

  // Form Styles
  .publish-form {
    :deep(.el-form-item) {
      margin-bottom: 24px;

      .el-form-item__label {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 8px;
      }
    }

    // Custom input styles
    :deep(.el-input__wrapper),
    :deep(.el-textarea__inner),
    :deep(.el-select .el-input__wrapper) {
      box-shadow: 0 0 0 1px #d1d5db inset;
      border-radius: 8px;

      &:hover {
        box-shadow: 0 0 0 1px #4f46e5 inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px #4f46e5 inset;
      }
    }

    :deep(.el-input-number) {
      width: 100%;

      .el-input__wrapper {
        padding-left: 15px;
        padding-right: 50px;
      }
    }

    .w-full {
      width: 100%;
    }

    .form-tip {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
  }

  // Trade Type Selector
  .trade-type-selector {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;

    .trade-type-card {
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 16px;

      &:hover {
        border-color: #4f46e5;
        background: #f9fafb;
      }

      &.active {
        border-color: #4f46e5;
        background: #eef2ff;

        .el-icon {
          color: #4f46e5;
        }

        h4 {
          color: #4f46e5;
        }
      }

      .el-icon {
        color: #6b7280;
        flex-shrink: 0;
      }

      .card-content {
        flex: 1;

        h4 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }
      }
    }
  }

  // Location Option
  .location-option {
    display: flex;
    flex-direction: column;

    .location-name {
      font-size: 14px;
      color: #303133;
    }

    .location-address {
      font-size: 12px;
      color: #6b7280;
      margin-top: 2px;
    }
  }

  // Editor Wrapper
  .editor-wrapper {
    border: 1px solid #d1d5db;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: #4f46e5;
    }

    .editor-toolbar {
      background: #f9fafb;
      padding: 8px 12px;
      border-bottom: 1px solid #e5e7eb;

      :deep(.el-button) {
        color: #6b7280;

        &:hover {
          color: #4f46e5;
        }
      }
    }

    .editor-textarea {
      :deep(.el-textarea__inner) {
        border: none;
        box-shadow: none !important;
        padding: 16px;
        font-size: 14px;
        line-height: 1.6;
      }
    }
  }

  // Upload Styles
  .service-upload {
    :deep(.el-upload-list--picture-card) {
      .el-upload-list__item {
        width: 120px;
        height: 120px;
        border-radius: 8px;
        overflow: hidden;
      }

      .el-upload--picture-card {
        width: 120px;
        height: 120px;
        border-radius: 8px;
        border: 2px dashed #d1d5db;
        background: #f9fafb;

        &:hover {
          border-color: #4f46e5;
          background: #eef2ff;
        }
      }
    }

    .upload-icon {
      font-size: 28px;
      color: #6b7280;
    }

    .upload-item {
      position: relative;
      width: 100%;
      height: 100%;

      .upload-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cover-badge {
        position: absolute;
        top: 8px;
        left: 8px;
        padding: 2px 8px;
        background: #4f46e5;
        color: white;
        font-size: 12px;
        border-radius: 4px;
      }

      .upload-actions {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.3s;

        &:hover {
          opacity: 1;
        }

        .upload-action {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background: white;
            transform: scale(1.1);
          }

          .el-icon {
            color: #303133;
            font-size: 18px;
          }
        }
      }
    }
  }

  // Form Actions
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;

    .el-button {
      min-width: 100px;
    }

    .publish-button {
      background: #4f46e5;
      border-color: #4f46e5;
      font-weight: 600;

      &:hover {
        background: #4338ca;
        border-color: #4338ca;
      }
    }
  }

  // Permission Alert
  .permission-alert {
    margin-top: 24px;
    border-radius: 16px;
    border: none;

    .alert-content {
      text-align: center;
      padding: 40px;

      .el-icon {
        margin-bottom: 16px;
      }

      h3 {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px;
      }

      p {
        font-size: 14px;
        color: #6b7280;
        margin: 0 0 24px;
      }

      .el-button {
        background: #4f46e5;
        border-color: #4f46e5;

        &:hover {
          background: #4338ca;
          border-color: #4338ca;
        }
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 640px) {
  .service-publish-page {
    .form-actions {
      flex-direction: column;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
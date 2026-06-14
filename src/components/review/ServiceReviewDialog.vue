<template>
  <el-dialog
    :model-value="visible"
    title="发表评价"
    width="520px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      class="review-form"
    >
      <!-- Rating -->
      <el-form-item label="评分" prop="rating">
        <div class="rating-wrapper">
          <el-rate
            v-model="form.rating"
            :max="5"
            :colors="['#4f46e5', '#4f46e5', '#4f46e5']"
            :void-color="'#e5e7eb'"
            show-text
            :texts="['非常差', '较差', '一般', '较好', '非常好']"
          />
        </div>
      </el-form-item>

      <!-- Content -->
      <el-form-item label="评价内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          maxlength="500"
          show-word-limit
          placeholder="请详细描述本次服务体验（至少10个字）"
        />
      </el-form-item>

      <!-- Anonymous -->
      <el-form-item label=" " :label-width="'80px'">
        <el-checkbox v-model="form.anonymous" class="anonymous-checkbox">
          匿名评价
          <span class="anonymous-tip">（评价列表中将显示"匿名用户"）</span>
        </el-checkbox>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
          class="submit-btn"
        >
          提交评价
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { createReview } from '@/api/review'
import type { ServiceReviewCreateRequest } from '@/types/review'

// Props
interface Props {
  orderId: number
  visible: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

// Form
const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  rating: 0,
  content: '',
  anonymous: false
})

// Validation rules
const rules: FormRules = {
  rating: [
    { required: true, message: '请为本次服务打分', trigger: 'change' },
    {
      validator: (_rule, value, callback) => {
        if (value < 1 || value > 5) {
          callback(new Error('请选择1-5星评分'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  content: [
    { required: true, message: '请填写评价内容', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        const len = (value || '').trim().length
        if (len < 10) {
          callback(new Error('评价内容至少10个字'))
        } else if (len > 500) {
          callback(new Error('评价内容不能超过500字'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// Methods
const resetForm = () => {
  form.rating = 0
  form.content = ''
  form.anonymous = false
  formRef.value?.resetFields()
}

const handleClose = () => {
  emit('update:visible', false)
  // Reset form when closing
  setTimeout(resetForm, 300)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      const data: ServiceReviewCreateRequest = {
        orderId: props.orderId,
        rating: form.rating,
        content: form.content.trim(),
        anonymous: form.anonymous
      }
      await createReview(data)
      ElMessage.success('评价提交成功')
      emit('success')
      emit('update:visible', false)
      setTimeout(resetForm, 300)
    } catch (error: any) {
      // Error message already shown by interceptor
      // Handle specific error codes if needed
      if (error.message?.includes('已评价')) {
        ElMessage.warning('该订单已评价，无需重复提交')
      }
      console.error('Failed to create review:', error)
    } finally {
      submitting.value = false
    }
  })
}

// Reset form when dialog opens
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetForm()
  }
})
</script>

<style scoped lang="scss">
.review-form {
  padding: 10px 0;

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #303133;
  }

  .rating-wrapper {
    :deep(.el-rate) {
      .el-rate__icon {
        font-size: 24px;
      }

      .el-rate__text {
        color: #4f46e5;
        font-weight: 500;
        margin-left: 12px;
      }
    }
  }

  :deep(.el-textarea__inner) {
    border-radius: 8px;
    border-color: #d1d5db;

    &:hover {
      border-color: #4f46e5;
    }

    &:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
    }
  }

  .anonymous-checkbox {
    :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
      background-color: #4f46e5;
      border-color: #4f46e5;
    }

    :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
      color: #4f46e5;
    }

    .anonymous-tip {
      color: #6b7280;
      font-size: 12px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .submit-btn {
    background: #4f46e5;
    border-color: #4f46e5;

    &:hover:not(:disabled) {
      background: #4338ca;
      border-color: #4338ca;
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
}
</style>

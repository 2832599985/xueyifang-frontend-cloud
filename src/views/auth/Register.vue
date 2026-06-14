<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Left Side: Branding -->
      <div class="auth-branding">
        <div class="brand-icon">
          <el-icon><School /></el-icon>
        </div>
        <h1>学艺坊</h1>
        <p class="subtitle">校园技能服务与交易平台</p>
        <p class="description">
          连接校园才华，变现知识技能<br>
          安全、便捷、专业的校园服务市场
        </p>
      </div>

      <!-- Right Side: Form -->
      <div class="auth-form-container">
        <!-- Tabs -->
        <div class="auth-tabs">
          <div class="tab-item" @click="router.push('/login')">登录</div>
          <div class="tab-item active">注册</div>
        </div>

        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="auth-form"
          size="large"
          @submit.prevent
        >
          <div class="form-grid">
            <el-form-item prop="studentId">
              <div class="input-label">学号 *</div>
              <el-input
                v-model="registerForm.studentId"
                placeholder="2024..."
              />
            </el-form-item>

            <el-form-item prop="realName">
              <div class="input-label">姓名 *</div>
              <el-input
                v-model="registerForm.realName"
                placeholder="真实姓名"
              />
            </el-form-item>
          </div>

          <div class="form-grid">
             <!-- 暂时硬编码专业和年级，后续可改为下拉 -->
            <el-form-item prop="professionalId">
              <div class="input-label">专业 *</div>
              <el-select v-model="registerForm.professionalId" placeholder="选择专业" style="width: 100%">
                <el-option label="计算机科学与技术" :value="1" />
                <el-option label="软件工程" :value="2" />
                <el-option label="视觉传达设计" :value="3" />
              </el-select>
            </el-form-item>
            
          </div>

          <el-form-item prop="phone">
            <div class="input-label">手机号 *</div>
            <el-input
              v-model="registerForm.phone"
              placeholder="用于接收通知"
            />
          </el-form-item>

          <el-form-item prop="password">
            <div class="input-label">设置密码 *</div>
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="8-16位，含数字字母"
              show-password
            />
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <div class="input-label">确认密码 *</div>
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="success"
              class="submit-btn"
              :loading="loading"
              @click="handleRegister"
            >
              立即注册
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { School } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'
import { getRegisterStatus } from '@/api/sysConfig'
import type { RegisterRequest } from '@/types/auth'

const router = useRouter()
const registerFormRef = ref<FormInstance>()
const loading = ref(false)
const registerEnabled = ref(true)

const registerForm = reactive<RegisterRequest>({
  studentId: '',
  password: '',
  confirmPassword: '',
  realName: '',
  phone: '',
  email: 'test@example.com', // 默认值
  dormitory: '默认宿舍', // 默认值
  professionalId: 1
})


const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const registerRules = reactive<FormRules>({
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 16, message: '长度在 8 到 16 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/, message: '密码需包含字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
})

const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await authApi.register(registerForm)
        ElMessage.success('注册成功，请登录')
        router.push('/login')
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 检查注册开关
onMounted(async () => {
  try {
    const res = await getRegisterStatus()
    registerEnabled.value = res.registerEnabled
    if (!res.registerEnabled) {
      ElMessage.warning('注册功能已关闭，请联系管理员')
      router.push('/login')
    }
  } catch (error) {
    console.error('Failed to check register status:', error)
    // 失败时默认允许（fail open）
  }
})
</script>

<style scoped lang="scss">
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9fafb; // gray-50
  padding: 20px;
}

.auth-card {
  display: flex;
  width: 100%;
  max-width: 900px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); // shadow-xl
  overflow: hidden;
  min-height: 550px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.auth-branding {
  flex: 1;
  background-color: #4f46e5; // indigo-600
  color: #fff;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  .brand-icon {
    font-size: 60px;
    margin-bottom: 16px;
  }

  h1 {
    font-size: 30px;
    font-weight: 700;
    margin: 0 0 8px;
  }

  .subtitle {
    font-size: 16px;
    color: #c7d2fe; // indigo-200
    margin: 0;
  }

  .description {
    margin-top: 32px;
    font-size: 14px;
    color: #a5b4fc; // indigo-300
    line-height: 1.6;
  }
}

.auth-form-container {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.auth-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb; // gray-200
  margin-bottom: 30px;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 12px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    color: #6b7280; // gray-500
    transition: all 0.3s;

    &:hover {
      color: #4f46e5;
    }

    &.active {
      color: #4f46e5; // indigo-600
      border-bottom: 2px solid #4f46e5;
    }
  }
}

.auth-form {
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .input-label {
    font-size: 12px;
    font-weight: 700;
    color: #374151; // gray-700
    margin-bottom: 4px;
  }

  :deep(.el-input__wrapper), :deep(.el-select__wrapper) {
    box-shadow: 0 0 0 1px #d1d5db inset; // gray-300
    padding: 8px 11px;
    
    &.is-focus {
      box-shadow: 0 0 0 1px #4f46e5 inset !important; // indigo-500
    }
  }

  .submit-btn {
    width: 100%;
    background-color: #16a34a; // green-600
    border-color: #16a34a;
    padding: 22px;
    font-size: 16px;
    font-weight: 700;
    margin-top: 10px;

    &:hover {
      background-color: #15803d; // green-700
      border-color: #15803d;
    }
  }
}
</style>

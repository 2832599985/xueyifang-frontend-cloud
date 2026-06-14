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
          <div class="tab-item active">登录</div>
          <div v-if="registerConfigStore.registerEnabled" class="tab-item" @click="router.push('/register')">注册</div>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="auth-form"
          size="large"
          @submit.prevent
        >
          <el-form-item prop="studentId">
            <div class="input-label">学号</div>
            <el-input
              v-model="loginForm.studentId"
              placeholder="请输入学号"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <div class="input-label">密码</div>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <div class="form-options">
            <el-checkbox>记住我</el-checkbox>
            <a href="#" class="forgot-password">忘记密码?</a>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              class="submit-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 快捷填充演示账号 -->
        <div class="demo-accounts">
          <div class="demo-title">演示账号</div>
          <div class="demo-btns">
            <el-button size="small" @click="fillAccount('20240002', 'password123')">
              卖家账号
            </el-button>
            <el-button size="small" @click="fillAccount('20240003', 'password123')">
              买家账号
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, School } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'
import { getRegisterStatus } from '@/api/sysConfig'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useRegisterConfigStore } from '@/stores/registerConfig'
import type { LoginRequest } from '@/types/auth'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()
const registerConfigStore = useRegisterConfigStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)
let registerStatusTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Initial fetch
  registerConfigStore.fetchRegisterStatus()

  // Start polling every 3 seconds
  // 轮询获取注册开关状态，保证后台修改后前端能及时更新
  registerStatusTimer = setInterval(() => {
    registerConfigStore.fetchRegisterStatus()
  }, 3000)
})

onUnmounted(() => {
  if (registerStatusTimer) {
    clearInterval(registerStatusTimer)
    registerStatusTimer = null
  }
})
const loginForm = reactive<LoginRequest>({
  studentId: '',
  password: ''
})

const fillAccount = (studentId: string, password: string) => {
  loginForm.studentId = studentId
  loginForm.password = password
}

const loginRules = reactive<FormRules>({
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
})

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await authApi.login(loginForm)
        
        appStore.setToken(res.token)
        userStore.setUserInfo(res.userInfo)
        
        ElMessage.success('登录成功')
        
        const redirect = route.query.redirect as string
        router.push(redirect || '/')
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}
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
  .input-label {
    font-size: 14px;
    font-weight: 700;
    color: #374151; // gray-700
    margin-bottom: 8px;
  }

  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #d1d5db inset; // gray-300
    padding: 8px 11px;
    
    &.is-focus {
      box-shadow: 0 0 0 1px #4f46e5 inset !important; // indigo-500
    }
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .forgot-password {
      font-size: 14px;
      color: #4f46e5;
      text-decoration: none;

      &:hover {
        color: #3730a3; // indigo-800
      }
    }
  }

  .submit-btn {
    width: 100%;
    background-color: #4f46e5;
    border-color: #4f46e5;
    padding: 22px;
    font-size: 16px;
    font-weight: 700;
    margin-top: 10px;

    &:hover {
      background-color: #4338ca; // indigo-700
      border-color: #4338ca;
    }
  }
}

.demo-accounts {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #e5e7eb;

  .demo-title {
    font-size: 13px;
    color: #9ca3af;
    text-align: center;
    margin-bottom: 12px;
  }

  .demo-btns {
    display: flex;
    gap: 10px;

    .el-button {
      flex: 1;
      border-color: #e0e7ff;
      color: #4f46e5;
      background: #f5f3ff;

      &:hover {
        background: #ede9fe;
        border-color: #c7d2fe;
      }
    }
  }
}
</style>

<template>
  <div class="admin-login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">学艺坊 Admin</h1>
          <p class="login-subtitle">管理后台登录</p>
        </div>

        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="formRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="studentId">
            <el-input
              v-model="loginForm.studentId"
              placeholder="管理员账号"
              size="large"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              size="large"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <!-- 快捷填充演示账号 -->
          <div class="demo-accounts">
            <div class="demo-title">演示账号</div>
            <el-button size="small" class="demo-btn" @click="fillAccount('20240001', 'password123')">
              管理员账号
            </el-button>
          </div>

          <router-link to="/login" class="back-link">
            返回用户登录
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { authApi } from '@/api/auth'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  studentId: '',
  password: ''
})

const fillAccount = (studentId: string, password: string) => {
  loginForm.studentId = studentId
  loginForm.password = password
}

const formRules: FormRules = {
  studentId: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      // Login
      const loginRes = await authApi.login({
        studentId: loginForm.studentId,
        password: loginForm.password
      })

      // Save token
      appStore.setToken(loginRes.token)

      // Get current user info
      const userInfo = await authApi.getCurrentUser()
      userStore.setUserInfo(userInfo)

      // Check if admin
      if (userInfo.role !== 2) {
        ElMessage.error('该账号不是管理员')
        appStore.clearToken()
        userStore.clearUserInfo()
        return
      }

      ElMessage.success('登录成功')

      // Redirect
      const redirect = (route.query.redirect as string) || '/admin/dashboard'
      router.push(redirect)
    } catch (error: any) {
      console.error('Login failed:', error)
      ElMessage.error(error.message || '登录失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.admin-login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .login-title {
    font-size: 28px;
    font-weight: 700;
    color: #4f46e5;
    margin: 0 0 8px;
  }

  .login-subtitle {
    font-size: 15px;
    color: #6b7280;
    margin: 0;
  }
}

.login-form {
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;

    &:hover {
      border-color: #4f46e5;
    }

    &.is-focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
  }

  .login-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    background: #4f46e5;
    border-color: #4f46e5;
    border-radius: 8px;

    &:hover:not(:disabled) {
      background: #4338ca;
      border-color: #4338ca;
    }
  }
}

.login-footer {
  text-align: center;
  margin-top: 24px;

  .demo-accounts {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px dashed #e5e7eb;

    .demo-title {
      font-size: 13px;
      color: #9ca3af;
      margin-bottom: 10px;
    }

    .demo-btn {
      border-color: #e0e7ff;
      color: #4f46e5;
      background: #f5f3ff;

      &:hover {
        background: #ede9fe;
        border-color: #c7d2fe;
      }
    }
  }

  .back-link {
    color: #6b7280;
    text-decoration: none;
    font-size: 14px;

    &:hover {
      color: #4f46e5;
    }
  }
}
</style>

<template>
  <div class="user-center-page">
    <div class="user-center-container">
      <!-- Left Sidebar -->
      <aside class="user-sidebar">
        <div class="sidebar-card">
          <!-- User Avatar Section -->
          <div class="user-profile-section">
            <el-avatar
              :size="80"
              :src="buildImageUrl(userStore.userInfo?.avatar)"
              class="user-avatar"
            >
              {{ userStore.userInfo?.nickname?.charAt(0) || userStore.userInfo?.realName?.charAt(0) || '用' }}
            </el-avatar>
            <div class="user-name">{{ userStore.userInfo?.nickname || userStore.userInfo?.realName || '用户' }}</div>
            <div class="user-badge" v-if="userStore.userInfo?.publishPermission === 1">
              <el-icon><CircleCheck /></el-icon>
              已认证服务商
            </div>
          </div>

          <!-- Navigation Menu -->
          <nav class="sidebar-nav">
            <router-link
              to="/user/center"
              class="nav-item active"
            >
              <el-icon><User /></el-icon>
              <span>个人资料</span>
            </router-link>
            <router-link
              to="/my-services"
              class="nav-item"
            >
              <el-icon><Box /></el-icon>
              <span>我的服务</span>
            </router-link>
            <router-link
              to="/orders"
              class="nav-item"
            >
              <el-icon><ShoppingBag /></el-icon>
              <span>购买订单</span>
            </router-link>
            <router-link
              to="/orders/sales"
              class="nav-item"
            >
              <el-icon><Shop /></el-icon>
              <span>销售订单</span>
            </router-link>
            <router-link
              to="/statistics/sales"
              class="nav-item"
            >
              <el-icon><TrendCharts /></el-icon>
              <span>销售统计</span>
            </router-link>
            <router-link
              to="/favorites"
              class="nav-item"
            >
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </router-link>
            <router-link
              to="/wallet"
              class="nav-item"
            >
              <el-icon><Wallet /></el-icon>
              <span>我的钱包</span>
            </router-link>
            <router-link
              to="/disputes"
              class="nav-item"
            >
              <el-icon><Warning /></el-icon>
              <span>我的纠纷</span>
            </router-link>
          </nav>
        </div>
      </aside>

      <!-- Right Main Content -->
      <main class="main-content">
        <!-- Profile Card -->
        <div class="content-card profile-card">
          <div class="card-header">
            <h2 class="card-title">个人资料</h2>
            <el-button text class="edit-btn" @click="openEditProfileDialog">
              编辑资料
            </el-button>
          </div>

          <div class="profile-content">
            <div class="profile-left">
              <div class="avatar-container" @click="triggerAvatarUpload">
                <el-avatar
                  :size="128"
                  :src="buildImageUrl(userStore.userInfo?.avatar)"
                  class="large-avatar"
                  :class="{ uploading: avatarUploading }"
                >
                  {{ userStore.userInfo?.nickname?.charAt(0) || userStore.userInfo?.realName?.charAt(0) || '用' }}
                </el-avatar>
                <div class="avatar-overlay" :class="{ 'is-uploading': avatarUploading }">
                  <template v-if="avatarUploading">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    <span>上传中...</span>
                  </template>
                  <template v-else>
                    <el-icon><Camera /></el-icon>
                    <span>更换头像</span>
                  </template>
                </div>
                <input
                  ref="avatarInputRef"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  class="avatar-input"
                  @change="handleAvatarChange"
                />
              </div>
              <div class="student-badge" v-if="userStore.userInfo">
                <el-icon><CircleCheck /></el-icon>
                已认证学生
              </div>
            </div>

            <div class="profile-right">
              <div class="info-grid">
                <div class="info-item">
                  <label>真实姓名</label>
                  <div class="info-value">{{ userStore.userInfo?.realName || '-' }}</div>
                </div>
                <div class="info-item">
                  <label>学号</label>
                  <div class="info-value">{{ userStore.userInfo?.studentId || '-' }}</div>
                </div>
                <div class="info-item">
                  <label>专业 / 年级</label>
                  <div class="info-value">
                    {{ userStore.userInfo?.professionalName || '未设置' }}
                    {{ userStore.userInfo?.grade ? ' / ' + userStore.userInfo.grade : '' }}
                  </div>
                </div>
                <div class="info-item">
                  <label>手机号</label>
                  <div class="info-value">{{ userStore.userInfo?.phone || '-' }}</div>
                </div>
                <div class="info-item">
                  <label>邮箱</label>
                  <div class="info-value">{{ userStore.userInfo?.email || '-' }}</div>
                </div>
                <div class="info-item">
                  <label>寝室号</label>
                  <div class="info-value">{{ userStore.userInfo?.dormitory || '-' }}</div>
                </div>
                <div class="info-item full-width">
                  <label>个人简介</label>
                  <div class="info-value bio">{{ userStore.userInfo?.bio || '暂无简介' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Wallet Summary Card -->
        <div class="content-card wallet-card">
          <div class="card-header">
            <h2 class="card-title">我的钱包</h2>
            <router-link to="/wallet/transactions" class="link-btn">
              查看交易记录
            </router-link>
          </div>

          <div class="wallet-content">
            <div class="wallet-grid">
              <div class="wallet-item primary">
                <div class="wallet-item-inner">
                  <div class="wallet-label">可用余额</div>
                  <div class="wallet-value">¥ {{ formatMoney(walletInfo.walletBalance) }}</div>
                </div>
                <el-icon class="wallet-icon"><Wallet /></el-icon>
              </div>
              <div class="wallet-item">
                <div class="wallet-label">冻结金额 (交易中)</div>
                <div class="wallet-value secondary">¥ {{ formatMoney(walletInfo.frozenAmount) }}</div>
              </div>
              <div class="wallet-item">
                <div class="wallet-label">总资产</div>
                <div class="wallet-value">¥ {{ formatMoney(walletInfo.totalAmount) }}</div>
              </div>
            </div>

            <div class="wallet-actions">
              <el-button class="action-btn primary" @click="goToWallet">
                充值
              </el-button>
              <el-button class="action-btn" @click="goToWallet">
                提现
              </el-button>
            </div>
          </div>
        </div>

        <!-- Permission Management Card -->
        <div class="content-card permission-card">
          <div class="card-header">
            <h2 class="card-title">权限管理</h2>
          </div>

          <div class="permission-content">
            <!-- Has Permission -->
            <div
              v-if="permissionStatus?.hasPermission || permissionStatus?.publishPermission === 1"
              class="permission-status approved"
            >
              <el-icon class="status-icon"><CircleCheck /></el-icon>
              <div class="status-content">
                <h3>已拥有发布权限</h3>
                <p>您已通过管理员审核，可以自由发布技能服务。请遵守平台规范，诚信交易。</p>
                <div class="review-time" v-if="permissionStatus?.reviewedAt">
                  审核通过时间：{{ formatDateTime(permissionStatus.reviewedAt) }}
                </div>
              </div>
            </div>

            <!-- Pending Review -->
            <div
              v-else-if="permissionStatus?.status === 'pending'"
              class="permission-status pending"
            >
              <el-icon class="status-icon"><Clock /></el-icon>
              <div class="status-content">
                <h3>发布权限审核中</h3>
                <p>管理员正在审核您的申请，请耐心等待。审核通过后您将可以发布服务。</p>
              </div>
            </div>

            <!-- Rejected or Not Applied -->
            <div
              v-else
              class="permission-status not-applied"
            >
              <div class="status-left">
                <el-icon class="status-icon"><Lock /></el-icon>
                <div class="status-content">
                  <h3>发布权限未开通</h3>
                  <p>开通发布权限后，您可以发布技能服务并赚取收入。</p>
                  <div
                    class="reject-reason"
                    v-if="permissionStatus?.status === 'rejected' && permissionStatus?.lastReviewReason"
                  >
                    <el-icon><Warning /></el-icon>
                    上次申请被拒绝：{{ permissionStatus.lastReviewReason }}
                  </div>
                </div>
              </div>
              <el-button
                type="primary"
                class="apply-btn"
                @click="openPermissionDialog"
              >
                申请开通
              </el-button>
            </div>
          </div>
        </div>

        <!-- Settings Card -->
        <div class="content-card settings-card">
          <div class="card-header">
            <h2 class="card-title">系统设置</h2>
          </div>

          <div class="settings-content">
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">修改登录密码</div>
                <div class="setting-desc">定期修改密码可以保护账号安全</div>
              </div>
              <el-button text class="setting-btn" @click="openChangePasswordDialog">
                修改
              </el-button>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">消息通知</div>
                <div class="setting-desc">订单状态变更、聊天消息通知</div>
              </div>
              <el-switch
                v-model="notificationEnabled"
                class="setting-switch"
                disabled
              />
            </div>

            <div class="logout-section">
              <el-button class="logout-btn" @click="handleLogout">
                退出登录
              </el-button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Edit Profile Dialog -->
    <el-dialog
      v-model="editProfileVisible"
      title="编辑资料"
      width="520px"
      :close-on-click-modal="false"
      class="custom-dialog"
    >
      <el-form
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
        label-width="80px"
        class="profile-form"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="profileForm.nickname" placeholder="请输入昵称" maxlength="20" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="寝室号" prop="dormitory">
          <el-input v-model="profileForm.dormitory" placeholder="请输入寝室号" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="profileForm.grade" placeholder="请选择年级" clearable style="width: 100%">
            <el-option label="大一" value="大一" />
            <el-option label="大二" value="大二" />
            <el-option label="大三" value="大三" />
            <el-option label="大四" value="大四" />
            <el-option label="研一" value="研一" />
            <el-option label="研二" value="研二" />
            <el-option label="研三" value="研三" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业" prop="professionalId">
          <el-select v-model="profileForm.professionalId" placeholder="请选择专业" clearable style="width: 100%">
            <el-option
              v-for="prof in professionals"
              :key="prof.id"
              :label="prof.professionalName"
              :value="prof.id"
            />
          </el-select>
          <div class="form-tip">专业修改一个月只能修改一次</div>
        </el-form-item>
        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="profileForm.bio"
            type="textarea"
            placeholder="介绍一下自己吧..."
            :rows="4"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editProfileVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateProfile" :loading="profileSubmitting">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- Permission Apply Dialog -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="申请发布权限"
      width="520px"
      :close-on-click-modal="false"
      class="custom-dialog"
    >
      <div class="permission-apply-content">
        <div class="apply-notice">
          <el-icon><InfoFilled /></el-icon>
          <div>
            <p>申请发布权限后，您将可以在平台发布技能服务并赚取收入。</p>
            <p>管理员将在 1-3 个工作日内审核您的申请。</p>
          </div>
        </div>

        <el-form
          ref="permissionFormRef"
          :model="permissionForm"
          label-position="top"
          class="permission-form"
        >
          <el-form-item label="申请理由（选填）">
            <el-input
              v-model="permissionForm.reason"
              type="textarea"
              placeholder="可以简单说明您想发布哪些类型的服务，或介绍您的技能特长..."
              :rows="4"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleApplyPermission" :loading="permissionSubmitting">
          提交申请
        </el-button>
      </template>
    </el-dialog>

    <!-- Change Password Dialog -->
    <el-dialog
      v-model="changePasswordVisible"
      title="修改密码"
      width="460px"
      :close-on-click-modal="false"
      class="custom-dialog"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
        class="password-form"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码（8-16位）"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="changePasswordVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword" :loading="passwordSubmitting">
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  User,
  Box,
  ShoppingBag,
  Shop,
  Star,
  Wallet,
  CircleCheck,
  Clock,
  Lock,
  Warning,
  InfoFilled,
  Camera,
  Loading,
  TrendCharts
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useDictStore } from '@/stores/dict'
import { authApi } from '@/api/auth'
import { getPermissionStatus, applyPermission } from '@/api/permission'
import { getWalletInfo } from '@/api/wallet'
import { uploadFile } from '@/api/file'
import { buildImageUrl } from '@/api/service'
import type { PermissionStatus } from '@/types/permission'
import type { WalletInfo } from '@/types/wallet'
import type { UpdateProfileRequest, ChangePasswordRequest } from '@/types/auth'

const router = useRouter()
const userStore = useUserStore()
const dictStore = useDictStore()

// ==================== State ====================

// Permission status
const permissionStatus = ref<PermissionStatus | null>(null)

// Wallet info
const walletInfo = reactive<WalletInfo>({
  walletBalance: 0,
  frozenAmount: 0,
  totalAmount: 0
})

// Notification toggle (placeholder)
const notificationEnabled = ref(true)

// Avatar upload
const avatarInputRef = ref<HTMLInputElement | null>(null)
const avatarUploading = ref(false)

// Professionals list
const professionals = computed(() => dictStore.professionals)

// ==================== Edit Profile Dialog ====================

const editProfileVisible = ref(false)
const profileFormRef = ref<FormInstance>()
const profileSubmitting = ref(false)

const profileForm = reactive<UpdateProfileRequest>({
  nickname: '',
  email: '',
  dormitory: '',
  grade: '',
  professionalId: undefined,
  bio: ''
})

const profileRules: FormRules = {
  nickname: [
    { max: 20, message: '昵称不能超过20个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '简介不能超过200个字符', trigger: 'blur' }
  ]
}

const openEditProfileDialog = () => {
  // Pre-fill form with current user info
  if (userStore.userInfo) {
    profileForm.nickname = userStore.userInfo.nickname || ''
    profileForm.email = userStore.userInfo.email || ''
    profileForm.dormitory = userStore.userInfo.dormitory || ''
    profileForm.grade = userStore.userInfo.grade || ''
    profileForm.professionalId = userStore.userInfo.professionalId
    profileForm.bio = userStore.userInfo.bio || ''
  }
  editProfileVisible.value = true
}

const handleUpdateProfile = async () => {
  if (!profileFormRef.value) return
  await profileFormRef.value.validate()

  // 检查专业是否修改，如修改则警告用户30天限制
  const originalProfessionalId = userStore.userInfo?.professionalId
  const newProfessionalId = profileForm.professionalId
  if (newProfessionalId && newProfessionalId !== originalProfessionalId) {
    try {
      await ElMessageBox.confirm(
        '专业修改后30天内无法再次修改，确定要修改专业吗？',
        '专业修改提醒',
        {
          confirmButtonText: '确定修改',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    } catch {
      return // 用户取消
    }
  }

  profileSubmitting.value = true
  try {
    await authApi.updateProfile(profileForm)
    ElMessage.success('资料更新成功')
    editProfileVisible.value = false
    // Refresh user info
    await userStore.fetchCurrentUser()
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败')
  } finally {
    profileSubmitting.value = false
  }
}

// ==================== Permission Apply Dialog ====================

const permissionDialogVisible = ref(false)
const permissionFormRef = ref<FormInstance>()
const permissionSubmitting = ref(false)

const permissionForm = reactive({
  reason: ''
})

const openPermissionDialog = () => {
  permissionForm.reason = ''
  permissionDialogVisible.value = true
}

const handleApplyPermission = async () => {
  permissionSubmitting.value = true
  try {
    await applyPermission({ reason: permissionForm.reason || undefined })
    ElMessage.success('申请已提交，请等待管理员审核')
    permissionDialogVisible.value = false
    // Refresh permission status
    await fetchPermissionStatus()
  } catch (error: any) {
    ElMessage.error(error.message || '申请提交失败')
  } finally {
    permissionSubmitting.value = false
  }
}

// ==================== Change Password Dialog ====================

const changePasswordVisible = ref(false)
const passwordFormRef = ref<FormInstance>()
const passwordSubmitting = ref(false)

const passwordForm = reactive<ChangePasswordRequest>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 16, message: '密码长度为8-16位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const openChangePasswordDialog = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  changePasswordVisible.value = true
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate()

  passwordSubmitting.value = true
  try {
    await authApi.changePassword(passwordForm)
    ElMessage.success('密码修改成功，请使用新密码重新登录')
    changePasswordVisible.value = false
    // Logout and redirect to login
    await userStore.logout()
    router.push('/login')
  } catch (error: any) {
    ElMessage.error(error.message || '密码修改失败')
  } finally {
    passwordSubmitting.value = false
  }
}

// ==================== Avatar Upload ====================

const triggerAvatarUpload = () => {
  if (avatarUploading.value) return
  avatarInputRef.value?.click()
}

const handleAvatarChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('请选择 JPG、PNG、GIF 或 WebP 格式的图片')
    return
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过 5MB')
    return
  }

  avatarUploading.value = true
  try {
    await uploadFile(file, 'user_avatar')
    ElMessage.success('头像更新成功')
    // Refresh user info to get new avatar
    await userStore.fetchCurrentUser()
  } catch (error: any) {
    ElMessage.error(error.message || '头像上传失败')
  } finally {
    avatarUploading.value = false
    // Reset input value to allow re-selecting the same file
    input.value = ''
  }
}

// ==================== Actions ====================

const goToWallet = () => {
  router.push('/wallet')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/')
  } catch {
    // User cancelled
  }
}

// ==================== Data Fetching ====================

const fetchPermissionStatus = async () => {
  try {
    permissionStatus.value = await getPermissionStatus()
  } catch (error) {
    console.error('Failed to fetch permission status:', error)
  }
}

const fetchWalletInfo = async () => {
  try {
    const info = await getWalletInfo()
    walletInfo.walletBalance = info.walletBalance
    walletInfo.frozenAmount = info.frozenAmount
    walletInfo.totalAmount = info.totalAmount
  } catch (error) {
    console.error('Failed to fetch wallet info:', error)
  }
}

// ==================== Helpers ====================

const formatMoney = (value: number) => {
  return (value || 0).toFixed(2)
}

const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ==================== Lifecycle ====================

onMounted(async () => {
  // Refresh user info
  await userStore.fetchCurrentUser()
  // Fetch permission status
  await fetchPermissionStatus()
  // Fetch wallet info
  await fetchWalletInfo()
  // Fetch professionals
  await dictStore.fetchProfessionals()
})
</script>

<style lang="scss" scoped>
.user-center-page {
  background: #f9fafb;
  min-height: calc(100vh - 64px);
  padding: 24px 0;
}

.user-center-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  gap: 24px;
}

// ==================== Sidebar ====================

.user-sidebar {
  width: 260px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
}

.sidebar-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 16px;
}

.user-profile-section {
  text-align: center;
  padding: 16px 0 24px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 16px;

  .user-avatar {
    background: #4f46e5;
    color: white;
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .user-name {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 8px;
  }

  .user-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    background: #ecfdf5;
    color: #059669;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;

    .el-icon {
      font-size: 14px;
    }
  }
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #4b5563;
    text-decoration: none;
    transition: all 0.2s;

    &:hover {
      background: #f9fafb;
      color: #4f46e5;
    }

    &.active {
      background: #eef2ff;
      color: #4f46e5;
    }

    .el-icon {
      font-size: 18px;
    }
  }
}

// ==================== Main Content ====================

.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .edit-btn,
  .link-btn {
    color: #4f46e5;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #4338ca;
    }
  }
}

// ==================== Profile Card ====================

.profile-content {
  display: flex;
  gap: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
}

.profile-left {
  flex-shrink: 0;
  text-align: center;

  .avatar-container {
    position: relative;
    display: inline-block;
    margin-bottom: 12px;
    cursor: pointer;
    border-radius: 50%;
    overflow: hidden;

    &:hover .avatar-overlay {
      opacity: 1;
    }
  }

  .large-avatar {
    background: #4f46e5;
    color: white;
    font-size: 48px;
    font-weight: 600;
    border: 4px solid #f3f4f6;
    transition: filter 0.2s;
  }

  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    color: white;
    border-radius: 50%;

    &.is-uploading {
      opacity: 1;
    }

    .el-icon {
      font-size: 24px;
      margin-bottom: 4px;

      &.is-loading {
        animation: rotate 1s linear infinite;
      }
    }

    span {
      font-size: 12px;
      font-weight: 500;
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .avatar-input {
    display: none;
  }

  .student-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    background: #eef2ff;
    color: #4f46e5;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;

    .el-icon {
      font-size: 14px;
    }
  }
}

.profile-right {
  flex: 1;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }

  .info-item {
    label {
      display: block;
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .info-value {
      font-size: 14px;
      font-weight: 500;
      color: #1f2937;

      &.bio {
        line-height: 1.6;
        color: #4b5563;
      }
    }

    &.full-width {
      grid-column: span 2;

      @media (max-width: 640px) {
        grid-column: span 1;
      }
    }
  }
}

// ==================== Wallet Card ====================

.wallet-content {
  .wallet-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .wallet-item {
    padding: 20px;
    border-radius: 12px;
    background: white;
    border: 1px solid #e5e7eb;

    &.primary {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      color: white;
      border: none;
      position: relative;
      overflow: hidden;

      .wallet-label {
        color: rgba(255, 255, 255, 0.9);
      }

      .wallet-value {
        color: white;
        font-size: 28px;
      }

      .wallet-icon {
        position: absolute;
        right: -16px;
        bottom: -16px;
        font-size: 80px;
        color: rgba(255, 255, 255, 0.2);
      }
    }

    .wallet-label {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .wallet-value {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;

      &.secondary {
        color: #6b7280;
      }
    }
  }

  .wallet-actions {
    display: flex;
    gap: 16px;

    .action-btn {
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 8px;

      &.primary {
        background: #4f46e5;
        border-color: #4f46e5;
        color: white;

        &:hover {
          background: #4338ca;
          border-color: #4338ca;
        }
      }

      &:not(.primary) {
        background: white;
        border-color: #d1d5db;
        color: #374151;

        &:hover {
          border-color: #9ca3af;
          background: #f9fafb;
        }
      }
    }
  }
}

// ==================== Permission Card ====================

.permission-content {
  .permission-status {
    display: flex;
    align-items: flex-start;
    padding: 20px;
    border-radius: 12px;

    &.approved {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;

      .status-icon {
        color: #059669;
      }

      h3 {
        color: #065f46;
      }

      p {
        color: #047857;
      }
    }

    &.pending {
      background: #fef3c7;
      border: 1px solid #fcd34d;

      .status-icon {
        color: #d97706;
      }

      h3 {
        color: #92400e;
      }

      p {
        color: #b45309;
      }
    }

    &.not-applied {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      justify-content: space-between;

      .status-icon {
        color: #6b7280;
      }

      h3 {
        color: #374151;
      }

      p {
        color: #6b7280;
      }
    }

    .status-left {
      display: flex;
      align-items: flex-start;
    }

    .status-icon {
      font-size: 24px;
      margin-right: 16px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .status-content {
      h3 {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 8px;
      }

      p {
        font-size: 14px;
        margin: 0;
        line-height: 1.5;
      }

      .review-time {
        margin-top: 8px;
        font-size: 12px;
        color: #6b7280;
      }

      .reject-reason {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        margin-top: 12px;
        padding: 10px;
        background: #fef2f2;
        border-radius: 6px;
        font-size: 13px;
        color: #dc2626;

        .el-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }
      }
    }

    .apply-btn {
      flex-shrink: 0;
      background: #4f46e5;
      border-color: #4f46e5;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 8px;

      &:hover {
        background: #4338ca;
        border-color: #4338ca;
      }
    }
  }
}

// ==================== Settings Card ====================

.settings-content {
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f3f4f6;

    &:last-of-type {
      border-bottom: none;
    }

    .setting-info {
      .setting-title {
        font-size: 14px;
        font-weight: 500;
        color: #1f2937;
        margin-bottom: 4px;
      }

      .setting-desc {
        font-size: 12px;
        color: #6b7280;
      }
    }

    .setting-btn {
      color: #4f46e5;
      font-size: 14px;
      font-weight: 500;

      &:hover {
        color: #4338ca;
      }
    }

    .setting-switch {
      --el-switch-on-color: #4f46e5;
    }
  }

  .logout-section {
    margin-top: 24px;

    .logout-btn {
      width: 100%;
      padding: 12px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 8px;
      background: white;
      border: 1px solid #fca5a5;
      color: #dc2626;

      &:hover {
        background: #fef2f2;
        border-color: #f87171;
      }
    }
  }
}

// ==================== Dialogs ====================

:deep(.custom-dialog) {
  border-radius: 16px;

  .el-dialog__header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid #f3f4f6;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 16px 24px 20px;
    border-top: 1px solid #f3f4f6;

    .el-button {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 500;

      &--primary {
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

.profile-form,
.password-form {
  :deep(.el-form-item__label) {
    color: #374151;
    font-weight: 500;
  }

  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #d1d5db inset;
    border-radius: 8px;

    &:hover {
      box-shadow: 0 0 0 1px #9ca3af inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px #4f46e5 inset;
    }
  }

  :deep(.el-textarea__inner) {
    box-shadow: 0 0 0 1px #d1d5db inset;
    border-radius: 8px;

    &:hover {
      box-shadow: 0 0 0 1px #9ca3af inset;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #f59e0b;
    margin-top: 4px;

    &:focus {
      box-shadow: 0 0 0 1px #4f46e5 inset;
    }
  }

  :deep(.el-select) {
    .el-input__wrapper {
      box-shadow: 0 0 0 1px #d1d5db inset;
      border-radius: 8px;

      &:hover {
        box-shadow: 0 0 0 1px #9ca3af inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px #4f46e5 inset;
      }
    }
  }
}

.permission-apply-content {
  .apply-notice {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: #eef2ff;
    border-radius: 8px;
    margin-bottom: 20px;

    .el-icon {
      color: #4f46e5;
      font-size: 20px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    p {
      margin: 0 0 4px;
      font-size: 14px;
      color: #4338ca;
      line-height: 1.5;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .permission-form {
    :deep(.el-form-item__label) {
      color: #374151;
      font-weight: 500;
    }

    :deep(.el-textarea__inner) {
      box-shadow: 0 0 0 1px #d1d5db inset;
      border-radius: 8px;

      &:hover {
        box-shadow: 0 0 0 1px #9ca3af inset;
      }

      &:focus {
        box-shadow: 0 0 0 1px #4f46e5 inset;
      }
    }
  }
}
</style>

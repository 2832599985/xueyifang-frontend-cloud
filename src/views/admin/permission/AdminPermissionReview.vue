<template>
  <div class="admin-permission-page" v-loading="loading">
    <!-- 标题区域 -->
    <section class="page-header">
      <div class="title-block">
        <h2>权限审核</h2>
        <p class="subtitle">审核用户发布服务的权限申请</p>
      </div>
    </section>

    <!-- 主内容卡片 -->
    <el-card class="permission-card" shadow="never">
      <!-- 无数据提示 -->
      <el-empty
        v-if="!loading && list.length === 0"
        description="暂无待审核的权限申请"
      />

      <!-- 表格 -->
      <template v-else>
        <el-table :data="list" border stripe>
          <el-table-column type="index" label="#" width="60" align="center" />

          <el-table-column label="姓名" prop="realName" min-width="100">
            <template #default="{ row }">
              {{ row.realName || '-' }}
            </template>
          </el-table-column>

          <el-table-column label="学号" prop="studentId" min-width="120">
            <template #default="{ row }">
              {{ row.studentId || '-' }}
            </template>
          </el-table-column>

          <el-table-column label="专业" prop="professionalName" min-width="140" />

          <el-table-column label="年级" prop="grade" min-width="80">
            <template #default="{ row }">
              {{ row.grade || '-' }}
            </template>
          </el-table-column>

          <el-table-column label="手机号" prop="phone" min-width="120">
            <template #default="{ row }">
              {{ row.phone || '-' }}
            </template>
          </el-table-column>

          <el-table-column label="邮箱" prop="email" min-width="160">
            <template #default="{ row }">
              {{ row.email || '-' }}
            </template>
          </el-table-column>

          <el-table-column label="申请时间" min-width="160">
            <template #default="{ row }">
              {{ formatTime(row.createTime) }}
            </template>
          </el-table-column>

          <el-table-column label="状态" min-width="100" align="center">
            <template #default>
              <el-tag type="warning" effect="light">待审核</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="160" fixed="right" align="center">
            <template #default="{ row }">
              <el-button type="success" text @click="approve(row)">
                <i class="fas fa-check"></i> 通过
              </el-button>
              <el-button type="danger" text @click="reject(row)">
                <i class="fas fa-times"></i> 拒绝
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            background
            layout="prev, pager, next, jumper, ->, total"
            :current-page="query.pageNum"
            :page-size="query.pageSize"
            :total="total"
            @current-change="handlePageChange"
          />
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPendingUsers, reviewPermission } from '@/api/admin'
import type { PendingUser } from '@/types/admin'

const loading = ref(false)
const list = ref<PendingUser[]>([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10
})

/**
 * 加载待审核用户列表
 */
const loadUsers = async () => {
  try {
    loading.value = true
    const res = await getPendingUsers(query.pageNum, query.pageSize)
    list.value = res.records
    total.value = res.total
  } catch (error: any) {
    console.error('Failed to load pending users:', error)
    ElMessage.error(error.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

/**
 * 格式化时间
 */
const formatTime = (timeStr: string): string => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 分页变化
 */
const handlePageChange = (page: number) => {
  query.pageNum = page
  loadUsers()
}

/**
 * 通过审核
 */
const approve = (row: PendingUser) => {
  const displayName = row.realName || row.studentId || `用户${row.userId}`
  ElMessageBox.confirm(
    `确认通过用户「${displayName}」的发布权限申请吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await reviewPermission({
        userId: row.userId,
        approved: true
      })
      ElMessage.success('审核通过')
      loadUsers()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    }
  }).catch(() => {
    // 用户取消
  })
}

/**
 * 拒绝审核
 */
const reject = (row: PendingUser) => {
  const displayName = row.realName || row.studentId || `用户${row.userId}`
  ElMessageBox.prompt(
    `请填写拒绝用户「${displayName}」发布权限的原因`,
    '拒绝申请',
    {
      confirmButtonText: '确认拒绝',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '例如：信息不完整、联系方式无效等（至少5个字）',
      inputValidator: (value: string) => {
        if (!value || value.trim().length < 5) {
          return '拒绝原因至少5个字'
        }
        return true
      }
    }
  ).then(async ({ value }) => {
    try {
      await reviewPermission({
        userId: row.userId,
        approved: false,
        reason: value.trim()
      })
      ElMessage.success('已拒绝申请')
      loadUsers()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    }
  }).catch(() => {
    // 用户取消
  })
}

onMounted(loadUsers)
</script>

<style scoped lang="scss">
.admin-permission-page {
  // Header
  .page-header {
    margin-bottom: 24px;

    .title-block {
      h2 {
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 8px;
      }

      .subtitle {
        font-size: 14px;
        color: #6b7280;
        margin: 0;
      }
    }
  }

  // Main card
  .permission-card {
    border: none;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

    :deep(.el-card__body) {
      padding: 24px;
    }

    // Table styling
    :deep(.el-table) {
      border-radius: 8px;
      overflow: hidden;

      th.el-table__cell {
        background-color: #f9fafb;
        color: #374151;
        font-weight: 600;
      }

      .el-button {
        padding: 4px 8px;

        i {
          margin-right: 4px;
        }
      }
    }

    // Empty state
    :deep(.el-empty) {
      padding: 60px 0;
    }
  }

  // Pagination
  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;

    :deep(.el-pagination) {
      .el-pager li.is-active {
        background-color: #4f46e5;
      }

      .el-pager li:hover {
        color: #4f46e5;
      }

      .btn-prev:hover,
      .btn-next:hover {
        color: #4f46e5;
      }
    }
  }
}

// Override Element Plus default colors
:deep(.el-tag--warning) {
  background-color: #fef3c7;
  border-color: #fcd34d;
  color: #d97706;
}

:deep(.el-button--success.is-text) {
  color: #10b981;

  &:hover {
    color: #059669;
    background-color: #ecfdf5;
  }
}

:deep(.el-button--danger.is-text) {
  color: #ef4444;

  &:hover {
    color: #dc2626;
    background-color: #fef2f2;
  }
}

// Responsive
@media (max-width: 768px) {
  .admin-permission-page {
    .permission-card {
      :deep(.el-card__body) {
        padding: 16px;
      }

      :deep(.el-table) {
        font-size: 13px;
      }
    }

    .pagination-wrapper {
      justify-content: center;
    }
  }
}
</style>

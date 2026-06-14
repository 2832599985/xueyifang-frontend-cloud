<template>
  <div class="favorites-page">
    <div class="page-container">
      <el-card class="favorites-card">
        <!-- 标题区域 -->
        <div class="card-header">
          <div class="header-left">
            <h1 class="page-title">我的收藏</h1>
            <span class="collection-count" v-if="total > 0">共 {{ total }} 个收藏</span>
          </div>
        </div>

        <!-- 收藏列表 -->
        <div class="favorites-content" v-loading="loading">
          <!-- 有数据时显示网格 -->
          <div v-if="favorites.length > 0" class="favorites-grid">
            <div
              v-for="item in favorites"
              :key="item.favoriteId"
              class="favorite-card"
              @click="goToDetail(item.service.id)"
            >
              <!-- 取消收藏按钮 -->
              <button
                class="uncollect-btn"
                @click.stop="handleUncollect(item)"
                title="取消收藏"
              >
                <el-icon><StarFilled /></el-icon>
              </button>

              <!-- 服务封面图 -->
              <div class="card-image">
                <LazyImage
                  :src="buildImageUrl(item.service.coverImage)"
                  :height="160"
                  :radius="0"
                  fit="cover"
                  class="service-image"
                />
              </div>

              <!-- 服务信息 -->
              <div class="card-content">
                <h3 class="service-title">{{ item.service.serviceTitle }}</h3>
                <div class="card-footer">
                  <span class="service-price">{{ formatPrice(item.service.price) }}</span>
                  <span class="service-views">{{ item.service.viewCount || 0 }} 浏览</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else-if="!loading" class="empty-state">
            <el-icon class="empty-icon"><Star /></el-icon>
            <p class="empty-text">你还没有收藏任何服务</p>
            <el-button class="primary-btn" @click="goToServices">
              去逛逛服务市场
            </el-button>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="total > pageSize">
          <el-pagination
            v-model:current-page="pageNum"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            background
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star, StarFilled } from '@element-plus/icons-vue'
import { getMyCollections, uncollectService } from '@/api/favorite'
import LazyImage from '@/components/common/LazyImage.vue'
import { buildImageUrl } from '@/api/service'
import type { FavoriteListItem } from '@/types/service'
import { usePaginated } from '@/composables/useAsync'

const router = useRouter()

// 使用 usePaginated 管理分页数据
const {
  loading,
  items: favorites,
  total,
  page: pageNum,
  pageSize,
  loadPage,
  refresh
} = usePaginated<FavoriteListItem>(
  async (pageNum, pageSizeVal) => {
    const result = await getMyCollections(pageNum, pageSizeVal)
    return { items: result.records || [], total: result.total || 0 }
  },
  {
    initialPage: 1,
    initialPageSize: 12,
    onError: (error) => {
      console.error('获取收藏列表失败:', error)
      ElMessage.error('获取收藏列表失败')
    }
  }
)

// 格式化价格
function formatPrice(price: number): string {
  return `¥ ${price.toFixed(2)}`
}

// 取消收藏
async function handleUncollect(item: FavoriteListItem) {
  try {
    await ElMessageBox.confirm(
      `确定要取消收藏「${item.service.serviceTitle}」吗？`,
      '取消收藏',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await uncollectService(item.service.id)
    ElMessage.success('已取消收藏')

    // 刷新列表
    refresh()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error)
      ElMessage.error('取消收藏失败')
    }
  }
}

// 跳转到服务详情
function goToDetail(serviceId: number) {
  router.push(`/services/${serviceId}`)
}

// 跳转到服务市场
function goToServices() {
  router.push('/services')
}

// 分页变化
function handlePageChange(page: number) {
  loadPage(page)
}

onMounted(() => {
  loadPage(1)
})
</script>

<style scoped lang="scss">
.favorites-page {
  min-height: calc(100vh - 64px);
  background-color: #f9fafb;
  padding: 32px 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.favorites-card {
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: none;
  min-height: 600px;

  :deep(.el-card__body) {
    padding: 32px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .page-title {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }

  .collection-count {
    font-size: 14px;
    color: #6b7280;
    margin-left: 16px;
  }
}

.favorites-content {
  min-height: 400px;
}

// 收藏网格
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
}

// 收藏卡片
.favorite-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: translateY(-4px);

    .service-image {
      transform: scale(1.05);
    }

    .service-title {
      color: #4f46e5;
    }
  }

  // 取消收藏按钮
  .uncollect-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 10;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #fff;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ef4444;
    transition: all 0.3s;

    &:hover {
      background: #fef2f2;
      transform: scale(1.1);
    }

    .el-icon {
      font-size: 16px;
    }
  }

  // 图片区域
  .card-image {
    width: 100%;
    height: 160px;
    overflow: hidden;
    background: #f3f4f6;

    .service-image {
      width: 100%;
      height: 100%;
      transition: transform 0.5s;
    }

    .image-error {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;

      .el-icon {
        font-size: 40px;
      }
    }
  }

  // 内容区域
  .card-content {
    padding: 16px;

    .service-title {
      font-size: 15px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 12px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: color 0.3s;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .service-price {
        font-size: 16px;
        font-weight: 700;
        color: #dc2626;
      }

      .service-views {
        font-size: 12px;
        color: #9ca3af;
      }
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;

  .empty-icon {
    font-size: 64px;
    color: #d1d5db;
    margin-bottom: 16px;
  }

  .empty-text {
    font-size: 16px;
    color: #6b7280;
    margin: 0 0 24px 0;
  }
}

.primary-btn {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
  font-weight: 500;
  padding: 12px 24px;

  &:hover,
  &:focus {
    background: #4338ca;
    border-color: #4338ca;
  }
}

// 分页
.pagination-wrapper {
  margin-top: 32px;
  display: flex;
  justify-content: center;

  :deep(.el-pagination) {
    .btn-prev,
    .btn-next,
    .el-pager li {
      background-color: #fff;
      border: 1px solid #e5e7eb;

      &:hover {
        color: #4f46e5;
      }

      &.is-active {
        background-color: #4f46e5;
        border-color: #4f46e5;
        color: #fff;
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .favorites-page {
    padding: 16px 0;
  }

  .favorites-card {
    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;

    .page-title {
      font-size: 20px;
    }

    .collection-count {
      margin-left: 0;
    }
  }
}
</style>

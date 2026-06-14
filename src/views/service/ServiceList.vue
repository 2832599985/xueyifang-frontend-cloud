<template>
  <div class="service-list-page">
    <div class="page-container">
      <!-- Page Header -->
      <el-card class="page-header-card" shadow="never">
        <div class="header-content">
          <div class="header-left">
            <h1 class="page-title">发现技能服务</h1>
            <p class="page-subtitle">找到你需要的校园技能服务，让学习成果变现</p>
          </div>
          <div class="header-right">
            <span class="service-count" v-if="totalCount > 0">
              共 <span class="count-number">{{ totalCount }}</span> 个服务
            </span>
          </div>
        </div>
      </el-card>

      <!-- Filter Section -->
      <el-card class="filter-card" shadow="hover">
        <div class="filter-container">
          <!-- Search Bar -->
          <div class="search-row">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索服务名称或描述..."
              size="large"
              clearable
              @keyup.enter="handleSearch"
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button
              type="primary"
              size="large"
              @click="handleSearch"
              class="search-button"
            >
              搜索
            </el-button>
          </div>

          <!-- Filter Options -->
          <div class="filter-row">
            <!-- Category Filter -->
            <div class="filter-item">
              <span class="filter-label">分类：</span>
              <div class="tag-group">
                <span
                  v-for="tag in serviceTags"
                  :key="tag.tagId"
                  :class="['tag-chip', { active: queryParams.tagId === tag.tagId }]"
                  @click="handleTagSelect(tag.tagId)"
                >
                  {{ tag.tagName }}
                </span>
                <span
                  :class="['tag-chip', { active: !queryParams.tagId }]"
                  @click="handleTagSelect(undefined)"
                >
                  全部
                </span>
              </div>
            </div>

            <!-- Sort Options -->
            <div class="filter-item">
              <span class="filter-label">排序：</span>
              <el-select
                v-model="queryParams.sortBy"
                placeholder="默认排序"
                size="default"
                @change="handleSearch"
                class="sort-select"
              >
                <el-option label="最新发布" value="latest" />
                <el-option label="价格从低到高" value="price_asc" />
                <el-option label="价格从高到低" value="price_desc" />
                <el-option label="浏览量最多" value="view_desc" />
              </el-select>
            </div>

            <!-- Trade Type Filter -->
            <div class="filter-item">
              <span class="filter-label">交易方式：</span>
              <el-radio-group
                v-model="queryParams.tradeType"
                @change="handleSearch"
                size="default"
              >
                <el-radio-button :label="undefined">全部</el-radio-button>
                <el-radio-button :label="1">线下交易</el-radio-button>
                <el-radio-button :label="2">线上担保</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Service Grid -->
      <div class="service-grid" v-loading="loading">
        <el-row :gutter="20" v-if="serviceList.length > 0">
          <el-col
            v-for="service in serviceList"
            :key="service.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="8"
            :xl="6"
            class="service-col"
          >
            <el-card
              class="service-card"
              shadow="hover"
              @click="goToDetail(service.id)"
            >
              <!-- Service Image -->
              <div class="service-image-wrapper">
                <LazyImage
                  :src="buildImageUrl(service.coverImage)"
                  :alt="service.serviceTitle"
                  :height="180"
                  :radius="0"
                  fit="cover"
                  class="service-image"
                />
                <div class="trade-type-badge" v-if="service.tradeType">
                  {{ getTradeTypeText(service.tradeType) }}
                </div>
              </div>

              <!-- Service Content -->
              <div class="service-content">
                <!-- Title and Tags -->
                <h3 class="service-title">{{ service.serviceTitle }}</h3>
                <div class="service-tags" v-if="service.tagName">
                  <el-tag size="small" type="info" class="service-tag">
                    {{ service.tagName }}
                  </el-tag>
                </div>

                <!-- Price and Stats -->
                <div class="service-footer">
                  <div class="price-section">
                    <span class="price">{{ formatPrice(service.price) }}</span>
                  </div>
                  <div class="stats-section">
                    <span class="stat-item" v-if="service.viewCount">
                      <el-icon><View /></el-icon>
                      {{ service.viewCount }}
                    </span>
                    <span class="stat-item" v-if="service.salesCount">
                      <el-icon><ShoppingCart /></el-icon>
                      {{ service.salesCount }}
                    </span>
                  </div>
                </div>

                <!-- Seller Info -->
                <div class="seller-info" v-if="service.sellerName">
                  <el-avatar size="small" :src="buildImageUrl(service.sellerAvatar)">
                    {{ service.sellerName?.charAt(0) }}
                  </el-avatar>
                  <span class="seller-name">{{ service.sellerName }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- Empty State -->
        <el-empty
          v-else-if="!loading"
          description="暂无相关服务"
          class="empty-state"
        >
          <el-button type="primary" @click="resetFilters">重置筛选条件</el-button>
        </el-empty>
      </div>

      <!-- Pagination -->
      <div class="pagination-wrapper" v-if="totalCount > 0">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="totalCount"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search,
  View,
  ShoppingCart,
  Picture
} from '@element-plus/icons-vue'
import { getServiceList, buildImageUrl } from '@/api/service'
import type { ServiceListItem, ServiceQueryParams } from '@/types/service'
import { formatPrice, getTradeTypeText } from '@/types/service'
import { useAppStore } from '@/stores/app'
import { useDictStore } from '@/stores/dict'
import { usePaginated } from '@/composables/useAsync'
import LazyImage from '@/components/common/LazyImage.vue'

const router = useRouter()
const appStore = useAppStore()
const dictStore = useDictStore()

// Data (using computed from dictStore for tags)
const serviceTags = computed(() => dictStore.serviceTags || [])
const searchKeyword = ref('')

// Query parameters
const queryParams = reactive<Omit<ServiceQueryParams, 'pageNum' | 'pageSize'>>({
  sortBy: undefined,
  tagId: undefined,
  tradeType: undefined,
  keyword: undefined
})

// 使用 usePaginated 管理分页数据加载
const {
  loading,
  items: serviceList,
  total: totalCount,
  page,
  pageSize,
  loadPage,
  refresh
} = usePaginated<ServiceListItem>(
  async (pageNum, pageSizeVal) => {
    appStore.setLoading(true)
    try {
      const params: ServiceQueryParams = {
        pageNum,
        pageSize: pageSizeVal,
        keyword: searchKeyword.value || undefined,
        ...queryParams
      }
      const result = await getServiceList(params)
      return { items: result.records, total: result.total }
    } finally {
      appStore.setLoading(false)
    }
  },
  {
    initialPage: 1,
    initialPageSize: 10,
    onError: (error) => {
      console.error('Failed to fetch service list:', error)
      ElMessage.error(error.message || '获取服务列表失败')
    }
  }
)

const loadDictData = async () => {
  try {
    await dictStore.fetchServiceTags()
  } catch (error: any) {
    console.error('Failed to fetch service tags:', error)
    ElMessage.error('获取服务分类失败')
  }
}

const handleSearch = () => {
  refresh() // 重置到第一页并重新加载
}

const handleTagSelect = (tagId?: number) => {
  queryParams.tagId = tagId
  refresh()
}

const handlePageChange = (newPage: number) => {
  loadPage(newPage)
  // Scroll to top of page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  refresh()
}

const resetFilters = () => {
  searchKeyword.value = ''
  queryParams.sortBy = undefined
  queryParams.tagId = undefined
  queryParams.tradeType = undefined
  queryParams.keyword = undefined
  refresh()
}

const goToDetail = (id: number) => {
  router.push(`/services/${id}`)
}

// Lifecycle
onMounted(() => {
  loadDictData()
  loadPage(1) // 初始加载第一页
})
</script>

<style scoped lang="scss">
.service-list-page {
  min-height: 100vh;
  background: #f9fafb;
  padding: 24px 0 40px;

  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  // Header Card
  .page-header-card {
    margin-bottom: 24px;
    border-radius: 16px;
    border: none;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;

      .header-left {
        .page-title {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
          color: #303133;
        }

        .page-subtitle {
          margin: 8px 0 0;
          font-size: 16px;
          color: #4b5563;
        }
      }

      .header-right {
        .service-count {
          font-size: 14px;
          color: #4b5563;

          .count-number {
            font-size: 18px;
            font-weight: bold;
            color: #4f46e5;
          }
        }
      }
    }
  }

  // Filter Card
  .filter-card {
    margin-bottom: 32px;
    border-radius: 16px;
    border: none;

    .filter-container {
      padding: 20px 0;

      .search-row {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;

        .search-input {
          flex: 1;

          :deep(.el-input__wrapper) {
            box-shadow: 0 0 0 1px #d1d5db inset;
            border-radius: 8px;

            &:hover {
              box-shadow: 0 0 0 1px #4f46e5 inset;
            }

            &.is-focus {
              box-shadow: 0 0 0 1px #4f46e5 inset;
            }
          }
        }

        .search-button {
          background: #4f46e5;
          border-color: #4f46e5;
          font-weight: 500;
          padding: 0 32px;

          &:hover {
            background: #4338ca;
            border-color: #4338ca;
          }
        }
      }

      .filter-row {
        display: flex;
        flex-direction: column;
        gap: 20px;

        .filter-item {
          display: flex;
          align-items: center;
          gap: 12px;

          .filter-label {
            color: #4b5563;
            font-size: 14px;
            min-width: 70px;
          }

          .tag-group {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            .tag-chip {
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 14px;
              color: #4b5563;
              background: #f3f4f6;
              cursor: pointer;
              transition: all 0.3s;
              user-select: none;

              &:hover {
                color: #4f46e5;
                background: #eef2ff;
              }

              &.active {
                color: white;
                background: #4f46e5;
              }
            }
          }

          .sort-select {
            width: 160px;
          }

          :deep(.el-radio-group) {
            .el-radio-button__inner {
              border-color: #d1d5db;

              &:hover {
                color: #4f46e5;
              }
            }

            .el-radio-button.is-active .el-radio-button__inner {
              background: #4f46e5;
              border-color: #4f46e5;
            }
          }
        }
      }
    }
  }

  // Service Grid
  .service-grid {
    min-height: 400px;

    .service-col {
      margin-bottom: 20px;
    }

    .service-card {
      cursor: pointer;
      border-radius: 16px;
      border: none;
      overflow: hidden;
      transition: all 0.3s ease;
      height: 100%;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);

        .service-image {
          transform: scale(1.05);
        }

        .service-title {
          color: #4f46e5;
        }
      }

      .service-image-wrapper {
        position: relative;
        width: 100%;
        height: 180px;
        overflow: hidden;
        background: #f3f4f6;

        .service-image {
          width: 100%;
          height: 100%;
          transition: transform 0.3s ease;
        }

        .image-error {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: #f3f4f6;
          color: #9ca3af;
        }

        .trade-type-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 12px;
          background: rgba(79, 70, 229, 0.9);
          color: white;
          font-size: 12px;
          border-radius: 12px;
          backdrop-filter: blur(4px);
        }
      }

      .service-content {
        padding: 16px;

        .service-title {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          transition: color 0.3s;
        }

        .service-tags {
          margin-bottom: 12px;

          .service-tag {
            background: #eef2ff;
            color: #4f46e5;
            border: 1px solid #c7d2fe;
          }
        }

        .service-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .price-section {
            .price {
              font-size: 20px;
              font-weight: bold;
              color: #dc2626;
            }
          }

          .stats-section {
            display: flex;
            gap: 12px;

            .stat-item {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 12px;
              color: #6b7280;

              .el-icon {
                font-size: 14px;
              }
            }
          }
        }

        .seller-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;

          .el-avatar {
            background: #4f46e5;
          }

          .seller-name {
            font-size: 14px;
            color: #4b5563;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }

  // Empty State
  .empty-state {
    padding: 60px 0;
  }

  // Pagination
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 32px 0;

    :deep(.el-pagination) {
      .el-pager li.is-active {
        background: #4f46e5;
      }

      .el-pagination__sizes .el-input__wrapper {
        box-shadow: 0 0 0 1px #d1d5db inset;
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .service-list-page {
    .page-header-card {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;

        .page-title {
          font-size: 24px;
        }
      }
    }

    .filter-card {
      .filter-container {
        .search-row {
          flex-direction: column;

          .search-button {
            width: 100%;
          }
        }

        .filter-row .filter-item {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    }
  }
}
</style>
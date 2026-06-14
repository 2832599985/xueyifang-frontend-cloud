<template>
  <div class="review-list">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- Empty State -->
    <el-empty
      v-else-if="reviews.length === 0"
      description="暂无评价"
      :image-size="120"
    />

    <!-- Review List -->
    <template v-else>
      <div class="review-items">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="review-item"
        >
          <div class="review-header">
            <el-avatar
              :size="40"
              :src="getReviewerAvatar(review)"
              class="reviewer-avatar"
            >
              {{ getReviewerDisplayName(review).charAt(0) }}
            </el-avatar>
            <div class="reviewer-info">
              <span class="reviewer-name">{{ getReviewerDisplayName(review) }}</span>
              <span class="review-time">{{ formatReviewTime(review.createTime) }}</span>
            </div>
            <div class="review-rating">
              <el-rate
                :model-value="review.rating"
                :max="5"
                disabled
                :colors="['#4f46e5', '#4f46e5', '#4f46e5']"
                :void-color="'#e5e7eb'"
              />
              <span class="rating-text">{{ getRatingLabel(review.rating) }}</span>
            </div>
          </div>
          <div class="review-content">
            {{ review.content }}
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-container" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          background
          @current-change="handlePageChange"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { listServiceReviews } from '@/api/review'
import { buildImageUrl } from '@/api/service'
import type { ServiceReview } from '@/types/review'
import {
  formatReviewTime,
  getRatingLabel,
  getReviewerDisplayName,
  DEFAULT_AVATAR
} from '@/types/review'

// Props
interface Props {
  serviceId: number
}

const props = defineProps<Props>()

// State
const loading = ref(false)
const reviews = ref<ServiceReview[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// Methods
const getReviewerAvatar = (review: ServiceReview): string => {
  if (review.anonymous || !review.reviewerAvatar) {
    return DEFAULT_AVATAR
  }
  return buildImageUrl(review.reviewerAvatar)
}

const fetchReviews = async () => {
  if (!props.serviceId) return

  loading.value = true
  try {
    const result = await listServiceReviews(props.serviceId, {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    reviews.value = result.records
    total.value = result.total
  } catch (error) {
    console.error('Failed to fetch reviews:', error)
    reviews.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchReviews()
}

// Watch for serviceId changes
watch(() => props.serviceId, (newId) => {
  if (newId) {
    currentPage.value = 1
    fetchReviews()
  }
}, { immediate: true })

// Initial fetch
onMounted(() => {
  if (props.serviceId) {
    fetchReviews()
  }
})
</script>

<style scoped lang="scss">
.review-list {
  .loading-container {
    padding: 20px 0;
  }

  .review-items {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .review-item {
    padding: 20px;
    background: #f9fafb;
    border-radius: 12px;
    transition: all 0.3s;

    &:hover {
      background: #f3f4f6;
    }

    .review-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .reviewer-avatar {
        background: #4f46e5;
        color: white;
        font-weight: 600;
      }

      .reviewer-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;

        .reviewer-name {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }

        .review-time {
          font-size: 12px;
          color: #9ca3af;
        }
      }

      .review-rating {
        display: flex;
        align-items: center;
        gap: 8px;

        :deep(.el-rate) {
          .el-rate__icon {
            font-size: 16px;
          }
        }

        .rating-text {
          font-size: 13px;
          font-weight: 500;
          color: #4f46e5;
        }
      }
    }

    .review-content {
      font-size: 14px;
      line-height: 1.6;
      color: #4b5563;
      padding-left: 52px; // avatar width + gap
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 24px;

    :deep(.el-pagination) {
      .el-pager li {
        &.is-active {
          background: #4f46e5;
        }
      }

      .btn-prev,
      .btn-next {
        &:hover:not(:disabled) {
          color: #4f46e5;
        }
      }
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .review-list {
    .review-item {
      padding: 16px;

      .review-header {
        flex-wrap: wrap;

        .review-rating {
          width: 100%;
          margin-top: 8px;
          margin-left: 52px;
        }
      }

      .review-content {
        padding-left: 0;
        margin-top: 12px;
      }
    }
  }
}
</style>

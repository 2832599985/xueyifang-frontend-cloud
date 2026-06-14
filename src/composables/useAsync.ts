import { ref, computed, type Ref, unref } from 'vue'

/**
 * 异步数据加载状态
 */
export interface AsyncState<T> {
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 数据 */
  data: Ref<T | null>
  /** 是否已加载完成 */
  isReady: Ref<boolean>
  /** 是否有错误 */
  hasError: Ref<boolean>
}

/**
 * 异步操作返回值
 */
export interface UseAsyncReturn<T, Args extends any[]> extends AsyncState<T> {
  /** 执行异步操作 */
  execute: (...args: Args) => Promise<T>
  /** 重置状态 */
  reset: () => void
  /** 刷新（重新执行上次调用） */
  refresh: () => Promise<T | null>
}

/**
 * 异步数据加载配置
 */
export interface UseAsyncOptions<T> {
  /** 初始数据 */
  initialData?: T
  /** 是否立即执行 */
  immediate?: boolean
  /** 成功回调 */
  onSuccess?: (data: T) => void
  /** 错误回调 */
  onError?: (error: Error) => void
  /** 重置数据时的默认值 */
  resetValue?: T | null
}

/**
 * 异步数据加载 Composable
 *
 * 统一处理异步操作的 loading/error/data 状态，减少页面中重复的异步处理代码。
 *
 * @example
 * ```ts
 * // 基础用法
 * const { loading, error, data, execute } = useAsync(async (id: number) => {
 *   return await fetchUser(id)
 * })
 * await execute(1)
 *
 * // 立即执行
 * const { loading, data } = useAsync(() => fetchServiceList(), {
 *   immediate: true,
 *   initialData: []
 * })
 *
 * // 带回调
 * const { execute } = useAsync(updateProfile, {
 *   onSuccess: () => ElMessage.success('更新成功'),
 *   onError: (e) => ElMessage.error(e.message)
 * })
 * ```
 *
 * @param fn 异步函数
 * @param options 配置选项
 */
export function useAsync<T, Args extends any[] = []>(
  fn: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, Args> {
  const {
    initialData = null as T | null,
    immediate = false,
    onSuccess,
    onError,
    resetValue = null
  } = options

  // 状态
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<T | null>(initialData) as Ref<T | null>

  // 计算属性
  const isReady = computed(() => !loading.value && data.value !== null)
  const hasError = computed(() => error.value !== null)

  // 保存上次调用的参数，用于 refresh
  let lastArgs: Args | null = null

  /**
   * 执行异步操作
   */
  async function execute(...args: Args): Promise<T> {
    // 保存参数
    lastArgs = args

    // 重置错误状态
    error.value = null
    loading.value = true

    try {
      const result = await fn(...args)
      data.value = result

      // 成功回调
      if (onSuccess) {
        onSuccess(result)
      }

      return result
    } catch (e) {
      // 错误处理
      const err = e instanceof Error ? e : new Error(String(e))
      error.value = err

      // 错误回调
      if (onError) {
        onError(err)
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置状态
   */
  function reset(): void {
    loading.value = false
    error.value = null
    data.value = resetValue
    lastArgs = null
  }

  /**
   * 刷新（重新执行上次调用）
   */
  async function refresh(): Promise<T | null> {
    if (lastArgs === null) {
      console.warn('[useAsync] refresh called without previous execute')
      return null
    }
    return execute(...lastArgs)
  }

  // 立即执行
  if (immediate) {
    execute(...([] as unknown as Args))
  }

  return {
    loading,
    error,
    data,
    isReady,
    hasError,
    execute,
    reset,
    refresh
  }
}

/**
 * 分页数据加载状态
 */
export interface PaginatedState<T> {
  loading: Ref<boolean>
  error: Ref<Error | null>
  items: Ref<T[]>
  total: Ref<number>
  page: Ref<number>
  pageSize: Ref<number>
  hasMore: Ref<boolean>
}

/**
 * 分页数据加载配置
 */
export interface UsePaginatedOptions {
  initialPage?: number
  initialPageSize?: number
  immediate?: boolean
  onSuccess?: (data: { items: any[]; total: number }) => void
  onError?: (error: Error) => void
}

/**
 * 分页数据加载 Composable
 *
 * 专门处理分页列表数据的加载，支持刷新、加载更多等操作。
 *
 * @example
 * ```ts
 * const { items, loading, page, loadPage, loadMore } = usePaginated(
 *   async (page, pageSize) => {
 *     const res = await fetchOrderList({ page, pageSize })
 *     return { items: res.records, total: res.total }
 *   },
 *   { immediate: true }
 * )
 *
 * // 加载指定页
 * await loadPage(2)
 *
 * // 加载更多（无限滚动）
 * await loadMore()
 * ```
 */
export function usePaginated<T>(
  fn: (page: number, pageSize: number) => Promise<{ items: T[]; total: number }>,
  options: UsePaginatedOptions = {}
) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    immediate = false,
    onSuccess,
    onError
  } = options

  const loading = ref(false)
  const error = ref<Error | null>(null)
  const items = ref<T[]>([]) as Ref<T[]>
  const total = ref(0)
  const page = ref(initialPage)
  const pageSize = ref(initialPageSize)

  const hasMore = computed(() => items.value.length < total.value)

  /**
   * 加载指定页数据
   */
  async function loadPage(targetPage: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const result = await fn(targetPage, pageSize.value)
      items.value = result.items
      total.value = result.total
      page.value = targetPage

      if (onSuccess) {
        onSuccess(result)
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      error.value = err

      if (onError) {
        onError(err)
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载更多（追加数据）
   */
  async function loadMore(): Promise<void> {
    if (!hasMore.value || loading.value) return

    loading.value = true
    error.value = null

    try {
      const nextPage = page.value + 1
      const result = await fn(nextPage, pageSize.value)
      items.value = [...items.value, ...result.items]
      total.value = result.total
      page.value = nextPage

      if (onSuccess) {
        onSuccess(result)
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      error.value = err

      if (onError) {
        onError(err)
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新（重新加载第一页）
   */
  async function refresh(): Promise<void> {
    page.value = initialPage
    items.value = []
    await loadPage(initialPage)
  }

  /**
   * 重置状态
   */
  function reset(): void {
    loading.value = false
    error.value = null
    items.value = []
    total.value = 0
    page.value = initialPage
  }

  // 立即执行
  if (immediate) {
    loadPage(initialPage)
  }

  return {
    loading,
    error,
    items,
    total,
    page,
    pageSize,
    hasMore,
    loadPage,
    loadMore,
    refresh,
    reset
  }
}

/**
 * 提交操作 Composable
 *
 * 专门处理表单提交等操作，自动处理 loading 状态。
 *
 * @example
 * ```ts
 * const { submitting, submit } = useSubmit(async (form) => {
 *   await createOrder(form)
 *   ElMessage.success('提交成功')
 *   router.push('/orders')
 * })
 *
 * // 表单提交
 * <el-button :loading="submitting" @click="submit(formData)">提交</el-button>
 * ```
 */
export function useSubmit<Args extends any[] = []>(
  fn: (...args: Args) => Promise<void>,
  options: {
    onSuccess?: () => void
    onError?: (error: Error) => void
  } = {}
) {
  const submitting = ref(false)
  const error = ref<Error | null>(null)

  async function submit(...args: Args): Promise<boolean> {
    if (submitting.value) return false

    submitting.value = true
    error.value = null

    try {
      await fn(...args)

      if (options.onSuccess) {
        options.onSuccess()
      }

      return true
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      error.value = err

      if (options.onError) {
        options.onError(err)
      }

      return false
    } finally {
      submitting.value = false
    }
  }

  return {
    submitting,
    error,
    submit
  }
}

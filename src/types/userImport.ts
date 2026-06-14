/**
 * User import related types
 * For admin bulk user import feature
 */

/**
 * Single failed row details
 */
export interface UserImportFailedRow {
  rowNum: number
  studentId: string | null
  reason: string
}

/**
 * Import result from backend
 */
export interface UserImportResultVO {
  totalCount: number
  successCount: number
  skippedCount: number
  failedCount: number
  failedRows: UserImportFailedRow[]
}

/**
 * Wallet-related type definitions
 * Aligned with backend WalletBalanceVO and wallet operations
 */

// ==================== Wallet Data Types ====================

/**
 * Wallet balance information
 * Maps to backend WalletBalanceVO
 */
export interface WalletInfo {
  walletBalance: number         // 可用余额
  frozenAmount: number          // 冻结金额（担保交易中）
  totalAmount: number           // 总资产（可用余额 + 冻结金额）
}

/**
 * Wallet transaction record
 * Maps to backend WalletTransactionVO
 */
export interface WalletTransaction {
  transactionId: number           // 流水ID
  transactionType: TransactionType
  typeName: string                // 交易类型名称
  amount: number                  // 交易金额
  balanceBefore: number           // 交易前余额
  balanceAfter: number            // 交易后余额
  frozenBefore: number            // 交易前冻结金额
  frozenAfter: number             // 交易后冻结金额
  relatedOrderId?: number         // 关联订单ID
  relatedOrderNumber?: string     // 关联订单编号
  transactionNo: string           // 流水号
  remark?: string                 // 备注说明
  createTime: string              // 创建时间
}

/**
 * Transaction query parameters
 */
export interface WalletTransactionQuery {
  pageNum?: number
  pageSize?: number
  transactionType?: TransactionType
  startTime?: string              // ISO 字符串
  endTime?: string                // ISO 字符串
}

/**
 * Transaction type enum
 * Maps to backend WalletConstant.TRANSACTION_TYPE_*
 */
export enum TransactionType {
  RECHARGE = 1,                 // 充值
  WITHDRAW = 2,                 // 提现
  PAYMENT = 3,                  // 支付
  REFUND = 4,                   // 退款（与后端一致）
  INCOME = 5,                   // 收入（与后端一致）
  FREEZE = 6,                   // 冻结
  UNFREEZE = 7                  // 解冻
}

// ==================== Request Types ====================

/**
 * Recharge request
 */
export interface RechargeRequest {
  amount: number
  paymentMethod?: string
}

/**
 * Withdraw request
 */
export interface WithdrawRequest {
  amount: number
  accountNumber?: string
  accountName?: string
}

// ==================== Helper Functions ====================

/**
 * Get display text for transaction type
 */
export function getTransactionTypeText(type: TransactionType): string {
  switch (type) {
    case TransactionType.RECHARGE:
      return '充值'
    case TransactionType.WITHDRAW:
      return '提现'
    case TransactionType.PAYMENT:
      return '支付'
    case TransactionType.INCOME:
      return '收入'
    case TransactionType.REFUND:
      return '退款'
    case TransactionType.FREEZE:
      return '冻结'
    case TransactionType.UNFREEZE:
      return '解冻'
    default:
      return '未知'
  }
}

/**
 * Get transaction type color
 */
export function getTransactionTypeColor(type: TransactionType): string {
  switch (type) {
    case TransactionType.RECHARGE:
    case TransactionType.INCOME:
    case TransactionType.REFUND:
    case TransactionType.UNFREEZE:
      return '#10b981'  // Green for income
    case TransactionType.WITHDRAW:
    case TransactionType.PAYMENT:
    case TransactionType.FREEZE:
      return '#ef4444'  // Red for expense
    default:
      return '#6b7280'  // Gray for unknown
  }
}

/**
 * Format amount with sign
 */
export function formatAmountWithSign(amount: number, type: TransactionType): string {
  const isIncome = [
    TransactionType.RECHARGE,
    TransactionType.INCOME,
    TransactionType.REFUND,
    TransactionType.UNFREEZE
  ].includes(type)

  const sign = isIncome ? '+' : '-'
  return `${sign}¥${Math.abs(amount).toFixed(2)}`
}

/**
 * Format wallet balance
 */
export function formatBalance(balance: number): string {
  return `¥${balance.toFixed(2)}`
}

/**
 * Check if balance is sufficient
 */
export function isBalanceSufficient(balance: number, amount: number): boolean {
  return balance >= amount
}

/**
 * Calculate available balance
 */
export function calculateAvailableBalance(walletInfo: WalletInfo): number {
  return walletInfo.walletBalance
}

/**
 * Calculate total assets
 */
export function calculateTotalAssets(walletInfo: WalletInfo): number {
  return walletInfo.totalAmount
}
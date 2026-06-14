/**
 * Wallet API module
 * Handles wallet and transaction related API calls
 */

import request from './request'
import type { PageResult, PageParams } from '@/types/http'
import type {
  WalletInfo,
  WalletTransaction,
  WalletTransactionQuery,
  RechargeRequest,
  WithdrawRequest
} from '@/types/wallet'

// ==================== Wallet Balance APIs ====================

/**
 * Get wallet balance information
 * @returns Wallet balance info
 */
export function getWalletInfo(): Promise<WalletInfo> {
  return request<WalletInfo>({
    url: '/wallet/balance',
    method: 'get'
  })
}

// ==================== Transaction APIs ====================

/**
 * Get wallet transaction history
 * @param params Query parameters with pagination
 * @returns Paginated transaction list
 */
export function getTransactionHistory(
  params?: WalletTransactionQuery
): Promise<PageResult<WalletTransaction>> {
  return request<PageResult<WalletTransaction>>({
    url: '/wallet/transactions',
    method: 'get',
    params: {
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 10,
      transactionType: params?.transactionType,
      startTime: params?.startTime,
      endTime: params?.endTime
    }
  })
}

// ==================== Recharge & Withdraw APIs ====================

/**
 * Recharge wallet
 * @param data Recharge request data
 * @returns Updated wallet info
 */
export function rechargeWallet(data: RechargeRequest): Promise<WalletInfo> {
  return request<WalletInfo>({
    url: '/wallet/recharge',
    method: 'post',
    data
  })
}

/**
 * Withdraw from wallet
 * @param data Withdraw request data
 * @returns Updated wallet info
 */
export function withdrawWallet(data: WithdrawRequest): Promise<WalletInfo> {
  return request<WalletInfo>({
    url: '/wallet/withdraw',
    method: 'post',
    data
  })
}

// ==================== Helper Functions ====================

/**
 * Check if wallet has sufficient balance
 * @param amount Amount to check
 * @returns Promise resolving to boolean
 */
export async function checkSufficientBalance(amount: number): Promise<boolean> {
  try {
    const walletInfo = await getWalletInfo()
    return walletInfo.walletBalance >= amount
  } catch (error) {
    console.error('Failed to check wallet balance:', error)
    return false
  }
}

/**
 * Format transaction list for display
 * @param transactions Original transaction list
 * @returns Enhanced transaction list
 */
export function formatTransactionList(
  transactions: WalletTransaction[]
): WalletTransaction[] {
  return transactions.map(transaction => ({
    ...transaction,
    // Add any computed fields if needed
  }))
}
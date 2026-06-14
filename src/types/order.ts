/**
 * Order-related type definitions
 * Aligned with backend OrderConstant and VOs
 */

// ==================== Order Status Enums ====================

/**
 * Order status enum (v2.0 updated)
 * Maps to backend OrderConstant.ORDER_*
 */
export enum OrderStatus {
  UNPAID = 1,                   // 待支付
  PENDING_SHIP = 2,             // 待发货 (v2.0: 原 PAID_PENDING_CONFIRM)
  PENDING_RECEIPT = 3,          // 待收货 (v2.0: 原 TRADING)
  COMPLETED = 4,                // 已完成
  CANCELLED = 5,                // 已取消
  FAILED = 6                    // 交易失败
}

/**
 * Refund status enum (v2.0 new)
 * Maps to backend OrderConstant.REFUND_*
 */
export enum RefundStatus {
  NONE = 0,                     // 无退款
  PENDING = 1,                  // 申请中（待卖家处理）
  APPROVED = 2,                 // 卖家同意（等待执行）
  REJECTED = 3,                 // 卖家拒绝
  COMPLETED = 4                 // 已执行退款（资金已退回）
}

/**
 * Payment status enum
 * Maps to backend OrderConstant.PAYMENT_*
 */
export enum PaymentStatus {
  UNPAID = 1,                   // 未支付
  PAID = 2,                     // 已支付
  REFUNDED = 3                  // 已退款
}

/**
 * Payment method enum
 * Maps to backend OrderConstant.PAYMENT_METHOD_*
 */
export enum PaymentMethod {
  WALLET = 1                    // 钱包支付
}

/**
 * Trade type enum
 * Maps to backend OrderConstant.TRADE_TYPE_*
 */
export enum TradeType {
  OFFLINE = 1,                  // 线下交易
  ONLINE = 2                    // 线上交易
}

/**
 * Order role type
 */
export type OrderRole = 'BUYER' | 'SELLER'

// ==================== Order Data Types ====================

/**
 * Order list item (for list views)
 * Maps to backend OrderListItemVO
 */
export interface OrderListItem {
  id: number
  orderNumber: string
  serviceId: number
  serviceTitle: string
  serviceImage?: string
  unitPrice: number
  quantity: number
  totalAmount: number
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  sellerId: number
  sellerName: string
  sellerAvatar?: string         // Seller avatar
  buyerId?: number              // Added for buyer info
  buyerName?: string            // Added for buyer info
  buyerAvatar?: string          // Buyer avatar
  createTime: string
  remark?: string               // Added for remark display
  refundStatus?: RefundStatus   // v2.0: 退款状态枚举
}

/**
 * Trade location info
 */
export interface TradeLocation {
  id: number
  locationName: string
  locationAddress: string
}

/**
 * Order detail (v2.0 updated)
 * Maps to backend OrderDetailVO
 */
export interface OrderDetail {
  id: number
  orderNumber: string
  serviceId: number
  serviceTitle: string
  serviceDescription?: string
  serviceImage?: string
  serviceTagName?: string      // Added for service category
  unitPrice: number
  quantity: number
  totalAmount: number
  tradeType: TradeType
  tradeLocationId?: number
  tradeLocationName?: string   // v2.0: 交易地点名称
  tradeLocation?: TradeLocation // Added for location details
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  frozenAmount?: number
  buyerId: number
  buyerName: string
  buyerAvatar?: string          // Added for buyer avatar
  buyerProfessional?: string    // Added for buyer professional
  sellerId: number
  sellerName: string
  sellerAvatar?: string         // Added for seller avatar
  sellerProfessional?: string   // Added for seller professional
  paymentTime?: string          // v2.0: 支付时间
  sellerShipTime?: string       // v2.0: 卖家发货时间 (原 confirmTime)
  buyerConfirmTime?: string     // v2.0: 买家确认收货时间
  createTime: string
  remark?: string
  // v2.0 退款相关字段
  refundStatus?: RefundStatus   // 退款状态
  refundReason?: string         // 退款原因
  refundRequestTime?: string    // 退款申请时间
  logs?: OrderLog[]             // Order operation logs
  // 评价相关字段
  isReviewed?: boolean          // 是否已评价
}

/**
 * Order operation log
 * For order timeline display
 */
export interface OrderLog {
  id?: number
  orderId: number
  operatorId: number
  operatorName?: string
  action: string
  actionDesc?: string
  createTime: string
}

// ==================== Request Types ====================

/**
 * Create order request
 * Maps to backend OrderCreateRequest
 */
export interface CreateOrderRequest {
  serviceId: number
  quantity: number
  tradeType: TradeType
  tradeLocationId?: number      // Required for offline trade
  remark?: string               // Added for frontend form
}

/**
 * Pay order request
 * Maps to backend OrderPayRequest
 */
export interface PayOrderRequest {
  orderId: number
  paymentMethod?: PaymentMethod
}

/**
 * Refund request (v2.0 updated)
 * Maps to backend OrderRefundRequest
 */
export interface RefundOrderRequest {
  orderId: number
  reason: string
}

/**
 * Seller handle refund request (v2.0 new)
 * Maps to backend SellerHandleRefundRequest
 */
export interface SellerHandleRefundRequest {
  approve: boolean
  rejectReason?: string
}

// ==================== Helper Functions ====================

/**
 * Get display text for order status (v2.0 updated)
 */
export function getOrderStatusText(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.UNPAID:
      return '待支付'
    case OrderStatus.PENDING_SHIP:
      return '待发货'
    case OrderStatus.PENDING_RECEIPT:
      return '待收货'
    case OrderStatus.COMPLETED:
      return '已完成'
    case OrderStatus.CANCELLED:
      return '已取消'
    case OrderStatus.FAILED:
      return '交易失败'
    default:
      return '未知'
  }
}

/**
 * Get status color for Element Plus tag (v2.0 updated)
 */
export function getOrderStatusType(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.UNPAID:
      return 'warning'
    case OrderStatus.PENDING_SHIP:
      return 'primary'        // 待发货 - 主色
    case OrderStatus.PENDING_RECEIPT:
      return ''               // 待收货 - 默认
    case OrderStatus.COMPLETED:
      return 'success'
    case OrderStatus.CANCELLED:
      return 'info'
    case OrderStatus.FAILED:
      return 'danger'
    default:
      return 'info'
  }
}

/**
 * Get display text for payment status
 */
export function getPaymentStatusText(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.UNPAID:
      return '未支付'
    case PaymentStatus.PAID:
      return '已支付'
    case PaymentStatus.REFUNDED:
      return '已退款'
    default:
      return '未知'
  }
}

/**
 * Get status color for payment status tag
 */
export function getPaymentStatusType(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.UNPAID:
      return 'warning'
    case PaymentStatus.PAID:
      return 'success'
    case PaymentStatus.REFUNDED:
      return 'danger'
    default:
      return 'info'
  }
}

/**
 * Get display text for refund status (v2.0 new)
 */
export function getRefundStatusText(status: RefundStatus): string {
  switch (status) {
    case RefundStatus.NONE:
      return ''
    case RefundStatus.PENDING:
      return '退款申请中'
    case RefundStatus.APPROVED:
      return '退款已同意'
    case RefundStatus.REJECTED:
      return '退款被拒绝'
    case RefundStatus.COMPLETED:
      return '已退款'
    default:
      return ''
  }
}

/**
 * Get status color for refund status tag (v2.0 new)
 */
export function getRefundStatusType(status: RefundStatus): string {
  switch (status) {
    case RefundStatus.NONE:
      return 'info'
    case RefundStatus.PENDING:
      return 'warning'
    case RefundStatus.APPROVED:
      return 'success'
    case RefundStatus.REJECTED:
      return 'danger'
    case RefundStatus.COMPLETED:
      return 'danger'  // 已退款显示为危险色
    default:
      return 'info'
  }
}

/**
 * Get display text for trade type
 */
export function getTradeTypeText(type: TradeType): string {
  switch (type) {
    case TradeType.OFFLINE:
      return '线下交易'
    case TradeType.ONLINE:
      return '线上担保'
    default:
      return '未知'
  }
}

/**
 * Check if order can be paid
 */
export function canPayOrder(status: OrderStatus): boolean {
  return status === OrderStatus.UNPAID
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(status: OrderStatus): boolean {
  return status === OrderStatus.UNPAID
}

/**
 * Check if buyer can confirm receipt (v2.0 updated)
 */
export function canBuyerConfirm(status: OrderStatus, refundStatus?: RefundStatus): boolean {
  // 待收货状态且无退款申请中才能确认收货
  const currentRefundStatus = refundStatus ?? RefundStatus.NONE
  return status === OrderStatus.PENDING_RECEIPT &&
         (currentRefundStatus === RefundStatus.NONE || currentRefundStatus === RefundStatus.REJECTED)
}

/**
 * Check if seller can ship order (v2.0 new)
 */
export function canSellerShip(status: OrderStatus): boolean {
  return status === OrderStatus.PENDING_SHIP
}

/**
 * Check if seller can handle refund (v2.0 new)
 */
export function canSellerHandleRefund(status: OrderStatus, refundStatus?: RefundStatus): boolean {
  return status === OrderStatus.PENDING_RECEIPT && refundStatus === RefundStatus.PENDING
}

/**
 * Check if buyer can apply refund (v2.0 updated)
 * 待发货: 可直接退款
 * 待收货: 需卖家同意
 */
export function canApplyRefund(status: OrderStatus, refundStatus?: RefundStatus): boolean {
  const currentRefundStatus = refundStatus ?? RefundStatus.NONE
  // 待发货状态可直接申请退款
  if (status === OrderStatus.PENDING_SHIP) {
    return true
  }
  // 待收货状态且无退款申请或被拒绝后可重新申请
  if (status === OrderStatus.PENDING_RECEIPT) {
    return currentRefundStatus === RefundStatus.NONE || currentRefundStatus === RefundStatus.REJECTED
  }
  return false
}

/**
 * Format order number for display
 */
export function formatOrderNumber(orderNumber: string): string {
  if (!orderNumber) return ''
  // Add spaces for readability, e.g., "202511280001" -> "2025 1128 0001"
  if (orderNumber.length === 12) {
    return `${orderNumber.slice(0, 4)} ${orderNumber.slice(4, 8)} ${orderNumber.slice(8)}`
  }
  return orderNumber
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`
}

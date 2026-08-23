export interface OrderCenterNavItem {
  code: string
  name: string
  routePath: string
}

export interface OrderCenterTab {
  code: string
  name: string
}

export interface OrderCenterBankAccount {
  companyName: string
  bankName: string
  accountNo: string
  taxNo: string
  remark: string
  tip: string
}

export interface OrderCenterIndexData {
  emptyText: string
  emptyInvoiceText: string
  emptyHistoryText: string
  emptyBalanceText: string
  navItems: OrderCenterNavItem[]
  orderTabs: OrderCenterTab[]
  balanceTabs: OrderCenterTab[]
  bankAccount: OrderCenterBankAccount
  invoiceTypes: OrderCenterTab[]
}

export interface OrderCenterOrder {
  id: number
  orderNo: string
  productName: string
  productDesc?: string
  amount: number
  amountLabel: string
  seatCount?: number
  status: string
  statusLabel: string
  payMethod?: string
  payMethodLabel?: string
  createTime: string
  payTime?: string
  canPay: boolean
  canCancel: boolean
  canInvoice: boolean
  qrCodeUrl?: string
}

export interface OrderCenterInvoiceItem {
  orderId: number
  orderNo: string
  productName: string
  amountLabel: string
}

export interface OrderCenterInvoice {
  id: number
  invoiceNo: string
  invoiceType: string
  invoiceTypeLabel: string
  title: string
  taxNo?: string
  email: string
  amount: number
  amountLabel: string
  status: string
  statusLabel: string
  createTime: string
  issueTime?: string
  items: OrderCenterInvoiceItem[]
}

export interface OrderCenterTransfer {
  id: number
  transferNo: string
  amount: number
  amountLabel: string
  payerName: string
  remark?: string
  status: string
  statusLabel: string
  createTime: string
}

export interface OrderCenterBalanceLog {
  id: number
  title: string
  remark?: string
  changeCents: number
  changeLabel: string
  bizType: string
  createTime: string
  income: boolean
}

export interface OrderCenterBalance {
  balance: number
  balanceLabel: string
  logs: OrderCenterBalanceLog[]
}

export type OrderCenterSection =
  | 'vip'
  | 'seat'
  | 'print'
  | 'transfer'
  | 'balance'
  | 'invoice'
  | 'invoice-history'

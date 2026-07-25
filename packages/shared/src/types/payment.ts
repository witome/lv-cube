export enum PayMethod {
  WECHAT = 'wechat',
}

export enum PayStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum SettleStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
}

export enum WithdrawStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
}

export interface Payment {
  id: number;
  orderId: number;
  userId: number;
  amount: number;
  payMethod: PayMethod;
  payStatus: PayStatus;
  transactionId?: string;
  paidAt?: Date;
}

export interface Settlement {
  id: number;
  orderId: number;
  supplierId: number;
  orderAmount: number;
  commissionRate: number;
  commissionFee: number;
  settleAmount: number;
  settleStatus: SettleStatus;
  settledAt?: Date;
}

export interface Withdraw {
  id: number;
  userId: number;
  role: 'supplier' | 'driver';
  amount: number;
  bankAccount: string;
  auditStatus: WithdrawStatus;
  auditRemark?: string;
  paidAt?: Date;
  createdAt: Date;
}

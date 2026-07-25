export enum AfterSaleType {
  REFUND = 'refund',
  RETURN_REFUND = 'return_refund',
  EXCHANGE = 'exchange',
}

export enum AfterSaleStatus {
  PENDING_SUPPLIER = 'pending_supplier',
  SUPPLIER_PROCESSED = 'supplier_processed',
  PENDING_ARBITRATION = 'pending_arbitration',
  ARBITRATED = 'arbitrated',
  CLOSED = 'closed',
}

export interface AfterSale {
  id: number;
  orderId: number;
  buyerId: number;
  supplierId: number;
  type: AfterSaleType;
  reason: string;
  description?: string;
  images: string[];
  status: AfterSaleStatus;
  buyerRefundAmount?: number;
  supplierCompensationAmount?: number;
  platformDecision?: string;
  decisionRemark?: string;
  appliedAt: Date;
  supplierProcessedAt?: Date;
  arbitratedAt?: Date;
  closedAt?: Date;
}

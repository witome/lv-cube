export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PENDING_ACCEPT = 'pending_accept',
  PREPARING = 'preparing',
  DELIVERING = 'delivering',
  PENDING_RECEIPT = 'pending_receipt',
  COMPLETED = 'completed',
  AFTER_SALE = 'after_sale',
  CANCELLED = 'cancelled',
}

export enum DeliveryTimeType {
  SAME_DAY = 'same_day',
  NEXT_DAY = 'next_day',
  SCHEDULED = 'scheduled',
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productSnapshot: {
    name: string;
    mainImage: string;
    skuName: string;
  };
  skuId: number;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNo: string;
  buyerId: number;
  supplierId: number;
  addressSnapshot: {
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
    latitude?: number;
    longitude?: number;
  };
  deliveryType: DeliveryTimeType;
  deliveryTimeSlot?: string;
  deliveryFee: number;
  goodsAmount: number;
  discountAmount: number;
  totalAmount: number;
  payAmount: number;
  commissionRate: number;
  commissionFee: number;
  status: OrderStatus;
  remark?: string;
  cancelReason?: string;
  paidAt?: Date;
  acceptedAt?: Date;
  deliveredAt?: Date;
  receivedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  items: OrderItem[];
}

export enum DeliveryType {
  PLATFORM = 'platform',
  OWNED = 'owned',
}

export enum DeliveryStatus {
  PENDING_PICKUP = 'pending_pickup',
  PICKED_UP = 'picked_up',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  SIGNED = 'signed',
  CANCELLED = 'cancelled',
}

export enum DriverStatus {
  IDLE = 'idle',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

export interface Delivery {
  id: number;
  orderId: number;
  driverId?: number;
  deliveryType: DeliveryType;
  pickupAddress: {
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
    latitude?: number;
    longitude?: number;
  };
  deliveryAddress: {
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
    latitude?: number;
    longitude?: number;
  };
  distance: number;
  deliveryFee: number;
  status: DeliveryStatus;
  driverLatitude?: number;
  driverLongitude?: number;
  driverLocationUpdatedAt?: Date;
  expectedArrivalTime?: Date;
  acceptedAt?: Date;
  pickedAt?: Date;
  deliveredAt?: Date;
  signedAt?: Date;
  createdAt: Date;
}

export interface DeliveryConfig {
  id: number;
  city: string;
  baseFee: number;
  baseDistance: number;
  perKmFee: number;
  freeDeliveryThreshold: number;
  sameDayFeeExtra: number;
  nextDayFeeExtra: number;
}

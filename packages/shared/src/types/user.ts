export enum UserRole {
  BUYER = 'buyer',
  SUPPLIER = 'supplier',
  DRIVER = 'driver',
  ADMIN = 'admin',
}

export enum AuditStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface UserBase {
  id: number;
  phone: string;
  nickname: string;
  avatar?: string;
  roles: UserRole[];
  realName?: string;
  idCardNo?: string;
  status: 'active' | 'disabled';
  createdAt: Date;
}

export interface SupplierProfile {
  userId: number;
  shopName: string;
  shopLogo?: string;
  shopDesc?: string;
  businessLicense: string;
  foodLicense?: string;
  auditStatus: AuditStatus;
  auditRemark?: string;
  createdAt: Date;
}

export interface DriverProfile {
  userId: number;
  driverName: string;
  licenseNo: string;
  vehiclePlate: string;
  vehicleType: string;
  capacity: number;
  auditStatus: AuditStatus;
  auditRemark?: string;
  createdAt: Date;
}

export interface Address {
  id: number;
  userId: number;
  type: 'buyer' | 'supplier';
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

import request from './request';

export function getUserList(params: any): Promise<{ list: any[]; total: number }> {
  return request.get('/user/list', { params });
}

export function getPendingSuppliers(): Promise<any[]> {
  return request.get('/user/pending-suppliers');
}

export function getPendingDrivers(): Promise<any[]> {
  return request.get('/user/pending-drivers');
}

export function reviewSupplier(id: number, data: { approved: boolean; remark?: string }) {
  return request.patch(`/user/review-supplier/${id}`, data);
}

export function reviewDriver(id: number, data: { approved: boolean; remark?: string }) {
  return request.patch(`/user/review-driver/${id}`, data);
}

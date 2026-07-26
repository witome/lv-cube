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

export function updateUserStatus(id: number, status: string) {
  return request.patch(`/user/${id}/status`, { status });
}

export function updateUserRoles(id: number, roles: string[]) {
  return request.patch(`/user/${id}/roles`, { roles });
}

export function deleteUser(id: number) {
  return request.delete(`/user/${id}`);
}

export function createUser(data: any) {
  return request.post('/user', data);
}

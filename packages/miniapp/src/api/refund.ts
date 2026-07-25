import { request } from './request';

export function applyRefund(orderId: number, reason: string, amount: number) {
  return request.post('/refund/apply', { orderId, reason, amount });
}

export function getRefundList(status?: string) {
  const params = status ? { status } : {};
  return request.get('/refund/list', { params });
}

export function getSupplierRefundList(status?: string) {
  const params = status ? { status } : {};
  return request.get('/refund/supplier/list', { params });
}

export function getRefundDetail(id: number) {
  return request.get(`/refund/${id}`);
}

export function approveRefund(id: number) {
  return request.post(`/refund/${id}/approve`);
}

export function rejectRefund(id: number, reason: string) {
  return request.post(`/refund/${id}/reject`, { reason });
}

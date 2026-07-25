import { request } from './request';

export function createOrder(data: any) {
  return request({ url: '/order', method: 'POST', data });
}

export function getBuyerOrders(params?: any) {
  return request({ url: '/order/buyer', method: 'GET', data: params });
}

export function getSupplierOrders(params?: any) {
  return request({ url: '/order/supplier', method: 'GET', data: params });
}

export function getOrderDetail(id: number) {
  return request({ url: `/order/${id}`, method: 'GET' });
}

export function acceptOrder(id: number) {
  return request({ url: `/order/${id}/accept`, method: 'PATCH' });
}

export function rejectOrder(id: number, reason: string) {
  return request({ url: `/order/${id}/reject`, method: 'PATCH', data: { reason } });
}

export function shipOrder(id: number) {
  return request({ url: `/order/${id}/ship`, method: 'PATCH' });
}

export function confirmOrder(id: number) {
  return request({ url: `/order/${id}/confirm`, method: 'PATCH' });
}

export function cancelOrder(id: number, reason: string) {
  return request({ url: `/order/${id}/cancel`, method: 'PATCH', data: { reason } });
}

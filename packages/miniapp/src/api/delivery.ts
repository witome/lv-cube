import { request } from './request';

export function getDeliveryPool() {
  return request({ url: '/delivery/pool', method: 'GET' });
}

export function getMyDeliveries(status?: string) {
  const params = status ? { status } : {};
  return request({ url: '/delivery/my', method: 'GET', data: params });
}

export function getDeliveryByOrder(orderId: number) {
  return request({ url: `/delivery/order/${orderId}`, method: 'GET' });
}

export function acceptDelivery(deliveryId: number) {
  return request({ url: `/delivery/accept/${deliveryId}`, method: 'POST' });
}

export function markPickedUp(deliveryId: number) {
  return request({ url: `/delivery/pickup/${deliveryId}`, method: 'PATCH' });
}

export function markDelivered(deliveryId: number) {
  return request({ url: `/delivery/deliver/${deliveryId}`, method: 'PATCH' });
}

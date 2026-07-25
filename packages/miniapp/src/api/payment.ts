import { request } from './request';

export function payOrder(data: { orderId: number }) {
  return request({ url: '/payment/pay', method: 'POST', data });
}

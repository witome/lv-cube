import { request } from './request';

export function getCart() {
  return request({ url: '/cart', method: 'GET' });
}

export function addCart(data: { productId: number; skuId: number; quantity: number }) {
  return request({ url: '/cart', method: 'POST', data });
}

export function updateCartQuantity(id: number, quantity: number) {
  return request({ url: `/cart/${id}/quantity`, method: 'PUT', data: { quantity } });
}

export function removeCartItem(id: number) {
  return request({ url: `/cart/${id}`, method: 'DELETE' });
}

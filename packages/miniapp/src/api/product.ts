import { request } from './request';

export function getProductList(params: any) {
  return request({ url: '/product', method: 'GET', data: params });
}

export function getProductDetail(id: number) {
  return request({ url: `/product/${id}`, method: 'GET' });
}

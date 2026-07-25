import { request } from './request';

export function createProduct(data: any) {
  return request({ url: '/product', method: 'POST', data });
}

export function updateProduct(id: number, data: any) {
  return request({ url: `/product/${id}`, method: 'PUT', data });
}

export function updateProductStatus(id: number, status: string) {
  return request({ url: `/product/${id}/status`, method: 'PATCH', data: { status } });
}

export function deleteProduct(id: number) {
  return request({ url: `/product/${id}`, method: 'DELETE' });
}

export function updateSkuStock(skuId: number, stock: number) {
  return request({ url: `/product/sku/${skuId}/stock`, method: 'PATCH', data: { stock } });
}

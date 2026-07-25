import request from './request';

export function getProductList(params: any): Promise<{ list: any[]; total: number }> {
  return request.get('/product', { params }) as any;
}

export function getProductDetail(id: number): Promise<any> {
  return request.get(`/product/${id}`) as any;
}

export function updateProductStatus(id: number, status: string) {
  return request.patch(`/product/${id}/status`, { status }) as any;
}

export function deleteProduct(id: number) {
  return request.delete(`/product/${id}`) as any;
}

import request from './request';

export function getOrderList(params: any): Promise<{ list: any[]; total: number }> {
  return request.get('/order/admin/list', { params }) as any;
}

export function getOrderDetail(id: number): Promise<any> {
  return request.get(`/order/${id}`) as any;
}

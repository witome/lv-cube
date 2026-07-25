import request from './request';

export function getDeliveryList(params: any): Promise<{ list: any[]; total: number }> {
  return request.get('/delivery/admin/list', { params }) as any;
}

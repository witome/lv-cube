import request from './request';

export function getRefundList(params: any): Promise<{ list: any[]; total: number }> {
  return request.get('/refund/admin/list', { params }) as any;
}

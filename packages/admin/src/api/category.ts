import request from './request';

export function getCategoryTree(): Promise<any[]> {
  return request.get('/category/tree');
}

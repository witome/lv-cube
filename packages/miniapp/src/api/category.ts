import { request } from './request';

export function getCategoryTree() {
  return request({ url: '/category/tree', method: 'GET' });
}

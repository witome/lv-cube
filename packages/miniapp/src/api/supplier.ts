import { request } from './request';

export function getMyCategories() {
  return request({ url: '/supplier/my-categories', method: 'GET' });
}

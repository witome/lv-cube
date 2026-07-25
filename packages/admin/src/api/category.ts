import request from './request';

export function getCategoryTree(): Promise<any[]> {
  return request.get('/category/tree') as any;
}

export function getCategoryList(): Promise<any[]> {
  return request.get('/category') as any;
}

export function createCategory(data: any) {
  return request.post('/category', data) as any;
}

export function updateCategory(id: number, data: any) {
  return request.put(`/category/${id}`, data) as any;
}

export function deleteCategory(id: number) {
  return request.delete(`/category/${id}`) as any;
}

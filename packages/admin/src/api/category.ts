import request from './request';

export function getCategoryTree(): Promise<any[]> {
  return request.get('/category/tree');
}

export function getCategoryList(): Promise<any[]> {
  return request.get('/category');
}

export function createCategory(data: any): Promise<any> {
  return request.post('/category', data);
}

export function updateCategory(id: number, data: any): Promise<any> {
  return request.put(`/category/${id}`, data);
}

export function deleteCategory(id: number): Promise<any> {
  return request.delete(`/category/${id}`);
}

import { request } from './request';

export function getAddressList(type?: string) {
  const params = type ? `?type=${type}` : '';
  return request({ url: `/address${params}`, method: 'GET' });
}

export function createAddress(data: any) {
  return request({ url: '/address', method: 'POST', data });
}

export function updateAddress(id: number, data: any) {
  return request({ url: `/address/${id}`, method: 'PUT', data });
}

export function deleteAddress(id: number) {
  return request({ url: `/address/${id}`, method: 'DELETE' });
}

export function setDefaultAddress(id: number) {
  return request({ url: `/address/${id}/default`, method: 'PATCH' });
}

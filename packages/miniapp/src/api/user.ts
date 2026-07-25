import { request } from './request';

export function switchRole(role: string) {
  return request({ url: '/user/switch-role', method: 'POST', data: { role } });
}

export function applySupplier(data: any) {
  return request({ url: '/user/apply-supplier', method: 'POST', data });
}

export function applyDriver(data: any) {
  return request({ url: '/user/apply-driver', method: 'POST', data });
}

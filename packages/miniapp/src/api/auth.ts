import { request } from './request';

export function login(data: { phone: string; password: string }) {
  return request<{ accessToken: string }>({ url: '/auth/login', method: 'POST', data });
}

export function register(data: { phone: string; password: string; nickname?: string }) {
  return request<{ accessToken: string }>({ url: '/auth/register', method: 'POST', data });
}

export function getProfile() {
  return request({ url: '/auth/profile', method: 'GET' });
}

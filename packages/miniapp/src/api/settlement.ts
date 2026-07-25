import { request } from './request';

export function getAccount() {
  return request({ url: '/settlement/account', method: 'GET' });
}

export function getSettlementList(params?: any) {
  return request({ url: '/settlement/list', method: 'GET', data: params });
}

export function applyWithdraw(data: { amount: number }) {
  return request({ url: '/settlement/withdraw', method: 'POST', data });
}

export function getWithdrawalList(params?: any) {
  return request({ url: '/settlement/withdrawals', method: 'GET', data: params });
}

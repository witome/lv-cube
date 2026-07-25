import request from './request';

export function getSettlementList(params: any) {
  return request.get('/settlement/list', { params });
}

export function getWithdrawalList(params: any) {
  return request.get('/settlement/withdrawals', { params });
}

import { request } from './request';

export function getMessageList(page = 1, pageSize = 20) {
  return request.get('/message/list', { params: { page, pageSize } });
}

export function getUnreadCount() {
  return request.get('/message/unread');
}

export function markMessageRead(id: number) {
  return request.post(`/message/${id}/read`);
}

export function markAllMessagesRead() {
  return request.post('/message/read-all');
}

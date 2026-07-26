const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
}

export function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');

    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: (options.method || 'GET') as any,
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
      success: (res: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const body = res.data;
          if (body.code === 0) {
            resolve(body.data);
          } else {
            const errMsg = Array.isArray(body.message) ? body.message.join('；') : (body.message || '请求失败');
            uni.showToast({ title: errMsg, icon: 'none' });
            reject(new Error(errMsg));
          }
        } else if (res.statusCode === 401) {
          uni.removeStorageSync('token');
          uni.reLaunch({ url: '/pages/index/index' });
          reject(new Error('未授权'));
        } else {
          const rawMessage = res.data?.message;
          const message = Array.isArray(rawMessage)
            ? rawMessage.join('；')
            : rawMessage || `请求失败（${res.statusCode}）`;
          uni.showToast({ title: message, icon: 'none' });
          reject(new Error(message));
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      },
    });
  });
}

request.get = function (url: string, data?: any) {
  return request({ url, method: 'GET', data });
};

request.post = function (url: string, data?: any) {
  return request({ url, method: 'POST', data });
};

request.put = function (url: string, data?: any) {
  return request({ url, method: 'PUT', data });
};

request.delete = function (url: string, data?: any) {
  return request({ url, method: 'DELETE', data });
};

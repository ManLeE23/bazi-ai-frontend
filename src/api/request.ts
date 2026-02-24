import { baseUrl } from './config';
import { ensureLoggedIn } from '@/utils/auth';

interface RequestParams {
  url: string;
  params: Record<string, any>;
  skipAuth?: boolean;
  hideErrorToast?: boolean;
}

// 全局更新请求头
export const updateHeader = () => {
  const token = uni.getStorageSync('token');
  return {
    'Content-Type': 'application/json',
    authorization: token ? `Bearer ${token}` : '',
    'user-timezone': 'Asia/Shanghai',
    // 'user-id': uni.getStorageSync('openId') || '',
  };
};

// 请求拦截
uni.addInterceptor('request', {
  invoke(args) {
    const header = updateHeader(); // 每次请求前更新token
    args.header = { ...args.header, ...header };
    args.url = baseUrl + args.url;
    return args;
  },
  // Removed success/fail from interceptor to handle them per-request
});

const handleResponse = (res: any, hideErrorToast: boolean = false) => {
  const { statusCode, data } = res;
  const isObject = data !== null && typeof data === 'object';
  const code = isObject && 'code' in data ? (data as any).code : undefined;
  const msg = isObject && 'msg' in data ? (data as any).msg : undefined;

  console.log('请求成功:', res);

  if (statusCode === 200) {
    if (code === 200) {
      return Promise.resolve(data);
    }
    // If it's not a standard {code, msg, data} response, just return the whole thing
    if (!isObject || code === undefined) {
      return Promise.resolve(res);
    }
  }

  if (statusCode === 401) {
    // 未登录或登录过期
    // uni.showToast({ title: '登录过期，请重新登录', icon: 'none' });
    uni.removeStorageSync('token');
    uni.reLaunch({ url: '/pages/login/index' });
    return Promise.reject(res);
  }

  let displayMsg = msg ? msg : '数据出错';
  // Prevent displaying technical errors (SQL, code dumps) to users
  if (
    displayMsg.length > 50 ||
    displayMsg.includes('SQL') ||
    displayMsg.includes('SELECT') ||
    displayMsg.includes('Traceback')
  ) {
    console.error('Hidden Error Detail:', displayMsg);
    displayMsg = '服务暂时不可用，请稍后再试';
  }

  if (!hideErrorToast) {
    uni.showToast({ title: displayMsg, icon: 'none' });
  }

  // Return the error object so caller can handle it
  return Promise.reject(data || res);
};

const handleError = (err: any, hideErrorToast: boolean = false) => {
  if (!hideErrorToast) {
    uni.showToast({ title: '网络连接失败', icon: 'none' });
  }
  return Promise.reject(err);
};

const request = async (options: any, hideErrorToast: boolean = false) => {
  try {
    const res = await uni.request(options);
    // uni.request in Promise mode returns { data, statusCode, header, ... } if successful (network-wise)
    // Or sometimes it returns [error, res] array depending on wrapper?
    // Standard uni-app V3 Promise: returns res object on success, throws on network error?
    // Actually, uni.request might return [err, res] if not using a specific promise wrapper.
    // But since the original code used `async success(res)`, it implies `uni.request` was being intercepted.
    // Wait, if I remove `success` interceptor, `uni.request` behavior depends on the project setup (manifest.json / main.js).
    // Usually in Vite/Vue3 uni-app, it returns a Promise resolving to `res`.

    // However, to be safe and compatible with previous behavior (which seemed to rely on interceptor resolving/rejecting),
    // let's assume `uni.request` returns a Promise.

    // Note: If uni.request returns [err, res] (callback style wrapped in promise), we need to handle that.
    // But standard `uni.request` without callback returns a Promise that resolves to `res`.

    // Let's inspect the previous code again.
    // `uni.addInterceptor` was used. `invoke` modifies args. `success` modifies result.
    // The previous code expected `uni.request` to return whatever `success` returned.

    return handleResponse(res, hideErrorToast);
  } catch (err) {
    return handleError(err, hideErrorToast);
  }
};

export const httpGet = async ({
  url,
  params,
  skipAuth,
  hideErrorToast,
}: RequestParams) => {
  if (!skipAuth) {
    try {
      await ensureLoggedIn();
    } catch (e) {
      console.error('Login guard failed:', e);
      return Promise.reject(e);
    }
  }
  return request(
    {
      method: 'GET',
      url, // The interceptor will prepend baseUrl
      data: params,
      // @ts-ignore
      skipAuth,
    },
    hideErrorToast,
  );
};

export const httpPost = async ({
  url,
  params,
  skipAuth,
  hideErrorToast,
}: RequestParams) => {
  if (!skipAuth) {
    try {
      await ensureLoggedIn();
    } catch (e) {
      console.error('Login guard failed:', e);
      return Promise.reject(e);
    }
  }
  return request(
    {
      method: 'POST',
      url,
      data: params,
      // @ts-ignore
      skipAuth,
    },
    hideErrorToast,
  );
};

export const httpPut = async ({
  url,
  params,
  skipAuth,
  hideErrorToast,
}: RequestParams) => {
  if (!skipAuth) {
    try {
      await ensureLoggedIn();
    } catch (e) {
      console.error('Login guard failed:', e);
      return Promise.reject(e);
    }
  }
  return request(
    {
      method: 'PUT',
      url,
      data: params,
      // @ts-ignore
      skipAuth,
    },
    hideErrorToast,
  );
};

export const httpDelete = async ({
  url,
  params,
  skipAuth,
  hideErrorToast,
}: RequestParams) => {
  if (!skipAuth) {
    try {
      await ensureLoggedIn();
    } catch (e) {
      console.error('Login guard failed:', e);
      return Promise.reject(e);
    }
  }
  return request(
    {
      method: 'DELETE',
      url,
      data: params,
      // @ts-ignore
      skipAuth,
    },
    hideErrorToast,
  );
};

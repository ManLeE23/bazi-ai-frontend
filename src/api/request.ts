import { baseUrl } from './config';
import { ensureLoggedIn } from '@/utils/auth';

interface RequestParams {
  url: string;
  params: Record<string, any>;
  skipAuth?: boolean;
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
  async success(res) {
    const { statusCode, data } = res;
    const isObject = data !== null && typeof data === 'object';
    const code = isObject && 'code' in data ? (data as any).code : undefined;
    const msg = isObject && 'msg' in data ? (data as any).msg : undefined;

    console.log('请求成功:', res);

    if (statusCode === 200) {
      if (code === 200) {
        return Promise.resolve(data);
      }
      if (!isObject || code === undefined) {
        return Promise.resolve(res);
      }
    }
    // if (code === 1401) {
    //   // 未登录
    //   uni.showToast({ title: '登录过期，正在重新登录', icon: 'none' });
    //   // clearStorage();
    //   // await checkLogin();
    //   // uni.showToast({ title: '登录成功', icon: 'none' });
    //   // return Promise.reject(res);
    // }

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

    uni.showToast({ title: displayMsg, icon: 'none' });
    return Promise.reject(res);
  },
  fail(err) {
    uni.showToast({ title: '网络连接失败', icon: 'none' });
    return Promise.reject(err);
  },
});

export const httpGet = async ({ url, params, skipAuth }: RequestParams) => {
  if (!skipAuth) {
    try {
      await ensureLoggedIn();
    } catch (e) {
      console.error('Login guard failed:', e);
      // Optional: Redirect to login or show toast?
      // For now, let the request proceed (it might fail with 401) or reject?
      // If login fails, we probably shouldn't proceed.
      return Promise.reject(e);
    }
  }
  return uni.request({
    method: 'GET',
    url,
    data: params,
    // @ts-ignore
    skipAuth,
  });
};

export const httpPost = async ({ url, params, skipAuth }: RequestParams) => {
  if (!skipAuth) {
    try {
      await ensureLoggedIn();
    } catch (e) {
      console.error('Login guard failed:', e);
      return Promise.reject(e);
    }
  }
  return uni.request({
    method: 'POST',
    url,
    data: params,
    // @ts-ignore
    skipAuth,
  });
};

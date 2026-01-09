import { baseUrl } from './config';

interface RequestParams {
  url: string;
  params: Record<string, any>;
}

// 全局更新请求头
export const updateHeader = () => {
  return {
    'Content-Type': 'application/json',
    // token: uni.getStorageSync('token') || '',
    'user-timezone': 'Asia/Shanghai',
    'user-id': uni.getStorageSync('openId') || '',
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
    const { code, msg } = data;

    // 统一处理业务码
    if (statusCode === 200 && code === 200) {
      return Promise.resolve(data); // 正常数据
    }
    // if (code === 1401) {
    //   // 未登录
    //   uni.showToast({ title: '登录过期，正在重新登录', icon: 'none' });
    //   clearStorage();
    //   await checkLogin();
    //   uni.showToast({ title: '登录成功', icon: 'none' });
    //   return Promise.reject(res);
    // }

    // HTTP错误
    uni.showToast({ title: msg ? msg : '数据出错', icon: 'error' });
    return Promise.reject(res);
  },
  fail(err) {
    uni.showToast({ title: '网络连接失败', icon: 'none' });
    return Promise.reject(err);
  },
});

export const httpGet = ({ url, params }: RequestParams) => {
  return uni.request({
    method: 'GET',
    url,
    data: params,
  });
};

export const httpPost = ({ url, params }: RequestParams) => {
  return uni.request({
    method: 'POST',
    url,
    data: params,
  });
};

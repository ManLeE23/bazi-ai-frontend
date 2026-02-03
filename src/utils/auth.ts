import { fetchOpenId } from '@/api/services';

let loginPromise: Promise<void> | null = null;
let isLoggedIn = false;

export const doLogin = () => {
  if (loginPromise) return loginPromise;

  loginPromise = new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => {
        if (res.code) {
            fetchOpenId({ code: res.code }).then((response: any) => {
                // response is the full data object from backend
                const data = response.data;
                if (data && data.openid) {
                    uni.setStorageSync('openId', data.openid);
                    // If token is present, store it
                    if (data.token) {
                        uni.setStorageSync('token', data.token);
                    }
                    isLoggedIn = true;
                    resolve();
                } else {
                    reject('No openid received in response');
                }
            }).catch((err: any) => {
                console.error('Login API error:', err);
                reject(err);
            });
        } else {
            reject('Uni login failed: no code');
        }
      },
      fail: (err) => {
        console.error('Uni login fail:', err);
        reject(err);
      }
    });
  });
  
  // If login fails, clear the promise so we can retry
  loginPromise.catch(() => {
      loginPromise = null;
  });

  return loginPromise;
};

export const ensureLoggedIn = async () => {
   if (isLoggedIn) return;
   
   // Check storage first?
   // User requirement: "Every time entering the app, need to login first"
   // This implies we should verify login or just trust storage?
   // Usually we trust storage for openId, but if we need a fresh token, we might need to login.
   // Given "login后才可以请求" (after login can request), maybe they mean strict session.
   // But let's check if we have openId.
   const openId = uni.getStorageSync('openId');
   if (openId) {
       isLoggedIn = true;
       return;
   }
   
   await doLogin();
};

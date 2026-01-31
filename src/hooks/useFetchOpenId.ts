import { fetchOpenId } from '@/api/services';
import { ref, onMounted } from 'vue';

export default function useFetchOpenId(onLoginSuccess?: () => void) {
  const openId = ref('');

  const getOpenId = () => {
    uni.login({
      success: (res) => {
        fetchOpenId({ code: res.code }).then((res) => {
          console.log('Login response:', res);
          const data = res.data as any;
          if (data && data.openid) {
            openId.value = data.openid;
            onLoginSuccess?.();
          }
        });
      },
      fail: (err) => {
        console.log('Login error:', err);
      },
    });
  };

  onMounted(() => {
    getOpenId();
  });

  return {
    openId,
    getOpenId,
  };
}

import { fetchOpenId } from '@/api/services';
import { ref, onMounted } from 'vue';

export default function useFetchOpenId() {
  const openId = ref('');

  const getOpenId = () => {
    uni.login({
      success: (res) => {
        fetchOpenId({ code: res.code }).then((res) => {
          console.log('Login response:', res);
          const { data } = res;
          uni.setStorageSync('openId', data.openid);
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

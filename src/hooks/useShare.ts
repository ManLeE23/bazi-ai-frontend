import { ref } from 'vue';
import { fetchShareConfig } from '@/api/services';

export interface ShareConfig {
  title: string;
  path: string;
  imageUrl: string;
}

export function useShare(initialConfig?: Partial<ShareConfig>) {
  const shareConfig = ref<ShareConfig>({
    title: '人生趋势：看清趋势，走对下一步',
    path: '/pages/index/index',
    imageUrl: '../../static/slogan.png', // 使用相对路径以确保小程序能够正确解析
    ...initialConfig,
  });

  const loadShareConfig = async () => {
    try {
      const res: any = await fetchShareConfig();
      const data = res?.data ?? res;
      const rawImage = data?.image_url;
      let imageUrl = shareConfig.value.imageUrl;

      if (typeof rawImage === 'string' && rawImage.trim() !== '') {
        const cleaned = rawImage.trim().replace(/^`|`$/g, '');
        if (cleaned) {
          imageUrl = cleaned;
        }
      }

      if (
        data?.title ||
        data?.path ||
        (typeof rawImage === 'string' && rawImage.trim() !== '')
      ) {
        shareConfig.value = {
          ...shareConfig.value,
          title: data?.title || shareConfig.value.title,
          path: data?.path || shareConfig.value.path,
          imageUrl: imageUrl,
        };
      }
    } catch (e) {
      console.error('Fetch share config failed:', e);
    }
  };

  return {
    shareConfig,
    loadShareConfig,
  };
}

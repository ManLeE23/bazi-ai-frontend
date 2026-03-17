import { ref } from 'vue';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
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
    imageUrl: '/static/slogan.png',
    ...initialConfig,
  });

  const loadShareConfig = async () => {
    try {
      const res: any = await fetchShareConfig();
      const data = res?.data ?? res;
      const rawImage = data?.image_url;
      const imageUrl =
        typeof rawImage === 'string'
          ? rawImage.trim().replace(/^`|`$/g, '')
          : shareConfig.value.imageUrl;

      if (data?.title || data?.path || imageUrl) {
        shareConfig.value = {
          ...shareConfig.value,
          title: data?.title || shareConfig.value.title,
          path: data?.path || shareConfig.value.path,
          imageUrl: imageUrl || shareConfig.value.imageUrl,
        };
      }
    } catch (e) {
      console.error('Fetch share config failed:', e);
    }
  };

  onShareAppMessage(() => {
    return {
      title: shareConfig.value.title,
      path: shareConfig.value.path,
      imageUrl: shareConfig.value.imageUrl,
    };
  });

  onShareTimeline(() => {
    const query = shareConfig.value.path.split('?')[1] || '';
    return {
      title: shareConfig.value.title,
      query: query,
      imageUrl: shareConfig.value.imageUrl,
    };
  });

  return {
    shareConfig,
    loadShareConfig,
  };
}

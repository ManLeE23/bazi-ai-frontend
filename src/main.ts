import { createSSRApp } from 'vue';
import App from './App.vue';
import 'vk-uview-ui/index.scss';
import uView from 'vk-uview-ui';
import { analytics } from '@/utils/analytics';

export function createApp() {
  const app = createSSRApp(App);
  app.use(uView);

  // Global Mixin for PV tracking
  app.mixin({
    onShow() {
      // @ts-ignore
      const route = this.$mpType === 'page' ? this.$route?.path || this.$scope?.route : null;
      if (route) {
        // Normalize route (ensure it starts with /)
        const pagePath = route.startsWith('/') ? route : `/${route}`;
        analytics.track('page_view', {
          title: '', // Optional: could try to get title
          referrer: '' // Hard to get in uni-app efficiently without history stack mgmt
        });
      }
    }
  });

  return {
    app,
  };
}

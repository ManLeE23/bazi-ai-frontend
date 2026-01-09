import { createSSRApp } from 'vue';
import App from './App.vue';
import 'vk-uview-ui/index.scss';
import uView from 'vk-uview-ui';

export function createApp() {
  const app = createSSRApp(App);
  app.use(uView);
  return {
    app,
  };
}

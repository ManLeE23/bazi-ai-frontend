import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import path from 'path';

export default defineConfig({
  plugins: [uni()],
  css: {
    preprocessorOptions: {
      scss: {
        // 先引入 uView 变量文件，再引入自己的变量（顺序很重要）
        additionalData: `
          @import "vk-uview-ui/theme.scss";
          @import "@/styles/variables.scss";
          @import "@/styles/uview.scss";
        `,
        // 注意：如果 uView 版本较新，路径可能是 'uview-ui/libs/css/variables.scss'
        // 若找不到文件，可在 node_modules/uview-ui 中搜索 "border-color" 定位变量文件
      },
    },
  },
  resolve: {
    // 配置别名，确保 uview-ui 能被正确找到
    alias: {
      'vk-uview-ui': path.resolve(__dirname, 'node_modules/vk-uview-ui'),
      '@uni-ui': '@dcloudio/uni-ui/lib',
    },
  },
});

<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { doLogin } from "@/utils/auth";
import { analytics } from "@/utils/analytics";

onLaunch(() => {
  console.log("App Launch");
  // Init analytics session
  analytics.initSession();
  analytics.track('app_open', {
    scene: uni.getLaunchOptionsSync().scene,
    version: uni.getAppBaseInfo().appVersion
  });

  // Check login status
  const token = uni.getStorageSync('token');
  if (!token) {
     console.log("No token, will need login");
  }
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style lang="scss">
body {
  font-size: $text-base;
  color: $color-slate-900;
}

html {
  font-size: $text-base;
  color: $color-slate-900;
}

::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}

/* Hide scrollbar for Chrome/Safari/Webkit */
.scroll-view ::-webkit-scrollbar,
uni-scroll-view ::-webkit-scrollbar,
uni-view ::-webkit-scrollbar,
element ::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scroll-view,
uni-scroll-view {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>

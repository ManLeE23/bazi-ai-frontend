<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("App Launch");
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
</style>

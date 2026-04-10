export const safeNavigateBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({
      url: '/pages/index/index',
    });
  }
};

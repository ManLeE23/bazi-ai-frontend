<template>
  <view class="markdown-body">
    <rich-text :nodes="htmlContent" :user-select="true"></rich-text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';

const props = defineProps<{
  content: string;
}>();

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true
});

// 添加类名，使用 class 选择器以适配小程序端样式限制
md.renderer.rules.paragraph_open = () => '<p class="md-p">';
md.renderer.rules.heading_open = (tokens, idx) => {
  const tag = tokens[idx].tag;
  return `<${tag} class="md-${tag}">`;
};
md.renderer.rules.bullet_list_open = () => '<ul class="md-ul">';
md.renderer.rules.ordered_list_open = () => '<ol class="md-ol">';
// md.renderer.rules.list_item_open = (tokens, idx) => {
//   // 判断父级是否为无序列表，决定是否插入自定义圆点
//   let isBullet = false;
//   for (let i = idx - 1; i >= 0; i--) {
//     const t = tokens[i];
//     if (t.type === 'bullet_list_open') { isBullet = true; break; }
//     if (t.type === 'ordered_list_open') { isBullet = false; break; }
//     if (t.type === 'bullet_list_close' || t.type === 'ordered_list_close') break;
//   }
//   return `<li class="md-li">${isBullet ? '<span class="md-bullet"></span>' : ''}`;
// };
// md.renderer.rules.list_item_close = () => '</li>';
md.renderer.rules.blockquote_open = () => '<blockquote class="md-blockquote">';
md.renderer.rules.strong_open = () => '<strong class="md-strong">';
md.renderer.rules.strong_close = () => '</strong>';
md.renderer.rules.link_open = (tokens, idx) => {
  const token = tokens[idx];
  const href = token.attrGet('href') || '';
  const title = token.attrGet('title');
  const target = token.attrGet('target');
  let attrs = ` href="${md.utils.escapeHtml(href)}"`;
  if (title) attrs += ` title="${md.utils.escapeHtml(title)}"`;
  if (target) attrs += ` target="${md.utils.escapeHtml(target)}"`;
  return `<a class="md-a"${attrs}>`;
};
md.renderer.rules.link_close = () => '</a>';
md.renderer.rules.image = (tokens, idx) => {
  const token = tokens[idx];
  const src = token.attrGet('src') || '';
  const altAttr = token.attrGet('alt') || '';
  const alt = altAttr ? md.utils.escapeHtml(altAttr) : '';
  const title = token.attrGet('title');
  let attrs = ` src="${md.utils.escapeHtml(src)}" alt="${alt}"`;
  if (title) attrs += ` title="${md.utils.escapeHtml(title)}"`;
  return `<img class="md-img"${attrs} />`;
};
md.renderer.rules.code_inline = (tokens, idx) => `<code class="md-code">${md.utils.escapeHtml(tokens[idx].content)}</code>`;
md.renderer.rules.code_block = (tokens, idx) => `<pre class="md-pre"><code class="md-code">${md.utils.escapeHtml(tokens[idx].content)}</code></pre>`;
md.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx];
  const lang = token.info ? token.info.trim() : '';
  const langClass = lang ? ` language-${md.utils.escapeHtml(lang)}` : '';
  return `<pre class="md-pre"><code class="md-code${langClass}">${md.utils.escapeHtml(token.content)}</code></pre>`;
};
md.renderer.rules.table_open = () => '<table class="md-table">';
md.renderer.rules.thead_open = () => '<thead class="md-thead">';
md.renderer.rules.tbody_open = () => '<tbody class="md-tbody">';
md.renderer.rules.tr_open = () => '<tr class="md-tr">';
md.renderer.rules.th_open = () => '<th class="md-th">';
md.renderer.rules.td_open = () => '<td class="md-td">';
md.renderer.rules.th_close = () => '</th>';
md.renderer.rules.td_close = () => '</td>';
md.renderer.rules.tr_close = () => '</tr>';
md.renderer.rules.thead_close = () => '</thead>';
md.renderer.rules.tbody_close = () => '</tbody>';
md.renderer.rules.table_close = () => '</table>';

const htmlContent = computed(() => {
  if (!props.content) return '';
  return md.render(props.content);
});
</script>

<style lang="scss" scoped>
.markdown-body {
  font-size: 30rpx;
  line-height: 1.8;
  color: #1e293b;
  word-break: break-all;
  
  /* Deep selector to style rich-text content */
  :deep(.md-p) { margin-bottom: 1em; }
  :deep(.md-strong) { color: #4f46e5; }
  :deep(.md-h1), :deep(.md-h2), :deep(.md-h3), :deep(.md-h4), :deep(.md-h5), :deep(.md-h6) {
    font-weight: bold;
    margin-top: 12rpx;
    margin-bottom: 8rpx;
    line-height: 1.4;
  }
  :deep(.md-h1:first-child), :deep(.md-h2:first-child), :deep(.md-h3:first-child),
  :deep(.md-h4:first-child), :deep(.md-h5:first-child), :deep(.md-h6:first-child) { margin-top: 0; }
  :deep(.md-p) { margin: 0 0 12rpx; }
  :deep(.md-p:first-child) { margin-top: 0; }
  :deep(.md-ul), :deep(.md-ol) { margin: 12rpx 0; }
  :deep(.md-ul:first-child), :deep(.md-ol:first-child) { margin-top: 0; }
  :deep(.md-li) { margin-bottom: 8rpx; position: relative; }
  :deep(.md-li::before) { background-color: #818cf8; }
  :deep(.md-ul .md-li) { padding-left: 24rpx; }
  :deep(.md-ul .md-bullet) {
    position: absolute;
    left: 0;
    top: 0.9em;
    width: 10rpx;
    height: 10rpx;
    border-radius: 50%;
    background-color: #4f46e5;
    transform: translateY(-50%);
  }
  :deep(.md-code) {
    background-color: #f5f5f5;
    padding: 0.2em 0.4em;
    border-radius: 4rpx;
    font-family: monospace;
    font-size: 0.9em;
  }
  :deep(.md-pre) {
    background-color: #f5f5f5;
    padding: 1em;
    border-radius: 8rpx;
    overflow-x: auto;
    margin-bottom: 1em;
  }
  :deep(.md-blockquote) {
    margin: 24rpx 0;
    padding: 16rpx 32rpx;
    border-left: 8rpx solid #e0e7ff;
    color: #64748b;
  }
  :deep(.md-a) { color: #4f46e5; text-decoration: none; }
  :deep(.md-img) { max-width: 100%; height: auto; border-radius: 8rpx; }
  :deep(.md-table) { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
  :deep(.md-th), :deep(.md-td) { border: 1px solid #e0e7ff; padding: 0.5em; text-align: left; }
  :deep(.md-th) { background-color: #f3f4f680; font-weight: bold; }
}
</style>

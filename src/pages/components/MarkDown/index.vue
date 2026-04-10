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
  font-size: 32rpx; /* body-lg */
  line-height: 1.6; /* 160% line-height */
  color: #191c20; /* on-surface */
  word-break: break-all;
  font-family: 'Plus Jakarta Sans', sans-serif;
  
  /* Deep selector to style rich-text content */
  :deep(.md-p:last-child),
  :deep(.md-pre:last-child),
  :deep(.md-ul:last-child),
  :deep(.md-ol:last-child),
  :deep(.md-blockquote:last-child),
  :deep(.md-table:last-child),
  :deep(.md-h1:last-child),
  :deep(.md-h2:last-child),
  :deep(.md-h3:last-child),
  :deep(.md-h4:last-child),
  :deep(.md-h5:last-child),
  :deep(.md-h6:last-child) {
    margin-bottom: 0 !important;
  }
  
  :deep(.md-p) { margin-bottom: 24rpx; }
  
  :deep(.md-strong) { 
    color: #632ce5; /* primary */
    font-weight: 800; 
  }
  
  :deep(.md-h1), :deep(.md-h2), :deep(.md-h3), :deep(.md-h4), :deep(.md-h5), :deep(.md-h6) {
    font-weight: 800; /* ExtraBold */
    color: #191c20;
    margin-top: 40rpx;
    margin-bottom: 24rpx;
    line-height: 1.4;
    letter-spacing: -0.02em;
  }
  
  :deep(.md-h1) { font-size: 48rpx; }
  :deep(.md-h2) { font-size: 40rpx; }
  :deep(.md-h3) { font-size: 36rpx; }
  
  :deep(.md-h1:first-child), :deep(.md-h2:first-child), :deep(.md-h3:first-child),
  :deep(.md-h4:first-child), :deep(.md-h5:first-child), :deep(.md-h6:first-child) { margin-top: 0; }
  
  :deep(.md-ul), :deep(.md-ol) { margin: 24rpx 0; padding-left: 16rpx; } 
  :deep(.md-ul:first-child), :deep(.md-ol:first-child) { margin-top: 0; }
  :deep(.md-li) { margin-bottom: 16rpx; position: relative; }
  
  :deep(.md-ul .md-li) { padding-left: 32rpx; }
  :deep(.md-ul .md-bullet) {
    position: absolute;
    left: 0;
    top: 0.8em;
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background-color: #7c4dff; /* primary_container */
    transform: translateY(-50%);
  }
  
  :deep(.md-code) {
    background-color: rgba(124, 77, 255, 0.08);
    color: #632ce5;
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    font-family: monospace;
    font-size: 28rpx;
  }
  
  :deep(.md-pre) {
    background-color: #f8f9ff; /* surface */
    padding: 32rpx;
    border-radius: 24rpx;
    overflow-x: auto;
    margin-bottom: 32rpx;
    border: 0.5px solid rgba(202, 195, 216, 0.3);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .md-code {
      background-color: transparent;
      color: #494455;
      padding: 0;
      border-radius: 0;
    }
  }
  
  :deep(.md-blockquote) {
    margin: 32rpx 0;
    padding: 24rpx 32rpx;
    border-left: 8rpx solid #7c4dff;
    background-color: rgba(124, 77, 255, 0.04);
    border-radius: 0 16rpx 16rpx 0;
    color: #64748b;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  :deep(.md-a) { 
    color: #7c4dff; 
    text-decoration: none; 
    border-bottom: 1px solid rgba(124, 77, 255, 0.3);
  }
  
  :deep(.md-img) { 
    max-width: 100%; 
    height: auto; 
    border-radius: 24rpx; 
    margin: 24rpx 0;
  }
  
  :deep(.md-table) { 
    border-collapse: collapse; 
    width: 100%; 
    margin-bottom: 32rpx; 
    border-radius: 16rpx;
    overflow: hidden;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  :deep(.md-th), :deep(.md-td) { 
    border: 0.5px solid rgba(202, 195, 216, 0.3); 
    padding: 20rpx; 
    text-align: left; 
  }
  
  :deep(.md-th) { 
    background-color: rgba(124, 77, 255, 0.05); 
    font-weight: 800; 
    color: #632ce5;
  }
}
</style>

const str = "深度洞察力：能够轻易看穿表面现象，直达事物或人性的核心本质，极具前瞻性。";
const idx = str.indexOf("：");
if (idx > -1) {
  console.log(str.slice(0, idx + 1));
  console.log(str.slice(idx + 1));
} else {
  console.log(str);
}

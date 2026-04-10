import fs from 'fs';
let content = fs.readFileSync('src/pages/mbti/report.vue', 'utf-8');
const reps = {
  '#f8f9ff': '#f0f9ff',
  '#6366f1': '#3b82f6',
  '#6366F1': '#3B82F6',
  '99, 102, 241': '59, 130, 246',
  '#4f46e5': '#2563eb',
  '#4F46E5': '#2563EB',
  '#4338CA': '#1D4ED8',
  '#eef2ff': '#eff6ff',
  '#E0E7FF': '#DBEAFE',
  '#C7D2FE': '#BFDBFE',
  '#312e81': '#1e3a8a',
  '#818cf8': '#60a5fa',
  '238, 242, 255': '239, 246, 255',
  '233, 213, 255': '219, 234, 254',
  '199, 210, 254': '191, 219, 254'
};
for (const k in reps) {
  content = content.split(k).join(reps[k]);
}
fs.writeFileSync('src/pages/mbti/report.vue', content, 'utf-8');


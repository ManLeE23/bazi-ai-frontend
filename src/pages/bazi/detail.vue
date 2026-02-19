<template>
  <view class="bazi-detail-container" :class="{ 'has-liuyue': !!activeLiuYue }">
    <HeaderBar :showBack="true" :fixed="true" :placeholder="true" backgroundColor="transparent" />
    <scroll-view scroll-y="true" class="main-scroll" :show-scrollbar="false">
    <!-- Header -->
    <view class="custom-header">
      <view class="header-content">
        <view class="user-info">
          <view class="name-row">
            <text class="user-name">{{ baziData.base_info?.name || '未命名' }}</text>
            <view class="gender-tag">
              <text class="gender-text">{{ baziData.base_info?.gender === '女' ? '坤造' : '乾造' }}</text>
            </view>
          </view>
          <text class="info-text">阳历：{{ baziData.base_info?.birth_datetime }}（真太阳）</text>
          <text class="info-text">阴历：{{ baziData.base_info?.chinese_birth_datetime }}</text>
        </view>
        <!-- <view class="share-btn">
          <u-icon name="share" size="20" color="#6366f1"></u-icon>
        </view> -->
      </view>
    </view>

    <!-- Main Content -->
    <view class="main-content">
      <!-- Bazi Grid -->
      <view class="section-card">
        <!-- Sticky Chart Header Block -->
        <view class="sticky-chart-header">
          <!-- Headers -->
          <view class="bazi-grid header-row">
            <text class="grid-cell label">盘式</text>
            <text class="grid-cell">年柱</text>
            <text class="grid-cell">月柱</text>
            <text class="grid-cell">日柱</text>
            <text class="grid-cell">时柱</text>
            <text class="grid-cell">大运</text>
            <text class="grid-cell">流年</text>
            <text class="grid-cell" v-if="activeLiuYue">流月</text>
          </view>
  
          <!-- Main Stars (Ten Gods) -->
          <view class="bazi-grid row-ten-god">
            <text class="grid-cell label">主星</text>
            <text class="grid-cell" :class="getElementClass(baziData.pillars?.year?.ten_god)">{{ baziData.pillars?.year?.ten_god }}</text>
            <text class="grid-cell" :class="baziData.pillars?.month?.ten_god ? getElementClass(baziData.pillars?.month?.ten_god) : ''">{{ baziData.pillars?.month?.ten_god }}</text>
            <text class="grid-cell" :class="'highlight'">{{ baziData.pillars?.day?.ten_god }}</text>
            <text class="grid-cell" :class="getElementClass(baziData.pillars?.hour?.ten_god)">{{ baziData.pillars?.hour?.ten_god }}</text>
            <!-- Placeholder for Dayun/Liunian current ten god if needed, or static -->
            <text class="grid-cell" :class="getElementClass(currentDayun?.ten_god)">{{ currentDayun?.ten_god }}</text>
            <text class="grid-cell" :class="getElementClass(currentLiunian?.ten_god)">{{ currentLiunian?.ten_god }}</text>
            <text class="grid-cell" v-if="activeLiuYue" :class="getElementClass(activeLiuYue?.ten_god || activeLiuYue?.stem_ten_god)">{{ activeLiuYue?.ten_god || activeLiuYue?.stem_ten_god }}</text>
          </view>
  
          <!-- Stems -->
          <view class="bazi-grid row-stem">
            <text class="grid-cell label">天干</text>
            <text class="grid-cell stem-text" :class="getWuXingClass(baziData.pillars?.year?.gan)">{{ baziData.pillars?.year?.gan }}</text>
            <text class="grid-cell stem-text" :class="getWuXingClass(baziData.pillars?.month?.gan)">{{ baziData.pillars?.month?.gan }}</text>
            <text class="grid-cell stem-text" :class="getWuXingClass(baziData.pillars?.day?.gan)">{{ baziData.pillars?.day?.gan }}</text>
            <text class="grid-cell stem-text" :class="getWuXingClass(baziData.pillars?.hour?.gan)">{{ baziData.pillars?.hour?.gan }}</text>
            <text class="grid-cell stem-text" :class="getWuXingClass(currentDayun?.pillar?.[0])">{{ currentDayun?.pillar?.[0] || '-' }}</text>
            <text class="grid-cell stem-text" :class="getWuXingClass(currentLiunianPillar?.[0])">{{ currentLiunianPillar?.[0] || '-' }}</text>
            <text class="grid-cell stem-text" v-if="activeLiuYue" :class="getWuXingClass(activeLiuYue?.pillar?.[0])">{{ activeLiuYue?.pillar?.[0] || '-' }}</text>
          </view>
  
          <!-- Branches -->
          <view class="bazi-grid row-branch">
            <text class="grid-cell label">地支</text>
            <text class="grid-cell branch-text" :class="getWuXingClass(baziData.pillars?.year?.zhi)">{{ baziData.pillars?.year?.zhi }}</text>
            <text class="grid-cell branch-text" :class="getWuXingClass(baziData.pillars?.month?.zhi)">{{ baziData.pillars?.month?.zhi }}</text>
            <text class="grid-cell branch-text" :class="getWuXingClass(baziData.pillars?.day?.zhi)">{{ baziData.pillars?.day?.zhi }}</text>
            <text class="grid-cell branch-text" :class="getWuXingClass(baziData.pillars?.hour?.zhi)">{{ baziData.pillars?.hour?.zhi }}</text>
            <text class="grid-cell branch-text" :class="getWuXingClass(currentDayun?.pillar?.[1])">{{ currentDayun?.pillar?.[1] || '-' }}</text>
            <text class="grid-cell branch-text" :class="getWuXingClass(currentLiunianPillar?.[1])">{{ currentLiunianPillar?.[1] || '-' }}</text>
            <text class="grid-cell branch-text" v-if="activeLiuYue" :class="getWuXingClass(activeLiuYue?.pillar?.[1])">{{ activeLiuYue?.pillar?.[1] || '-' }}</text>
          </view>
  
          <!-- Hidden Stems & Deputy Stars Merged -->
          <view class="bazi-grid row-hidden">
            <text class="grid-cell label">藏干</text>
            <view class="grid-cell hidden-col">
              <view v-for="(h, i) in baziData.pillars?.year?.hidden_stems" :key="i" class="hidden-item">
                <text :class="getWuXingClass(h.gan)">{{ h.gan }}</text>
                <text class="hidden-ten-god">{{ h.full_ten_god }}</text>
              </view>
            </view>
            <view class="grid-cell hidden-col">
              <view v-for="(h, i) in baziData.pillars?.month?.hidden_stems" :key="i" class="hidden-item">
                <text :class="getWuXingClass(h.gan)">{{ h.gan }}</text>
                <text class="hidden-ten-god">{{ h.full_ten_god }}</text>
              </view>
            </view>
            <view class="grid-cell hidden-col">
              <view v-for="(h, i) in baziData.pillars?.day?.hidden_stems" :key="i" class="hidden-item">
                <text :class="getWuXingClass(h.gan)">{{ h.gan }}</text>
                <text class="hidden-ten-god">{{ h.full_ten_god }}</text>
              </view>
            </view>
            <view class="grid-cell hidden-col">
              <view v-for="(h, i) in baziData.pillars?.hour?.hidden_stems" :key="i" class="hidden-item">
                <text :class="getWuXingClass(h.gan)">{{ h.gan }}</text>
                <text class="hidden-ten-god">{{ h.full_ten_god }}</text>
              </view>
            </view>
            <view class="grid-cell hidden-col">
              <view v-for="(h, i) in currentDayun?.hidden_stems" :key="i" class="hidden-item">
                <text :class="getWuXingClass(h.gan)">{{ h.gan }}</text>
                <text class="hidden-ten-god">{{ h.full_ten_god }}</text>
              </view>
            </view>
            <view class="grid-cell hidden-col">
              <view v-for="(h, i) in currentLiunian?.hidden_stems" :key="i" class="hidden-item">
                <text :class="getWuXingClass(h.gan)">{{ h.gan }}</text>
                <text class="hidden-ten-god">{{ h.full_ten_god }}</text>
              </view>
            </view>
            <view class="grid-cell hidden-col" v-if="activeLiuYue">
              <view v-for="(h, i) in activeLiuYue?.hidden_stems" :key="i" class="hidden-item">
                <text :class="getWuXingClass(h.gan)">{{ h.gan }}</text>
                <text class="hidden-ten-god">{{ h.full_ten_god }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- Na Yin -->
        <view class="bazi-grid row-meta">
          <text class="grid-cell label">纳音</text>
          <text class="grid-cell">{{ baziData.pillars?.year?.nayin }}</text>
          <text class="grid-cell">{{ baziData.pillars?.month?.nayin }}</text>
          <text class="grid-cell">{{ baziData.pillars?.day?.nayin }}</text>
          <text class="grid-cell">{{ baziData.pillars?.hour?.nayin }}</text>
          <text class="grid-cell">{{ currentDayun?.nayin }}</text>
          <text class="grid-cell">{{ currentLiunian?.nayin }}</text>
          <text class="grid-cell" v-if="activeLiuYue">-</text>
        </view>

        <!-- Xing Yun -->
        <view class="bazi-grid row-meta">
          <text class="grid-cell label">星运</text>
          <text class="grid-cell">{{ baziData.pillars?.year?.xing_yun }}</text>
          <text class="grid-cell">{{ baziData.pillars?.month?.xing_yun }}</text>
          <text class="grid-cell">{{ baziData.pillars?.day?.xing_yun }}</text>
          <text class="grid-cell">{{ baziData.pillars?.hour?.xing_yun }}</text>
          <text class="grid-cell">{{ currentDayun?.xing_yun }}</text>
          <text class="grid-cell">{{ currentLiunian?.xing_yun }}</text>
          <text class="grid-cell" v-if="activeLiuYue">-</text>
        </view>

         <!-- Kong Wang -->
        <view class="bazi-grid row-meta">
          <text class="grid-cell label">空亡</text>
          <text class="grid-cell empty-death">{{ baziData.pillars?.year?.kong_wang }}</text>
          <text class="grid-cell empty-death">{{ baziData.pillars?.month?.kong_wang }}</text>
          <text class="grid-cell empty-death">{{ baziData.pillars?.day?.kong_wang }}</text>
          <text class="grid-cell empty-death">{{ baziData.pillars?.hour?.kong_wang }}</text>
          <text class="grid-cell empty-death">{{ currentDayun?.kong_wang }}</text>
          <text class="grid-cell empty-death">{{ currentLiunian?.kong_wang }}</text>
          <text class="grid-cell empty-death" v-if="activeLiuYue">-</text>
        </view>
        
        <!-- Extra Info -->
        <view class="extra-info-row">
            <text class="extra-item">胎元：<text class="value">{{ baziData.extra_info?.tai_yuan }}</text></text>
            <text class="extra-item">命宫：<text class="value">{{ baziData.extra_info?.ming_gong }}</text></text>
            <text class="extra-item">身宫：<text class="value">{{ baziData.extra_info?.shen_gong }}</text></text>
        </view>

        <!-- Yun Flow Panel -->
        <view class="yun-flow-panel">
            <!-- Da Yun Section -->
            <view class="yun-row">
                <view class="yun-label">
                    <text>大</text>
                    <text>运</text>
                </view>
                <scroll-view scroll-x class="yun-scroll" :show-scrollbar="false" :enable-flex="true">
                    <view class="dayun-list">
                        <view 
                            v-for="(yun, index) in baziData.da_yun?.list" 
                            :key="index"
                            class="dayun-item"
                            :class="{ active: activeYunIndex === index }"
                            @click="handleDayunSelect(index)"
                        >
                            <view class="year-info">
                                <text class="year-label">{{ yun.start_year }}</text>
                                <text class="age-label">{{ yun.start_age }}岁</text>
                            </view>
                            <view class="pillar-col">
                                <text class="pillar-char" :class="getWuXingClass(yun.pillar?.[0])">{{ yun.pillar?.[0] }}</text>
                                <text class="pillar-char" :class="getWuXingClass(yun.pillar?.[1])">{{ yun.pillar?.[1] }}</text>
                            </view>
                            <text class="ten-god-label">{{ yun.ten_god }}</text>
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- Liu Nian Section -->
            <view class="yun-row">
                <view class="yun-label">
                    <text>流</text>
                    <text>年</text>
                </view>
                <scroll-view scroll-x class="yun-scroll" :show-scrollbar="false" :enable-flex="true">
                    <view class="liunian-list">
                        <view 
                            v-for="(ln, index) in currentLiuNianList" 
                            :key="index"
                            class="liunian-item"
                            :class="{ active: activeLiunianYear === ln.year }"
                            @click="handleLiunianSelect(ln)"
                        >
                            <text class="year-num">{{ ln.year }}</text>
                            <view class="pillar-col">
                                <text class="pillar-char" :class="getWuXingClass(ln.pillar?.[0])">{{ ln.pillar?.[0] }}</text>
                                <text class="pillar-char" :class="getWuXingClass(ln.pillar?.[1])">{{ ln.pillar?.[1] }}</text>
                            </view>
                            <text class="ten-god-text">{{ ln.ten_god }}</text>
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- Liu Yue Section -->
            <view class="yun-row" v-if="activeLiunianYear">
                <view class="yun-label">
                    <text>流</text>
                    <text>月</text>
                </view>
                <view class="liuyue-container">
                    <view class="liuyue-grid">
                        <view 
                            v-for="(month, index) in currentLiuYueList" 
                            :key="index" 
                            class="liuyue-item"
                            :class="{ active: activeLiuYue?.month === month.month }"
                            @click="handleLiuYueSelect(month)"
                        >
                            <text class="month-label">{{ month.term_label }}</text>
                            <view class="pillar-row">
                                <text class="pillar-char" :class="getWuXingClass(month.pillar?.[0])">{{ month.pillar?.[0] }}</text>
                                <text class="ten-god">{{ month.stem_ten_god }}</text>
                            </view>
                            <view class="pillar-row">
                                <text class="pillar-char" :class="getWuXingClass(month.pillar?.[1])">{{ month.pillar?.[1] }}</text>
                                <text class="ten-god">{{ month.branch_ten_god }}</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
      </view>


    </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchBaziCalculate } from '@/api/services';
import HeaderBar from '@/components/HeaderBar.vue';

// --- Types ---
interface HiddenStem {
  gan: string;
  full_gan: string;
  ten_god: string;
  full_ten_god: string;
}

interface Pillar {
  gan: string;
  zhi: string;
  ten_god: string;
  nayin: string;
  xing_yun: string;
  kong_wang: string;
  hidden_stems: HiddenStem[];
}

interface DaYunItem {
  pillar: string;
  start_age: number;
  start_year: number;
  end_year: number;
  ten_god: string;
  nayin: string;
  xing_yun: string;
  kong_wang: string;
  hidden_stems: HiddenStem[];
}

interface LiuYueItem {
  month: number;
  month_gan?: string;
  month_zhi?: string;
  gan_zhi?: string;
  start_term?: string;
  start_date?: string;
  stem_ten_god?: string;
  branch_ten_god?: string;
  ten_god?: string; // Main Star from API
  hidden_stems?: HiddenStem[]; // Hidden Stems from API
  pillar?: string; // Add pillar field
  term_label?: string; // Added by frontend
}

interface LiuNianItem {
  year: number;
  pillar: string;
  ten_god: string;
  nayin: string;
  xing_yun: string;
  kong_wang: string;
  hidden_stems: HiddenStem[];
  liu_yue?: LiuYueItem[];
}

interface BaziData {
  base_info: {
    name: string;
    gender: string;
    birth_date: string;
    chinese_birth_date: string;
    birth_location: string;
    birth_datetime: string;
    chinese_birth_datetime: string;
  };
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
  };
  extra_info: {
    tai_yuan: string;
    ming_gong: string;
    shen_gong: string;
  };
  da_yun: {
    start_age: number;
    list: DaYunItem[];
  };
  liu_nian: LiuNianItem[];
}

// --- State ---
const baziData = ref<BaziData>({
    base_info: { name: '', gender: '', birth_date: '', chinese_birth_date: '', birth_location: '', birth_datetime: '', chinese_birth_datetime: '' },
    pillars: {
        year: {} as Pillar,
        month: {} as Pillar,
        day: {} as Pillar,
        hour: {} as Pillar
    },
    extra_info: { tai_yuan: '', ming_gong: '', shen_gong: '' },
    da_yun: { start_age: 0, list: [] },
    liu_nian: []
});

const activeYunIndex = ref(0);
const activeLiunianYear = ref<number | null>(null);
const activeLiuYue = ref<LiuYueItem | null>(null);

// --- Computed ---
const currentDayun = computed(() => {
    return baziData.value.da_yun?.list[activeYunIndex.value];
});

const currentLiuNianList = computed(() => {
    if (!currentDayun.value) return [];
    const start = currentDayun.value.start_year;
    const end = currentDayun.value.end_year;
    return baziData.value.liu_nian.filter(ln => ln.year >= start && ln.year <= end);
});

const currentLiunian = computed(() => {
    if (!activeLiunianYear.value) return null;
    return baziData.value.liu_nian.find(item => item.year === activeLiunianYear.value) || null;
});

const currentLiunianPillar = computed(() => {
    return currentLiunian.value ? currentLiunian.value.pillar : '';
});

const getTenGod = (dayMaster: string, targetStem: string): string => {
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const dIdx = stems.indexOf(dayMaster);
    const tIdx = stems.indexOf(targetStem);
    if (dIdx === -1 || tIdx === -1) return '';
    
    const dElem = Math.floor(dIdx / 2);
    const tElem = Math.floor(tIdx / 2);
    const samePol = (dIdx % 2) === (tIdx % 2);
    
    // Same Element
    if (dElem === tElem) return samePol ? '比肩' : '劫财';
    // DM generates T (Output)
    if ((dElem + 1) % 5 === tElem) return samePol ? '食神' : '伤官';
    // T generates DM (Resource)
    if ((tElem + 1) % 5 === dElem) return samePol ? '偏印' : '正印';
    // DM controls T (Wealth)
    if ((dElem + 2) % 5 === tElem) return samePol ? '偏财' : '正财';
    // T controls DM (Officer/Killing)
    if ((tElem + 2) % 5 === dElem) return samePol ? '七杀' : '正官';
    
    return '';
};

const getBranchMainQi = (branch: string): string => {
    const map: Record<string, string> = {
        '子': '癸', '丑': '己', '寅': '甲', '卯': '乙', '辰': '戊', '巳': '丙',
        '午': '丁', '未': '己', '申': '庚', '酉': '辛', '戌': '戊', '亥': '壬'
    };
    return map[branch] || '';
};

// Five Tigers Seeking Month Logic (Wu Hu Dun) & Data Mapping
const currentLiuYueList = computed(() => {
    if (!activeLiunianYear.value) return [];
    
    const ln = currentLiunian.value;
    const dayMaster = baziData.value.pillars.day?.gan; // Get Day Master
    
    // Priority: Use provided liu_yue data
    if (ln && ln.liu_yue && ln.liu_yue.length > 0) {
        return ln.liu_yue.map((m, index) => {
            // Format date: 2026-02-04 -> 2/4
            let dateStr = '';
            if (m.start_date) {
                const parts = m.start_date.split(' ')[0].split('-');
                if (parts.length >= 3) {
                    dateStr = `${parseInt(parts[1])}/${parseInt(parts[2])}`;
                }
            }
            
            // Ensure pillar exists
            let pillar = m.gan_zhi || (m.month_gan && m.month_zhi ? m.month_gan + m.month_zhi : '');
            
            // If missing stem, calculate it
            if ((!pillar || pillar.length < 2) && m.month_zhi && ln.pillar) {
                const yearStem = ln.pillar[0];
                const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
                const branches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
                const yearStemIdx = stems.indexOf(yearStem);
                const branchIdx = branches.indexOf(m.month_zhi);
                
                if (yearStemIdx > -1 && branchIdx > -1) {
                    const startStemIdx = ((yearStemIdx % 5) * 2 + 2) % 10;
                    const stem = stems[(startStemIdx + branchIdx) % 10];
                    pillar = stem + m.month_zhi;
                }
            }
            
            // Calculate Ten Gods
            let stemTenGod = '';
            let branchTenGod = '';
            if (dayMaster && pillar && pillar.length >= 2) {
                stemTenGod = getTenGod(dayMaster, pillar[0]);
                const branchMainQi = getBranchMainQi(pillar[1]);
                branchTenGod = getTenGod(dayMaster, branchMainQi);
            }
            
            return {
                month: m.month || (index + 1),
                pillar: pillar || m.month_zhi,
                term_label: `${m.start_term || ''} ${dateStr}`.trim(),
                stem_ten_god: stemTenGod,
                branch_ten_god: branchTenGod,
                ten_god: m.ten_god,
                hidden_stems: m.hidden_stems
            };
        });
    }

    // Fallback: Calculate purely based on logic
    // Get Year Stem
    const yearPillar = currentLiunianPillar.value;
    if (!yearPillar) return [];
    
    const yearStem = yearPillar[0];
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const branches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']; // Starts from Yin month
    
    // Find index of year stem (0-9)
    const yearStemIdx = stems.indexOf(yearStem);
    if (yearStemIdx === -1) return []; // Should not happen
    
    // Calculate first month stem index
    // Formula: (yearStemIdx % 5) * 2 + 2
    let startStemIdx = ((yearStemIdx % 5) * 2 + 2) % 10;
    
    const months = [];
    for (let i = 0; i < 12; i++) {
        const stem = stems[(startStemIdx + i) % 10];
        const branch = branches[i];
        
        // Calculate Ten Gods for fallback
        let stemTenGod = '';
        let branchTenGod = '';
        if (dayMaster) {
            stemTenGod = getTenGod(dayMaster, stem);
            const branchMainQi = getBranchMainQi(branch);
            branchTenGod = getTenGod(dayMaster, branchMainQi);
        }
        
        months.push({
            month: i + 1,
            pillar: stem + branch,
            term_label: `${i + 1}月`, // Fallback label
            stem_ten_god: stemTenGod,
            branch_ten_god: branchTenGod
        });
    }
    return months;
});

// --- Methods ---
const handleDayunSelect = (index: number) => {
    activeYunIndex.value = index;
    // Auto select first year of new Da Yun
    const list = currentLiuNianList.value;
    if (list.length > 0) {
        activeLiunianYear.value = list[0].year;
    } else {
        activeLiunianYear.value = null;
    }
};

const handleLiunianSelect = (item: LiuNianItem) => {
    activeLiunianYear.value = item.year;
    activeLiuYue.value = null; // Reset flow month when year changes
};

const handleLiuYueSelect = (month: LiuYueItem) => {
    console.log('month', month);
    if (activeLiuYue.value?.month === month.month) {
        activeLiuYue.value = null; // Toggle off
    } else {
        activeLiuYue.value = month;
    }
    console.log('activeLiuYue', activeLiuYue.value);
};

// Styling Helpers
const getWuXingClass = (char: string | undefined) => {
    if (!char) return '';
    const map: Record<string, string> = {
        '甲': 'mu', '乙': 'mu', '寅': 'mu', '卯': 'mu',
        '丙': 'huo', '丁': 'huo', '巳': 'huo', '午': 'huo',
        '戊': 'tu', '己': 'tu', '辰': 'tu', '戌': 'tu', '丑': 'tu', '未': 'tu',
        '庚': 'jin', '辛': 'jin', '申': 'jin', '酉': 'jin',
        '壬': 'shui', '癸': 'shui', '亥': 'shui', '子': 'shui'
    };
    return map[char] || '';
};

const getElementClass = (tenGod: string | undefined) => {
    if (!tenGod) return '';
    // Simple color mapping based on ten god types (approximated from HTML)
    if (tenGod.includes('财')) return 'text-rose-500';
    if (tenGod.includes('官') || tenGod.includes('杀')) return 'text-slate-600';
    if (tenGod.includes('印') || tenGod.includes('枭')) return 'text-slate-600';
    if (tenGod.includes('伤') || tenGod.includes('食')) return 'text-emerald-500';
    if (tenGod.includes('比') || tenGod.includes('劫')) return 'text-indigo-600';
    return 'text-slate-600';
};

const queryParams = ref<any>({});

onLoad((options) => {
    queryParams.value = options || {};
    fetchData();
});

const fetchData = async () => {
    try {
        uni.showLoading({ title: '排盘中...' });
        
        const profileId = queryParams.value.id || queryParams.value.profile_id;
        
        if (!profileId) {
            throw new Error('缺少档案ID');
        }

        const res: any = await fetchBaziCalculate(profileId);
        if (res.data) {
            baziData.value = res.data;
            
            // Init selection
            if (baziData.value.da_yun?.list?.length > 0) {
                const currentYear = new Date().getFullYear();
                const index = baziData.value.da_yun.list.findIndex(dy => dy.start_year <= currentYear && dy.end_year >= currentYear);
                const targetIndex = index >= 0 ? index : 0;
                activeYunIndex.value = targetIndex;
                
                // If current year is within the range, select it
                if (index >= 0) {
                    activeLiunianYear.value = currentYear;
                } else {
                    // Fallback to first year of the selected Da Yun
                    handleDayunSelect(targetIndex);
                }
            }
        }
    } catch (e) {
        console.error(e);
        uni.showToast({ title: '排盘失败', icon: 'none' });
    } finally {
        uni.hideLoading();
    }
};

</script>

<style lang="scss" scoped>
.bazi-detail-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #EEF2FF 0%, #EBEFFF 50%, #F5F3FF 100%);
}

.main-scroll {
  flex: 1;
  height: 0;
}

// Colors
.mu { color: #10B981; }
.huo { color: #EF4444; }
.tu { color: #B45309; }
.jin { color: #D99014; }
.shui { color: #3B82F6; }

.text-rose-500 { color: #f43f5e; }
.text-slate-600 { color: #475569; }
.text-emerald-500 { color: #10b981; }
.text-indigo-600 { color: #4f46e5; }
.text-amber-600 { color: #d97706; }
.text-purple-600 { color: #9333ea; }

.custom-header {
  padding: 12px 20px;
  background: transparent;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .user-info {
        .name-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
            
            .user-name {
                font-size: 24px;
                font-weight: 900;
                color: #1e293b;
                letter-spacing: -0.5px;
            }
            
            .gender-tag {
                background: rgba(255, 255, 255, 0.6);
                padding: 4px 10px;
                border-radius: 999px;
                backdrop-filter: blur(4px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                
                .gender-text {
                    font-size: 12px;
                    color: #4f46e5;
                    font-weight: 900;
                }
            }
        }
        
        .info-text {
            font-size: 14px;
            font-weight: 500;
            color: #64748b;
            margin-top: 6px;
            display: block;
            opacity: 0.9;
        }
    }
    
    .share-btn {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.6);
    }
  }
}

.main-content {
    padding-bottom: 100px;
    .section-card {
        background-color: transparent;
        box-shadow: none;
        border: none;
    }
}

.bazi-grid {
    display: grid;
    grid-template-columns: 50px repeat(6, 1fr);
    gap: 4px;
    text-align: center;
    align-items: center;
    padding: 0 8px;
    margin-bottom: 16px;

    .has-liuyue & {
        grid-template-columns: 50px repeat(7, 1fr);
    }
    
    .grid-cell {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .label {
        font-size: 12px;
        font-weight: bold;
        color: #64748b;
        min-height: 40rpx;
    }
}

.sticky-chart-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: rgba(238, 242, 255, 0.98);
    backdrop-filter: blur(10px);
    margin: 0 -8px;
    padding: 8px 8px 0;

    .bazi-grid {
        margin-bottom: 12px;
        &:last-child {
            margin-bottom: 8px;
        }
    }
}

.header-row {
    .grid-cell {
        font-size: 12px;
        font-weight: bold;
        color: #64748b;
    }
}

.row-ten-god {
    font-size: 13px;
    font-weight: 900;
    
    .highlight {
        color: #4f46e5;
    }
}

.row-stem, .row-branch {
    margin-bottom: 8px;
    
    .stem-text, .branch-text {
        font-size: 26px;
        font-weight: 900;
    }
}

.row-hidden {
    align-items: flex-start;
    padding-top: 4px;
    padding-bottom: 4px;
    
    .hidden-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        
        .hidden-item {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2px;
            font-size: 13px;
            font-weight: 500;
            
            .hidden-ten-god {
                color: #64748b;
                font-size: 11px;
            }
        }
    }
}

.row-fuxing {
    align-items: flex-start;
    margin-bottom: 8px;

    .hidden-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
    }

    .hidden-item {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 20px;
        font-size: 12px;
        font-weight: bold;
        color: #64748b;
    }
}

.row-meta {
    margin-bottom: 8px;
    .grid-cell {
        font-size: 12px;
        font-weight: bold;
        color: #64748b;
    }
    
    .empty-death {
        color: #fb7185;
    }
}

.extra-info-row {
    display: flex;
    justify-content: space-around;
    padding: 8px 0;
    // border-top: 1px solid #f8fafc;
    background-color: rgba(248, 250, 252, 0.5);
    
    .extra-item {
        font-size: 13px;
        font-weight: 900;
        color: #94a3b8;
        
        .value {
            margin-left: 4px;
        }
    }
}

.yun-flow-panel {
    // background-color: rgba(255, 255, 255, 0.25);
    border-radius: 12px;
    padding: 8px 0;
    margin-top: 12px;
    // border: 1px solid rgba(255, 255, 255, 0.3);

    .yun-row {
        display: flex;
        align-items: center;
        margin-bottom: 6px;
        padding-right: 4px;

        &:last-child {
            margin-bottom: 0;
        }

        .yun-label {
            width: 32px;
            min-width: 32px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            
            text {
                font-size: 13px;
                font-weight: 900;
                color: #64748b;
                line-height: 1.3;
                margin: 1px 0;
            }
        }

        .yun-scroll {
            flex: 1;
            white-space: nowrap;
            width: 0;
        }
        
        .liuyue-container {
            flex: 1;
            padding-right: 4px;
        }
    }
}

.dayun-list, .liunian-list {
    display: flex;
}

.dayun-item {
    min-width: 48px;
    padding: 6px 0;
    border-radius: 8px;
    background-color: transparent;
    border: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.3s;
    
    &.active {
        background-color: rgba(255, 255, 255, 0.8);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .year-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 4px;
    }

    .year-label {
        font-size: 10px;
        font-weight: bold;
        color: #64748b;
    }
    
    .age-label {
        font-size: 10px;
        font-weight: bold;
        color: #94a3b8;
        margin-top: 1px;
    }
    
    .pillar-col {
        margin: 2px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
        
        .pillar-char {
            font-size: 15px;
            font-weight: 900;
            line-height: 1.1;
        }
    }
    
    .ten-god-label {
        font-size: 10px;
        font-weight: bold;
        color: #94a3b8;
        margin-top: 2px;
    }
}

.liunian-item {
    min-width: 44px;
    padding: 6px 0;
    margin: 0 2px;
    border-radius: 8px;
    border: none;
    background-color: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: none;
    transition: all 0.2s;
    
    &.active {
        background-color: rgba(255, 255, 255, 0.8);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }
    
    .year-num {
        font-size: 10px;
        font-weight: 900;
        color: #64748b;
        margin-bottom: 4px;
    }
    
    .pillar-col {
        margin: 2px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
        
        .pillar-char {
            font-size: 15px;
            font-weight: 900;
            line-height: 1.1;
        }
    }
    
    .ten-god-text {
        font-size: 10px;
        font-weight: bold;
        color: #94a3b8;
        margin-top: 2px;
    }
}

.liuyue-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
    margin-bottom: 0;
    
    .liuyue-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 6px 0;
        margin: 0 2px;
        background-color: transparent;
        border: none;
        border-radius: 8px;
        transition: all 0.2s;
        cursor: pointer;
        position: relative;
        z-index: 1;
        
        &.active {
            background-color: rgba(255, 255, 255, 0.8);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }
        
        .month-label {
            font-size: 10px;
            font-weight: 900;
            color: #64748b;
            margin-bottom: 4px;
        }
        
        .pillar-row {
            display: flex;
            align-items: center;
            margin-bottom: 1px;
            
            .pillar-char {
                font-size: 14px;
                font-weight: 900;
                line-height: 1.1;
            }
            
            .ten-god {
                font-size: 10px;
                color: #94a3b8;
                font-weight: bold;
                transform: scale(0.9);
                width: 24px;
                text-align: center;
                white-space: nowrap;
            }
        }
    }
}
</style>
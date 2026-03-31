import { ref, computed } from 'vue';
import { fetchMBTIReport } from '@/api/services';

export interface MBTILetterIntro {
  dimension?: string;
  title?: string;
  description?: string;
  your_side?: string;
  your_summary?: string;
  code?: string;
  name?: string;
  percent?: number;
}
export interface MBTIRarity {
  rank_label?: string;
  population_range?: string;
  note?: string;
}
export interface MBTIStrengthsGrowth {
  [key: string]: any;
}
export interface MBTISelfInsight {
  [key: string]: any;
}
export interface MBTINeighbors {
  [key: string]: any;
}
export interface MBTIArchetype {
  code?: string;
  title?: string;
  subtitle?: string;
  examples?: Array<{ name: string; image: string }>;
}
export interface MBTIFacet {
  code: string;
  name: string;
  score: number;
  label: string;
}
export interface MBTIModuleSection {
  id: string;
  title: string;
  body: string;
}
export interface MBTIModuleContent {
  facets?: MBTIFacet[] | null;
  sections?: MBTIModuleSection[] | null;
  summary_ai?: string | null;
}
export interface MBTIUnlockAction {
  product_id: string;
  cta: string;
}
export interface MBTIModule {
  id: string;
  title: string;
  category: string;
  need_pay: boolean;
  unlocked: boolean;
  teaser: string;
  content: MBTIModuleContent;
  unlock_action: MBTIUnlockAction;
}
export interface MBTICore {
  letters: MBTILetterIntro[];
  rarity: MBTIRarity;
  keywords: string[];
  strengths_growth: MBTIStrengthsGrowth;
  self_insight: MBTISelfInsight;
  neighbors: MBTINeighbors;
  archetype: MBTIArchetype;
}
export interface MBTIDimensionSide {
  letter: string;
  label: string;
  percent: number;
}
export interface MBTIDimension {
  dimension: string;
  left: MBTIDimensionSide;
  right: MBTIDimensionSide;
  neutral?: { count: number; percent_all: number };
  chosen?: string;
  clarity?: string;
}
export interface MBTIContextMetrics {
  base_type: string;
  context_types: { work: string; private: string; social: string };
  dimension_scores: Record<string, Record<string, number>>;
  dimension_percentages: Record<string, Record<string, Record<string, number>>>;
  clarity: Record<string, string>;
  context_deviation: Record<string, Record<string, number>>;
  subtype: string;
}

export interface MBTIReportResponse {
  report_id?: string;
  type?: string;
  dimension_scores?: Record<string, any>;
  dimensions?: MBTIDimension[];
  core: MBTICore;
  modules: MBTIModule[];
  context?: MBTIContextMetrics | null;
}

export function useMBTIReport() {
  const isLoading = ref(false);
  const core = ref<MBTICore | null>(null);
  const modules = ref<MBTIModule[]>([]);
  const dimensions = ref<MBTIDimension[]>([]);
  const contextData = ref<MBTIContextMetrics | null>(null);
  const reportType = ref('');
  const reportId = ref('');

  const typeCode = computed(() => {
    if (reportType.value) return reportType.value;
    const a = core.value?.archetype?.code;
    if (a) return a || '';
    const letters = core.value?.letters?.map((l) => l.code || '').join('');
    return letters || 'MBTI';
  });

  const archetypeTitle = computed(
    () =>
      core.value?.archetype?.title ||
      (core.value?.archetype as any)?.label ||
      '人格类型',
  );

  const archetypeImage = computed(
    () => (core.value?.archetype as any)?.image || ''
  );

  const archetypeExamples = computed(() => core.value?.archetype?.examples || []);
  const lettersList = computed(() => core.value?.letters || []);

  const dimensionsList = computed(() => dimensions.value || []);

  const rarityRankLabel = computed(() => core.value?.rarity?.rank_label || '');
  const rarityPopulation = computed(
    () => core.value?.rarity?.population_range || '',
  );
  const rarityNoteText = computed(() => core.value?.rarity?.note || '');

  const clarityOverall = computed(() => {
    if (contextData.value?.clarity) {
      const vals = Object.values(contextData.value.clarity);
      if (!vals.length) return '';
      const high = vals.filter((v) => v === '高').length;
      const mid = vals.filter((v) => v === '中').length;
      if (high === vals.length) return '高度清晰';
      if (mid > 0) return '中等清晰';
      return '低度清晰';
    }
    const vals = dimensions.value.map((d) => d.clarity).filter((v) => !!v) as string[];
    if (!vals.length) return '';
    const high = vals.filter((v) => v === '高').length;
    const mid = vals.filter((v) => v === '中').length;
    if (high === vals.length) return '高度清晰';
    if (mid > 0) return '中等清晰';
    return '低度清晰';
  });

  const selfInsightSections = computed(() => {
    const list = [
      { id: 'world_view', title: '你如何看待自己和世界', body: core.value?.self_insight?.world_view || '' },
      { id: 'relationships', title: '你在人际和沟通中的风格', body: core.value?.self_insight?.relationships || '' },
      { id: 'decision_style', title: '你做选择时的习惯', body: core.value?.self_insight?.decision_style || '' },
      { id: 'under_stress', title: '当你感到累/焦虑时，通常会发生什么', body: core.value?.self_insight?.under_stress || '' },
    ];
    return list.filter((s) => !!s.body);
  });

  const dimLabelFromCode = (code: string) => {
    const map: Record<string, string> = {
      'E/I': '能量来源',
      'S/N': '信息获取',
      'T/F': '决策方式',
      'J/P': '生活方式',
    };
    return map[code] || code;
  };

  const getDimensionColor = (code: string) => {
    const map: Record<string, string> = {
      'E/I': '#9292FF',
      'S/N': '#00D2A0',
      'T/F': '#FF9F43',
      'J/P': '#4CC9F0',
    };
    return map[code] || '#6366F1';
  };

  const isLeftDominant = (d: MBTIDimension) =>
    (d.left?.percent ?? 0) >= (d.right?.percent ?? 0);
  const leftPercent = (d: MBTIDimension) =>
    Math.max(0, Math.min(100, d.left?.percent ?? 0));
  const rightPercent = (d: MBTIDimension) =>
    Math.max(0, Math.min(100, d.right?.percent ?? 0));
  const leftCode = (d: MBTIDimension) => (d.left?.letter || '').toUpperCase();
  const rightCode = (d: MBTIDimension) => (d.right?.letter || '').toUpperCase();
  const leftName = (d: MBTIDimension) => d.left?.label || '';
  const rightName = (d: MBTIDimension) => d.right?.label || '';
  const barStyle = (d: MBTIDimension) => {
    const width = (isLeftDominant(d) ? leftPercent(d) : rightPercent(d)) + '%';
    return {
      width,
      backgroundColor: getDimensionColor(d.dimension),
      [isLeftDominant(d) ? 'left' : 'right']: 0,
      opacity: 0.8,
    } as any;
  };

  const strengthsStatic = computed(() => core.value?.strengths_growth?.strengths_static || []);
  const weaknessesStatic = computed(() => core.value?.strengths_growth?.weaknesses_static || []);
  const strengthsFocusAi = computed(() => core.value?.strengths_growth?.strengths_focus_ai || []);
  const growthAi = computed(() => core.value?.strengths_growth?.growth_ai || []);

  const makeFocusAuto = (dims: MBTIDimension[]) => {
    const tips: string[] = [];
    dims.forEach((d) => {
      const l = leftPercent(d);
      const r = rightPercent(d);
      const diff = Math.abs(l - r);
      const label = dimLabelFromCode(d.dimension);
      if (diff <= 10 && tips.length < 2) {
        tips.push('在' + label + '方面较为灵活，不走极端，更擅长因情境调整策略');
      }
      const dominant = Math.max(l, r);
      const side = isLeftDominant(d) ? leftName(d) : rightName(d);
      if (dominant >= 90 && tips.length < 3) {
        tips.push('你在“' + label + '：' + side + '”上优势明显，适合相关场景，但也要留意在不同语境下保持弹性');
      }
    });
    return tips;
  };

  const makeGrowthAuto = (dims: MBTIDimension[]) => {
    const tips: string[] = [];
    dims.forEach((d) => {
      const l = leftPercent(d);
      const r = rightPercent(d);
      const label = dimLabelFromCode(d.dimension);
      const nonDominant = isLeftDominant(d) ? rightName(d) : leftName(d);
      const dominant = Math.max(l, r);
      if (dominant >= 90 && tips.length < 3) {
        tips.push('在“' + label + '”上倾向较为单一，适当引入“' + nonDominant + '”视角，会让决策更全面');
      }
    });
    return tips;
  };

  const splitText = (text: string) => {
    const idx1 = text.indexOf('：');
    const idx2 = text.indexOf(':');
    let idx = -1;
    if (idx1 > -1 && idx2 > -1) idx = Math.min(idx1, idx2);
    else if (idx1 > -1) idx = idx1;
    else idx = idx2;

    if (idx > -1) {
      return [text.slice(0, idx + 1), text.slice(idx + 1)];
    }
    return ['', text];
  };

  const strengthsCombined = computed(() => [...strengthsStatic.value]);
  const growthCombined = computed(() => [...weaknessesStatic.value]);

  const unlockCta = computed(() => {
    const lockedModule = modules.value.find(
      (m) => m.need_pay && !m.unlocked && m.unlock_action,
    );
    return lockedModule?.unlock_action || null;
  });

  const modulesRender = computed(() => {
    return modules.value.filter((m) => m.id !== 'facets_8');
  });

  const getModule = (id: string) => modules.value.find((m) => m.id === id);
  const getModuleSections = (id: string) => getModule(id)?.content?.sections || [];
  const moduleBody = (id: string) => {
    const m = getModule(id);
    if (!m) return '';
    return m.content?.summary_ai || '';
  };

  const getModuleSectionBody = (moduleId: string, sectionId: string) => {
    const sections = getModuleSections(moduleId);
    const sec = sections.find((s) => s.id === sectionId);
    return sec?.body || '';
  };

  const maskNeeded = (id: string) => id === 'career' || id === 'love' || id === 'advanced_guide';

  const loadReport = async (id?: string) => {
    isLoading.value = true;
    try {
      if (id) reportId.value = id;
      if (!reportId.value) {
        throw new Error('缺少报告ID');
      }
      const res: any = await fetchMBTIReport(reportId.value);
      const data: MBTIReportResponse = res.data || res;
      reportType.value = data.type || '';
      core.value = data.core || null;
      modules.value = data.modules || [];
      dimensions.value = data.dimensions || [];
      contextData.value = data.context || null;
      return data;
    } catch (e) {
      console.error('报告加载失败', e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    core,
    modules,
    dimensions,
    contextData,
    reportType,
    reportId,
    typeCode,
    archetypeTitle,
    archetypeImage,
    archetypeExamples,
    lettersList,
    dimensionsList,
    rarityRankLabel,
    rarityPopulation,
    rarityNoteText,
    clarityOverall,
    selfInsightSections,
    strengthsStatic,
    weaknessesStatic,
    strengthsFocusAi,
    growthAi,
    strengthsCombined,
    growthCombined,
    unlockCta,
    modulesRender,
    dimLabelFromCode,
    getDimensionColor,
    isLeftDominant,
    leftPercent,
    rightPercent,
    leftCode,
    rightCode,
    leftName,
    rightName,
    barStyle,
    makeFocusAuto,
    makeGrowthAuto,
    splitText,
    getModule,
    getModuleSections,
    moduleBody,
    getModuleSectionBody,
    maskNeeded,
    loadReport
  };
}

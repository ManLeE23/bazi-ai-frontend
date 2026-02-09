import { httpGet, httpPost, httpPut, httpDelete } from './request';

export interface DailyFortuneResponse {
  profile_id: number | string;
  date: string;
  lunar_date: string;
  yi: string[];
  ji: string[];
  analysis: string;
}

type Gender = '男' | '女';

type GenReportParams = {
  birth_date: string;
  birth_hour: string;
  gender: Gender;
  focus_dimensions: string[];
  user_id: string | null;
};

export const fetchLegalDocs = (name: 'user_agreement' | 'privacy_policy') => {
  return httpGet({ url: '/api/legal/docs', params: { name }, skipAuth: true });
};

export const fetchOpenId = (params: { code: string }) => {
  return httpPost({ url: '/api/auth/login', params, skipAuth: true });
};

export const fetchPhoneLogin = (params: {
  code: string;
  login_code?: string;
}) => {
  return httpPost({ url: '/api/auth/wx_phone_login', params, skipAuth: true });
};

export const fetchReportList = () => {
  return httpGet({ url: '/api/reports/list', params: {} });
};

export const fetchProfilesList = () => {
  return httpGet({ url: '/api/profiles/list', params: {} });
};

export const fetchCreateProfile = (params: {
  name: string;
  gender: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  mode?: string;
}) => {
  return httpPost({ url: '/api/profiles/create', params });
};

export const fetchDeleteProfile = (id: string) => {
  return httpDelete({ url: `/api/profiles/${id}`, params: {} });
};

export const fetchUpdateSelfStatus = (id: string, is_self: boolean) => {
  return httpPut({ url: `/api/profiles/${id}/self`, params: { is_self } });
};

export const fetchSetSelfProfile = (id: string) => {
  return fetchUpdateSelfStatus(id, true);
};

export const fetchUnsetSelfProfile = (id: string) => {
  return fetchUpdateSelfStatus(id, false);
};

export const fetchDailyFortune = () => {
  return httpGet({ url: '/api/profiles/self/daily-fortune', params: {} });
};

export const fetchGenReport = (params: GenReportParams) => {
  return httpPost({ url: '/api/reports/create', params });
};

export const fetchReportById = (reportId: string) => {
  return httpGet({ url: `/api/reports/detail/${reportId}`, params: {} });
};

export const fetchProgressfromReportId = (reportId: string) => {
  return httpGet({ url: `/api/reports/progress/${reportId}`, params: {} });
};

// 创建新的QA对话session
export const fetchCreateSession = (params: any) => {
  return httpPost({ url: '/api/chat/create/sessions', params });
};

export const fetchSuggestedQuestions = (params: {
  session_id?: string;
  limit?: number;
}) => {
  return httpGet({
    url: '/api/chat/suggested-questions',
    params,
  });
};

export const fetchChatResponse = (params: {
  session_id: string;
  message: string;
}) => {
  return httpPost({
    url: `/api/chat/sessions/stream-message/${params.session_id}`,
    params: { message: params.message },
  });
};

export const fetchChatHistory = (session_id: string) => {
  return httpGet({
    url: `/api/chat/sessions/messages/${session_id}`,
    params: {},
  });
};

export const fetchSendMessage = (params: {
  session_id: string;
  user_input: string;
}) => {
  return httpPost({
    url: `/api/chat/create/sessions/message/${params.session_id}`,
    params: { user_input: params.user_input },
  });
};

export const fetchSessionsList = (params: { search?: string } = {}) => {
  return httpGet({
    url: '/api/chat/sessions/list',
    params,
  });
};

export const fetchSessionUserInfo = (session_id: string) => {
  return httpGet({
    url: `/api/chat/sessions/${session_id}/user-info`,
    params: {},
  });
};

export const fetchSystemUserInfo = () => {
  return httpGet({
    url: '/api/auth/me',
    params: {},
  });
};

export const fetchMembershipInfo = () => {
  return httpGet({
    url: '/api/membership/me',
    params: {},
  });
};

export const fetchMembershipPlans = () => {
  return httpGet({
    url: '/api/membership/plans',
    params: {},
  });
};

export const fetchTokenHistory = () => {
  return httpGet({
    url: '/api/membership/tokens',
    params: {},
  });
};

export const fetchApplyInvite = (code: string) => {
  return httpPost({
    url: '/api/invites/apply',
    params: { invite_code: code },
  });
};

export const fetchBaziCalculate = (params: {
  name?: string;
  gender: string;
  birth_date: string;
  birth_time: string;
  birth_location?: string;
}) => {
  return httpPost({
    url: '/api/bazi/calculate',
    params,
  });
};

export const fetchWechatPayment = (params: {
  amount_total: number;
  description: string;
  currency?: string;
  mode?: string;
  openid?: string;
  code?: string;
}) => {
  return httpPost({
    url: '/api/payments/wechat/jsapi',
    params,
  });
};

export const postAnalyticsEvents = (params: { events: any[] }) => {
  return httpPost({
    url: '/api/analytics/events',
    params,
    skipAuth: true, // Usually analytics don't strictly require auth or should work without it
  });
};

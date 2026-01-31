import { httpGet, httpPost } from './request';

type Gender = '男' | '女';

type GenReportParams = {
  birth_date: string;
  birth_hour: string;
  gender: Gender;
  focus_dimensions: string[];
  user_id: string | null;
};

export const fetchOpenId = (params: { code: string }) => {
  return httpPost({ url: '/api/auth/login', params });
};

export const fetchReportList = () => {
  return httpGet({ url: '/api/reports/list', params: {} });
};

export const fetchProfilesList = () => {
  return httpGet({ url: '/api/profiles/list', params: {} });
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

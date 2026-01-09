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
  return httpPost({ url: '/api/v1/auth/login', params });
};

export const fetchReportList = () => {
  return httpGet({ url: '/api/v1/reports/list', params: {} });
};

export const fetchGenReport = (params: GenReportParams) => {
  return httpPost({ url: '/api/v1/reports/create', params });
};

export const fetchReportById = (reportId: string) => {
  return httpGet({ url: `/api/v1/reports/detail/${reportId}`, params: {} });
};

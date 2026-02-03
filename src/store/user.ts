import { reactive } from 'vue';

export interface UserInfo {
  id?: string;
  name: string;
  gender: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  chinese_birth_date?: string;
  session_id?: string;
  [key: string]: any;
}

export interface SystemUser {
  id?: string;
  openid?: string;
  nickname: string;
  avatar?: string | null;
  question_count?: number;
  is_vip?: boolean;
  created_at?: string;
  updated_at?: string;
}

const SYSTEM_USER_KEY = 'system_user_info';
const USER_INFO_KEY = 'user_info';

export const userStore = reactive({
  userInfo: uni.getStorageSync(USER_INFO_KEY) as UserInfo | null, // Current session target profile (Bazi subject)
  systemUser: uni.getStorageSync(SYSTEM_USER_KEY) as SystemUser | null, // System account user (Login user)

  setUserInfo(info: UserInfo) {
    this.userInfo = info;
    uni.setStorageSync(USER_INFO_KEY, info);
  },

  setSystemUser(info: SystemUser) {
    this.systemUser = info;
    uni.setStorageSync(SYSTEM_USER_KEY, info);
  },

  clearUserInfo() {
    this.userInfo = null;
    uni.removeStorageSync(USER_INFO_KEY);
  },

  clearSystemUser() {
    this.systemUser = null;
    uni.removeStorageSync(SYSTEM_USER_KEY);
  },

  get hasProfile() {
    return !!(this.userInfo && this.userInfo.name);
  },
});

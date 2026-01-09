<template>
  <div class="profile-page">
    <!-- Header -->
    <div class="profile-header">
      <div class="circle-bg"></div>
      <div class="bottom-circle"></div>
      <u-navbar
        :is-back="false"
        :is-fixed="true"
        background="transparent"
        :border-bottom="false"
      />
      
      <div class="header-content">
        <div class="user-avatar">
          <image src="@/static/icon/default-calendar.svg" class="avatar-icon" />
        </div>
        <h1 class="header-title">我的</h1>
        <p class="header-subtitle">管理你的命理服务</p>
      </div>
    </div>

    <div class="content-container">
      <!-- Membership Status Card -->
      <div :class="['membership-card', isMember ? 'member' : 'normal']">
        <div class="card-header">
          <div class="member-info">
            <div :class="['member-icon', isMember ? 'member-icon-member' : 'member-icon-normal']">
              <image :src="crownIcon" class="icon" />
            </div>
            <div class="member-text">
              <h3 :class="['member-title', isMember ? 'member-title-member' : '']">
                {{ isMember ? 'AI 高级会员' : '普通用户' }}
              </h3>
              <p v-if="isMember && memberExpiry" class="member-expiry">有效期至：{{ memberExpiry }}</p>
            </div>
          </div>
          <image v-if="isMember" :src="checkIcon" class="check-icon" />
        </div>

        <div v-if="isMember" class="member-benefits">
          <div class="benefit-item">
            <image :src="checkIcon" class="benefit-icon" />
            <span>无限次 AI 命理咨询</span>
          </div>
          <div class="benefit-item">
            <image :src="checkIcon" class="benefit-icon" />
            <span>深度命盘分析报告</span>
          </div>
          <div class="benefit-item">
            <image :src="checkIcon" class="benefit-icon" />
            <span>优先体验新功能</span>
          </div>
        </div>
        <div v-else class="upgrade-btn-container">
          <button @click="onNavigate('membership')" class="upgrade-btn">升级会员，解锁全部功能</button>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="menu-container">
        <div @click="onNavigate('history')" class="menu-item">
          <div class="menu-icon">
            <image :src="fileIcon" class="icon" />
          </div>
          <div class="menu-text">
            <h4 class="menu-title">历史报告</h4>
            <p class="menu-desc">查看往期命理分析</p>
          </div>
          <image :src="chevronIcon" class="chevron-icon" />
        </div>
        
        <div class="divider"></div>
        
        <div @click="onNavigate('orders')" class="menu-item">
          <div class="menu-icon">
            <image :src="shoppingIcon" class="icon" />
          </div>
          <div class="menu-text">
            <h4 class="menu-title">我的订单</h4>
            <p class="menu-desc">查看购买记录</p>
          </div>
          <image :src="chevronIcon" class="chevron-icon" />
        </div>
        
        <div v-if="!isMember" class="divider"></div>
        
        <div v-if="!isMember" @click="onNavigate('membership')" class="menu-item highlighted">
          <div class="menu-icon highlighted">
            <image :src="crownIcon" class="icon" />
          </div>
          <div class="menu-text">
            <h4 class="menu-title highlighted">升级会员</h4>
            <p class="menu-desc">解锁更多权益</p>
          </div>
          <image :src="chevronIcon" class="chevron-icon" />
        </div>
      </div>

      <!-- Stats Card -->
      <div class="stats-card">
        <h3 class="stats-title">我的统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">3</div>
            <div class="stat-label">分析次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">8</div>
            <div class="stat-label">提问次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">15</div>
            <div class="stat-label">使用天数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabbar -->
    <Tabbar :current="2" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Tabbar from '@/components/Tabbar.vue';

// 使用项目中的图标
import crownIcon from '@/static/icon/user.svg';
import checkIcon from '@/static/icon/default-calendar.svg';
import fileIcon from '@/static/icon/default-calendar.svg';
import shoppingIcon from '@/static/icon/default-clock.svg';
import chevronIcon from '@/static/icon/default-clock.svg';

type ProfilePageProps = {
  onNavigate: (page: 'membership' | 'orders' | 'history') => void;
  isMember: boolean;
  memberExpiry?: string;
};

const props = withDefaults(defineProps<ProfilePageProps>(), {
  isMember: false,
  memberExpiry: undefined,
});

const onNavigate = (page: 'membership' | 'orders' | 'history') => {
  props.onNavigate(page);
};
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, $color-slate-50, $color-slate-100);
  padding-bottom: 70px;
  position: relative;
}

.profile-header {
  background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
  position: relative;
  overflow: hidden;
  padding: 48px 24px 96px 24px;
  box-sizing: border-box;
  
  .circle-bg {
    position: absolute;
    top: 0;
    right: 0;
    width: 256px;
    height: 256px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    margin-right: -128px;
    margin-top: -128px;
  }
  
  .bottom-circle {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 384rpx;
    height: 384rpx;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    margin-left: -192rpx;
    margin-bottom: -192rpx;
  }
  
  .header-content {
    position: relative;
    z-index: 10;
    text-align: center;
    
    .user-avatar {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      
      .avatar-icon {
        width: 40px;
        height: 40px;
      }
    }
    
    .header-title {
      color: $color-white;
      font-size: $text-lg;
      margin: 0 0 8px 0;
      font-weight: 600;
    }
    
    .header-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: $text-base;
      margin: 0;
    }
  }
}

.content-container {
  max-width: 768px;
  margin: -64px 20px 0;
  position: relative;
  z-index: 10;
}

.membership-card {
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  
  &.member {
    background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
  }
  
  &.normal {
    background: $color-white;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    
    .member-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .member-icon {
        width: 48px;
        height: 48px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.member-icon-member {
          background: rgba(255, 255, 255, 0.2);
        }
        
        &.member-icon-normal {
          background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
        }
        
        .icon {
          width: 24px;
          height: 24px;
        }
      }
      
      .member-text {
        .member-title {
          margin: 0;
          font-size: $text-lg;
          
          &.member-title-member {
            color: $color-white;
          }
        }
        
        .member-expiry {
          color: rgba(255, 255, 255, 0.9);
          font-size: $text-sm;
          margin: 0;
        }
      }
    }
    
    .check-icon {
      width: 32px;
      height: 32px;
    }
  }
  
  .member-benefits {
    .benefit-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: $color-white;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .benefit-icon {
        width: 16px;
        height: 16px;
      }
    }
  }
  
  .upgrade-btn-container {
    .upgrade-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
      color: $color-white;
      border: none;
      border-radius: 12px;
      font-size: $text-base;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
      transition: all 0.2s ease;
      
      &:active {
        transform: scale(0.98);
      }
    }
  }
}

.menu-container {
  background: $color-white;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 16px;
  
  .divider {
    height: 1px;
    background: $color-slate-100;
    margin: 0 24px;
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    transition: background 0.2s ease;
    
    &.highlighted {
      .menu-icon {
        background: linear-gradient(135deg, $color-amber-400, $color-orange-500) !important;
      }
      
      .menu-title {
        color: $color-amber-600 !important;
      }
    }
    
    .menu-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: $color-slate-100;
      
      &.highlighted {
        background: linear-gradient(135deg, $color-amber-400, $color-orange-500);
      }
      
      .icon {
        width: 20px;
        height: 20px;
      }
    }
    
    .menu-text {
      flex: 1;
      
      .menu-title {
        margin: 0;
        font-size: $text-base;
        font-weight: 500;
        
        &.highlighted {
          color: $color-amber-600;
        }
      }
      
      .menu-desc {
        color: $color-slate-600;
        font-size: $text-sm;
        margin: 0;
      }
    }
    
    .chevron-icon {
      width: 20px;
      height: 20px;
      color: $color-slate-400;
    }
    
    &:active {
      background: $color-slate-50;
    }
  }
}

.stats-card {
  background: linear-gradient(135deg, $color-slate-50, $color-slate-100);
  border-radius: 24px;
  padding: 24px;
  border: 1px solid $color-slate-200;
  
  .stats-title {
    margin: 0 0 16px 0;
    font-size: $text-lg;
    font-weight: 600;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    
    .stat-item {
      text-align: center;
      
      .stat-value {
        font-size: $text-2lg;
        margin-bottom: 4px;
      }
      
      .stat-label {
        color: $color-slate-600;
        font-size: $text-sm;
        margin: 0;
      }
    }
  }
}
</style>
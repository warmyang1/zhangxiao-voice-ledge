import type { PlatformInfo, Platform } from '../types';

export const PLATFORMS: PlatformInfo[] = [
  {
    id: 'wechat',
    name: '微信支付',
    icon: '💳',
    color: '#07C160',
    connected: false,
  },
  {
    id: 'alipay',
    name: '支付宝',
    icon: '💰',
    color: '#1677FF',
    connected: false,
  },
  {
    id: 'taobao',
    name: '淘宝/天猫',
    icon: '🛍️',
    color: '#FF5000',
    connected: false,
  },
  {
    id: 'jd',
    name: '京东',
    icon: '📦',
    color: '#E1251B',
    connected: false,
  },
  {
    id: 'douyin',
    name: '抖音',
    icon: '🎵',
    color: '#000000',
    connected: false,
  },
];

export const getPlatformInfo = (platformId: Platform): PlatformInfo => {
  return PLATFORMS.find(p => p.id === platformId) || PLATFORMS[PLATFORMS.length - 1];
};

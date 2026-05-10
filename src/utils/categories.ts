import type { CategoryInfo, Category } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'catering', name: '餐饮', icon: '🍜', color: '#FF6B6B' },
  { id: 'shopping', name: '购物', icon: '🛒', color: '#4ECDC4' },
  { id: 'transport', name: '交通', icon: '🚗', color: '#45B7D1' },
  { id: 'entertainment', name: '娱乐', icon: '🎮', color: '#96CEB4' },
  { id: 'living', name: '居住', icon: '🏠', color: '#FFEAA7' },
  { id: 'medical', name: '医疗', icon: '💊', color: '#DDA0DD' },
  { id: 'education', name: '教育', icon: '📚', color: '#74B9FF' },
  { id: 'communication', name: '通讯', icon: '📱', color: '#A29BFE' },
  { id: 'travel', name: '旅行', icon: '✈️', color: '#FD79A8' },
  { id: 'investment', name: '投资', icon: '💰', color: '#00CEC9' },
  { id: 'salary', name: '工资', icon: '💵', color: '#55A3FF' },
  { id: 'other', name: '其他', icon: '📦', color: '#B2BEC3' },
];

export const getCategoryInfo = (categoryId: Category): CategoryInfo => {
  return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
};

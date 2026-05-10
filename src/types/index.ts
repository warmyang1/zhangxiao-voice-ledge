export type Category =
  | 'catering'
  | 'shopping'
  | 'transport'
  | 'entertainment'
  | 'living'
  | 'medical'
  | 'education'
  | 'communication'
  | 'travel'
  | 'investment'
  | 'salary'
  | 'other';

export type Platform = 'wechat' | 'alipay' | 'taobao' | 'jd' | 'douyin';

export type SyncSource = 'manual' | 'auto';

export type TransactionType = 'income' | 'expense';

export interface CategoryInfo {
  id: Category;
  name: string;
  icon: string;
  color: string;
}

export interface PlatformInfo {
  id: Platform;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  lastSync?: Date;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  categoryIcon: string;
  merchant: string;
  platform?: Platform;
  platformIcon?: string;
  timestamp: Date;
  note?: string;
  tags?: string[];
  syncSource: SyncSource;
  transactionNo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  notificationEnabled: boolean;
  syncInterval: 'realtime' | 'hourly' | 'daily';
  currency: string;
  language: string;
}

export interface Budget {
  categoryId: Category;
  limit: number;
  spent: number;
  month: string;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'tip' | 'comparison';
  title: string;
  content: string;
  createdAt: Date;
}

export interface VoiceRecognitionResult {
  text: string;
  amount?: number;
  category?: Category;
  merchant?: string;
  confidence: number;
}

export interface SpendingAnalysis {
  totalExpense: number;
  totalIncome: number;
  topCategories: {
    category: CategoryInfo;
    amount: number;
    percentage: number;
  }[];
  trends: {
    date: string;
    amount: number;
  }[];
  insights: AIInsight[];
}

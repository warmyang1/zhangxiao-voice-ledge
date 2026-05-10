import type { Transaction, AIInsight, SpendingAnalysis, Category, CategoryInfo } from '../types';
import { CATEGORIES, getCategoryInfo } from '../utils/categories';
import { v4 as uuidv4 } from 'uuid';

export const analyzeSpending = (transactions: Transaction[], period: 'week' | 'month' | 'year'): SpendingAnalysis => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
  }

  const filteredTransactions = transactions.filter(t => new Date(t.timestamp) >= startDate);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryTotals = new Map<Category, number>();
  filteredTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const current = categoryTotals.get(t.category) || 0;
      categoryTotals.set(t.category, current + t.amount);
    });

  const topCategories = Array.from(categoryTotals.entries())
    .map(([categoryId, amount]) => ({
      category: getCategoryInfo(categoryId),
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const trends = generateTrends(filteredTransactions, period);

  const insights = generateInsights(transactions, filteredTransactions, period);

  return {
    totalExpense,
    totalIncome,
    topCategories,
    trends,
    insights,
  };
};

const generateTrends = (transactions: Transaction[], period: 'week' | 'month' | 'year') => {
  const trends: { date: string; amount: number }[] = [];
  const now = new Date();

  let days: number;
  switch (period) {
    case 'week':
      days = 7;
      break;
    case 'month':
      days = 30;
      break;
    case 'year':
      days = 365;
      break;
  }

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];

    const dayTotal = transactions
      .filter(t => {
        const tDate = new Date(t.timestamp).toISOString().split('T')[0];
        return tDate === dateStr && t.type === 'expense';
      })
      .reduce((sum, t) => sum + t.amount, 0);

    trends.push({ date: dateStr, amount: dayTotal });
  }

  return trends;
};

const generateInsights = (
  allTransactions: Transaction[],
  periodTransactions: Transaction[],
  period: 'week' | 'month' | 'year'
): AIInsight[] => {
  const insights: AIInsight[] = [];
  const now = new Date();

  const categorySpending = new Map<Category, number>();
  periodTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const current = categorySpending.get(t.category) || 0;
      categorySpending.set(t.category, current + t.amount);
    });

  const topCategory = Array.from(categorySpending.entries())
    .sort(([, a], [, b]) => b - a)[0];

  if (topCategory) {
    const [categoryId, amount] = topCategory;
    const categoryInfo = getCategoryInfo(categoryId);
    insights.push({
      id: uuidv4(),
      type: 'tip',
      title: `${period === 'week' ? '本周' : period === 'month' ? '本月' : '今年'}最大支出`,
      content: `你在${categoryInfo.name}上花费了 ¥${amount.toFixed(2)}，占总支出的 ${((amount / (periodTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 1)) * 100).toFixed(1)}%`,
      createdAt: now,
    });
  }

  const platformCounts = new Map<string, number>();
  periodTransactions.forEach(t => {
    if (t.platform) {
      const count = platformCounts.get(t.platform) || 0;
      platformCounts.set(t.platform, count + 1);
    }
  });

  const topPlatform = Array.from(platformCounts.entries())
    .sort(([, a], [, b]) => b - a)[0];

  if (topPlatform) {
    insights.push({
      id: uuidv4(),
      type: 'comparison',
      title: '高频消费平台',
      content: `${topPlatform[0]}是你最常使用的支付平台，共 ${topPlatform[1]} 笔交易`,
      createdAt: now,
    });
  }

  const lastPeriodStart = new Date(now.getTime() - (period === 'week' ? 14 : period === 'month' ? 60 : 730) * 24 * 60 * 60 * 1000);
  const lastPeriodEnd = new Date(now.getTime() - (period === 'week' ? 7 : period === 'month' ? 30 : 365) * 24 * 60 * 60 * 1000);

  const lastPeriodSpending = allTransactions
    .filter(t =>
      new Date(t.timestamp) >= lastPeriodStart &&
      new Date(t.timestamp) <= lastPeriodEnd &&
      t.type === 'expense'
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const currentSpending = periodTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (lastPeriodSpending > 0) {
    const change = ((currentSpending - lastPeriodSpending) / lastPeriodSpending) * 100;
    if (Math.abs(change) > 10) {
      insights.push({
        id: uuidv4(),
        type: change > 0 ? 'warning' : 'tip',
        title: '消费对比',
        content: `相比上${period === 'week' ? '周' : period === 'month' ? '月' : '年'}，你的支出${change > 0 ? '增长' : '减少'}了 ${Math.abs(change).toFixed(1)}%`,
        createdAt: now,
      });
    }
  }

  return insights;
};

export const generateBudgetSuggestions = (transactions: Transaction[]): { category: CategoryInfo; suggestion: string }[] => {
  const suggestions: { category: CategoryInfo; suggestion: string }[] = [];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthExpenses = transactions.filter(
    t => new Date(t.timestamp) >= monthStart && t.type === 'expense'
  );

  const categorySpending = new Map<Category, number>();
  monthExpenses.forEach(t => {
    const current = categorySpending.get(t.category) || 0;
    categorySpending.set(t.category, current + t.amount);
  });

  const totalSpending = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

  CATEGORIES.filter((c: CategoryInfo) => c.id !== 'salary').forEach((category: CategoryInfo) => {
    const spending = categorySpending.get(category.id) || 0;
    const percentage = totalSpending > 0 ? (spending / totalSpending) * 100 : 0;

    if (percentage > 30) {
      suggestions.push({
        category,
        suggestion: `${category.name}支出占比 ${percentage.toFixed(1)}%，建议控制`,
      });
    }
  });

  return suggestions;
};

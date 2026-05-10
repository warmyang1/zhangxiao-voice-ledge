import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../stores/authStore';
import { useTransactionStore } from '../stores/transactionStore';
import { formatCurrency } from '../utils/formatters';
import { Link } from 'react-router-dom';

interface DailyStats {
  date: string;
  income: number;
  expense: number;
  transactionCount: number;
}

interface CategoryStats {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
}

export const AdminOverview: React.FC = () => {
  const { users, currentUser } = useAuthStore();
  const transactions = useTransactionStore((state) => state.transactions);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedChart, setSelectedChart] = useState<'trend' | 'category' | 'platform'>('trend');

  if (!currentUser || currentUser.id !== 'admin_001') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">权限不足</h2>
          <p className="text-text-secondary mb-6">您没有权限访问此页面</p>
          <Button onClick={() => window.location.href = '/'} className="bg-gradient-to-r from-indigo-500 to-purple-600">
            返回首页
          </Button>
        </Card>
      </div>
    );
  }

  const stats = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const filteredTransactions = transactions.filter(
      t => new Date(t.timestamp) >= startDate
    );

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const activeUsers = users.filter(u => {
      if (!u.subscription?.endDate) return false;
      return new Date(u.subscription.endDate) > now;
    }).length;

    const categoryMap = new Map<string, { amount: number; count: number }>();
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
        categoryMap.set(t.category, {
          amount: existing.amount + t.amount,
          count: existing.count + 1,
        });
      });

    const categoryStats: CategoryStats[] = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      }))
      .sort((a, b) => b.amount - a.amount);

    const dailyMap = new Map<string, DailyStats>();
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.timestamp).toLocaleDateString('zh-CN');
      const existing = dailyMap.get(date) || {
        date,
        income: 0,
        expense: 0,
        transactionCount: 0,
      };

      if (t.type === 'income') {
        existing.income += t.amount;
      } else {
        existing.expense += t.amount;
      }
      existing.transactionCount += 1;

      dailyMap.set(date, existing);
    });

    const dailyStats: DailyStats[] = Array.from(dailyMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);

    const platformMap = new Map<string, number>();
    filteredTransactions.forEach(t => {
      if (t.platform) {
        const existing = platformMap.get(t.platform) || 0;
        platformMap.set(t.platform, existing + t.amount);
      }
    });

    const platformStats = Array.from(platformMap.entries())
      .map(([platform, amount]) => ({ platform, amount }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalIncome,
      totalExpense,
      netIncome: totalIncome - totalExpense,
      transactionCount: filteredTransactions.length,
      avgTransaction: filteredTransactions.length > 0 
        ? filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length 
        : 0,
      activeUsers,
      totalUsers: users.length,
      categoryStats,
      dailyStats,
      platformStats,
    };
  }, [transactions, users, selectedPeriod]);

  const getSubscriptionStats = () => {
    const now = new Date();
    const stats = {
      active: 0,
      expired: 0,
      free: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0,
    };

    users.forEach(u => {
      if (u.subscription?.plan === 'free') {
        stats.free++;
      } else if (u.subscription?.plan === 'weekly') {
        stats.weekly++;
      } else if (u.subscription?.plan === 'monthly') {
        stats.monthly++;
      } else if (u.subscription?.plan === 'yearly') {
        stats.yearly++;
      }

      if (u.subscription?.endDate && new Date(u.subscription.endDate) > now) {
        stats.active++;
      } else {
        stats.expired++;
      }
    });

    return stats;
  };

  const subscriptionStats = getSubscriptionStats();

  return (
    <div className="pb-20 min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-white px-4 pt-8 pb-12">
        <div className="relative">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-20 -left-10 w-48 h-48 bg-white/3 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-1">📊 数据总览</h1>
              <p className="text-white/70">张小账后台数据统计</p>
            </div>
          </div>

          <div className="flex space-x-3 overflow-x-auto">
            <Link to="/admin">
              <Button variant="ghost" className="text-white/80 hover:text-white whitespace-nowrap">
                👥 用户管理
              </Button>
            </Link>
            <Link to="/admin/withdrawal">
              <Button variant="ghost" className="text-white/80 hover:text-white whitespace-nowrap">
                💳 银行卡管理
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex space-x-2">
            {(['week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedPeriod === period
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {period === 'week' ? '近7天' : period === 'month' ? '近30天' : '近1年'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">📈</span>
              <p className="text-sm opacity-90">总收入</p>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalIncome)}</p>
          </Card>
          <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">📉</span>
              <p className="text-sm opacity-90">总支出</p>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalExpense)}</p>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">💰</span>
              <p className="text-sm opacity-90">净收入</p>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.netIncome)}</p>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">📝</span>
              <p className="text-sm opacity-90">交易笔数</p>
            </div>
            <p className="text-2xl font-bold">{stats.transactionCount}</p>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-5">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-sm opacity-80">用户统计</p>
              <p className="text-3xl font-bold">
                {stats.activeUsers} / {stats.totalUsers}
              </p>
              <p className="text-xs opacity-70">活跃用户 / 总用户</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center text-xs">
            <div className="bg-white/10 rounded-lg p-2">
              <p className="font-bold">{subscriptionStats.free}</p>
              <p className="opacity-70">免费</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <p className="font-bold">{subscriptionStats.weekly}</p>
              <p className="opacity-70">周订阅</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <p className="font-bold">{subscriptionStats.monthly}</p>
              <p className="opacity-70">月订阅</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <p className="font-bold">{subscriptionStats.yearly}</p>
              <p className="opacity-70">年订阅</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center space-x-2">
              <span>📊</span>
              <span>数据图表</span>
            </h3>
            <div className="flex space-x-2">
              {[
                { id: 'trend', label: '趋势' },
                { id: 'category', label: '分类' },
                { id: 'platform', label: '平台' },
              ].map((chart) => (
                <button
                  key={chart.id}
                  onClick={() => setSelectedChart(chart.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedChart === chart.id
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-text-secondary hover:bg-slate-200'
                  }`}
                >
                  {chart.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 min-h-[300px]">
            {selectedChart === 'trend' && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">支出趋势</h4>
                {stats.dailyStats.length > 0 ? (
                  <div className="space-y-2">
                    {stats.dailyStats.slice(-7).map((day, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-20 text-xs text-text-secondary">{day.date}</div>
                        <div className="flex-1 bg-indigo-100 rounded-full h-8 relative overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${Math.min((day.expense / Math.max(...stats.dailyStats.map(d => d.expense), 1)) * 100, 100)}%` }}
                          >
                            <span className="text-xs text-white font-medium">
                              {formatCurrency(day.expense)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <span className="text-4xl">📊</span>
                    <p className="text-text-secondary mt-2">暂无数据</p>
                  </div>
                )}
              </div>
            )}

            {selectedChart === 'category' && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">支出分类</h4>
                {stats.categoryStats.length > 0 ? (
                  <div className="space-y-3">
                    {stats.categoryStats.slice(0, 8).map((cat, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{cat.category}</span>
                            <span className="text-sm font-bold text-text-primary">
                              {formatCurrency(cat.amount)} ({cat.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full"
                              style={{ width: `${cat.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <span className="text-4xl">🏷️</span>
                    <p className="text-text-secondary mt-2">暂无数据</p>
                  </div>
                )}
              </div>
            )}

            {selectedChart === 'platform' && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">平台分布</h4>
                {stats.platformStats.length > 0 ? (
                  <div className="space-y-3">
                    {stats.platformStats.map((platform, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-text-primary">{platform.platform}</p>
                          <p className="text-sm text-text-secondary">
                            {formatCurrency(platform.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <span className="text-4xl">🌐</span>
                    <p className="text-text-secondary mt-2">暂无数据</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-white rounded-2xl shadow-lg p-5">
          <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center space-x-2">
            <span>💡</span>
            <span>关键指标</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
              <p className="text-sm text-text-secondary mb-1">平均每笔交易</p>
              <p className="text-2xl font-bold text-indigo-600">
                {formatCurrency(stats.avgTransaction)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <p className="text-sm text-text-secondary mb-1">订阅转化率</p>
              <p className="text-2xl font-bold text-green-600">
                {((subscriptionStats.weekly + subscriptionStats.monthly + subscriptionStats.yearly) / Math.max(stats.totalUsers, 1) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <p className="text-sm text-text-secondary mb-1">活跃订阅用户</p>
              <p className="text-2xl font-bold text-purple-600">
                {subscriptionStats.active}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4">
              <p className="text-sm text-text-secondary mb-1">预计月收入</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(
                  subscriptionStats.weekly * 5 / 7 * 30 +
                  subscriptionStats.monthly +
                  subscriptionStats.yearly / 12
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-5">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">📈</span>
            <div>
              <h4 className="font-bold mb-2">数据说明</h4>
              <ul className="text-sm space-y-1 text-white/80">
                <li>• 数据基于所选时间段内的所有交易记录</li>
                <li>• 活跃用户 = 订阅未过期的用户</li>
                <li>• 平台分布统计自动同步的消费记录</li>
                <li>• 预计月收入根据当前订阅方案估算</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg p-3 z-40">
        <div className="flex space-x-3 max-w-md mx-auto">
          <Link to="/admin" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 shadow-lg">
              <span className="flex items-center justify-center space-x-2">
                <span className="text-xl">👥</span>
                <span className="font-medium">用户管理</span>
              </span>
            </Button>
          </Link>
          <Link to="/admin/withdrawal" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 shadow-lg">
              <span className="flex items-center justify-center space-x-2">
                <span className="text-xl">💳</span>
                <span className="font-medium">银行卡管理</span>
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useTransactionStore } from '../stores/transactionStore';
import { Header } from '../components/layout/Header';
import { Card } from '../components/common/Card';
import { TrendChart } from '../components/charts/TrendChart';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { analyzeSpending } from '../services/ai';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/common/Button';

type Period = 'week' | 'month' | 'year';

export const Analytics: React.FC = () => {
  const transactions = useTransactionStore((state) => state.transactions);
  const [period, setPeriod] = useState<Period>('month');

  const analysis = useMemo(() => {
    return analyzeSpending(transactions, period);
  }, [transactions, period]);

  const pieChartData = analysis.topCategories.map((item) => ({
    name: `${item.category.icon} ${item.category.name}`,
    value: item.amount,
    color: item.category.color,
  }));

  return (
    <div className="pb-20 min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white px-4 pt-8 pb-12">
        <div className="relative">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 -left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <Header title="消费分析" subtitle="AI 智能洞察" />

        <div className="mt-6 flex space-x-2">
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setPeriod(p)}
              className={period === p ? 'bg-white/20 text-white hover:bg-white/30' : 'text-white/80 hover:text-white'}
            >
              {p === 'week' ? '本周' : p === 'month' ? '本月' : '今年'}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
              <div>
                <p className="text-xs opacity-80">收入</p>
                <p className="text-2xl font-bold">{formatCurrency(analysis.totalIncome)}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-red-400 to-rose-500 text-white rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">📉</span>
              </div>
              <div>
                <p className="text-xs opacity-80">支出</p>
                <p className="text-2xl font-bold">{formatCurrency(analysis.totalExpense)}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xl">📈</span>
            <h3 className="text-lg font-semibold text-text-primary">支出趋势</h3>
          </div>
          <TrendChart data={analysis.trends} />
        </Card>

        <Card className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xl">📊</span>
            <h3 className="text-lg font-semibold text-text-primary">支出分布</h3>
          </div>
          {pieChartData.length > 0 ? (
            <CategoryPieChart data={pieChartData} />
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl">📊</span>
              <p className="text-text-secondary mt-2">暂无数据</p>
            </div>
          )}
        </Card>

        {analysis.topCategories.length > 0 && (
          <Card className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">🏆</span>
              <h3 className="text-lg font-semibold text-text-primary">支出排行榜</h3>
            </div>
            <div className="space-y-3">
              {analysis.topCategories.slice(0, 5).map((item, index) => (
                <div key={item.category.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-400 text-white' :
                      index === 1 ? 'bg-gray-300 text-white' :
                      index === 2 ? 'bg-orange-400 text-white' :
                      'bg-slate-200 text-text-secondary'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-xl">{item.category.icon}</span>
                    <span className="font-medium text-text-primary">{item.category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">{formatCurrency(item.amount)}</p>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-text-secondary ml-2">{item.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {analysis.insights.length > 0 && (
          <Card className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">💡</span>
              <h3 className="text-lg font-semibold text-text-primary">AI 智能洞察</h3>
            </div>
            <div className="space-y-3">
              {analysis.insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-xl ${
                    insight.type === 'warning'
                      ? 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-100'
                      : insight.type === 'tip'
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100'
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg flex-shrink-0">
                      {insight.type === 'warning' ? '⚠️' : insight.type === 'tip' ? '💡' : '📊'}
                    </span>
                    <div>
                      <h4 className="font-medium text-text-primary">{insight.title}</h4>
                      <p className="text-sm text-text-secondary mt-1">{insight.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {analysis.insights.length === 0 && (
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5">
            <div className="text-center">
              <span className="text-4xl">🤖</span>
              <h3 className="font-semibold text-text-primary mt-3">AI 正在等待数据</h3>
              <p className="text-sm text-text-secondary mt-1">添加更多交易记录，AI 将为您分析消费习惯</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

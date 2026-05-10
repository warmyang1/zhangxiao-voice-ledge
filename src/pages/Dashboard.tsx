import React, { useMemo } from 'react';
import { Card } from '../components/common/Card';
import { TransactionList } from '../components/transaction/TransactionCard';
import { useTransactionStore } from '../stores/transactionStore';
import { formatCurrency, formatMonth } from '../utils/formatters';
import { Header } from '../components/layout/Header';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const Dashboard: React.FC = () => {
  const transactions = useTransactionStore((state) => state.transactions);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthTransactions = transactions.filter(
      (t) => new Date(t.timestamp) >= monthStart
    );

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      transactionCount: monthTransactions.length,
    };
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="pb-20 min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white px-4 pt-8 pb-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/8 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <Header title="张小账" subtitle="智能语音记账" />

          <div className="mt-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <span className="text-4xl">💰</span>
            </div>
            <p className="text-sm opacity-80 mb-2">{formatMonth(new Date())}</p>
            <p className="text-5xl font-bold mb-1 tracking-tight">{formatCurrency(monthlyStats.balance)}</p>
            <p className="text-sm opacity-75">本月结余</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <Card className="bg-white/15 backdrop-blur-sm border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-400/20 rounded-xl flex items-center justify-center">
                  <span className="text-lg">📈</span>
                </div>
                <div>
                  <p className="text-xs opacity-75">收入</p>
                  <p className="text-xl font-bold text-green-300">{formatCurrency(monthlyStats.income)}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/15 backdrop-blur-sm border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-400/20 rounded-xl flex items-center justify-center">
                  <span className="text-lg">📉</span>
                </div>
                <div>
                  <p className="text-xs opacity-75">支出</p>
                  <p className="text-xl font-bold text-red-300">{formatCurrency(monthlyStats.expense)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-12 space-y-4">
        <Link to="/voice">
          <Card className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <span className="text-3xl">🎤</span>
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-lg">语音记账</h3>
                  <p className="text-sm text-text-secondary">说出金额和内容，AI自动分类</p>
                </div>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <span className="text-indigo-600 text-lg">→</span>
              </div>
            </div>
          </Card>
        </Link>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center space-x-2">
              <span>📋</span>
              <span>最近交易</span>
            </h2>
            <Link to="/transactions">
              <Button variant="ghost" size="sm">查看全部</Button>
            </Link>
          </div>

          <TransactionList
            transactions={recentTransactions}
            emptyMessage="暂无交易记录，试试语音记账吧"
          />
        </div>

        <div className="mt-6">
          <Card className="bg-gradient-to-r from-gradient-start to-gradient-end rounded-2xl overflow-hidden">
            <div className="flex items-center space-x-4 p-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">智能分析</h3>
                <p className="text-sm text-white/80">AI 帮你分析消费习惯</p>
              </div>
              <Link to="/analytics">
                <Button variant="secondary" size="sm" className="bg-white text-indigo-600 hover:bg-white/90">查看</Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 p-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-lg">✍️</span>
              </div>
              <div>
                <p className="text-xs text-text-secondary">交易笔数</p>
                <p className="text-xl font-bold text-text-primary">{monthlyStats.transactionCount}</p>
              </div>
            </div>
          </Card>
          <Link to="/platforms">
            <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
              <div className="flex items-center space-x-3 p-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-lg">🔄</span>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">自动记账</p>
                  <p className="text-sm font-medium text-primary">管理平台 →</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link to="/transactions">
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="text-center">
                <span className="text-2xl">📝</span>
                <p className="text-xs text-text-secondary mt-2">交易记录</p>
              </div>
            </Card>
          </Link>
          <Link to="/settings">
            <Card className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="text-center">
                <span className="text-2xl">⚙️</span>
                <p className="text-xs text-text-secondary mt-2">设置</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

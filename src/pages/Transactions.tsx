import React, { useState, useMemo } from 'react';
import { useTransactionStore } from '../stores/transactionStore';
import { TransactionList } from '../components/transaction/TransactionCard';
import { Header } from '../components/layout/Header';
import { Card } from '../components/common/Card';
import { CATEGORIES } from '../utils/categories';
import { formatCurrency } from '../utils/formatters';
import type { Category, Transaction } from '../types';

export const Transactions: React.FC = () => {
  const transactions = useTransactionStore((state) => state.transactions);
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const matchKeyword = !searchKeyword || 
        t.merchant.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        t.note?.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchCategory && matchKeyword;
    });
  }, [transactions, selectedCategory, searchKeyword]);

  const stats = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, t) => {
        if (t.type === 'expense') {
          acc.expense += t.amount;
        } else {
          acc.income += t.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [filteredTransactions]);

  const handleDeleteTransaction = (transaction: Transaction) => {
    setDeleteConfirm(transaction);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteTransaction(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white px-4 pt-8 pb-12">
        <div className="relative">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 -left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <Header title="交易记录" subtitle={`共 ${filteredTransactions.length} 笔`} />

        <div className="mt-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="搜索商家或备注..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        <Card className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">📈</span>
              </div>
              <div>
                <p className="text-xs text-text-secondary">收入</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(stats.income)}</p>
              </div>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-red-600 text-xl">📉</span>
              </div>
              <div>
                <p className="text-xs text-text-secondary">支出</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(stats.expense)}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white text-text-secondary hover:bg-slate-50 shadow-sm'
            }`}
          >
            全部
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white text-text-secondary hover:bg-slate-50 shadow-sm'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <TransactionList
          transactions={filteredTransactions}
          onTransactionDelete={handleDeleteTransaction}
          emptyMessage="暂无符合条件的交易记录"
        />

        {filteredTransactions.length > 0 && (
          <div className="mt-4 text-center text-sm text-text-secondary bg-slate-50 rounded-xl py-3">
            显示 {filteredTransactions.length} 笔交易
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white p-5">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">⚠️</span>
                <h3 className="text-xl font-bold">确认删除</h3>
              </div>
            </div>
            
            <div className="p-5">
              <p className="text-text-primary mb-3">确定要删除这笔交易记录吗？</p>
              
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">商家</span>
                  <span className="font-medium">{deleteConfirm.merchant}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-text-secondary">金额</span>
                  <span className="font-bold text-red-600">{formatCurrency(deleteConfirm.amount)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-text-secondary">时间</span>
                  <span className="text-sm">{new Date(deleteConfirm.timestamp).toLocaleString('zh-CN')}</span>
                </div>
              </div>
              
              <p className="text-sm text-red-600 mb-4">⚠️ 此操作不可撤销</p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-text-secondary rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-rose-600 transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

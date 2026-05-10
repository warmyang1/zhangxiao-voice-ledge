import React from 'react';
import type { Transaction } from '../../types';
import { Card } from '../common/Card';
import { Tag } from '../common/Tag';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import clsx from 'clsx';

interface TransactionCardProps {
  transaction: Transaction;
  onClick?: () => void;
  onDelete?: (transaction: Transaction) => void;
  showDelete?: boolean;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ 
  transaction, 
  onClick, 
  onDelete,
  showDelete = true 
}) => {
  const isExpense = transaction.type === 'expense';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(transaction);
    }
  };

  return (
    <Card hoverable={!!onClick} onClick={onClick} className="relative group">
      <div className="flex items-center space-x-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm"
          style={{ backgroundColor: `${transaction.categoryIcon ? '#4ECDC4'.replace('#', '') : '#64748B'}15` }}
        >
          {transaction.categoryIcon || '📦'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="font-semibold text-text-primary truncate">
              {transaction.merchant || '未知商家'}
            </p>
            {transaction.syncSource === 'auto' && (
              <span className="text-xs" title="自动同步">
                ☁️
              </span>
            )}
            {transaction.syncSource === 'manual' && (
              <span className="text-xs" title="手动录入">
                🎤
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-1 flex-wrap">
            <Tag color="#64748B" size="sm">
              {transaction.categoryIcon} {transaction.category}
            </Tag>
            <span className="text-xs text-text-secondary">
              {formatDateTime(transaction.timestamp)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className={clsx(
              'font-bold text-lg',
              isExpense ? 'text-red-600' : 'text-green-600'
            )}>
              {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
            </p>
            {transaction.platform && (
              <p className="text-xs text-text-secondary mt-0.5">
                {transaction.platform}
              </p>
            )}
          </div>

          {showDelete && onDelete && (
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 hover:text-red-700"
              title="删除记录"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
  onTransactionDelete?: (transaction: Transaction) => void;
  emptyMessage?: string;
  showDelete?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onTransactionClick,
  onTransactionDelete,
  emptyMessage = '暂无交易记录',
  showDelete = true,
}) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📭</span>
        </div>
        <p className="text-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          onClick={() => onTransactionClick?.(transaction)}
          onDelete={onTransactionDelete}
          showDelete={showDelete}
        />
      ))}
    </div>
  );
};

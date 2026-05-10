import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction, Category, Platform } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByPeriod: (startDate: Date, endDate: Date) => Transaction[];
  getTransactionsByCategory: (category: Category) => Transaction[];
  getTransactionsByPlatform: (platform: Platform) => Transaction[];
  getRecentTransactions: (limit?: number) => Transaction[];
  clearAll: () => void;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (transactionData) => {
        const now = new Date();
        const transaction: Transaction = {
          ...transactionData,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        }));
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      getTransactionsByPeriod: (startDate, endDate) => {
        return get().transactions.filter(
          (t) => new Date(t.timestamp) >= startDate && new Date(t.timestamp) <= endDate
        );
      },

      getTransactionsByCategory: (category) => {
        return get().transactions.filter((t) => t.category === category);
      },

      getTransactionsByPlatform: (platform) => {
        return get().transactions.filter((t) => t.platform === platform);
      },

      getRecentTransactions: (limit = 10) => {
        return get().transactions.slice(0, limit);
      },

      clearAll: () => {
        set({ transactions: [] });
      },
    }),
    {
      name: 'voice-ledger-transactions',
    }
  )
);

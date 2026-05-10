import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Transaction, UserProfile } from '../types';

interface VoiceLedgerDB extends DBSchema {
  transactions: {
    key: string;
    value: Transaction;
    indexes: {
      'by-timestamp': Date;
      'by-category': string;
      'by-syncStatus': string;
    };
  };
  userProfile: {
    key: string;
    value: UserProfile;
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      type: 'create' | 'update' | 'delete';
      data: any;
      timestamp: Date;
    };
  };
}

class CloudSyncService {
  private db: IDBPDatabase<VoiceLedgerDB> | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;

  constructor() {
    this.initDB();
    this.setupOnlineListener();
  }

  private async initDB() {
    try {
      this.db = await openDB<VoiceLedgerDB>('voice-ledger-db', 1, {
        upgrade(db) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('by-timestamp', 'timestamp');
          transactionStore.createIndex('by-category', 'category');
          transactionStore.createIndex('by-syncStatus', 'syncStatus');

          db.createObjectStore('userProfile', { keyPath: 'id' });
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async saveTransaction(transaction: Transaction): Promise<void> {
    if (this.db) {
      await this.db.put('transactions', transaction);

      if (this.isOnline) {
        await this.syncTransactionToCloud(transaction);
      } else {
        await this.addToSyncQueue({
          id: transaction.id,
          type: 'create',
          data: transaction,
          timestamp: new Date(),
        });
      }
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    if (this.db) {
      const transactions = await this.db.getAll('transactions');
      return transactions.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
    return [];
  }

  async deleteTransaction(id: string): Promise<void> {
    if (this.db) {
      await this.db.delete('transactions', id);

      if (this.isOnline) {
        await this.deleteTransactionFromCloud(id);
      } else {
        await this.addToSyncQueue({
          id,
          type: 'delete',
          data: { id },
          timestamp: new Date(),
        });
      }
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    if (this.db) {
      await this.db.put('userProfile', profile);
    }
  }

  async getUserProfile(): Promise<UserProfile | undefined> {
    if (this.db) {
      const profiles = await this.db.getAll('userProfile');
      return profiles[0];
    }
    return undefined;
  }

  private async addToSyncQueue(item: { id: string; type: 'create' | 'update' | 'delete'; data: any; timestamp: Date }): Promise<void> {
    if (this.db) {
      const queueItem = {
        type: item.type,
        data: item.data,
        timestamp: item.timestamp,
      };
      await this.db.put('syncQueue', { id: `${item.type}-${item.id}-${Date.now()}`, ...queueItem });
    }
  }

  private async syncTransactionToCloud(transaction: Transaction): Promise<void> {
    console.log('Syncing transaction to cloud:', transaction.id);
  }

  private async deleteTransactionFromCloud(id: string): Promise<void> {
    console.log('Deleting transaction from cloud:', id);
  }

  private async syncPendingChanges(): Promise<void> {
    if (!this.db || this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;

    try {
      const queue = await this.db.getAll('syncQueue');

      for (const item of queue) {
        switch (item.type) {
          case 'create':
          case 'update':
            await this.syncTransactionToCloud(item.data);
            break;
          case 'delete':
            await this.deleteTransactionFromCloud(item.data.id);
            break;
        }
        await this.db.delete('syncQueue', item.id);
      }

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  async forceSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('No internet connection');
    }
    await this.syncPendingChanges();
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  getSyncStatus(): 'idle' | 'syncing' | 'error' {
    if (this.syncInProgress) return 'syncing';
    return 'idle';
  }
}

export const cloudSyncService = new CloudSyncService();

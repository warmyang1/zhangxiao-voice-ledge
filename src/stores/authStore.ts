import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  subscription: {
    status: 'free' | 'active' | 'expired';
    plan: 'free' | 'weekly' | 'monthly' | 'yearly' | null;
    startDate: Date | null;
    endDate: Date | null;
    cardNumber?: string;
    bankName?: string;
    cardHolder?: string;
    cardBindDate?: Date;
  };
  data: any;
}

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, password: string, email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateSubscription: (plan: 'weekly' | 'monthly' | 'yearly', cardNumber: string) => void;
  checkSubscriptionStatus: () => boolean;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const ADMIN_ACCOUNT = {
  username: '2729143515',
  password: 'ZL4505124TTZL',
  isAdmin: true,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      users: [],

      register: async (username: string, password: string, email: string) => {
        const { users } = get();
        
        if (users.find(u => u.username === username)) {
          return { success: false, message: '用户名已存在' };
        }
        
        if (users.find(u => u.email === email)) {
          return { success: false, message: '邮箱已被注册' };
        }

        if (username === ADMIN_ACCOUNT.username) {
          return { success: false, message: '该用户名不可注册' };
        }

        const newUser: User = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          username,
          email,
          password,
          createdAt: new Date(),
          subscription: {
            status: 'free',
            plan: null,
            startDate: null,
            endDate: null,
          },
          data: null,
        };

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        newUser.subscription = {
          status: 'active',
          plan: 'free',
          startDate,
          endDate,
        };

        set({ users: [...users, newUser] });

        return { success: true, message: '注册成功！免费试用30天' };
      },

      login: async (username: string, password: string) => {
        if (username === ADMIN_ACCOUNT.username && password === ADMIN_ACCOUNT.password) {
          const adminUser: User = {
            id: 'admin_001',
            username: ADMIN_ACCOUNT.username,
            email: 'admin@zhangxiao.zhang',
            password: ADMIN_ACCOUNT.password,
            createdAt: new Date(),
            subscription: {
              status: 'active',
              plan: 'yearly',
              startDate: new Date('2024-01-01'),
              endDate: new Date('2099-12-31'),
            },
            data: null,
          };
          set({ currentUser: adminUser, isAuthenticated: true });
          return { success: true, message: '管理员登录成功' };
        }

        const { users } = get();
        const user = users.find(u => u.username === username && u.password === password);

        if (!user) {
          return { success: false, message: '用户名或密码错误' };
        }

        set({ currentUser: user, isAuthenticated: true });
        return { success: true, message: '登录成功' };
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      updateSubscription: (plan: 'weekly' | 'monthly' | 'yearly', cardNumber: string) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const startDate = new Date();
        let endDate = new Date();

        switch (plan) {
          case 'weekly':
            endDate.setDate(endDate.getDate() + 7);
            break;
          case 'monthly':
            endDate.setMonth(endDate.getMonth() + 1);
            break;
          case 'yearly':
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;
        }

        const updatedUser = {
          ...currentUser,
          subscription: {
            ...currentUser.subscription,
            status: 'active' as const,
            plan,
            startDate,
            endDate,
            cardNumber,
          },
        };

        set({
          currentUser: updatedUser,
          users: users.map(u => u.id === updatedUser.id ? updatedUser : u),
        });
      },

      checkSubscriptionStatus: () => {
        const { currentUser } = get();
        if (!currentUser) return false;
        
        if (currentUser.id === 'admin_001') return true;
        
        if (currentUser.subscription.status === 'active' && currentUser.subscription.endDate) {
          const now = new Date();
          const endDate = new Date(currentUser.subscription.endDate);
          return now < endDate;
        }
        
        return false;
      },

      addUser: (user: User) => {
        set(state => ({ users: [...state.users, user] }));
      },

      updateUser: (id: string, updates: Partial<User>) => {
        set(state => ({
          users: state.users.map(u => u.id === id ? { ...u, ...updates } : u),
          currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...updates } : state.currentUser,
        }));
      },

      deleteUser: (id: string) => {
        set(state => ({
          users: state.users.filter(u => u.id !== id),
          currentUser: state.currentUser?.id === id ? null : state.currentUser,
          isAuthenticated: state.currentUser?.id === id ? false : state.isAuthenticated,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useTransactionStore } from '../stores/transactionStore';
import { Header } from '../components/layout/Header';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Tag } from '../components/common/Tag';
import { Link } from 'react-router-dom';

export const Settings: React.FC = () => {
  const { currentUser, logout } = useAuthStore();
  const { clearAll, transactions } = useTransactionStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const getSubscriptionInfo = () => {
    if (!currentUser) return null;
    
    if (currentUser.id === 'admin_001') {
      return {
        plan: '管理员',
        daysLeft: '永久',
        color: '#10b981',
      };
    }

    const { subscription } = currentUser;
    if (subscription.status === 'active' && subscription.endDate) {
      const now = new Date();
      const endDate = new Date(subscription.endDate);
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        plan: subscription.plan === 'free' ? '免费试用' :
              subscription.plan === 'weekly' ? '周订阅' :
              subscription.plan === 'monthly' ? '月订阅' : '年订阅',
        daysLeft: daysLeft > 0 ? `${daysLeft}天` : '已过期',
        color: daysLeft > 7 ? '#10b981' : daysLeft > 0 ? '#f59e0b' : '#ef4444',
      };
    }
    
    return {
      plan: '未订阅',
      daysLeft: '0',
      color: '#6b7280',
    };
  };

  const subscriptionInfo = getSubscriptionInfo();

  const handleExportData = () => {
    const data = {
      transactions,
      user: {
        username: currentUser?.username,
        email: currentUser?.email,
        subscription: currentUser?.subscription,
      },
      exportTime: new Date().toISOString(),
      version: '1.0.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zhangxiao-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    clearAll();
    setShowClearConfirm(false);
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white px-4 pt-8 pb-12">
        <div className="relative">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 -left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <Header title="设置" subtitle="个性化配置" />
      </div>

      <div className="px-4 -mt-6 space-y-4">
        <Card className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-text-primary text-lg">{currentUser?.username}</h3>
              <p className="text-sm text-text-secondary">{currentUser?.email}</p>
              {subscriptionInfo && (
                <Tag color={subscriptionInfo.color} size="sm" className="mt-1">
                  {subscriptionInfo.plan} · 剩余 {subscriptionInfo.daysLeft}
                </Tag>
              )}
            </div>
          </div>
          
          {currentUser?.id !== 'admin_001' && (
            <Link to="/subscription">
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
                💎 {subscriptionInfo?.plan === '未订阅' ? '立即订阅' : '续费/升级'}
              </Button>
            </Link>
          )}
        </Card>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-text-secondary mb-3 flex items-center space-x-2">
            <span>☁️</span>
            <span>同步设置</span>
          </h4>
          <Card className="bg-white rounded-2xl p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-green-600">☁️</span>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">云端同步</p>
                    <p className="text-sm text-text-secondary">数据实时同步到云端</p>
                  </div>
                </div>
                <Tag color="#10b981" size="sm">已启用</Tag>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="font-medium text-text-primary mb-2">同步频率</p>
                <div className="flex space-x-2">
                  {[
                    { id: 'realtime', label: '实时' },
                    { id: 'hourly', label: '每小时' },
                    { id: 'daily', label: '每天' },
                  ].map((interval) => (
                    <button
                      key={interval.id}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium"
                    >
                      {interval.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-text-secondary mb-3 flex items-center space-x-2">
            <span>🔔</span>
            <span>通知设置</span>
          </h4>
          <Card className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600">🔔</span>
                </div>
                <div>
                  <p className="font-medium text-text-primary">消费提醒</p>
                  <p className="text-sm text-text-secondary">大额消费时发送通知</p>
                </div>
              </div>
              <button className="w-12 h-6 bg-indigo-500 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full shadow absolute top-0.5 right-0.5"></div>
              </button>
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-text-secondary mb-3 flex items-center space-x-2">
            <span>💾</span>
            <span>数据管理</span>
          </h4>
          <Card className="bg-white rounded-2xl p-4">
            <div className="space-y-4">
              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📤</span>
                  <div className="text-left">
                    <p className="font-medium text-text-primary">导出数据</p>
                    <p className="text-sm text-text-secondary">导出为 JSON 格式</p>
                  </div>
                </div>
                <span className="text-indigo-600 text-lg">→</span>
              </button>

              <div className="border-t border-slate-100 pt-4">
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full flex items-center justify-between p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🗑️</span>
                    <div className="text-left">
                      <p className="font-medium text-red-600">清除所有数据</p>
                      <p className="text-sm text-text-secondary">此操作不可恢复</p>
                    </div>
                  </div>
                  <span className="text-red-600 text-lg">→</span>
                </button>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-text-secondary mb-3 flex items-center space-x-2">
            <span>ℹ️</span>
            <span>关于</span>
          </h4>
          <Card className="bg-white rounded-2xl p-5">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="font-bold text-text-primary text-xl">张小账</h3>
              <p className="text-sm text-text-secondary">智能语音记账 · AI消费分析</p>
              <p className="text-xs text-text-secondary mt-1">版本 1.0.0</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-text-secondary">
              <p>张小账是一款智能语音记账应用，让记账变得简单高效。支持语音输入、AI自动分类、自动同步各大平台消费记录。</p>
            </div>
          </Card>
        </div>

        <Card className="bg-white rounded-2xl p-4 mt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">🚪</span>
              <div className="text-left">
                <p className="font-medium">退出登录</p>
                <p className="text-sm text-text-secondary">切换账号</p>
              </div>
            </div>
            <span className="text-lg">→</span>
          </button>
        </Card>

        <div className="h-20"></div>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white p-5">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">⚠️</span>
                <h3 className="text-xl font-bold">确认清除数据</h3>
              </div>
            </div>
            
            <div className="p-5">
              <p className="text-text-primary mb-3">确定要清除所有数据吗？</p>
              <p className="text-sm text-text-secondary mb-4">包括所有交易记录，此操作不可恢复。</p>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowClearConfirm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  onClick={handleClearData}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
                >
                  确认清除
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

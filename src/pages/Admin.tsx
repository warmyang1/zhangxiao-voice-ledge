import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency } from '../utils/formatters';
import { Link } from 'react-router-dom';

export const Admin: React.FC = () => {
  const { users, deleteUser, updateUser, logout, currentUser } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!currentUser || currentUser.id !== 'admin_001') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">权限不足</h2>
          <p className="text-text-secondary mb-6">您没有权限访问后台管理系统</p>
          <Button onClick={() => window.location.href = '/'} className="bg-gradient-to-r from-indigo-500 to-purple-600">
            返回首页
          </Button>
        </Card>
      </div>
    );
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSubscriptionStatus = (user: typeof users[0]) => {
    const { subscription } = user;
    if (!subscription.endDate) return { text: '未订阅', color: 'text-gray-600', bg: 'bg-gray-100' };
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return { text: '已过期', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (daysLeft <= 7) {
      return { text: `剩余${daysLeft}天`, color: 'text-orange-600', bg: 'bg-orange-100' };
    } else {
      return { text: `剩余${daysLeft}天`, color: 'text-green-600', bg: 'bg-green-100' };
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('确定要删除该用户吗？此操作不可撤销')) {
      deleteUser(userId);
      setSelectedUser(null);
    }
  };

  const handleExtendSubscription = (userId: string, days: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newEndDate = user.subscription.endDate ? new Date(user.subscription.endDate) : new Date();
    newEndDate.setDate(newEndDate.getDate() + days);

    updateUser(userId, {
      subscription: {
        ...user.subscription,
        status: 'active',
        endDate: newEndDate,
      },
    });

    alert(`已为用户延长${days}天订阅`);
  };

  const stats = {
    totalUsers: users.length,
    activeSubscriptions: users.filter(u => {
      if (!u.subscription.endDate) return false;
      return new Date(u.subscription.endDate) > new Date();
    }).length,
    totalRevenue: users.reduce((sum, u) => {
      if (u.subscription.plan && u.subscription.plan !== 'free') {
        const planPrice = u.subscription.plan === 'weekly' ? 5 : u.subscription.plan === 'monthly' ? 18 : 168;
        return sum + planPrice;
      }
      return sum;
    }, 0),
  };

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
              <h1 className="text-3xl font-bold mb-1">后台管理</h1>
              <p className="text-white/70">张小账管理系统</p>
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/admin/overview">
                <Button variant="ghost" className="text-white/80 hover:text-white whitespace-nowrap">
                  📊 数据总览
                </Button>
              </Link>
              <Link to="/admin/withdrawal">
                <Button variant="ghost" className="text-white/80 hover:text-white whitespace-nowrap">
                  💳 银行卡
                </Button>
              </Link>
              <Button 
                onClick={logout}
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                退出登录
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <p className="text-white/60 text-sm">总用户数</p>
              <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <p className="text-white/60 text-sm">活跃订阅</p>
              <p className="text-3xl font-bold mt-1">{stats.activeSubscriptions}</p>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <p className="text-white/60 text-sm">总收入</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </Card>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        <Card className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-xl">🔍</span>
            <input
              type="text"
              placeholder="搜索用户名或邮箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>
        </Card>

        <div className="mt-6">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center space-x-2">
            <span>👥</span>
            <span>用户列表 ({filteredUsers.length})</span>
          </h2>

          {filteredUsers.length === 0 ? (
            <Card className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👤</span>
              </div>
              <p className="text-text-secondary">暂无用户数据</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => {
                const status = getSubscriptionStatus(user);
                return (
                  <Card
                    key={user.id}
                    hoverable
                    onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                    className={`bg-white rounded-2xl p-4 cursor-pointer transition-all ${
                      selectedUser === user.id ? 'ring-2 ring-indigo-500 shadow-lg' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">{user.username}</p>
                          <p className="text-sm text-text-secondary">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.text}
                        </span>
                        {selectedUser === user.id && (
                          <span className="text-indigo-600">▼</span>
                        )}
                      </div>
                    </div>

                    {selectedUser === user.id && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-xs text-text-secondary">订阅方案</p>
                            <p className="font-semibold text-text-primary mt-1">
                              {user.subscription.plan === 'free' ? '免费试用' :
                               user.subscription.plan === 'weekly' ? '周订阅' :
                               user.subscription.plan === 'monthly' ? '月订阅' :
                               user.subscription.plan === 'yearly' ? '年订阅' : '未订阅'}
                            </p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-xs text-text-secondary">到期时间</p>
                            <p className="font-semibold text-text-primary mt-1">
                              {user.subscription.endDate 
                                ? new Date(user.subscription.endDate).toLocaleDateString('zh-CN')
                                : '无'}
                            </p>
                          </div>
                          {user.subscription.cardNumber && (
                            <div className="col-span-2 bg-indigo-50 rounded-xl p-3">
                              <p className="text-xs text-indigo-600">绑定卡号</p>
                              <p className="font-semibold text-indigo-700 mt-1 font-mono">
                                {user.subscription.cardNumber}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-text-secondary mb-3">
                          注册时间：{new Date(user.createdAt).toLocaleDateString('zh-CN')}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExtendSubscription(user.id, 30);
                            }}
                          >
                            +30天
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExtendSubscription(user.id, 90);
                            }}
                          >
                            +90天
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExtendSubscription(user.id, 365);
                            }}
                          >
                            +1年
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user.id);
                            }}
                            className="text-red-600 hover:bg-red-50 ml-auto"
                          >
                            删除用户
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-5 mt-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🔐</span>
            <div>
              <h4 className="font-bold mb-2">管理员信息</h4>
              <div className="text-sm space-y-1 text-white/80">
                <p>管理员账号：{currentUser.username}</p>
                <p>登录时间：{new Date().toLocaleString('zh-CN')}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg p-3 z-40">
        <div className="flex space-x-3 max-w-md mx-auto">
          <Link to="/admin/overview" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 shadow-lg">
              <span className="flex items-center justify-center space-x-2">
                <span className="text-xl">📊</span>
                <span className="font-medium">数据总览</span>
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

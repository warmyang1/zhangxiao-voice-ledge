import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency } from '../utils/formatters';
import { Link } from 'react-router-dom';

interface WithdrawalRecord {
  id: string;
  userId: string;
  username: string;
  amount: number;
  cardNumber: string;
  cardHolder: string;
  bankName: string;
  withdrawalDate: Date;
  status: 'completed';
  note?: string;
}

export const AdminWithdrawal: React.FC = () => {
  const { users, currentUser, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'bind' | 'withdraw' | 'records'>('bind');
  const [withdrawalRecords, setWithdrawalRecords] = useState<WithdrawalRecord[]>([]);
  
  const [cardNumber, setCardNumber] = useState(currentUser?.subscription?.cardNumber || '');
  const [cardHolder, setCardHolder] = useState(currentUser?.username || '');
  const [bankName, setBankName] = useState(currentUser?.subscription?.bankName || '');
  
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

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

  const usersWithSubscriptions = users.filter(u => {
    if (u.id === 'admin_001') return false;
    if (!u.subscription?.plan || u.subscription.plan === 'free') return false;
    return true;
  });

  const calculateTotalRecharged = (user: typeof usersWithSubscriptions[0]): number => {
    const plan = user.subscription?.plan;
    if (!plan || plan === 'free') return 0;
    
    const prices: Record<string, number> = {
      weekly: 5,
      monthly: 18,
      yearly: 168,
    };
    
    return prices[plan] || 0;
  };

  const totalUserRecharged = usersWithSubscriptions.reduce((sum, u) => sum + calculateTotalRecharged(u), 0);
  const totalWithdrawed = withdrawalRecords.reduce((sum, w) => sum + w.amount, 0);

  const handleBindCard = () => {
    if (!cardNumber || cardNumber.length < 16 || !cardHolder || !bankName) {
      alert('请填写完整的银行卡信息');
      return;
    }

    updateUser('admin_001', {
      subscription: {
        ...currentUser.subscription,
        cardNumber,
        cardHolder,
        bankName,
        cardBindDate: new Date(),
        status: 'active',
      },
    });

    alert('银行卡绑定成功');
  };

  const handleOpenWithdrawModal = (userId: string) => {
    const user = usersWithSubscriptions.find(u => u.id === userId);
    if (!user) return;
    
    setSelectedUserId(userId);
    setWithdrawAmount(calculateTotalRecharged(user).toString());
    setShowWithdrawModal(true);
  };

  const handleCreateWithdrawal = () => {
    if (!selectedUserId || !withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('请选择用户并输入正确的提现金额');
      return;
    }

    const user = usersWithSubscriptions.find(u => u.id === selectedUserId);
    if (!user) {
      alert('未找到该用户');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    const maxAmount = calculateTotalRecharged(user);
    
    if (amount > maxAmount) {
      alert('提现金额不能超过用户充值金额');
      return;
    }

    const newRecord: WithdrawalRecord = {
      id: `WD_${Date.now()}`,
      userId: selectedUserId,
      username: user.username,
      amount,
      cardNumber: currentUser.subscription?.cardNumber || '',
      cardHolder: currentUser.subscription?.cardHolder || currentUser.username,
      bankName: currentUser.subscription?.bankName || '',
      withdrawalDate: new Date(),
      status: 'completed',
      note: withdrawNote,
    };

    setWithdrawalRecords([...withdrawalRecords, newRecord]);
    setShowWithdrawModal(false);
    setSelectedUserId('');
    setWithdrawAmount('');
    setWithdrawNote('');
    
    alert(`已成功提取 ${user.username} 的 ${formatCurrency(amount)}`);
  };

  const hasAdminCard = currentUser.subscription?.cardNumber && currentUser.subscription?.cardNumber.length >= 16;

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
              <h1 className="text-3xl font-bold mb-1">💳 银行卡管理</h1>
              <p className="text-white/70">绑定银行卡 · 提取充值</p>
            </div>
          </div>

          <div className="flex space-x-3 overflow-x-auto">
            <Link to="/admin">
              <Button variant="ghost" className="text-white/80 hover:text-white whitespace-nowrap">
                👥 用户管理
              </Button>
            </Link>
            <Link to="/admin/overview">
              <Button variant="ghost" className="text-white/80 hover:text-white whitespace-nowrap">
                📊 数据总览
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <p className="text-white/60 text-sm">用户充值总额</p>
              <p className="text-3xl font-bold mt-1 text-green-400">{formatCurrency(totalUserRecharged)}</p>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <p className="text-white/60 text-sm">已提现金额</p>
              <p className="text-3xl font-bold mt-1 text-red-400">{formatCurrency(totalWithdrawed)}</p>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <p className="text-white/60 text-sm">银行卡状态</p>
              <p className={`text-3xl font-bold mt-1 ${hasAdminCard ? 'text-green-400' : 'text-orange-400'}`}>
                {hasAdminCard ? '✅ 已绑定' : '⚠️ 未绑定'}
              </p>
            </Card>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('bind')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'bind'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-text-secondary hover:bg-slate-50'
              }`}
            >
              🏦 绑定银行卡
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'withdraw'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-text-secondary hover:bg-slate-50'
              }`}
            >
              💰 提取充值
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'records'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-text-secondary hover:bg-slate-50'
              }`}
            >
              📋 提现记录
            </button>
          </div>

          <div className="p-4">
            {activeTab === 'bind' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-text-secondary">
                    💡 请绑定您的银行卡，用于收取用户充值金额的提现
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    开户银行
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="例如：中国工商银行"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    持卡人姓名
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="请输入持卡人姓名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    银行卡号
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 19))}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                    placeholder="请输入银行卡号"
                    maxLength={19}
                  />
                </div>

                {hasAdminCard && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-600 font-medium">✅ 当前已绑定银行卡</p>
                    <p className="text-sm text-green-600 mt-1">
                      {bankName} (****{cardNumber.slice(-4)})
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleBindCard}
                  disabled={!cardNumber || !cardHolder || !bankName}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3"
                >
                  {hasAdminCard ? '更新银行卡信息' : '绑定银行卡'}
                </Button>
              </div>
            )}

            {activeTab === 'withdraw' && (
              <div className="space-y-4">
                {!hasAdminCard ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">⚠️</span>
                    </div>
                    <p className="text-text-primary font-medium mb-2">请先绑定银行卡</p>
                    <p className="text-sm text-text-secondary mb-4">
                      在"绑定银行卡"页面完成银行卡绑定后再进行提现操作
                    </p>
                    <Button onClick={() => setActiveTab('bind')}>
                      去绑定银行卡
                    </Button>
                  </div>
                ) : usersWithSubscriptions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📭</span>
                    </div>
                    <p className="text-text-secondary">暂无用户充值记录</p>
                  </div>
                ) : (
                  <div>
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 mb-4">
                      <p className="text-sm text-text-secondary">
                        💡 点击"提取"按钮，将用户充值金额提取到您绑定的银行卡
                      </p>
                    </div>

                    <div className="space-y-3">
                      {usersWithSubscriptions.map((user) => {
                        const amount = calculateTotalRecharged(user);
                        return (
                          <Card key={user.id} className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                                  {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-text-primary">{user.username}</p>
                                  <p className="text-sm text-text-secondary">
                                    订阅方案：{
                                      user.subscription?.plan === 'weekly' ? '周订阅 ¥5' :
                                      user.subscription?.plan === 'monthly' ? '月订阅 ¥18' :
                                      '年订阅 ¥168'
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">
                                  {formatCurrency(amount)}
                                </p>
                                <Button
                                  onClick={() => handleOpenWithdrawModal(user.id)}
                                  size="sm"
                                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white mt-2"
                                >
                                  提取
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'records' && (
              <div className="space-y-4">
                {withdrawalRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📋</span>
                    </div>
                    <p className="text-text-secondary">暂无提现记录</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-bold text-text-primary mb-3">提现记录</h3>
                    <div className="space-y-3">
                      {withdrawalRecords.map((record) => (
                        <Card key={record.id} className="bg-white border border-slate-200 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-bold text-text-primary">提取自：{record.username}</p>
                              <p className="text-sm text-text-secondary">
                                提取时间：{new Date(record.withdrawalDate).toLocaleString('zh-CN')}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                              ✅ 已完成
                            </span>
                          </div>

                          <div className="bg-slate-50 rounded-xl p-3 mb-2">
                            <div className="flex justify-between mb-2">
                              <span className="text-text-secondary">提取金额</span>
                              <span className="text-2xl font-bold text-red-600">
                                {formatCurrency(record.amount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary">转入银行卡</span>
                              <span className="font-medium">
                                {record.bankName} (****{record.cardNumber.slice(-4)})
                              </span>
                            </div>
                          </div>

                          {record.note && (
                            <p className="text-sm text-text-secondary mt-2">
                              备注：{record.note}
                            </p>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-5">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">📋</span>
            <div>
              <h4 className="font-bold mb-2">功能说明</h4>
              <ul className="text-sm space-y-1 text-white/80">
                <li>• 管理员绑定自己的银行卡用于收取提现</li>
                <li>• 查看所有付费用户的充值金额</li>
                <li>• 将用户充值金额提取到管理员银行卡</li>
                <li>• 所有提现操作均会记录在提现记录中</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {showWithdrawModal && selectedUserId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white p-5">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">💰</span>
                <h3 className="text-xl font-bold">提取用户充值金额</h3>
              </div>
            </div>
            
            <div className="p-5">
              {(() => {
                const user = usersWithSubscriptions.find(u => u.id === selectedUserId);
                if (!user) return null;
                
                return (
                  <>
                    <div className="bg-slate-50 rounded-xl p-4 mb-4">
                      <p className="text-text-secondary mb-2">用户：{user.username}</p>
                      <p className="text-text-secondary mb-2">
                        银行卡：{currentUser.subscription?.bankName} (****{currentUser.subscription?.cardNumber?.slice(-4)})
                      </p>
                      <p className="text-text-secondary">
                        可提取金额：<span className="text-2xl font-bold text-green-600">
                          {formatCurrency(calculateTotalRecharged(user))}
                        </span>
                      </p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        提取金额
                      </label>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                        placeholder="请输入提取金额"
                        max={calculateTotalRecharged(user)}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        备注（可选）
                      </label>
                      <textarea
                        value={withdrawNote}
                        onChange={(e) => setWithdrawNote(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                        placeholder="请输入备注信息..."
                        rows={3}
                      />
                    </div>
                  </>
                );
              })()}
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setSelectedUserId('');
                    setWithdrawAmount('');
                    setWithdrawNote('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  onClick={handleCreateWithdrawal}
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
                >
                  确认提取
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

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
          <Link to="/admin/overview" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 shadow-lg">
              <span className="flex items-center justify-center space-x-2">
                <span className="text-xl">📊</span>
                <span className="font-medium">数据总览</span>
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

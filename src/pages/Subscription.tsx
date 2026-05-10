import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency } from '../utils/formatters';

const PRICING_PLANS = [
  {
    id: 'weekly',
    name: '周订阅',
    price: 5,
    period: '7天',
    features: [
      '完整功能使用',
      '语音记账',
      'AI消费分析',
      '自动同步',
    ],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'monthly',
    name: '月订阅',
    price: 18,
    period: '30天',
    popular: true,
    features: [
      '完整功能使用',
      '语音记账',
      'AI消费分析',
      '自动同步',
      '专属客服支持',
    ],
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'yearly',
    name: '年订阅',
    price: 168,
    period: '365天',
    features: [
      '完整功能使用',
      '语音记账',
      'AI消费分析',
      '自动同步',
      '专属客服支持',
      '享受8折优惠',
    ],
    color: 'from-pink-500 to-rose-600',
  },
];

export const Subscription: React.FC = () => {
  const { currentUser, updateSubscription } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async () => {
    if (!selectedPlan || !cardNumber) return;

    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    updateSubscription(selectedPlan as 'weekly' | 'monthly' | 'yearly', cardNumber);

    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setSelectedPlan(null);
      setCardNumber('');
    }, 2000);
  };

  const getSubscriptionStatus = () => {
    if (!currentUser) return null;
    
    const { subscription } = currentUser;
    if (subscription.status === 'active' && subscription.endDate) {
      const endDate = new Date(subscription.endDate);
      const now = new Date();
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        plan: subscription.plan,
        daysLeft,
        endDate: endDate.toLocaleDateString('zh-CN'),
      };
    }
    return null;
  };

  const status = getSubscriptionStatus();

  return (
    <div className="pb-20 min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white px-4 pt-8 pb-16">
        <div className="relative">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 -left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
            <span className="text-4xl">💎</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">订阅服务</h1>
          <p className="text-white/80">解锁全部高级功能</p>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-4">
        {status && (
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg p-5">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-bold text-lg">
                  {status.plan === 'free' ? '免费试用中' : 
                   status.plan === 'weekly' ? '周订阅会员' :
                   status.plan === 'monthly' ? '月订阅会员' : '年订阅会员'}
                </h3>
                <p className="text-sm text-white/80">
                  剩余 {status.daysLeft} 天 · {status.endDate} 到期
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="mt-6">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center space-x-2">
            <span>💰</span>
            <span>选择订阅方案</span>
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            {PRICING_PLANS.map((plan) => (
              <Card
                key={plan.id}
                hoverable
                onClick={() => setSelectedPlan(plan.id)}
                className={`rounded-2xl overflow-hidden transition-all cursor-pointer ${
                  selectedPlan === plan.id
                    ? 'ring-4 ring-indigo-500 shadow-xl scale-[1.02]'
                    : 'hover:shadow-lg'
                }`}
              >
                <div className={`bg-gradient-to-r ${plan.color} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {plan.popular && (
                        <span className="bg-white/30 px-2 py-1 rounded-full text-xs font-medium">
                          推荐
                        </span>
                      )}
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                    </div>
                    {selectedPlan === plan.id && (
                      <span className="text-2xl">✓</span>
                    )}
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-baseline space-x-1 mb-4">
                    <span className="text-3xl font-bold text-text-primary">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-text-secondary">/{plan.period}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm text-text-secondary">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {selectedPlan && (
          <Card className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center space-x-2">
              <span>💳</span>
              <span>绑定收费卡号</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  卡号
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="请输入收费卡号"
                  maxLength={20}
                />
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary">订阅方案</span>
                  <span className="font-medium">
                    {PRICING_PLANS.find(p => p.id === selectedPlan)?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">应付金额</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(PRICING_PLANS.find(p => p.id === selectedPlan)?.price || 0)}
                  </span>
                </div>
              </div>
              
              <Button
                onClick={handleSubscribe}
                loading={loading}
                disabled={!cardNumber}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold"
              >
                {loading ? '绑定中...' : '确认订阅'}
              </Button>
            </div>
          </Card>
        )}

        {success && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl">✅</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">订阅成功！</h3>
                <p className="text-text-secondary">欢迎使用张小账会员服务</p>
              </div>
            </Card>
          </div>
        )}

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5">
          <div className="flex items-start space-x-3">
            <span className="text-xl">📝</span>
            <div>
              <h4 className="font-medium text-text-primary mb-2">订阅说明</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• 订阅后可持续使用全部高级功能</li>
                <li>• 收费卡号仅用于会员验证</li>
                <li>• 订阅期满自动续费提醒</li>
                <li>• 如需取消，请联系客服</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

import React from 'react';
import { Header } from '../components/layout/Header';
import { VoiceRecorder } from '../components/voice/VoiceRecorder';
import { Card } from '../components/common/Card';
import { useNavigate } from 'react-router-dom';

export const VoiceRecord: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-20 min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white px-4 pt-8 pb-12">
        <div className="relative">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 -left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <Header
          title="语音记账"
          subtitle="说出金额和内容，AI自动分类"
          showBack
          onBack={() => navigate('/')}
        />
      </div>

      <div className="px-4 -mt-6">
        <Card className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 overflow-hidden">
          <div className="p-6">
            <VoiceRecorder />
          </div>
        </Card>

        <div className="mt-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xl">💡</span>
            <h3 className="text-lg font-semibold text-text-primary">记账示例</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-md transition-shadow">
              <div className="p-4">
                <p className="text-sm text-text-primary font-medium">"买了一件衣服花了200块"</p>
                <p className="text-xs text-text-secondary mt-2">→ 识别为：购物，¥200</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-md transition-shadow">
              <div className="p-4">
                <p className="text-sm text-text-primary font-medium">"中午吃饭用了68"</p>
                <p className="text-xs text-text-secondary mt-2">→ 识别为：餐饮，¥68</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-pink-50 to-red-50 hover:shadow-md transition-shadow">
              <div className="p-4">
                <p className="text-sm text-text-primary font-medium">"打车花了30"</p>
                <p className="text-xs text-text-secondary mt-2">→ 识别为：交通，¥30</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-md transition-shadow">
              <div className="p-4">
                <p className="text-sm text-text-primary font-medium">"在奶茶店买了杯奶茶花了25"</p>
                <p className="text-xs text-text-secondary mt-2">→ 识别为：餐饮，¥25</p>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-6">
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">🎯</span>
              <h4 className="font-bold text-white">支持的功能</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-300">✓</span>
                <span className="text-sm text-white/90">语音识别金额</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-300">✓</span>
                <span className="text-sm text-white/90">支持中文数字</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-300">✓</span>
                <span className="text-sm text-white/90">AI智能分类</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-300">✓</span>
                <span className="text-sm text-white/90">自动识别商家</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <span className="text-xl">💬</span>
              <div>
                <h5 className="font-medium text-text-primary">小贴士</h5>
                <p className="text-sm text-text-secondary mt-1">
                  说话时尽量清晰，包含金额和消费类型，比如："今天中午吃饭花了50元"
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

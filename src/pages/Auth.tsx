import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/common/Button';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(username, password);
        if (result.success) {
          navigate(username === '2729143515' ? '/admin' : '/');
        } else {
          setError(result.message);
        }
      } else {
        if (!email) {
          setError('请输入邮箱');
          setLoading(false);
          return;
        }
        const result = await register(username, password, email);
        if (result.success) {
          alert(result.message);
          setIsLogin(true);
          setEmail('');
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-4">
            <span className="text-5xl">💰</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">张小账</h1>
          <p className="text-white/80 text-sm">智能语音记账 · AI消费分析</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex mb-6 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                !isLogin
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              注册
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="请输入用户名"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="请输入邮箱"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="请输入密码"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold"
            >
              {isLogin ? '登录' : '注册'}
            </Button>
          </form>

          {isLogin && (
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div className="flex items-start space-x-3">
                <span className="text-xl">💡</span>
                <div>
                  <h4 className="font-medium text-text-primary text-sm">新用户注册</h4>
                  <p className="text-xs text-text-secondary mt-1">
                    注册即享30天免费试用，到期后按周/月/年订阅收费
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-white/60 text-sm mt-6">
          © 2024 张小账 · 智能语音记账应用
        </p>
      </div>
    </div>
  );
};

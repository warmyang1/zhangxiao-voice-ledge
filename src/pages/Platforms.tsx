import React from 'react';
import { useUserStore } from '../stores/userStore';
import { useTransactionStore } from '../stores/transactionStore';
import { Header } from '../components/layout/Header';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Tag';
import type { Platform } from '../types';
import { formatRelativeTime } from '../utils/formatters';
import { v4 as uuidv4 } from 'uuid';

export const Platforms: React.FC = () => {
  const { platforms, connectPlatform, disconnectPlatform, syncPlatform } = useUserStore();
  const { addTransaction } = useTransactionStore();

  const handleConnect = (platformId: Platform) => {
    connectPlatform(platformId);

    const mockTransactions = generateMockTransactions(platformId);
    mockTransactions.forEach((t) => {
      addTransaction(t);
    });
  };

  const handleSync = (platformId: Platform) => {
    syncPlatform(platformId);
    const mockTransactions = generateMockTransactions(platformId);
    mockTransactions.forEach((t) => {
      addTransaction(t);
    });
  };

  const generateMockTransactions = (platformId: Platform) => {
    const platforms: Record<Platform, { name: string; merchants: string[] }> = {
      wechat: { name: '微信支付', merchants: ['星巴克', '美团外卖', '滴滴出行'] },
      alipay: { name: '支付宝', merchants: ['盒马鲜生', '饿了么', '花呗还款'] },
      taobao: { name: '淘宝', merchants: ['天猫超市', '聚划算', '淘鲜达'] },
      jd: { name: '京东', merchants: ['京东到家', '京东自营', '京东快递'] },
      douyin: { name: '抖音', merchants: ['抖音商城', '抖音外卖', '抖音直播'] },
    };

    const platform = platforms[platformId];
    const merchant = platform.merchants[Math.floor(Math.random() * platform.merchants.length)];
    const amount = Math.floor(Math.random() * 200) + 20;
    const daysAgo = Math.floor(Math.random() * 7);

    return [{
      id: uuidv4(),
      amount,
      type: 'expense' as const,
      category: 'other' as const,
      categoryIcon: '📦',
      merchant,
      platform: platformId,
      timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      syncSource: 'auto' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }];
  };

  return (
    <div className="pb-20 bg-background min-h-screen">
      <Header title="自动记账" subtitle="连接平台，自动同步" />

      <div className="px-4 py-4">
        <Card className="bg-blue-50 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-medium text-primary mb-1">自动记账说明</h4>
              <p className="text-sm text-text-secondary">
                连接各大支付平台后，我们将自动同步您的交易记录，无需手动录入。
                所有数据都会经过加密处理，保护您的隐私安全。
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {platforms.map((platform) => (
            <Card key={platform.id} className="hover:shadow-elevated transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${platform.color}15` }}
                  >
                    {platform.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{platform.name}</h3>
                    {platform.lastSync && (
                      <p className="text-xs text-text-secondary">
                        上次同步: {formatRelativeTime(platform.lastSync)}
                      </p>
                    )}
                  </div>
                </div>

                {platform.connected ? (
                  <Badge variant="success">已连接</Badge>
                ) : (
                  <Badge variant="info">未连接</Badge>
                )}
              </div>

              <div className="flex space-x-2">
                {platform.connected ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(platform.id)}
                      className="flex-1"
                    >
                      立即同步
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => disconnectPlatform(platform.id)}
                    >
                      断开
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleConnect(platform.id)}
                    className="flex-1"
                  >
                    连接平台
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-6 bg-gray-50">
          <h4 className="font-medium text-text-primary mb-2">🔒 数据安全</h4>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• 所有数据采用银行级加密传输</li>
            <li>• 我们不会存储您的账号密码</li>
            <li>• 您可以随时断开平台连接</li>
            <li>• 数据同步后仅用于记账分析</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useVoiceRecognition, parseVoiceInput } from '../../hooks/useVoiceRecognition';
import { useTransactionStore } from '../../stores/transactionStore';
import { getCategoryInfo } from '../../utils/categories';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Tag } from '../common/Tag';
import { formatCurrency } from '../../utils/formatters';

export const VoiceRecorder: React.FC = () => {
  const { isListening, transcript, startListening, stopListening, resetTranscript, error } = useVoiceRecognition();
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [parsedResult, setParsedResult] = useState<ReturnType<typeof parseVoiceInput> | null>(null);
  const [editedAmount, setEditedAmount] = useState('');
  const [editedMerchant, setEditedMerchant] = useState('');

  useEffect(() => {
    if (transcript && !showResult) {
      const result = parseVoiceInput(transcript);
      setParsedResult(result);
      setEditedAmount(result.amount?.toString() || '');
      setEditedMerchant(result.merchant || '');
    }
  }, [transcript, showResult]);

  const handleStartRecording = () => {
    resetTranscript();
    setShowResult(false);
    setParsedResult(null);
    startListening();
  };

  const handleStopRecording = () => {
    stopListening();
    if (transcript) {
      const result = parseVoiceInput(transcript);
      setParsedResult(result);
      setEditedAmount(result.amount?.toString() || '');
      setEditedMerchant(result.merchant || '');
      setShowResult(true);
    }
  };

  const handleConfirm = () => {
    if (!parsedResult || !editedAmount) return;

    setIsProcessing(true);

    const amount = parseFloat(editedAmount);
    if (isNaN(amount) || amount <= 0) {
      setIsProcessing(false);
      return;
    }

    const categoryInfo = parsedResult.category ? getCategoryInfo(parsedResult.category) : getCategoryInfo('other');

    addTransaction({
      amount,
      type: 'expense',
      category: parsedResult.category || 'other',
      categoryIcon: categoryInfo.icon,
      merchant: editedMerchant || '未识别商家',
      timestamp: new Date(),
      syncSource: 'manual',
    });

    setTimeout(() => {
      setIsProcessing(false);
      setShowResult(false);
      setParsedResult(null);
      resetTranscript();
      setEditedAmount('');
      setEditedMerchant('');
    }, 1000);
  };

  const handleCancel = () => {
    setShowResult(false);
    setParsedResult(null);
    resetTranscript();
  };

  const handleRetry = () => {
    resetTranscript();
    setShowResult(false);
    setParsedResult(null);
    startListening();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <button
            onMouseDown={handleStartRecording}
            onMouseUp={handleStopRecording}
            onTouchStart={handleStartRecording}
            onTouchEnd={handleStopRecording}
            className={clsx(
              'w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300',
              isListening
                ? 'bg-gradient-to-r from-red-500 to-rose-500 animate-pulse shadow-2xl scale-110'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-elevated'
            )}
          >
            <span className="text-4xl">{isListening ? '🔴' : '🎤'}</span>
          </button>
          {isListening && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg">
              录音中...
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-text-secondary">
            {isListening ? '🎙️ 松开手指完成录音' : '👆 长按麦克风开始语音记账'}
          </p>
        </div>

        {error && (
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 w-full">
            <div className="flex items-start space-x-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm text-red-800 font-medium">语音识别出错</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {isListening && transcript && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
          <div className="flex items-start space-x-3">
            <span className="text-xl">💬</span>
            <div className="flex-1">
              <p className="text-sm text-indigo-900 font-medium mb-1">你说的：</p>
              <p className="text-text-primary text-base leading-relaxed">{transcript}</p>
            </div>
          </div>
        </Card>
      )}

      {showResult && parsedResult && (
        <Card className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✨</span>
              <h3 className="text-lg font-bold">识别结果</h3>
            </div>
            <p className="text-sm text-white/80 mt-1">"{transcript}"</p>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">💰 消费金额</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-lg">¥</span>
                <input
                  type="number"
                  value={editedAmount}
                  onChange={(e) => setEditedAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-lg font-semibold"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">🏪 商家/商品</label>
              <input
                type="text"
                value={editedMerchant}
                onChange={(e) => setEditedMerchant(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="例如：星巴克、淘宝购物"
              />
              <p className="text-xs text-text-secondary mt-1">
                {parsedResult.merchant ? `AI 识别：${parsedResult.merchant}` : 'AI 未识别到商家，请手动输入'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">📂 消费分类</label>
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${getCategoryInfo(parsedResult.category || 'other').color}20` }}
                >
                  {getCategoryInfo(parsedResult.category || 'other').icon}
                </div>
                <div>
                  <Tag color={getCategoryInfo(parsedResult.category || 'other').color}>
                    {getCategoryInfo(parsedResult.category || 'other').name}
                  </Tag>
                  <p className="text-xs text-text-secondary mt-1">
                    AI 置信度：{Math.round(parsedResult.confidence * 100)}%
                  </p>
                </div>
              </div>
            </div>

            {editedAmount && parseFloat(editedAmount) > 0 && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <p className="text-sm text-text-secondary mb-1">确认支出金额</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {formatCurrency(parseFloat(editedAmount))}
                </p>
                {editedMerchant && (
                  <p className="text-sm text-text-secondary mt-1">
                    商家：{editedMerchant}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col space-y-2 pt-2">
              <Button
                onClick={handleConfirm}
                loading={isProcessing}
                disabled={!editedAmount || parseFloat(editedAmount) <= 0}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold"
              >
                ✅ 确认记账
              </Button>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="flex-1"
                >
                  🔄 重新录音
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  ❌ 取消
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {!showResult && !isListening && parsedResult && parsedResult.amount && (
        <Card className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary flex items-center space-x-2">
              <span>💡</span>
              <span>识别预览</span>
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-text-secondary">金额</span>
              <span className="font-semibold text-lg text-text-primary">
                {parsedResult.amount ? formatCurrency(parsedResult.amount) : '未识别'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-text-secondary">商家</span>
              <span className="font-medium text-text-primary">
                {parsedResult.merchant || '未识别'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-text-secondary">分类</span>
              <Tag color={getCategoryInfo(parsedResult.category || 'other').color}>
                {getCategoryInfo(parsedResult.category || 'other').icon} {getCategoryInfo(parsedResult.category || 'other').name}
              </Tag>
            </div>
          </div>

          <div className="flex space-x-3 mt-4">
            <Button
              onClick={() => setShowResult(true)}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              ✏️ 修改并确认
            </Button>
            <Button
              variant="outline"
              onClick={resetTranscript}
            >
              🔄 重录
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

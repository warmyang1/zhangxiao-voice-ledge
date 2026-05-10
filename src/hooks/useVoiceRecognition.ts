import { useState, useCallback, useRef } from 'react';
import type { Category, VoiceRecognitionResult } from '../types';

interface UseVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

const chineseNumberMap: Record<string, string> = {
  '零': '0',
  '一': '1',
  '二': '2',
  '两': '2',
  '三': '3',
  '四': '4',
  '五': '5',
  '六': '6',
  '七': '7',
  '八': '8',
  '九': '9',
  '十': '10',
  '百': '',
  '千': '',
  '块': '',
  '元': '',
  '钱': '',
  '花了': '',
  '用了': '',
  '买了': '',
  '消费': '',
  '支付': '',
};

const categoryKeywords: Record<Category, string[]> = {
  catering: ['吃饭', '午餐', '早餐', '晚餐', '外卖', '奶茶', '咖啡', '餐厅', '饭店', '小吃', '点餐'],
  shopping: ['买', '购物', '衣服', '鞋', '包', '超市', '商场', '商品', '淘宝', '京东', '日用品', '零食'],
  transport: ['打车', '地铁', '公交', '打车', '停车', '油费', '交通', '出行', '火车', '飞机'],
  entertainment: ['电影', '游戏', 'KTV', '娱乐', '唱歌', '演出', '门票', '抖音', '视频', '会员'],
  living: ['房租', '水电', '物业', '生活', '日用品', '燃气', '网费'],
  medical: ['医院', '药店', '医疗', '看病', '买药', '门诊'],
  education: ['学费', '培训', '课程', '教育', '书籍', '学习', '文具'],
  communication: ['话费', '流量', '宽带', '通讯', '手机'],
  travel: ['旅行', '旅游', '机票', '酒店', '门票', '景点', '住宿'],
  investment: ['投资', '理财', '股票', '基金', '保险'],
  salary: ['工资', '收入', '奖金', '报销'],
  other: ['其他', '杂项', '花费'],
};

const merchantKeywords: Record<string, string> = {
  '星巴克': '咖啡',
  '瑞幸': '咖啡',
  '麦当劳': '快餐',
  '肯德基': '快餐',
  '美团': '外卖',
  '饿了么': '外卖',
  '盒马': '超市',
  '沃尔玛': '超市',
  '永辉': '超市',
  '天猫': '购物',
  '淘宝': '购物',
  '京东': '购物',
  '抖音': '娱乐',
  '滴滴': '出行',
  '高德': '出行',
};

export const useVoiceRecognition = (): UseVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('您的浏览器不支持语音识别，请使用 Chrome、Safari 或 Edge 浏览器');
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => {
            return prev + finalTranscript;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        switch (event.error) {
          case 'not-allowed':
            setError('请允许麦克风权限，然后刷新页面重试');
            break;
          case 'no-speech':
            setError('未检测到语音，请对准麦克风说话');
            break;
          case 'network':
            setError('网络错误，请检查网络连接后重试');
            break;
          case 'audio-capture':
            setError('未找到麦克风设备，请检查麦克风');
            break;
          default:
            setError('语音识别出错，请重试');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setError('启动语音识别失败，请刷新页面重试');
      console.error('Speech recognition init error:', err);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Stop recognition error:', err);
      }
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error,
  };
};

export const parseVoiceInput = (text: string): VoiceRecognitionResult => {
  let amount: number | undefined;
  let category: Category | undefined;
  let merchant: string | undefined;
  let confidence = 0.5;

  let processedText = text;

  Object.entries(chineseNumberMap).forEach(([key, value]) => {
    processedText = processedText.split(key).join(value);
  });

  const amountPatterns = [
    /(\d+\.?\d*)\s*(?:块|元|钱)/,
    /花了\s*(\d+\.?\d*)/,
    /用了\s*(\d+\.?\d*)/,
    /消费\s*(\d+\.?\d*)/,
    /支付\s*(\d+\.?\d*)/,
    /买(?:了|个|件|次)?(?:.+?)?\s*(\d+\.?\d*)/,
    /共\s*(\d+\.?\d*)/,
    /总价\s*(\d+\.?\d*)/,
  ];

  for (const pattern of amountPatterns) {
    const match = processedText.match(pattern);
    if (match) {
      amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        break;
      }
    }
  }

  const lowerText = text.toLowerCase();
  for (const [merchantName] of Object.entries(merchantKeywords)) {
    if (lowerText.includes(merchantName.toLowerCase())) {
      merchant = merchantName;
      break;
    }
  }

  if (!merchant) {
    const merchantMatch = text.match(/(?:在|到|去|给)([^\s，。,]+?)(?:花了|用了|买了|支付|消费)/);
    if (merchantMatch) {
      merchant = merchantMatch[1].trim();
      if (merchant.length > 10) {
        merchant = merchant.substring(0, 10);
      }
    }
  }

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        category = cat as Category;
        confidence = Math.min(confidence + 0.3, 1);
        break;
      }
    }
    if (category) break;
  }

  if (!category) {
    category = 'other';
    confidence = 0.3;
  }

  return {
    text,
    amount,
    category,
    merchant,
    confidence,
  };
};

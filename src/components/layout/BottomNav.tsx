import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const navItems = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/voice', label: '记账', icon: '🎤' },
  { path: '/transactions', label: '记录', icon: '📋' },
  { path: '/analytics', label: '分析', icon: '📊' },
  { path: '/settings', label: '设置', icon: '⚙️' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isVoice = item.path === '/voice';

          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex flex-col items-center justify-center',
                isVoice ? '-mt-4' : '',
                'transition-all duration-200'
              )}
            >
              <div
                className={clsx(
                  'flex items-center justify-center',
                  isVoice
                    ? 'w-14 h-14 bg-primary rounded-full shadow-elevated'
                    : 'w-10 h-10',
                  isActive && !isVoice ? 'text-primary' : 'text-text-secondary'
                )}
              >
                <span className="text-xl">{item.icon}</span>
              </div>
              {!isVoice && (
                <span
                  className={clsx(
                    'text-xs mt-1 transition-colors',
                    isActive ? 'text-primary font-medium' : 'text-text-secondary'
                  )}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

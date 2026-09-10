'use client';

import React from 'react';
import { Home, Compass, Sparkles, Bookmark, User } from 'lucide-react';
import { ScreenName } from './types';
import { Translations } from '../lib/i18n';

interface BottomNavProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  savedCount: number;
  t: Translations;
}

export default function BottomNav({ currentScreen, onNavigate, savedCount, t }: BottomNavProps) {
  const isHome = currentScreen === 'dashboard';
  const isExplore = currentScreen === 'schemes' || currentScreen === 'services';
  const isCopilot = currentScreen === 'copilot';
  const isSaved = currentScreen === 'saved';
  const isProfile = currentScreen === 'profile';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around relative">
        {/* Home */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
            isHome ? 'text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${isHome ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-1">{t.home}</span>
        </button>

        {/* Explore */}
        <button
          onClick={() => onNavigate('schemes')}
          className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
            isExplore ? 'text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className={`w-5 h-5 transition-transform ${isExplore ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-1">{t.explore}</span>
        </button>

        {/* Prominent Center AI Assistant Button */}
        <div className="relative -top-4">
          <button
            onClick={() => onNavigate('copilot')}
            className={`w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-blue-500/30 transition-transform active:scale-95 hover:scale-105 flex items-center justify-center`}
            aria-label="AI Assistant"
          >
            <div className={`w-full h-full rounded-full flex flex-col items-center justify-center text-white ${isCopilot ? 'bg-transparent' : 'bg-transparent'}`}>
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
          </button>
          <span className="block text-center text-[10px] text-indigo-600 font-semibold mt-1">
            {t.assistant}
          </span>
        </div>

        {/* Saved */}
        <button
          onClick={() => onNavigate('saved')}
          className={`flex flex-col items-center justify-center w-14 py-1 relative transition-all ${
            isSaved ? 'text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Bookmark className={`w-5 h-5 transition-transform ${isSaved ? 'scale-110' : ''}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1">{t.saved}</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
            isProfile ? 'text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className={`w-5 h-5 transition-transform ${isProfile ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-1">{t.profile}</span>
        </button>
      </div>
    </div>
  );
}

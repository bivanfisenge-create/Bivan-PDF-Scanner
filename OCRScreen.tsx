import React from 'react';
import { AppSettings, AppView } from '../types';
import { 
  ShieldCheck, 
  Smartphone, 
  Maximize2, 
  Moon, 
  Sun, 
  Lock, 
  ArrowLeft,
  Settings as SettingsIcon,
  Search,
  FolderOpen
} from 'lucide-react';

interface HeaderProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isPhoneFrame: boolean;
  setIsPhoneFrame: (val: boolean) => void;
  isLocked: boolean;
  setIsLocked: (val: boolean) => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  settings,
  setSettings,
  isPhoneFrame,
  setIsPhoneFrame,
  isLocked,
  setIsLocked,
  onOpenSearch,
}) => {
  const toggleDarkMode = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    setSettings((prev) => ({ ...prev, theme: newTheme }));
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'home':
        return 'PDF Scanner';
      case 'camera':
        return 'Camera Scanner';
      case 'crop':
        return 'Crop & Perspective';
      case 'filter':
        return 'Enhance Filters';
      case 'ocr':
        return 'OCR Text Recognizer';
      case 'studio':
        return 'Document Studio';
      case 'myDocs':
        return 'My Documents';
      case 'settings':
        return 'App Settings';
      default:
        return 'PDF Scanner';
    }
  };

  return (
    <header className={`sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors ${isPhoneFrame ? 'pt-7 sm:pt-8 pb-3 px-4 sm:px-5' : 'py-3 px-4'}`}>
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Left Section: Back Button or Title */}
        <div className="flex items-center gap-3">
          {currentView !== 'home' ? (
            <button
              onClick={() => setCurrentView('home')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <FolderOpen className="w-5 h-5" />
            </div>
          )}

          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              {getViewTitle()}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Offline & Private</span>
            </div>
          </div>
        </div>

        {/* Right Section Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Search Button */}
          {currentView === 'home' && (
            <button
              onClick={onOpenSearch || (() => setCurrentView('myDocs'))}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Search Documents"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Security Lock Toggle */}
          {settings.appPinEnabled && (
            <button
              onClick={() => setIsLocked(true)}
              className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
              title="Lock Application"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {/* Frame Toggle (Phone mockup vs Fullscreen) */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className={`p-2 rounded-xl transition-colors hidden sm:flex items-center gap-1.5 text-xs font-bold ${
              isPhoneFrame
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Toggle Device Frame"
          >
            {isPhoneFrame ? <Smartphone className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden md:inline">{isPhoneFrame ? 'Phone Frame' : 'Full Screen'}</span>
          </button>

          {/* Dark Mode Switcher */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Toggle Theme"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Navigation */}
          {currentView !== 'settings' && (
            <button
              onClick={() => setCurrentView('settings')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="App Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

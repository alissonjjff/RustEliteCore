import React from 'react';
import { Download, Terminal, Settings, Code, Layout, Globe } from 'lucide-react';
import { SupportedLanguage } from '../types/plugin';

interface HeaderProps {
  activeTab: 'simulator' | 'editor' | 'code' | 'cui';
  setActiveTab: (tab: 'simulator' | 'editor' | 'code' | 'cui') => void;
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  onDownloadCs: () => void;
  pluginName: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  onDownloadCs,
  pluginName
}) => {
  const t = {
    'pt-BR': {
      brand: 'Rust Plugin Studio',
      tabSim: 'Simulador In-Game',
      tabEditor: 'Configurações',
      tabCode: 'Código C# & Download',
      tabCui: 'Interface CUI',
      downloadBtn: `Baixar ${pluginName}.cs`,
    },
    'en': {
      brand: 'Rust Plugin Studio',
      tabSim: 'In-Game Simulator',
      tabEditor: 'Settings',
      tabCode: 'C# Code & Export',
      tabCui: 'CUI Designer',
      downloadBtn: `Download ${pluginName}.cs`,
    }
  }[lang];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#111317]/95 backdrop-blur border-b border-[#252830] px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded bg-[#ce422b] flex items-center justify-center font-black text-white text-lg tracking-wider shadow-sm select-none">
            R
          </div>
          <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
            Rust Plugin <span className="text-[#ce422b]">Studio</span>
          </span>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-[#21242c] text-[#ce422b] border border-[#ce422b]/40'
                : 'text-neutral-400 hover:text-white hover:bg-[#1a1c23]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            {t.tabSim}
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              activeTab === 'editor'
                ? 'bg-[#21242c] text-[#ce422b] border border-[#ce422b]/40'
                : 'text-neutral-400 hover:text-white hover:bg-[#1a1c23]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            {t.tabEditor}
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-[#21242c] text-[#ce422b] border border-[#ce422b]/40'
                : 'text-neutral-400 hover:text-white hover:bg-[#1a1c23]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            {t.tabCode}
          </button>

          <button
            onClick={() => setActiveTab('cui')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              activeTab === 'cui'
                ? 'bg-[#21242c] text-[#ce422b] border border-[#ce422b]/40'
                : 'text-neutral-400 hover:text-white hover:bg-[#1a1c23]'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            {t.tabCui}
          </button>
        </nav>

        {/* Zone 3: Primary Action & Language Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setLang(lang === 'pt-BR' ? 'en' : 'pt-BR')}
            title="Alternar idioma / Switch language"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-400 hover:text-white bg-[#1a1c23] hover:bg-[#252833] border border-[#2b2f3a] rounded transition-colors whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
            <span>{lang === 'pt-BR' ? 'PT' : 'EN'}</span>
          </button>

          <button
            onClick={onDownloadCs}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-[#ce422b] hover:bg-[#b73722] rounded transition-colors whitespace-nowrap shadow-sm shadow-[#ce422b]/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {t.downloadBtn}
          </button>
        </div>
      </div>
    </header>
  );
};

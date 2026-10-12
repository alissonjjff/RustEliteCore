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
      brand: 'RUST ELITE CORE',
      tabSim: 'Simulador In-Game',
      tabEditor: 'Configurações',
      tabCode: 'Código C# & Download',
      tabCui: 'Interface CUI',
      downloadBtn: `Baixar ${pluginName}.cs`,
    },
    'en': {
      brand: 'RUST ELITE CORE',
      tabSim: 'In-Game Simulator',
      tabEditor: 'Settings',
      tabCode: 'C# Code & Export',
      tabCui: 'CUI Designer',
      downloadBtn: `Download ${pluginName}.cs`,
    }
  }[lang];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a120c]/95 backdrop-blur border-b border-[#1c3021] px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark with official logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-10 h-10 border border-[#3b5e40] bg-[#0c140e] overflow-hidden flex items-center justify-center shrink-0 shadow-md shadow-black/60">
            <img
              src="https://i.imgur.com/AKe0qE2.png"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
              alt="RUST ELITE CORE Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg lg:text-xl font-black tracking-wider text-white whitespace-nowrap font-mono">
                RUST ELITE <span className="text-[#4ade80]">CORE</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#122416] text-[#4ade80] border border-[#244c2c] font-bold">
                [v2.2.3]
              </span>
            </div>
            <span className="text-[10px] text-[#6d8a74] font-mono tracking-widest uppercase">
              MILITARY TACTICAL ENGINE
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation links (Tactical HUD Tabs) */}
        <nav className="hidden md:flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-semibold transition-colors whitespace-nowrap uppercase tracking-wider cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-[#152619] text-[#4ade80] border border-[#2f5c35] shadow-sm'
                : 'text-[#849e89] hover:text-white hover:bg-[#101b13] border border-transparent'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#22c55e]" />
            {t.tabSim}
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-semibold transition-colors whitespace-nowrap uppercase tracking-wider cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-[#152619] text-[#4ade80] border border-[#2f5c35] shadow-sm'
                : 'text-[#849e89] hover:text-white hover:bg-[#101b13] border border-transparent'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-[#22c55e]" />
            {t.tabEditor}
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-semibold transition-colors whitespace-nowrap uppercase tracking-wider cursor-pointer ${
              activeTab === 'code'
                ? 'bg-[#152619] text-[#4ade80] border border-[#2f5c35] shadow-sm'
                : 'text-[#849e89] hover:text-white hover:bg-[#101b13] border border-transparent'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-[#22c55e]" />
            {t.tabCode}
          </button>

          <button
            onClick={() => setActiveTab('cui')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-semibold transition-colors whitespace-nowrap uppercase tracking-wider cursor-pointer ${
              activeTab === 'cui'
                ? 'bg-[#152619] text-[#4ade80] border border-[#2f5c35] shadow-sm'
                : 'text-[#849e89] hover:text-white hover:bg-[#101b13] border border-transparent'
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-[#22c55e]" />
            {t.tabCui}
          </button>
        </nav>

        {/* Zone 3: Primary Action & Language Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setLang(lang === 'pt-BR' ? 'en' : 'pt-BR')}
            title="Alternar idioma / Switch language"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium text-[#8fa794] hover:text-white bg-[#101c13] hover:bg-[#152519] border border-[#203724] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>[{lang === 'pt-BR' ? 'PT' : 'EN'}]</span>
          </button>

          <button
            onClick={onDownloadCs}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#061408] bg-[#22c55e] hover:bg-[#16a34a] border border-[#4ade80] transition-colors whitespace-nowrap cursor-pointer shadow-sm shadow-[#22c55e]/20"
          >
            <Download className="w-3.5 h-3.5" />
            {t.downloadBtn}
          </button>
        </div>
      </div>
    </header>
  );
};

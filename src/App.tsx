import { useState, useEffect } from 'react';
import { PLUGIN_TEMPLATES } from './data/pluginTemplates';
import { PluginConfig, SupportedLanguage } from './types/plugin';
import { Header } from './components/Header';
import { Simulator } from './components/Simulator';
import { PluginEditor } from './components/PluginEditor';
import { CodeViewer } from './components/CodeViewer';
import { CuiDesigner } from './components/CuiDesigner';
import { generatePluginCSharp } from './utils/codeGenerators';
import { soundEffects } from './utils/audio';
import { CheckCircle2, Shield, Flame, Terminal, Download, Cpu } from 'lucide-react';
import workbenchHero from './assets/images/rust_workbench_gear_1791719285928.jpg';

const normalizeKits = (rawKits: any[]) => {
  if (!Array.isArray(rawKits)) return PLUGIN_TEMPLATES.rustEliteCore.kits;
  return rawKits.map(kit => {
    let items = Array.isArray(kit.items) ? kit.items.map((item: any) => {
      let shortname = item.shortname || '';
      let name = item.name || '';
      if (shortname === 'stone') {
        shortname = 'stones';
        if (!name || name === 'stone') name = 'Pedra';
      }
      if (shortname === 'stone.hatchet') {
        shortname = 'stonehatchet';
        if (!name || name === 'stone.hatchet') name = 'Machado de Pedra';
      }
      return {
        ...item,
        shortname,
        name: name || shortname,
        amount: Number(item.amount) || 1
      };
    }) : [];

    // Ensure starter kit has Machado de Pedra and Pedra
    if (kit.id === 'starter') {
      const hasHatchet = items.some((it: any) => it.shortname === 'stonehatchet' || it.shortname === 'stone.hatchet');
      const hasStones = items.some((it: any) => it.shortname === 'stones' || it.shortname === 'stone');
      if (!hasHatchet) {
        items.unshift({ shortname: 'stonehatchet', name: 'Machado de Pedra', amount: 1, container: 'belt' });
      }
      if (!hasStones) {
        items.push({ shortname: 'stones', name: 'Pedra', amount: 1000, container: 'main' });
      }
    }

    // Ensure builder kit has Pedra
    if (kit.id === 'builder') {
      const hasStones = items.some((it: any) => it.shortname === 'stones' || it.shortname === 'stone');
      if (!hasStones) {
        items.splice(3, 0, { shortname: 'stones', name: 'Pedra', amount: 5000, container: 'main' });
      }
    }

    return {
      ...kit,
      items
    };
  });
};

export default function App() {
  const [config, setConfig] = useState<PluginConfig>(() => {
    try {
      const saved = localStorage.getItem('rust_studio_plugin_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          name: 'RustEliteCore',
          version: '2.2.3',
          author: 'brtaskgamer',
          kits: normalizeKits(parsed.kits || PLUGIN_TEMPLATES.rustEliteCore.kits)
        };
      }
    } catch {
      // fallback
    }
    return {
      ...PLUGIN_TEMPLATES.rustEliteCore,
      name: 'RustEliteCore',
      version: '2.2.3',
      author: 'brtaskgamer',
      kits: normalizeKits(PLUGIN_TEMPLATES.rustEliteCore.kits)
    };
  });

  const [activeTab, setActiveTab] = useState<'simulator' | 'editor' | 'code' | 'cui'>('simulator');
  const [lang, setLang] = useState<SupportedLanguage>('pt-BR');

  useEffect(() => {
    try {
      localStorage.setItem('rust_studio_plugin_config', JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  const handleDownloadCs = () => {
    soundEffects.playLootClaim();
    const csCode = generatePluginCSharp(config);
    const blob = new Blob([csCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name}.cs`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080d09] text-[#e1eee4] flex flex-col selection:bg-[#22c55e] selection:text-black">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onDownloadCs={handleDownloadCs}
        pluginName={config.name}
      />

      {/* Hero Overview Banner (Military Code Tech HUD) */}
      <section className="relative w-full border-b border-[#1c3020] bg-[#0c140e] military-grid-bg overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#4ade80]">
              <span className="px-1.5 py-0.5 bg-[#132617] border border-[#23472a] text-[#22c55e] font-bold text-[10px] tracking-widest uppercase">
                [SYS.CORE]
              </span>
              <span className="font-bold tracking-wider uppercase">
                {lang === 'pt-BR' ? 'Oxide / uMod & Carbon Tactical Engine' : 'Oxide / uMod & Carbon Tactical Engine'}
              </span>
              <span className="text-[#36563c]">·</span>
              <span className="text-[#84a089]">Rust Dedicated Protocol 2420</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight uppercase font-mono">
                {config.title}
              </h1>
              <span className="px-2.5 py-1 bg-[#102314] text-[#4ade80] border border-[#244c2c] text-xs font-mono font-bold tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#22c55e]" />
                [v{config.version} // STABLE]
              </span>
            </div>

            <p className="text-xs lg:text-sm text-[#8fa795] max-w-2xl leading-relaxed">
              {config.description}
            </p>

            {/* Quick Badges Unboxed - Military Tech Telemetry */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#8fa795] mt-2">
              <span className="flex items-center gap-1.5 text-[#b2c9b7]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
                C# Nativo Facepunch
              </span>
              <span className="text-[#2b4430]">·</span>
              <span className="flex items-center gap-1.5 text-[#b2c9b7]">
                <Shield className="w-3.5 h-3.5 text-[#4ade80]" />
                Permissões Oxide
              </span>
              <span className="text-[#2b4430]">·</span>
              <span className="flex items-center gap-1.5 text-[#b2c9b7]">
                <Cpu className="w-3.5 h-3.5 text-[#86efac]" />
                Taxa de Coleta {config.gatherMultiplier}x (VIP {config.vipGatherMultiplier}x)
              </span>
            </div>
          </div>

          {/* Side Workbench Thumbnail & Fast Action - Straight Tactical HUD Box */}
          <div className="shrink-0 flex items-center gap-4 bg-[#0f1a12] p-3 border border-[#203624] shadow-md shadow-black/40">
            <img
              src={workbenchHero}
              alt="Rust Workbench"
              className="w-16 h-16 object-cover border border-[#2a4830] shrink-0"
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#e1eee4] font-mono tracking-wide">{config.name}.cs</span>
              <span className="text-[11px] text-[#7e9984] font-mono">
                Pasta <code className="text-[#4ade80] bg-[#142317] px-1 border border-[#203925]">/oxide/plugins/</code>
              </span>
              <button
                onClick={handleDownloadCs}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-[#061408] text-xs font-mono font-bold uppercase tracking-wider border border-[#4ade80] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar Plugin C#
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tab Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-6">
        {activeTab === 'simulator' && <Simulator config={config} lang={lang} />}
        {activeTab === 'editor' && <PluginEditor config={config} setConfig={setConfig} lang={lang} />}
        {activeTab === 'code' && <CodeViewer config={config} lang={lang} />}
        {activeTab === 'cui' && <CuiDesigner config={config} setConfig={setConfig} lang={lang} />}
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#060a07] border-t border-[#17271b] px-4 lg:px-8 py-6 text-[#728978] text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border border-[#2b4b30] bg-[#0c140e] overflow-hidden flex items-center justify-center shrink-0">
              <img
                src="https://i.imgur.com/AKe0qE2.png"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
                alt="RUST ELITE CORE"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[#96ada0]">RUST ELITE CORE — Compatível com Oxide, uMod e Carbon</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span>ARQUIVO: {config.name}.cs</span>
            <span className="text-[#2b4430]">·</span>
            <span>Facepunch Dedicated Server</span>
            <span className="text-[#2b4430]">·</span>
            <button
              onClick={() => setActiveTab('simulator')}
              className="text-[#4ade80] hover:text-[#86efac] flex items-center gap-1 cursor-pointer"
            >
              <Terminal className="w-3 h-3" /> Testar no Simulador
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

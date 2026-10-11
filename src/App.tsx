import { useState } from 'react';
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

export default function App() {
  const [config, setConfig] = useState<PluginConfig>({ ...PLUGIN_TEMPLATES.rustEliteCore });
  const [activeTab, setActiveTab] = useState<'simulator' | 'editor' | 'code' | 'cui'>('simulator');
  const [lang, setLang] = useState<SupportedLanguage>('pt-BR');

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
    <div className="min-h-screen bg-[#0c0d10] text-slate-100 flex flex-col selection:bg-[#ce422b] selection:text-white">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onDownloadCs={handleDownloadCs}
        pluginName={config.name}
      />

      {/* Hero Overview Banner */}
      <section className="relative w-full border-b border-[#232733] bg-[#111319] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#ce422b]">
              <Flame className="w-4 h-4 text-[#ce422b]" />
              <span className="font-bold tracking-wider uppercase">
                {lang === 'pt-BR' ? 'Oxide / uMod & Carbon Plugin Engine' : 'Oxide / uMod & Carbon Plugin Engine'}
              </span>
              <span className="text-neutral-500">·</span>
              <span className="text-neutral-400">Rust Dedicated Protocol 2420</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              {config.title} <span className="text-neutral-500 font-mono text-lg font-normal">v{config.version}</span>
            </h1>

            <p className="text-xs lg:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              {config.description}
            </p>

            {/* Quick Badges Unboxed */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400 mt-2">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                C# Nativo Facepunch
              </span>
              <span className="text-neutral-600">·</span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Shield className="w-3.5 h-3.5 text-[#ce422b]" />
                Permissões Oxide
              </span>
              <span className="text-neutral-600">·</span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Cpu className="w-3.5 h-3.5 text-[#3498db]" />
                Taxa de Coleta {config.gatherMultiplier}x (VIP {config.vipGatherMultiplier}x)
              </span>
            </div>
          </div>

          {/* Side Workbench Thumbnail & Fast Action */}
          <div className="shrink-0 flex items-center gap-4 bg-[#171922] p-3 rounded-xl border border-[#272b38] shadow-lg">
            <img
              src={workbenchHero}
              alt="Rust Workbench"
              className="w-16 h-16 rounded-lg object-cover border border-white/10 shrink-0"
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-white font-mono">{config.name}.cs</span>
              <span className="text-[11px] text-neutral-400">
                Pronto para <code className="text-[#ce422b]">/oxide/plugins/</code>
              </span>
              <button
                onClick={handleDownloadCs}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#ce422b] hover:bg-[#b73722] text-white text-xs font-bold rounded transition-colors cursor-pointer"
              >
                <Download className="w-3 h-3" />
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
      <footer className="w-full bg-[#0a0b0e] border-t border-[#1c1f28] px-4 lg:px-8 py-6 text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#ce422b] text-white flex items-center justify-center font-bold text-[10px]">
              R
            </div>
            <span>Rust Plugin Studio & Generator — Compatível com Oxide, uMod e Carbon</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span>Arquivo: {config.name}.cs</span>
            <span>·</span>
            <span>Facepunch Rust Dedicated Server</span>
            <span>·</span>
            <button
              onClick={() => setActiveTab('simulator')}
              className="text-[#ce422b] hover:underline flex items-center gap-1"
            >
              <Terminal className="w-3 h-3" /> Testar no Simulador
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

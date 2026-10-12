import React, { useState } from 'react';
import { PluginConfig, SupportedLanguage } from '../types/plugin';
import { generatePluginCSharp, generatePluginConfigJson, generatePluginLangJson } from '../utils/codeGenerators';
import { soundEffects } from '../utils/audio';
import { Copy, Check, Download, FileCode, FileText, Server, Sparkles } from 'lucide-react';

interface CodeViewerProps {
  config: PluginConfig;
  lang: SupportedLanguage;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ config, lang }) => {
  const [activeSubTab, setActiveSubTab] = useState<'cs' | 'config' | 'lang' | 'guide'>('cs');
  const [copied, setCopied] = useState(false);

  const csharpCode = generatePluginCSharp(config);
  const configJson = generatePluginConfigJson(config);
  const langPtJson = generatePluginLangJson('pt-BR');
  const langEnJson = generatePluginLangJson('en');

  const getActiveContent = () => {
    switch (activeSubTab) {
      case 'cs': return csharpCode;
      case 'config': return configJson;
      case 'lang': return lang === 'pt-BR' ? langPtJson : langEnJson;
      default: return '';
    }
  };

  const getFileName = () => {
    switch (activeSubTab) {
      case 'cs': return `${config.name}.cs`;
      case 'config': return `${config.name}.json`;
      case 'lang': return `${config.name}.json`;
      default: return '';
    }
  };

  const handleCopy = () => {
    soundEffects.playClick();
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string, mime: string) => {
    soundEffects.playLootClaim();
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-8 flex flex-col gap-6 font-mono military-grid-bg">
      {/* Top Selector & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0c140e] p-4 border border-[#1c3021] shadow-lg shadow-black/40">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => { soundEffects.playClick(); setActiveSubTab('cs'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeSubTab === 'cs'
                ? 'bg-[#22c55e] text-[#061408] border border-[#4ade80]'
                : 'text-[#8fa794] hover:text-white bg-[#0f1a12] border border-[#1e3422]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            {config.name}.cs (C#)
          </button>

          <button
            onClick={() => { soundEffects.playClick(); setActiveSubTab('config'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeSubTab === 'config'
                ? 'bg-[#22c55e] text-[#061408] border border-[#4ade80]'
                : 'text-[#8fa794] hover:text-white bg-[#0f1a12] border border-[#1e3422]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            oxide/config/ (JSON)
          </button>

          <button
            onClick={() => { soundEffects.playClick(); setActiveSubTab('lang'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeSubTab === 'lang'
                ? 'bg-[#22c55e] text-[#061408] border border-[#4ade80]'
                : 'text-[#8fa794] hover:text-white bg-[#0f1a12] border border-[#1e3422]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            oxide/lang/ (PT/EN)
          </button>

          <button
            onClick={() => { soundEffects.playClick(); setActiveSubTab('guide'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeSubTab === 'guide'
                ? 'bg-[#22c55e] text-[#061408] border border-[#4ade80]'
                : 'text-[#8fa794] hover:text-white bg-[#0f1a12] border border-[#1e3422]'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            {lang === 'pt-BR' ? 'Como Instalar no Servidor' : 'Server Install Guide'}
          </button>
        </div>

        {activeSubTab !== 'guide' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f1a12] hover:bg-[#16271a] border border-[#1e3422] text-xs font-mono font-semibold text-[#b2c9b6] hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span className="text-[#4ade80]">{lang === 'pt-BR' ? 'Copiado!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#8fa794]" />
                  <span>{lang === 'pt-BR' ? 'Copiar Código' : 'Copy Code'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownload(getActiveContent(), getFileName(), 'text/plain')}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-[#061408] border border-[#4ade80] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm shadow-[#22c55e]/25"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'pt-BR' ? `Baixar ${getFileName()}` : `Download ${getFileName()}`}</span>
            </button>
          </div>
        )}
      </div>

      {/* Code Display or Installation Guide */}
      {activeSubTab === 'guide' ? (
        <div className="bg-[#0c140e] border border-[#1c3021] p-6 lg:p-8 flex flex-col gap-6 text-[#b2c9b6] shadow-lg shadow-black/40">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2 mb-2 font-mono uppercase tracking-wide">
              <Server className="w-5 h-5 text-[#22c55e]" />
              Guia Militar / Técnico de Instalação (Oxide / uMod & Carbon)
            </h2>
            <p className="text-sm text-[#8fa794] font-sans">
              Instruções para deploy do plugin <span className="font-mono text-[#4ade80] font-bold">{config.name}.cs</span> em qualquer servidor dedicado de Rust (Linux, Windows, Pterodactyl, Zap-Hosting, Hostinger, Nitrado ou local).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0f1a12] p-5 border border-[#1e3422] flex flex-col gap-3">
              <div className="w-6 h-6 bg-[#22c55e] text-[#061408] flex items-center justify-center font-bold text-xs font-mono">
                1
              </div>
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">Baixar o arquivo .cs</h3>
              <p className="text-xs text-[#8fa794] leading-relaxed font-sans">
                Clique no botão de download acima para obter o arquivo <span className="font-mono text-white">{config.name}.cs</span>.
              </p>
            </div>

            <div className="bg-[#0f1a12] p-5 border border-[#1e3422] flex flex-col gap-3">
              <div className="w-6 h-6 bg-[#22c55e] text-[#061408] flex items-center justify-center font-bold text-xs font-mono">
                2
              </div>
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">Deploy no Servidor</h3>
              <p className="text-xs text-[#8fa794] leading-relaxed font-sans">
                Acesse o SFTP ou painel e envie o arquivo para o diretório de plugins:
              </p>
              <code className="text-xs font-mono bg-[#070c08] p-2 border border-[#1c3021] text-[#4ade80]">
                /server/rust/oxide/plugins/
              </code>
            </div>

            <div className="bg-[#0f1a12] p-5 border border-[#1e3422] flex flex-col gap-3">
              <div className="w-6 h-6 bg-[#22c55e] text-[#061408] flex items-center justify-center font-bold text-xs font-mono">
                3
              </div>
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">Compilação Automática</h3>
              <p className="text-xs text-[#8fa794] leading-relaxed font-sans">
                O compilador do Oxide carrega o plugin em tempo real com zero downtime:
              </p>
              <code className="text-[11px] font-mono bg-[#070c08] p-2 border border-[#1c3021] text-[#86efac]">
                [Oxide] {config.name} was compiled successfully
              </code>
            </div>
          </div>

          {/* Useful Server Commands */}
          <div className="bg-[#0f1a12] p-6 border border-[#1e3422]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono text-[#4ade80]">
              [RCON.COMMANDS] Comandos do Servidor (F1 Console / Web RCON)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-[#070c08] p-3 border border-[#1c3021]">
                <span className="text-[#4ade80] font-bold">oxide.reload {config.name}</span>
                <p className="text-[#8fa794] font-sans text-[11px] mt-1">Recarrega o plugin imediatamente após alterar a config.</p>
              </div>
              <div className="bg-[#070c08] p-3 border border-[#1c3021]">
                <span className="text-[#4ade80] font-bold">oxide.grant group default rustelitecore.use</span>
                <p className="text-[#8fa794] font-sans text-[11px] mt-1">Libera comandos de kits e homes para jogadores comuns.</p>
              </div>
              <div className="bg-[#070c08] p-3 border border-[#1c3021]">
                <span className="text-[#4ade80] font-bold">oxide.grant user &lt;SteamID64&gt; rustelitecore.vip</span>
                <p className="text-[#8fa794] font-sans text-[11px] mt-1">Concede status VIP (taxas maiores, kits VIP, mais homes).</p>
              </div>
              <div className="bg-[#070c08] p-3 border border-[#1c3021]">
                <span className="text-[#4ade80] font-bold">oxide.show perms {config.name}</span>
                <p className="text-[#8fa794] font-sans text-[11px] mt-1">Lista todas as permissões registradas pelo plugin.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Code Display Box */
        <div className="relative bg-[#060a07] border-2 border-[#1c3021] overflow-hidden shadow-2xl">
          <div className="bg-[#0c140e] px-4 py-2 border-b border-[#1c3021] flex items-center justify-between text-[#8fa794] text-xs font-mono">
            <span className="text-white font-bold">[FILE: {getFileName()}]</span>
            <span className="text-[#4ade80]">{getActiveContent().split('\n').length} LINHAS // C# OXIDE</span>
          </div>

          <pre className="p-4 lg:p-6 text-xs lg:text-sm font-mono text-[#d7e6dc] overflow-x-auto max-h-[640px] leading-relaxed selection:bg-[#22c55e] selection:text-black">
            <code>{getActiveContent()}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

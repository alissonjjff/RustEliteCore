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
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-8 flex flex-col gap-6">
      {/* Top Selector & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#12141c] p-4 rounded-xl border border-[#232733]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { soundEffects.playClick(); setActiveSubTab('cs'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded transition-colors ${
              activeSubTab === 'cs'
                ? 'bg-[#ce422b] text-white'
                : 'text-neutral-400 hover:text-white bg-[#181a24]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            {config.name}.cs (C#)
          </button>

          <button
            onClick={() => { soundEffects.playClick(); setActiveSubTab('config'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded transition-colors ${
              activeSubTab === 'config'
                ? 'bg-[#ce422b] text-white'
                : 'text-neutral-400 hover:text-white bg-[#181a24]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            oxide/config/ (JSON)
          </button>

          <button
            onClick={() => { soundEffects.playClick(); setActiveSubTab('lang'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded transition-colors ${
              activeSubTab === 'lang'
                ? 'bg-[#ce422b] text-white'
                : 'text-neutral-400 hover:text-white bg-[#181a24]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            oxide/lang/ (Localização)
          </button>

          <button
            onClick={() => { soundEffects.playClick(); setActiveSubTab('guide'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded transition-colors ${
              activeSubTab === 'guide'
                ? 'bg-[#ce422b] text-white'
                : 'text-neutral-400 hover:text-white bg-[#181a24]'
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e212c] hover:bg-[#282d3c] border border-[#2d3242] text-xs font-semibold text-neutral-200 rounded transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">{lang === 'pt-BR' ? 'Copiado!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{lang === 'pt-BR' ? 'Copiar Código' : 'Copy Code'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownload(getActiveContent(), getFileName(), 'text/plain')}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#ce422b] hover:bg-[#b73722] text-xs font-bold text-white rounded transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'pt-BR' ? `Baixar ${getFileName()}` : `Download ${getFileName()}`}</span>
            </button>
          </div>
        )}
      </div>

      {/* Code Display or Installation Guide */}
      {activeSubTab === 'guide' ? (
        <div className="bg-[#12141c] border border-[#232733] rounded-xl p-6 lg:p-8 flex flex-col gap-6 text-neutral-300">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2 mb-2">
              <Server className="w-5 h-5 text-[#ce422b]" />
              Guia Completo de Instalação no Rust Dedicated Server (Oxide / uMod & Carbon)
            </h2>
            <p className="text-sm text-neutral-400">
              Siga os passos abaixo para instalar e rodar o plugin <span className="font-mono text-white">{config.name}.cs</span> em qualquer servidor dedicado de Rust (Linux, Windows, Pterodactyl, Zap-Hosting, Hostinger, Nitrado ou local).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#181a24] p-5 rounded-lg border border-[#282d3d] flex flex-col gap-3">
              <div className="w-7 h-7 rounded bg-[#ce422b] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-white">Baixar o arquivo .cs</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Clique no botão de download acima para obter o arquivo <span className="font-mono text-white">{config.name}.cs</span>.
              </p>
            </div>

            <div className="bg-[#181a24] p-5 rounded-lg border border-[#282d3d] flex flex-col gap-3">
              <div className="w-7 h-7 rounded bg-[#ce422b] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-white">Colocar na pasta de Plugins</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Acesse o FTP ou Gerenciador de Arquivos do servidor e envie o arquivo para o diretório:
              </p>
              <code className="text-xs font-mono bg-[#0e1015] p-2 rounded text-[#ce422b]">
                /server/rust/oxide/plugins/
              </code>
            </div>

            <div className="bg-[#181a24] p-5 rounded-lg border border-[#282d3d] flex flex-col gap-3">
              <div className="w-7 h-7 rounded bg-[#ce422b] text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-white">Compilação Automática</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                O Oxide compila o plugin em tempo real! Você verá no console:
              </p>
              <code className="text-[11px] font-mono bg-[#0e1015] p-2 rounded text-green-400">
                [Oxide] {config.name} was compiled successfully
              </code>
            </div>
          </div>

          {/* Useful Server Commands */}
          <div className="bg-[#181a24] p-6 rounded-lg border border-[#282d3d]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Comandos de Gerenciamento via Console do Servidor (F1 / RCON)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-[#0e1015] p-3 rounded border border-white/5">
                <span className="text-[#ce422b] font-bold">oxide.reload {config.name}</span>
                <p className="text-neutral-400 font-sans text-[11px] mt-1">Recarrega o plugin imediatamente após alterar a config.</p>
              </div>
              <div className="bg-[#0e1015] p-3 rounded border border-white/5">
                <span className="text-[#ce422b] font-bold">oxide.grant group default rustelite.use</span>
                <p className="text-neutral-400 font-sans text-[11px] mt-1">Libera os comandos de kits e homes para todos os jogadores.</p>
              </div>
              <div className="bg-[#0e1015] p-3 rounded border border-white/5">
                <span className="text-[#ce422b] font-bold">oxide.grant user &lt;SteamID64&gt; rustelite.vip</span>
                <p className="text-neutral-400 font-sans text-[11px] mt-1">Concede benefícios VIP (mais homes, taxas maiores, kit VIP).</p>
              </div>
              <div className="bg-[#0e1015] p-3 rounded border border-white/5">
                <span className="text-[#ce422b] font-bold">oxide.show perms {config.name}</span>
                <p className="text-neutral-400 font-sans text-[11px] mt-1">Lista todas as permissões registradas pelo plugin.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Code Display Box */
        <div className="relative bg-[#0c0d12] border border-[#232733] rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-[#151722] px-4 py-2 border-b border-[#232733] flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>{getFileName()}</span>
            <span>{getActiveContent().split('\n').length} linhas</span>
          </div>

          <pre className="p-4 lg:p-6 text-xs lg:text-sm font-mono text-neutral-200 overflow-x-auto max-h-[640px] leading-relaxed">
            <code>{getActiveContent()}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

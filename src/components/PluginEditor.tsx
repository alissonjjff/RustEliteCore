import React from 'react';
import { PluginConfig, SupportedLanguage, KitDefinition } from '../types/plugin';
import { PLUGIN_TEMPLATES } from '../data/pluginTemplates';
import { soundEffects } from '../utils/audio';
import { generatePluginConfigJson } from '../utils/codeGenerators';
import { Sliders, Plus, Trash2, Shield, Copy, Check, Download, AlertTriangle, Info, ShieldCheck, Terminal, FileCode, CheckCircle2, FileJson } from 'lucide-react';

interface PluginEditorProps {
  config: PluginConfig;
  setConfig: React.Dispatch<React.SetStateAction<PluginConfig>>;
  lang: SupportedLanguage;
}

export const PluginEditor: React.FC<PluginEditorProps> = ({ config, setConfig, lang }) => {
  const [copiedPerm, setCopiedPerm] = React.useState<string | null>(null);
  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  const t = {
    'pt-BR': {
      presets: 'Modelos Pré-Configurados',
      general: 'Informações do Plugin',
      modules: 'Módulos & Funcionalidades Ativas',
      parameters: 'Parâmetros & Balanceamento',
      kitsTitle: 'Configuração de Kits',
      permsTitle: 'Permissões Oxide',
      pluginName: 'Nome do Arquivo (.cs)',
      author: 'Autor',
      version: 'Versão',
      desc: 'Descrição',
      addKit: 'Adicionar Novo Kit',
      deleteKit: 'Excluir',
      copyCommand: 'Copiar Comando de Permissão',
      copied: 'Copiado!',
    },
    'en': {
      presets: 'Preset Templates',
      general: 'Plugin Information',
      modules: 'Active Modules & Features',
      parameters: 'Parameters & Balancing',
      kitsTitle: 'Kits Configuration',
      permsTitle: 'Oxide Permissions',
      pluginName: 'File Name (.cs)',
      author: 'Author',
      version: 'Version',
      desc: 'Description',
      addKit: 'Add New Kit',
      deleteKit: 'Delete',
      copyCommand: 'Copy Grant Command',
      copied: 'Copied!',
    }
  }[lang];

  const handleCopyText = (text: string, label: string) => {
    soundEffects.playClick();
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDownloadConfigJson = () => {
    soundEffects.playLootClaim();
    const jsonContent = generatePluginConfigJson(config);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    soundEffects.playClick();
    const jsonContent = generatePluginConfigJson(config);
    navigator.clipboard.writeText(jsonContent);
    setCopiedText('json_config');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const activeModulesCount = [
    config.enableKits,
    config.enableCui,
    config.enableHomes,
    config.enableGatherMultiplier,
    config.enableAutoSmelt,
    config.enableAutoDoors,
    config.enableRaidAlerts,
  ].filter(Boolean).length;

  const handleSelectTemplate = (key: string) => {
    soundEffects.playClick();
    if (PLUGIN_TEMPLATES[key]) {
      setConfig({
        ...PLUGIN_TEMPLATES[key],
        name: 'RustEliteCore',
        version: '2.2.3',
        author: 'brtaskgamer',
      });
    }
  };

  const handleToggleModule = (field: keyof PluginConfig) => {
    soundEffects.playClick();
    setConfig(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleAddKit = () => {
    soundEffects.playLootClaim();
    const kitNumber = config.kits.length + 1;
    const newKit: KitDefinition = {
      id: `kit_${kitNumber}`,
      name: `Novo Kit ${kitNumber}`,
      description: 'Descrição do kit configurada pelo usuário.',
      cooldownSeconds: 300,
      icon: 'shield',
      items: [
        { shortname: 'bandage', name: 'Bandagem', amount: 3, container: 'belt' },
        { shortname: 'wood', name: 'Madeira', amount: 2000, container: 'main' }
      ]
    };
    setConfig(prev => ({
      ...prev,
      kits: [...prev.kits, newKit]
    }));
  };

  const handleDeleteKit = (id: string) => {
    soundEffects.playClick();
    setConfig(prev => ({
      ...prev,
      kits: prev.kits.filter(k => k.id !== id)
    }));
  };

  const copyPermCmd = (permKey: string) => {
    soundEffects.playClick();
    const cmd = `oxide.grant group default ${permKey}`;
    navigator.clipboard.writeText(cmd);
    setCopiedPerm(permKey);
    setTimeout(() => setCopiedPerm(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-8 flex flex-col gap-8 military-grid-bg">
      {/* Template Presets Bar - Military Tactical Loadouts */}
      <section className="bg-[#0c140e] border border-[#1c3021] p-5 shadow-lg shadow-black/40">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#4ade80] mb-3 flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-[#22c55e]" />
          [SYS.PRESETS] {t.presets}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.entries(PLUGIN_TEMPLATES).map(([key, tpl]) => {
            const isSelected = config.name === tpl.name;
            return (
              <button
                key={key}
                onClick={() => handleSelectTemplate(key)}
                className={`p-3 text-left transition-colors cursor-pointer flex flex-col justify-between font-mono ${
                  isSelected
                    ? 'bg-[#1b3821] text-[#4ade80] border-2 border-[#22c55e] font-bold'
                    : 'bg-[#0f1a11] hover:bg-[#152518] text-[#8fa794] border border-[#1e3422]'
                }`}
              >
                <div className="text-xs font-bold truncate">{tpl.title}</div>
                <div className="text-[11px] opacity-75 mt-1 truncate">{tpl.name}.cs</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2-Column Grid: Metadata & Feature Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Info (Non-editable official metadata - Tactical HUD Panel) */}
        <div className="bg-[#0c140e] border border-[#1c3021] hover:border-[#27462e] transition-colors p-6 flex flex-col gap-4 shadow-lg shadow-black/40">
          <div className="flex items-center justify-between border-b border-[#18291c] pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wide">
              <span className="w-2.5 h-2.5 bg-[#22c55e]" />
              {lang === 'pt-BR' ? 'Informações Oficiais do Plugin' : 'Official Plugin Information'}
            </h2>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#4ade80] bg-[#112415] border border-[#214a29] px-2 py-0.5 flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-3 h-3 text-[#22c55e]" />
              [PADRÃO FIXO]
            </span>
          </div>

          {/* Locked Identity Notice */}
          <div className="bg-[#0f1a12] border border-[#1e3422] p-3 text-xs leading-relaxed flex items-center gap-3 font-mono">
            <Info className="w-4 h-4 text-[#4ade80] shrink-0" />
            <p className="text-[11px] text-[#8fa794]">
              Nome, versão e créditos fixados para integridade do servidor Oxide. Arquivo oficial: <code className="text-[#4ade80] bg-[#152718] px-1 border border-[#234229]">RustEliteCore.cs</code>.
            </p>
          </div>

          {/* 4-Card Metadata Grid (Non-editable) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Nome do Plugin */}
            <div className="bg-[#0f1a12] border border-[#1e3422] p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-[#b2c9b6] flex items-center gap-1.5 font-mono text-[11px]">
                  <FileCode className="w-3.5 h-3.5 text-[#22c55e]" />
                  Classe C# (.cs)
                </span>
                <span className="text-[10px] bg-[#142817] text-[#4ade80] border border-[#264e2c] px-1.5 font-mono font-bold">
                  Oxide
                </span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-0.5 tracking-wider">
                {config.name}
              </div>
              <div className="text-[10px] text-[#718b77] font-mono mt-1">
                Arquivo: <span className="text-[#b2c9b6] font-bold">{config.name}.cs</span>
              </div>
            </div>

            {/* Versão Atual */}
            <div className="bg-[#0f1a12] border border-[#1e3422] p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-[#b2c9b6] flex items-center gap-1.5 font-mono text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
                  Versão Atual
                </span>
                <span className="text-[10px] bg-[#142817] text-[#4ade80] border border-[#264e2c] px-1.5 font-mono font-bold">
                  Estável
                </span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-0.5 tracking-wider">
                v{config.version}
              </div>
              <div className="text-[10px] text-[#718b77] font-mono mt-1">
                RCON: <code className="text-[#b2c9b6]">oxide.version</code>
              </div>
            </div>

            {/* Autor */}
            <div className="bg-[#0f1a12] border border-[#1e3422] p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-[#b2c9b6] flex items-center gap-1.5 font-mono text-[11px]">
                  <Shield className="w-3.5 h-3.5 text-[#4ade80]" />
                  Autor Oficial
                </span>
                <span className="text-[10px] bg-[#142817] text-[#4ade80] border border-[#264e2c] px-1.5 font-mono font-bold">
                  Dev
                </span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-0.5 tracking-wider">
                {config.author}
              </div>
              <div className="text-[10px] text-[#718b77] font-mono mt-1">
                Créditos no cabeçalho Facepunch
              </div>
            </div>

            {/* Prefixo no Chat */}
            <div className="bg-[#0f1a12] border border-[#1e3422] p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-[#b2c9b6] flex items-center gap-1.5 font-mono text-[11px]">
                  <Terminal className="w-3.5 h-3.5 text-[#86efac]" />
                  Prefixo Chat
                </span>
                <span className="text-[10px] bg-[#142817] text-[#86efac] border border-[#264e2c] px-1.5 font-mono font-bold">
                  In-Game
                </span>
              </div>
              <div className="text-sm font-bold text-[#4ade80] font-mono mt-0.5 tracking-wider">
                [{config.name}]
              </div>
              <div className="text-[10px] text-[#718b77] font-mono mt-1">
                Prefixo visual nas mensagens
              </div>
            </div>
          </div>

          {/* Diretórios e Arquivos no Servidor */}
          <div className="bg-[#0f1a12] border border-[#1e3422] p-3 flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#b2c9b6] font-mono uppercase tracking-wider">
              [FS.PATHS] Estrutura de Arquivos no Servidor:
            </span>
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex items-center justify-between bg-[#080d09] px-2.5 py-1.5 border border-[#192b1c]">
                <span className="text-[#8fa794] truncate">
                  Plugin: <span className="text-[#4ade80] font-bold">/oxide/plugins/{config.name}.cs</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(`/oxide/plugins/${config.name}.cs`, 'plugin_path')}
                  className="text-[#8fa794] hover:text-white shrink-0 ml-2 cursor-pointer flex items-center gap-1"
                  title="Copiar caminho"
                >
                  {copiedText === 'plugin_path' ? <Check className="w-3 h-3 text-[#22c55e]" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#080d09] px-2.5 py-1.5 border border-[#192b1c]">
                <span className="text-[#8fa794] truncate">
                  Config: <span className="text-[#86efac] font-bold">/oxide/config/{config.name}.json</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(`/oxide/config/${config.name}.json`, 'config_path')}
                  className="text-[#8fa794] hover:text-white shrink-0 ml-2 cursor-pointer flex items-center gap-1"
                  title="Copiar caminho"
                >
                  {copiedText === 'config_path' ? <Check className="w-3 h-3 text-[#22c55e]" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#080d09] px-2.5 py-1.5 border border-[#192b1c]">
                <span className="text-[#8fa794] truncate">
                  Data: <span className="text-[#b2c9b6] font-bold">/oxide/data/{config.name}.json</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(`/oxide/data/${config.name}.json`, 'data_path')}
                  className="text-[#8fa794] hover:text-white shrink-0 ml-2 cursor-pointer flex items-center gap-1"
                  title="Copiar caminho"
                >
                  {copiedText === 'data_path' ? <Check className="w-3 h-3 text-[#22c55e]" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Descrição Oficial Fixa */}
          <div className="bg-[#0f1a12] border border-[#1e3422] p-3">
            <span className="text-xs font-semibold text-[#b2c9b6] block mb-1 font-mono uppercase tracking-wider">
              Descrição Oficial:
            </span>
            <p className="text-xs text-[#8fa794] leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>

        {/* Feature Modules Toggles (Military Tech Switchboard) */}
        <div className="bg-[#0c140e] border border-[#1c3021] p-6 flex flex-col gap-4 shadow-lg shadow-black/40">
          <div className="flex items-center justify-between border-b border-[#18291c] pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wide">
              <span className="w-2.5 h-2.5 bg-[#22c55e]" />
              {t.modules}
            </h2>
            <span className="text-[10px] font-mono text-[#8fa794] bg-[#0f1a12] border border-[#1e3422] px-2 py-0.5">
              {activeModulesCount} / 7 ATIVOS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { key: 'enableKits', label: 'Sistema de Kits (/kit)', desc: 'Kits personalizáveis com cooldown' },
              { key: 'enableCui', label: 'Interface Gráfica CUI', desc: 'Menu visual nativo in-game' },
              { key: 'enableHomes', label: 'Sistema de Homes (/sethome)', desc: 'Salvar e teleportar para bases' },
              { key: 'enableGatherMultiplier', label: 'Multiplicador de Coleta (Rates)', desc: 'Taxas de mineração e madeira' },
              { key: 'enableAutoSmelt', label: 'Auto-Smelt de Minérios', desc: 'Funde minérios ao coletar' },
              { key: 'enableAutoDoors', label: 'Portas Automáticas (/ad)', desc: 'Fecha portas após passar' },
              { key: 'enableRaidAlerts', label: 'Alarme de Raid & Discord', desc: 'Alerta sobre explosivos na base' },
            ].map(mod => {
              const active = Boolean(config[mod.key as keyof PluginConfig]);
              return (
                <div
                  key={mod.key}
                  onClick={() => handleToggleModule(mod.key as keyof PluginConfig)}
                  className={`p-3 border cursor-pointer transition-colors flex flex-col justify-between font-mono ${
                    active
                      ? 'bg-[#122316] border-[#22c55e]/60 shadow-sm'
                      : 'bg-[#0a110c] border-[#18291c] opacity-60 hover:opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white tracking-wide">{mod.label}</span>
                    {/* Military Square Toggle */}
                    <div className={`w-7 h-4 border transition-colors flex items-center p-0.5 ${
                      active ? 'bg-[#183a1f] border-[#22c55e] justify-end' : 'bg-[#070c08] border-[#223626] justify-start'
                    }`}>
                      <div className={`w-2.5 h-2.5 ${active ? 'bg-[#4ade80]' : 'bg-[#3b5440]'}`} />
                    </div>
                  </div>
                  <span className="text-[11px] text-[#7f9984] font-sans mt-1.5">{mod.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Isolated Section: Download General .json Config (Below Info & Modules) */}
      <div className="w-full bg-[#0c140e] border-2 border-[#1c3021] hover:border-[#2b4c33] p-5 shadow-xl transition-colors flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 bg-[#122416] border border-[#22c55e]/40 flex items-center justify-center shrink-0 mt-0.5">
            <FileJson className="w-5 h-5 text-[#22c55e]" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight font-mono uppercase">
                [CONFIG.JSON] Arquivo de Configuração Geral
              </span>
              <span className="text-[11px] font-mono text-[#4ade80] bg-[#122617] border border-[#234d2a] px-2 py-0.5 font-bold">
                {config.name}.json
              </span>
              <span className="text-[11px] font-mono text-[#8fa794] bg-[#0a110c] border border-[#192b1c] px-2 py-0.5">
                {activeModulesCount} Módulos Ativos
              </span>
            </div>
            <p className="text-xs text-[#8fa794] max-w-2xl leading-relaxed">
              Baixe este arquivo <code className="text-[#e1eee4] font-mono bg-[#111c13] px-1 border border-[#1e3422]">.json</code> com todas as configurações para colocar na pasta <code className="text-[#4ade80] font-mono bg-[#111c13] px-1 border border-[#1e3422]">/oxide/config/{config.name}.json</code> do seu servidor dedicado.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleCopyJson}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-mono font-semibold text-[#b2c9b6] hover:text-white bg-[#0f1a12] hover:bg-[#16271a] border border-[#223927] transition-colors cursor-pointer uppercase tracking-wider"
            title="Copiar conteúdo JSON para a área de transferência"
          >
            {copiedText === 'json_config' ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                <span className="text-[#4ade80]">JSON Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#8fa794]" />
                <span>Copiar JSON</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadConfigJson}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-[#061408] bg-[#22c55e] hover:bg-[#16a34a] border border-[#4ade80] shadow-sm shadow-[#22c55e]/25 transition-colors cursor-pointer"
            title="Baixar arquivo JSON para colocar em oxide/config/"
          >
            <Download className="w-4 h-4" />
            <span>Baixar {config.name}.json</span>
          </button>
        </div>
      </div>

      {/* Parameters & Balancing Sliders (Only visible if at least one parameter module is active) */}
      {(config.enableGatherMultiplier || config.enableTeleport || config.enableAutoDoors || config.enableHomes) && (
        <section className="bg-[#0c140e] border border-[#1c3021] p-6 shadow-lg shadow-black/40">
          <div className="flex items-center justify-between mb-6 border-b border-[#18291c] pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wide">
              <span className="w-2.5 h-2.5 bg-[#22c55e]" />
              {t.parameters}
            </h2>
            <span className="text-[11px] font-mono text-[#8fa794] bg-[#0a110c] border border-[#192b1c] px-2 py-0.5">
              [PARÂMETROS DOS MÓDULOS ATIVOS]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Gather Multiplier */}
            {config.enableGatherMultiplier && (
              <div className="bg-[#0f1a12] p-4 border border-[#1e3422]">
                <div className="flex justify-between items-center mb-2 font-mono">
                  <span className="text-xs font-semibold text-[#b2c9b6]">Taxa de Coleta Padrão</span>
                  <span className="text-sm font-black text-[#4ade80]">{config.gatherMultiplier}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={config.gatherMultiplier}
                  onChange={e => setConfig({ ...config, gatherMultiplier: parseFloat(e.target.value) })}
                  className="w-full accent-[#22c55e] cursor-pointer"
                />
                <span className="text-[11px] text-[#718b77] mt-1 block font-mono">Aplica-se a todos os jogadores comuns</span>
              </div>
            )}

            {/* VIP Multiplier */}
            {config.enableGatherMultiplier && (
              <div className="bg-[#0f1a12] p-4 border border-[#1e3422]">
                <div className="flex justify-between items-center mb-2 font-mono">
                  <span className="text-xs font-semibold text-[#b2c9b6]">Taxa de Coleta VIP</span>
                  <span className="text-sm font-black text-[#86efac]">{config.vipGatherMultiplier}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={config.vipGatherMultiplier}
                  onChange={e => setConfig({ ...config, vipGatherMultiplier: parseFloat(e.target.value) })}
                  className="w-full accent-[#22c55e] cursor-pointer"
                />
                <span className="text-[11px] text-[#718b77] mt-1 block font-mono">Requer permissão rustelite.vip</span>
              </div>
            )}

            {/* Teleport Countdown */}
            {config.enableTeleport && (
              <div className="bg-[#0f1a12] p-4 border border-[#1e3422]">
                <div className="flex justify-between items-center mb-2 font-mono">
                  <span className="text-xs font-semibold text-[#b2c9b6]">Tempo de Espera Teleporte</span>
                  <span className="text-sm font-black text-white">{config.teleportCountdownSeconds}s</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="60"
                  step="1"
                  value={config.teleportCountdownSeconds}
                  onChange={e => setConfig({ ...config, teleportCountdownSeconds: parseInt(e.target.value) })}
                  className="w-full accent-[#22c55e] cursor-pointer"
                />
                <span className="text-[11px] text-[#718b77] mt-1 block font-mono">Contagem regressiva parada antes do TP</span>
              </div>
            )}

            {/* Combat Block Timer */}
            {config.enableTeleport && (
              <div className="bg-[#0f1a12] p-4 border border-[#1e3422]">
                <div className="flex justify-between items-center mb-2 font-mono">
                  <span className="text-xs font-semibold text-[#b2c9b6]">Bloqueio PvP (Combat Block)</span>
                  <span className="text-sm font-black text-white">{config.combatBlockSeconds}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={config.combatBlockSeconds}
                  onChange={e => setConfig({ ...config, combatBlockSeconds: parseInt(e.target.value) })}
                  className="w-full accent-[#22c55e] cursor-pointer"
                />
                <span className="text-[11px] text-[#718b77] mt-1 block font-mono">Impede teleporte logo após dano</span>
              </div>
            )}

            {/* AutoDoor Delay */}
            {config.enableAutoDoors && (
              <div className="bg-[#0f1a12] p-4 border border-[#1e3422]">
                <div className="flex justify-between items-center mb-2 font-mono">
                  <span className="text-xs font-semibold text-[#b2c9b6]">Fechamento Automático Portas</span>
                  <span className="text-sm font-black text-white">{config.autoDoorDefaultSeconds}s</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={config.autoDoorDefaultSeconds}
                  onChange={e => setConfig({ ...config, autoDoorDefaultSeconds: parseInt(e.target.value) })}
                  className="w-full accent-[#22c55e] cursor-pointer"
                />
                <span className="text-[11px] text-[#718b77] mt-1 block font-mono">Tempo em segundos até trancar</span>
              </div>
            )}

            {/* Homes Limits */}
            {config.enableHomes && (
              <div className="bg-[#0f1a12] p-4 border border-[#1e3422]">
                <div className="flex justify-between items-center mb-2 font-mono">
                  <span className="text-xs font-semibold text-[#b2c9b6]">Limite de Homes (Padrão / VIP)</span>
                  <span className="text-sm font-black text-white">{config.maxHomesDefault} / {config.maxHomesVip}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={config.maxHomesDefault}
                    onChange={e => setConfig({ ...config, maxHomesDefault: parseInt(e.target.value) || 1 })}
                    className="w-1/2 bg-[#080d09] border border-[#213725] px-2 py-1 text-xs text-white font-mono"
                  />
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={config.maxHomesVip}
                    onChange={e => setConfig({ ...config, maxHomesVip: parseInt(e.target.value) || 1 })}
                    className="w-1/2 bg-[#080d09] border border-[#213725] px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
                <span className="text-[11px] text-[#718b77] mt-1 block font-mono">Máximo de /sethome permitidos</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Kits Editor Section (Only appears if enableKits is true) */}
      {config.enableKits && (
        <section className="bg-[#0c140e] border border-[#1c3021] p-6 shadow-lg shadow-black/40">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-[#18291c] pb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wide">
                <span className="w-2.5 h-2.5 bg-[#22c55e]" />
                {t.kitsTitle}
              </h2>
              <span className="text-[11px] font-mono text-[#4ade80] bg-[#122617] border border-[#234d2a] px-2 py-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#22c55e]" />
                [LOCALSTORAGE SYNC]
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setConfig(prev => ({
                    ...prev,
                    kits: [...PLUGIN_TEMPLATES.rustEliteCore.kits]
                  }));
                }}
                className="px-2.5 py-1 text-xs font-mono text-[#8fa794] hover:text-white bg-[#0f1a12] hover:bg-[#16271a] border border-[#1e3422] transition-colors cursor-pointer uppercase tracking-wider"
              >
                Restaurar Padrão
              </button>

              <button
                onClick={handleAddKit}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-[#22c55e] hover:bg-[#16a34a] text-[#061408] border border-[#4ade80] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {t.addKit}
              </button>
            </div>
          </div>

          {/* Informative storage notice */}
          <div className="mb-4 p-3.5 bg-[#0f1a12] border border-[#1e3422] text-xs text-[#b2c9b6] flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono">
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                📁 Armazenamento de Kits & Configurações:
              </span>
              <span className="text-[#8fa794] text-[11px]">
                • <strong>Servidor Rust:</strong> Salvo em <code className="text-[#4ade80]">oxide/config/RustEliteCore.json</code> na chave <code className="text-white">"ListaDeKits"</code>.
                <br />
                • <strong>Navegador:</strong> Salvo no <code className="text-white">localStorage</code> automaticamente ao editar.
              </span>
            </div>
          </div>

          {/* Admin in-game kit creation notice */}
          <div className="mb-5 p-4 bg-[#0a120c] border border-[#192c1d] text-xs text-[#8fa794] flex flex-col gap-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Shield className="w-4 h-4 text-[#22c55e]" />
                [ADMIN HUD] Criação & Edição de Kits In-Game
              </span>
              <span className="text-[10px] font-mono bg-[#122617] text-[#4ade80] border border-[#234d2a] px-2 py-0.5 font-bold">
                rustelitecore.admin
              </span>
            </div>
            <p className="text-[11px] text-[#8fa794] leading-relaxed font-sans">
              No servidor Rust, você pode montar o inventário no seu próprio boneco e gravar o kit com um comando simples:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-1 font-mono text-[11px]">
              <div className="bg-[#060a07] p-2.5 border border-[#192c1d]">
                <span className="text-[#4ade80] font-bold block mb-1">/kit add &lt;nome&gt; [cd] [vip]</span>
                <span className="text-[#718b77] font-sans text-[11px] block leading-tight">
                  Grava os itens do seu inventário no kit instantaneamente. Ex: <code className="text-white">/kit add pvp 300</code>
                </span>
              </div>
              <div className="bg-[#060a07] p-2.5 border border-[#192c1d]">
                <span className="text-[#86efac] font-bold block mb-1">/kit remove &lt;nome&gt;</span>
                <span className="text-[#718b77] font-sans text-[11px] block leading-tight">
                  Remove o kit e atualiza o arquivo de configuração no disco.
                </span>
              </div>
              <div className="bg-[#060a07] p-2.5 border border-[#192c1d]">
                <span className="text-[#22c55e] font-bold block mb-1">/kit list</span>
                <span className="text-[#718b77] font-sans text-[11px] block leading-tight">
                  Exibe todos os kits cadastrados com tempos de recarga e itens.
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.kits.map((kit, idx) => (
              <div key={kit.id} className="bg-[#0f1a12] border border-[#1e3422] p-4 flex flex-col gap-3 font-mono">
                <div className="flex items-center justify-between border-b border-[#18291c] pb-2">
                  <input
                    type="text"
                    value={kit.name}
                    onChange={e => {
                      const next = [...config.kits];
                      const val = e.target.value;
                      next[idx].name = val;
                      const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, '');
                      if (slug && (next[idx].id.startsWith('custom_') || next[idx].id.startsWith('kit_'))) {
                        next[idx].id = slug;
                      }
                      setConfig({ ...config, kits: next });
                    }}
                    className="bg-transparent text-sm font-bold text-white focus:outline-none border-b border-transparent focus:border-[#22c55e] font-mono tracking-wide"
                  />
                  <button
                    onClick={() => handleDeleteKit(kit.id)}
                    className="text-[#718b77] hover:text-red-400 p-1 cursor-pointer transition-colors"
                    title="Remover kit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-[#718b77] block mb-1">Cooldown (s)</label>
                    <input
                      type="number"
                      value={kit.cooldownSeconds}
                      onChange={e => {
                        const next = [...config.kits];
                        next[idx].cooldownSeconds = parseInt(e.target.value) || 0;
                        setConfig({ ...config, kits: next });
                      }}
                      className="w-full bg-[#080d09] border border-[#213725] px-2.5 py-1 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#718b77] block mb-1">Permissão</label>
                    <button
                      onClick={() => {
                        const next = [...config.kits];
                        next[idx].permissionRequired = next[idx].permissionRequired ? undefined : 'rustelitecore.vip';
                        setConfig({ ...config, kits: next });
                      }}
                      className={`w-full py-1 px-2 text-xs font-bold border transition-colors cursor-pointer uppercase ${
                        kit.permissionRequired
                          ? 'bg-[#183a1f] border-[#22c55e] text-[#4ade80]'
                          : 'bg-[#080d09] border-[#213725] text-[#718b77] hover:text-white'
                      }`}
                    >
                      {kit.permissionRequired ? '★ VIP' : 'Padrão'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#718b77] block mb-1">Descrição</label>
                  <input
                    type="text"
                    value={kit.description}
                    onChange={e => {
                      const next = [...config.kits];
                      next[idx].description = e.target.value;
                      setConfig({ ...config, kits: next });
                    }}
                    className="w-full bg-[#080d09] border border-[#213725] px-2.5 py-1 text-xs text-[#b2c9b6] font-sans"
                  />
                </div>

                {/* Items in kit */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-[#8fa794]">
                      Itens ({kit.items.length})
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {kit.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center justify-between gap-2 text-xs bg-[#080d09] px-2.5 py-1.5 border border-[#192b1c]"
                      >
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-[#d7e6dc] truncate font-medium font-sans">{item.name}</span>
                          <span className="text-[10px] text-[#718b77] font-mono truncate">{item.shortname}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] text-[#718b77] font-mono">x</span>
                          <input
                            type="number"
                            min="1"
                            max="100000"
                            value={item.amount}
                            onChange={e => {
                              const next = [...config.kits];
                              next[idx].items[itemIdx].amount = Math.max(1, parseInt(e.target.value) || 1);
                              setConfig({ ...config, kits: next });
                            }}
                            className="w-16 bg-[#0f1a12] border border-[#223927] px-1.5 py-0.5 text-xs text-[#4ade80] font-mono font-bold text-right"
                          />
                          <button
                            onClick={() => {
                              const next = [...config.kits];
                              next[idx].items.splice(itemIdx, 1);
                              setConfig({ ...config, kits: next });
                            }}
                            className="p-1 text-[#718b77] hover:text-red-400 transition-colors cursor-pointer"
                            title="Remover este item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Add Item inside kit */}
                  <div className="mt-2.5 pt-2 border-t border-[#18291c] flex items-center gap-1.5">
                    <select
                      id={`select-item-${kit.id}`}
                      className="flex-1 bg-[#080d09] border border-[#213725] px-2 py-1 text-xs text-[#b2c9b6] focus:outline-none font-mono"
                      defaultValue="rifle.ak"
                    >
                      <option value="rifle.ak">AK-47 (1x)</option>
                      <option value="ammo.rifle">Munição 5.56 (128x)</option>
                      <option value="syringe.medical">Seringa Médica (4x)</option>
                      <option value="explosive.timed">C4 Explosivo (2x)</option>
                      <option value="wood">Madeira (1000x)</option>
                      <option value="stone">Pedra (1000x)</option>
                      <option value="metal.fragments">Fragmentos de Metal (1000x)</option>
                      <option value="sulfur">Enxofre (500x)</option>
                      <option value="scrap">Scrap (250x)</option>
                      <option value="bandage">Bandagem (5x)</option>
                      <option value="metal.facemask">Máscara de Metal (1x)</option>
                      <option value="metal.plate.torso">Colete de Metal (1x)</option>
                      <option value="door.hinged.metal">Porta de Metal (2x)</option>
                      <option value="lock.code">Code Lock (2x)</option>
                    </select>

                    <button
                      onClick={() => {
                        const sel = document.getElementById(`select-item-${kit.id}`) as HTMLSelectElement;
                        if (!sel) return;
                        const val = sel.value;
                        const defaults: Record<string, { name: string; amount: number }> = {
                          'rifle.ak': { name: 'Assault Rifle (AK-47)', amount: 1 },
                          'ammo.rifle': { name: 'Munição 5.56', amount: 128 },
                          'syringe.medical': { name: 'Seringa Médica', amount: 4 },
                          'explosive.timed': { name: 'C4 (Timed Explosive)', amount: 2 },
                          'wood': { name: 'Madeira', amount: 1000 },
                          'stone': { name: 'Pedra', amount: 1000 },
                          'metal.fragments': { name: 'Fragmentos de Metal', amount: 1000 },
                          'sulfur': { name: 'Enxofre', amount: 500 },
                          'scrap': { name: 'Scrap (Sucata)', amount: 250 },
                          'bandage': { name: 'Bandagem', amount: 5 },
                          'metal.facemask': { name: 'Máscara Facial de Metal', amount: 1 },
                          'metal.plate.torso': { name: 'Colete de Metal', amount: 1 },
                          'door.hinged.metal': { name: 'Porta de Metal', amount: 2 },
                          'lock.code': { name: 'Code Lock', amount: 2 },
                        };
                        const found = defaults[val] || { name: val, amount: 1 };
                        soundEffects.playLootClaim();
                        const next = [...config.kits];
                        next[idx].items.push({
                          shortname: val,
                          name: found.name,
                          amount: found.amount,
                          container: 'main'
                        });
                        setConfig({ ...config, kits: next });
                      }}
                      className="px-2.5 py-1 bg-[#122316] hover:bg-[#22c55e] hover:text-[#061408] text-[#4ade80] text-xs font-mono font-bold border border-[#22c55e]/50 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 uppercase tracking-wider"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Oxide Permissions & RCON Commands Helper */}
      <section className="bg-[#0c140e] border border-[#1c3021] p-6 shadow-lg shadow-black/40">
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2 font-mono uppercase tracking-wide">
          <Shield className="w-4 h-4 text-[#22c55e]" />
          {t.permsTitle}
        </h2>
        <p className="text-xs text-[#8fa794] mb-4 font-mono">
          Comandos prontos para conceder permissões no console do seu servidor dedicado ou RCON:
        </p>

        <div className="flex flex-col gap-2">
          {config.permissions.map(perm => (
            <div
              key={perm.key}
              className="flex items-center justify-between p-3 bg-[#0f1a12] border border-[#1e3422]"
            >
              <div>
                <span className="text-xs font-mono font-bold text-white tracking-wider">{perm.key}</span>
                <p className="text-[11px] text-[#718b77] font-mono">{perm.description}</p>
              </div>

              <button
                onClick={() => copyPermCmd(perm.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#080d09] hover:bg-[#152718] text-xs font-mono font-medium text-[#b2c9b6] hover:text-white border border-[#213725] transition-colors cursor-pointer"
              >
                {copiedPerm === perm.key ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                    <span className="text-[#4ade80] font-bold">{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#8fa794]" />
                    <span>oxide.grant group default {perm.key}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

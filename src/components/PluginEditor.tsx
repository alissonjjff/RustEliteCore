import React from 'react';
import { PluginConfig, SupportedLanguage, KitDefinition } from '../types/plugin';
import { PLUGIN_TEMPLATES } from '../data/pluginTemplates';
import { soundEffects } from '../utils/audio';
import { Sliders, Plus, Trash2, Shield, Copy, Check } from 'lucide-react';

interface PluginEditorProps {
  config: PluginConfig;
  setConfig: React.Dispatch<React.SetStateAction<PluginConfig>>;
  lang: SupportedLanguage;
}

export const PluginEditor: React.FC<PluginEditorProps> = ({ config, setConfig, lang }) => {
  const [copiedPerm, setCopiedPerm] = React.useState<string | null>(null);

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

  const handleSelectTemplate = (key: string) => {
    soundEffects.playClick();
    if (PLUGIN_TEMPLATES[key]) {
      setConfig({ ...PLUGIN_TEMPLATES[key] });
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
    const newKit: KitDefinition = {
      id: `custom_${Date.now().toString().slice(-4)}`,
      name: 'Novo Kit Personalizado',
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
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-8 flex flex-col gap-8">
      {/* Template Presets Bar */}
      <section className="bg-[#12141c] border border-[#232733] rounded-xl p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#ce422b]" />
          {t.presets}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {Object.entries(PLUGIN_TEMPLATES).map(([key, tpl]) => {
            const isSelected = config.name === tpl.name;
            return (
              <button
                key={key}
                onClick={() => handleSelectTemplate(key)}
                className={`p-3 rounded-lg text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#ce422b] text-white shadow-lg shadow-[#ce422b]/25 font-bold'
                    : 'bg-[#181a24] hover:bg-[#202330] text-neutral-300 border border-[#262a38]'
                }`}
              >
                <div className="text-xs font-bold truncate">{tpl.title}</div>
                <div className="text-[11px] opacity-80 mt-1 truncate">{tpl.name}.cs</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2-Column Grid: Metadata & Feature Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Info */}
        <div className="bg-[#12141c] border border-[#232733] rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#ce422b] rounded-sm" />
            {t.general}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-400 block mb-1.5">{t.pluginName}</label>
              <input
                type="text"
                value={config.name}
                onChange={e => setConfig({ ...config, name: e.target.value.replace(/[^a-zA-Z0-9]/g, '') })}
                className="w-full bg-[#181a24] border border-[#282d3d] rounded px-3 py-2 text-sm text-white font-mono focus:border-[#ce422b] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-400 block mb-1.5">{t.version}</label>
              <input
                type="text"
                value={config.version}
                onChange={e => setConfig({ ...config, version: e.target.value })}
                className="w-full bg-[#181a24] border border-[#282d3d] rounded px-3 py-2 text-sm text-white font-mono focus:border-[#ce422b] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1.5">{t.author}</label>
            <input
              type="text"
              value={config.author}
              onChange={e => setConfig({ ...config, author: e.target.value })}
              className="w-full bg-[#181a24] border border-[#282d3d] rounded px-3 py-2 text-sm text-white focus:border-[#ce422b] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1.5">{t.desc}</label>
            <textarea
              rows={3}
              value={config.description}
              onChange={e => setConfig({ ...config, description: e.target.value })}
              className="w-full bg-[#181a24] border border-[#282d3d] rounded p-3 text-xs text-neutral-200 focus:border-[#ce422b] focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Feature Modules Toggles */}
        <div className="bg-[#12141c] border border-[#232733] rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#ce422b] rounded-sm" />
            {t.modules}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'enableKits', label: 'Sistema de Kits (/kit)', desc: 'Kits personalizáveis com tempo de recarga' },
              { key: 'enableCui', label: 'Interface Gráfica CUI', desc: 'Menu visual nativo na tela do Rust' },
              { key: 'enableHomes', label: 'Sistema de Homes (/sethome)', desc: 'Salvar e teleportar para bases' },
              { key: 'enableGatherMultiplier', label: 'Multiplicador de Coleta (Rates)', desc: 'Multiplica madeira, pedra, enxofre' },
              { key: 'enableAutoSmelt', label: 'Auto-Smelt de Minérios', desc: 'Funde metal e enxofre ao coletar' },
              { key: 'enableAutoDoors', label: 'Portas Automáticas (/ad)', desc: 'Fecha portas após passar por elas' },
              { key: 'enableRaidAlerts', label: 'Alarme de Raid & Discord', desc: 'Alerta sobre explosivos na base' },
            ].map(mod => {
              const active = Boolean(config[mod.key as keyof PluginConfig]);
              return (
                <div
                  key={mod.key}
                  onClick={() => handleToggleModule(mod.key as keyof PluginConfig)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                    active
                      ? 'bg-[#181a24] border-[#ce422b]/50 shadow-sm'
                      : 'bg-[#14161f] border-[#222530] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{mod.label}</span>
                    <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${active ? 'bg-[#ce422b] justify-end' : 'bg-neutral-700 justify-start'}`}>
                      <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>
                  <span className="text-[11px] text-neutral-400 mt-1">{mod.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Parameters & Balancing Sliders */}
      <section className="bg-[#12141c] border border-[#232733] rounded-xl p-6">
        <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#ce422b] rounded-sm" />
          {t.parameters}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gather Multiplier */}
          <div className="bg-[#181a24] p-4 rounded-lg border border-[#252938]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-neutral-300">Taxa de Coleta Padrão</span>
              <span className="text-sm font-black font-mono text-[#ce422b]">{config.gatherMultiplier}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={config.gatherMultiplier}
              onChange={e => setConfig({ ...config, gatherMultiplier: parseFloat(e.target.value) })}
              className="w-full accent-[#ce422b]"
            />
            <span className="text-[11px] text-neutral-500 mt-1 block">Aplica-se a todos os jogadores comuns</span>
          </div>

          {/* VIP Multiplier */}
          <div className="bg-[#181a24] p-4 rounded-lg border border-[#252938]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-neutral-300">Taxa de Coleta VIP</span>
              <span className="text-sm font-black font-mono text-[#f39c12]">{config.vipGatherMultiplier}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={config.vipGatherMultiplier}
              onChange={e => setConfig({ ...config, vipGatherMultiplier: parseFloat(e.target.value) })}
              className="w-full accent-[#f39c12]"
            />
            <span className="text-[11px] text-neutral-500 mt-1 block">Requer permissão rustelite.vip</span>
          </div>

          {/* Teleport Countdown */}
          <div className="bg-[#181a24] p-4 rounded-lg border border-[#252938]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-neutral-300">Tempo de Espera Teleporte</span>
              <span className="text-sm font-black font-mono text-white">{config.teleportCountdownSeconds}s</span>
            </div>
            <input
              type="range"
              min="3"
              max="60"
              step="1"
              value={config.teleportCountdownSeconds}
              onChange={e => setConfig({ ...config, teleportCountdownSeconds: parseInt(e.target.value) })}
              className="w-full accent-[#ce422b]"
            />
            <span className="text-[11px] text-neutral-500 mt-1 block">Contagem regressiva parada antes do teleporte</span>
          </div>

          {/* Combat Block Timer */}
          <div className="bg-[#181a24] p-4 rounded-lg border border-[#252938]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-neutral-300">Bloqueio Anti-Fuga (PvP Combat)</span>
              <span className="text-sm font-black font-mono text-white">{config.combatBlockSeconds}s</span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={config.combatBlockSeconds}
              onChange={e => setConfig({ ...config, combatBlockSeconds: parseInt(e.target.value) })}
              className="w-full accent-[#ce422b]"
            />
            <span className="text-[11px] text-neutral-500 mt-1 block">Impede teleporte logo após sofrer ou causar dano</span>
          </div>

          {/* AutoDoor Delay */}
          <div className="bg-[#181a24] p-4 rounded-lg border border-[#252938]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-neutral-300">Fechamento Automático Portas</span>
              <span className="text-sm font-black font-mono text-white">{config.autoDoorDefaultSeconds}s</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={config.autoDoorDefaultSeconds}
              onChange={e => setConfig({ ...config, autoDoorDefaultSeconds: parseInt(e.target.value) })}
              className="w-full accent-[#ce422b]"
            />
            <span className="text-[11px] text-neutral-500 mt-1 block">Tempo em segundos até a porta bater e trancar</span>
          </div>

          {/* Homes Limits */}
          <div className="bg-[#181a24] p-4 rounded-lg border border-[#252938]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-neutral-300">Limite de Homes (Default / VIP)</span>
              <span className="text-sm font-black font-mono text-white">{config.maxHomesDefault} / {config.maxHomesVip}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="20"
                value={config.maxHomesDefault}
                onChange={e => setConfig({ ...config, maxHomesDefault: parseInt(e.target.value) || 1 })}
                className="w-1/2 bg-[#12141c] border border-[#2e3344] rounded px-2 py-1 text-xs text-white"
              />
              <input
                type="number"
                min="1"
                max="50"
                value={config.maxHomesVip}
                onChange={e => setConfig({ ...config, maxHomesVip: parseInt(e.target.value) || 1 })}
                className="w-1/2 bg-[#12141c] border border-[#2e3344] rounded px-2 py-1 text-xs text-white"
              />
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block">Quantidade máxima de /sethome</span>
          </div>
        </div>
      </section>

      {/* Kits Editor Section */}
      <section className="bg-[#12141c] border border-[#232733] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#ce422b] rounded-sm" />
            {t.kitsTitle}
          </h2>
          <button
            onClick={handleAddKit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#ce422b] hover:bg-[#b73722] text-white rounded transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.addKit}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.kits.map((kit, idx) => (
            <div key={kit.id} className="bg-[#181a24] border border-[#272b3b] rounded-lg p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={kit.name}
                  onChange={e => {
                    const next = [...config.kits];
                    next[idx].name = e.target.value;
                    setConfig({ ...config, kits: next });
                  }}
                  className="bg-transparent text-sm font-bold text-white focus:outline-none border-b border-transparent focus:border-[#ce422b]"
                />
                <button
                  onClick={() => handleDeleteKit(kit.id)}
                  className="text-neutral-500 hover:text-red-400 p-1"
                  title="Remover kit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Cooldown (Segundos)</label>
                <input
                  type="number"
                  value={kit.cooldownSeconds}
                  onChange={e => {
                    const next = [...config.kits];
                    next[idx].cooldownSeconds = parseInt(e.target.value) || 0;
                    setConfig({ ...config, kits: next });
                  }}
                  className="w-full bg-[#12141c] border border-[#2b3040] rounded px-2.5 py-1 text-xs text-white font-mono"
                />
              </div>

              {/* Items in kit */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 block mb-1.5">Itens do Kit</span>
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
                  {kit.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-center justify-between text-xs bg-[#12141c] px-2 py-1 rounded">
                      <span className="text-neutral-300 truncate">{item.name}</span>
                      <span className="text-[#ce422b] font-mono font-bold">x{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Oxide Permissions & RCON Commands Helper */}
      <section className="bg-[#12141c] border border-[#232733] rounded-xl p-6">
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#ce422b]" />
          {t.permsTitle}
        </h2>
        <p className="text-xs text-neutral-400 mb-4">
          Comandos prontos para conceder permissões no console do seu servidor dedicado ou RCON:
        </p>

        <div className="flex flex-col gap-2">
          {config.permissions.map(perm => (
            <div
              key={perm.key}
              className="flex items-center justify-between p-3 bg-[#181a24] border border-[#252936] rounded-lg"
            >
              <div>
                <span className="text-xs font-mono font-bold text-white">{perm.key}</span>
                <p className="text-[11px] text-neutral-400">{perm.description}</p>
              </div>

              <button
                onClick={() => copyPermCmd(perm.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#222633] hover:bg-[#2b3040] text-xs font-medium text-neutral-200 rounded transition-colors cursor-pointer"
              >
                {copiedPerm === perm.key ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400">{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
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

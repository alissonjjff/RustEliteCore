import React, { useState } from 'react';
import { PluginConfig, SupportedLanguage } from '../types/plugin';
import { soundEffects } from '../utils/audio';
import { Layout, Palette, Copy, Check } from 'lucide-react';
import domeBackdrop from '../assets/images/rust_monument_dome_1791719271169.jpg';

interface CuiDesignerProps {
  config: PluginConfig;
  setConfig: React.Dispatch<React.SetStateAction<PluginConfig>>;
  lang: SupportedLanguage;
}

export const CuiDesigner: React.FC<CuiDesignerProps> = ({ config, setConfig, lang }) => {
  const [headerTitle, setHeaderTitle] = useState('MENU DE KITS VIP');
  const [accentColor, setAccentColor] = useState('#ce422b');
  const [panelBg, setPanelBg] = useState('rgba(24, 26, 32, 0.95)');
  const [fontSize, setFontSize] = useState(18);
  const [copiedCode, setCopiedCode] = useState(false);

  const cuiSnippet = `// Snippet C# para Facepunch Oxide CUI
public void CreateCustomUi(BasePlayer player)
{
    CuiHelper.DestroyUi(player, "CustomUi_Root");
    CuiElementContainer container = new CuiElementContainer();

    // Painel Principal
    container.Add(new CuiPanel
    {
        Image = { Color = "${config.cuiSecondaryColor}" },
        RectTransform = { AnchorMin = "0.2 0.2", AnchorMax = "0.8 0.8" },
        CursorEnabled = true
    }, "Overlay", "CustomUi_Root");

    // Cabecalho
    container.Add(new CuiPanel
    {
        Image = { Color = "${config.cuiPrimaryColor}" },
        RectTransform = { AnchorMin = "0 0.9", AnchorMax = "1 1" }
    }, "CustomUi_Root", "CustomUi_Header");

    container.Add(new CuiLabel
    {
        Text = { Text = "${headerTitle}", FontSize = ${fontSize}, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" },
        RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
    }, "CustomUi_Header");

    // Botao de Acao
    container.Add(new CuiButton
    {
        Button = { Command = "kit claim starter", Color = "0.2 0.5 0.3 0.9" },
        RectTransform = { AnchorMin = "0.3 0.4", AnchorMax = "0.7 0.55" },
        Text = { Text = "RESGATAR RECOMPENSA", FontSize = 14, Align = TextAnchor.MiddleCenter }
    }, "CustomUi_Root");

    CuiHelper.AddUi(player, container);
}`;

  const handleCopySnippet = () => {
    soundEffects.playClick();
    navigator.clipboard.writeText(cuiSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-8 flex flex-col gap-6">
      {/* Intro */}
      <div className="bg-[#12141c] border border-[#232733] rounded-xl p-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
          <Layout className="w-5 h-5 text-[#ce422b]" />
          {lang === 'pt-BR' ? 'Designer Visual de Telas CUI (Rust In-Game HUD)' : 'Visual Rust CUI Screen Designer'}
        </h2>
        <p className="text-xs text-neutral-400">
          Personalize as cores, títulos e estilo dos menus gráficos exibidos na tela dos jogadores via <span className="font-mono text-white">Oxide.Game.Rust.Cui</span>.
        </p>
      </div>

      {/* Editor & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-[#12141c] border border-[#232733] rounded-xl p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#ce422b]" />
            Configurar Estilos
          </h3>

          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Título do Cabeçalho</label>
            <input
              type="text"
              value={headerTitle}
              onChange={e => setHeaderTitle(e.target.value)}
              className="w-full bg-[#181a24] border border-[#2b3040] rounded px-3 py-2 text-xs text-white focus:border-[#ce422b] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Tamanho da Fonte ({fontSize}px)</label>
            <input
              type="range"
              min="12"
              max="28"
              value={fontSize}
              onChange={e => setFontSize(parseInt(e.target.value))}
              className="w-full accent-[#ce422b]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-2">Tema de Cores</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Rust Orange', color: '#ce422b', oxide: '0.81 0.26 0.17 0.95' },
                { name: 'Toxic Green', color: '#27ae60', oxide: '0.15 0.68 0.38 0.95' },
                { name: 'Cobalt Blue', color: '#2980b9', oxide: '0.16 0.50 0.73 0.95' },
                { name: 'Dark Metal', color: '#2c3e50', oxide: '0.17 0.24 0.31 0.95' },
                { name: 'Gold VIP', color: '#f39c12', oxide: '0.95 0.61 0.07 0.95' },
                { name: 'Blood Crimson', color: '#c0392b', oxide: '0.75 0.22 0.17 0.95' }
              ].map(theme => (
                <button
                  key={theme.name}
                  onClick={() => {
                    soundEffects.playClick();
                    setAccentColor(theme.color);
                    setConfig(prev => ({ ...prev, cuiPrimaryColor: theme.oxide }));
                  }}
                  className={`p-2 rounded text-left border text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                    accentColor === theme.color
                      ? 'border-white bg-[#222736] text-white'
                      : 'border-[#272b3a] bg-[#171922] text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: theme.color }} />
                  <span className="truncate">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCopySnippet}
            className="mt-4 flex items-center justify-center gap-2 py-2 px-4 bg-[#1e222e] hover:bg-[#282d3d] border border-[#2b3040] text-xs font-bold text-white rounded transition-colors cursor-pointer"
          >
            {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copiedCode ? 'Código CUI Copiado!' : 'Copiar C# CuiHelper'}
          </button>
        </div>

        {/* Live Mockup Viewport */}
        <div className="lg:col-span-2 bg-[#0c0d10] border border-[#232733] rounded-xl overflow-hidden relative aspect-[16/10] flex items-center justify-center p-6 shadow-2xl">
          <img
            src={domeBackdrop}
            alt="Rust Backdrop"
            className="absolute inset-0 w-full h-full object-cover blur-[2px] opacity-40 select-none"
          />

          {/* Rendered CUI Container */}
          <div
            className="relative z-10 w-full max-w-lg rounded-lg border-2 shadow-2xl overflow-hidden flex flex-col"
            style={{ backgroundColor: panelBg, borderColor: accentColor }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between text-white font-bold"
              style={{ backgroundColor: accentColor }}
            >
              <span style={{ fontSize: `${fontSize}px` }} className="uppercase tracking-wider">
                {headerTitle}
              </span>
              <span className="text-xs bg-black/30 px-2 py-0.5 rounded cursor-pointer">X</span>
            </div>

            {/* Content Mockup */}
            <div className="p-6 flex flex-col gap-4">
              <p className="text-xs text-neutral-300">
                Pré-visualização fiel de como a tela CUI é renderizada no cliente do jogador conectando ao seu servidor Rust.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#101217] p-3 rounded border border-white/10 text-center">
                  <div className="text-xs font-bold text-white">KIT INICIANTE</div>
                  <div className="text-[10px] text-neutral-400 mt-1">Ferramentas de Pedra</div>
                  <button
                    onClick={() => soundEffects.playLootClaim()}
                    className="mt-3 w-full py-1 text-[11px] font-bold text-white rounded transition-colors"
                    style={{ backgroundColor: accentColor }}
                  >
                    Resgatar
                  </button>
                </div>

                <div className="bg-[#101217] p-3 rounded border border-white/10 text-center">
                  <div className="text-xs font-bold text-white">KIT VIP ELITE</div>
                  <div className="text-[10px] text-neutral-400 mt-1">Arma AK-47 + Munição</div>
                  <button
                    onClick={() => soundEffects.playLootClaim()}
                    className="mt-3 w-full py-1 text-[11px] font-bold text-white rounded transition-colors"
                    style={{ backgroundColor: accentColor }}
                  >
                    Resgatar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

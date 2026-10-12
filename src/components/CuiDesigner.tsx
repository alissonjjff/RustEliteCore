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
  const [accentColor, setAccentColor] = useState('#22c55e');
  const [panelBg, setPanelBg] = useState('rgba(12, 20, 14, 0.95)');
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
        Button = { Command = "kit claim starter", Color = "0.15 0.55 0.25 0.9" },
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
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-8 flex flex-col gap-6 font-mono military-grid-bg">
      {/* Intro */}
      <div className="bg-[#0c140e] border border-[#1c3021] p-6 shadow-lg shadow-black/40">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-2 font-mono uppercase tracking-wide">
          <Layout className="w-4 h-4 text-[#22c55e]" />
          [CUI.DESIGNER] {lang === 'pt-BR' ? 'Designer Visual de Telas CUI (Rust In-Game HUD)' : 'Visual Rust CUI Screen Designer'}
        </h2>
        <p className="text-xs text-[#8fa794] font-sans">
          Personalize as cores, títulos e estilo dos menus gráficos exibidos na tela dos jogadores via <span className="font-mono text-[#4ade80]">Oxide.Game.Rust.Cui</span>.
        </p>
      </div>

      {/* Editor & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-[#0c140e] border border-[#1c3021] p-6 flex flex-col gap-4 shadow-lg shadow-black/40">
          <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wide border-b border-[#18291c] pb-2">
            <Palette className="w-4 h-4 text-[#22c55e]" />
            Configurar Estilos HUD
          </h3>

          <div>
            <label className="text-xs font-semibold text-[#8fa794] block mb-1.5 uppercase tracking-wider">Título do Cabeçalho</label>
            <input
              type="text"
              value={headerTitle}
              onChange={e => setHeaderTitle(e.target.value)}
              className="w-full bg-[#080d09] border border-[#213725] px-3 py-2 text-xs text-white focus:border-[#22c55e] focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8fa794] block mb-1.5 uppercase tracking-wider">Tamanho da Fonte ({fontSize}px)</label>
            <input
              type="range"
              min="12"
              max="28"
              value={fontSize}
              onChange={e => setFontSize(parseInt(e.target.value))}
              className="w-full accent-[#22c55e] cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8fa794] block mb-2 uppercase tracking-wider">Padrão Tático de Cores</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Tactical Green', color: '#22c55e', oxide: '0.13 0.77 0.36 0.95' },
                { name: 'Military Olive', color: '#65a30d', oxide: '0.39 0.64 0.05 0.95' },
                { name: 'Radar Green', color: '#10b981', oxide: '0.06 0.72 0.51 0.95' },
                { name: 'Night Vision', color: '#84cc16', oxide: '0.51 0.80 0.08 0.95' },
                { name: 'Tactical Amber', color: '#eab308', oxide: '0.91 0.70 0.03 0.95' },
                { name: 'Desert Khaki', color: '#ca8a04', oxide: '0.79 0.54 0.01 0.95' }
              ].map(theme => (
                <button
                  key={theme.name}
                  onClick={() => {
                    soundEffects.playClick();
                    setAccentColor(theme.color);
                    setConfig(prev => ({ ...prev, cuiPrimaryColor: theme.oxide }));
                  }}
                  className={`p-2 text-left border text-[11px] font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    accentColor === theme.color
                      ? 'border-[#22c55e] bg-[#142817] text-white'
                      : 'border-[#1e3422] bg-[#080d09] text-[#8fa794] hover:text-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: theme.color }} />
                  <span className="truncate">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCopySnippet}
            className="mt-4 flex items-center justify-center gap-2 py-2 px-4 bg-[#122416] hover:bg-[#1a3320] border border-[#223e27] text-xs font-mono font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
          >
            {copiedCode ? <Check className="w-4 h-4 text-[#22c55e]" /> : <Copy className="w-4 h-4 text-[#8fa794]" />}
            {copiedCode ? 'Código CUI Copiado!' : 'Copiar C# CuiHelper'}
          </button>
        </div>

        {/* Live Mockup Viewport */}
        <div className="lg:col-span-2 bg-[#050a06] border-2 border-[#1c3021] overflow-hidden relative aspect-[16/10] flex items-center justify-center p-6 shadow-2xl">
          <img
            src={domeBackdrop}
            alt="Rust Backdrop"
            className="absolute inset-0 w-full h-full object-cover blur-[2px] opacity-35 select-none"
          />

          {/* Rendered CUI Container */}
          <div
            className="relative z-10 w-full max-w-lg border-2 shadow-2xl overflow-hidden flex flex-col font-mono"
            style={{ backgroundColor: panelBg, borderColor: accentColor }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between text-white font-bold"
              style={{ backgroundColor: accentColor, color: '#051408' }}
            >
              <span style={{ fontSize: `${fontSize}px` }} className="uppercase tracking-wider font-mono font-bold">
                {headerTitle}
              </span>
              <span className="text-xs bg-black/40 text-white px-2 py-0.5 cursor-pointer font-mono font-bold">X</span>
            </div>

            {/* Content Mockup */}
            <div className="p-6 flex flex-col gap-4 bg-[#09110a]/90">
              <p className="text-xs text-[#8fa794] font-sans">
                Pré-visualização de HUD renderizado na interface in-game do jogador pelo Oxide CUI.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#050a06] p-3 border border-[#1e3422] text-center">
                  <div className="text-xs font-bold text-white uppercase">[KIT INICIANTE]</div>
                  <div className="text-[10px] text-[#8fa794] mt-1 font-sans">Ferramentas de Pedra</div>
                  <button
                    onClick={() => soundEffects.playLootClaim()}
                    className="mt-3 w-full py-1 text-[11px] font-mono font-bold text-[#061408] transition-colors uppercase tracking-wider cursor-pointer"
                    style={{ backgroundColor: accentColor }}
                  >
                    Resgatar
                  </button>
                </div>

                <div className="bg-[#050a06] p-3 border border-[#1e3422] text-center">
                  <div className="text-xs font-bold text-white uppercase">[KIT VIP ELITE]</div>
                  <div className="text-[10px] text-[#8fa794] mt-1 font-sans">Arma AK-47 + Munição</div>
                  <button
                    onClick={() => soundEffects.playLootClaim()}
                    className="mt-3 w-full py-1 text-[11px] font-mono font-bold text-[#061408] transition-colors uppercase tracking-wider cursor-pointer"
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

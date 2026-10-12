import React, { useState, useEffect, useRef } from 'react';
import { PluginConfig, SupportedLanguage } from '../types/plugin';
import { soundEffects } from '../utils/audio';
import { Send, Terminal, Play, Shield, RefreshCw, X, Crosshair, Sparkles } from 'lucide-react';
import domeBackdrop from '../assets/images/rust_monument_dome_1791719271169.jpg';

interface SimulatorProps {
  config: PluginConfig;
  lang: SupportedLanguage;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isSystem?: boolean;
  timestamp: string;
}

interface ConsoleLog {
  id: string;
  type: 'info' | 'warn' | 'oxide' | 'chat';
  text: string;
  time: string;
}

export const Simulator: React.FC<SimulatorProps> = ({ config, lang }) => {
  const [viewMode, setViewMode] = useState<'hud' | 'console'>('hud');
  const [chatInput, setChatInput] = useState('');
  const [consoleInput, setConsoleInput] = useState('');
  const [isVipGranted, setIsVipGranted] = useState(false);
  const [showCuiMenu, setShowCuiMenu] = useState(false);
  const [homes, setHomes] = useState<Record<string, { x: number; y: number; z: number }>>({
    'base': { x: 142.5, y: 15.0, z: -890.2 }
  });
  const [kitCooldowns, setKitCooldowns] = useState<Record<string, number>>({});
  const [teleportTimer, setTeleportTimer] = useState<number | null>(null);
  const [autoDoorsActive, setAutoDoorsActive] = useState(true);
  const [inventoryStats, setInventoryStats] = useState({
    wood: 1250,
    stone: 800,
    metal: 450,
    sulfur: 120,
    scrap: 75
  });

  const [activeSlot, setActiveSlot] = useState(0);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: config.name,
      text: `<color=#ce422b>[${config.name}]</color> Bem-vindo ao servidor! Digite <color=#f39c12>/kit</color> ou <color=#f39c12>/home</color> para começar.`,
      isSystem: true,
      timestamp: '14:20'
    }
  ]);

  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([
    { id: '1', type: 'oxide', text: `[Oxide] [Info] Loading Oxide Core v2.0.4025...`, time: '14:19:50' },
    { id: '2', type: 'oxide', text: `[Oxide] [Info] ${config.name} v${config.version} by ${config.author} was compiled successfully in 0.042s!`, time: '14:20:01' },
    { id: '3', type: 'info', text: `[Server] Connected player 'GamerBR' [76561198012345678]`, time: '14:20:05' }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  // Tick kit cooldowns
  useEffect(() => {
    const timer = setInterval(() => {
      setKitCooldowns(prev => {
        const next: Record<string, number> = {};
        let changed = false;
        Object.entries(prev).forEach(([key, val]) => {
          if (val > 1) {
            next[key] = val - 1;
            changed = true;
          } else {
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Teleport countdown logic
  useEffect(() => {
    if (teleportTimer === null) return;
    if (teleportTimer > 0) {
      const t = setTimeout(() => setTeleportTimer(teleportTimer - 1), 1000);
      return () => clearTimeout(t);
    } else {
      soundEffects.playTeleport();
      addSystemChat(`<color=#2ecc71>[${config.name}]</color> Teleportado com sucesso para seu destino!`);
      setTeleportTimer(null);
    }
  }, [teleportTimer]);

  const addSystemChat = (formattedText: string) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: config.name,
      text: formattedText,
      isSystem: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const addConsoleLog = (text: string, type: 'info' | 'warn' | 'oxide' | 'chat' = 'info') => {
    const newLog: ConsoleLog = {
      id: Date.now().toString(),
      type,
      text,
      time: new Date().toLocaleTimeString()
    };
    setConsoleLogs(prev => [...prev, newLog]);
  };

  const handleExecuteCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    soundEffects.playClick();

    // User chat message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'GamerBR',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    addConsoleLog(`[Chat] GamerBR: ${trimmed}`, 'chat');

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (cmd === '/kit') {
      if (args.length === 0) {
        if (config.enableCui) {
          setShowCuiMenu(true);
        } else {
          addSystemChat(`<color=#ce422b>[${config.name}]</color> Kits disponíveis: <color=#f39c12>starter, builder, vip</color>. Digite /kit <nome>.`);
        }
      } else {
        handleClaimKit(args[0].toLowerCase());
      }
    } else if (cmd === '/sethome') {
      const homeName = args[0] ? args[0].toLowerCase() : 'home';
      const maxAllowed = isVipGranted ? config.maxHomesVip : config.maxHomesDefault;
      if (Object.keys(homes).length >= maxAllowed && !homes[homeName]) {
        soundEffects.playError();
        addSystemChat(`<color=#e74c3c>[${config.name}]</color> Limite de homes atingido (${maxAllowed}). Adquira VIP para mais!`);
      } else {
        setHomes(prev => ({
          ...prev,
          [homeName]: { x: Math.floor(Math.random() * 500), y: 20, z: Math.floor(Math.random() * 500) }
        }));
        soundEffects.playLootClaim();
        addSystemChat(`<color=#2ecc71>[${config.name}]</color> Home '<color=#f39c12>${homeName}</color>' criada na sua posição!`);
      }
    } else if (cmd === '/home') {
      const homeName = args[0] ? args[0].toLowerCase() : 'base';
      if (!homes[homeName]) {
        soundEffects.playError();
        addSystemChat(`<color=#e74c3c>[${config.name}]</color> Home '<color=#f39c12>${homeName}</color>' não encontrada. Suas homes: ${Object.keys(homes).join(', ') || 'nenhuma'}`);
      } else {
        addSystemChat(`<color=#3498db>[${config.name}]</color> Teleportando para '<color=#f39c12>${homeName}</color>' em ${config.teleportCountdownSeconds}s. Não se mova!`);
        setTeleportTimer(config.teleportCountdownSeconds);
      }
    } else if (cmd === '/ad' || cmd === '/autodoor') {
      soundEffects.playDoor();
      const nextState = !autoDoorsActive;
      setAutoDoorsActive(nextState);
      addSystemChat(`<color=#2ecc71>[${config.name}]</color> AutoDoor: ${nextState ? '<color=#2ecc71>ATIVADO (fechando em 5s)</color>' : '<color=#e74c3c>DESATIVADO</color>'}`);
    } else if (cmd === '/rates' || cmd === '/gather') {
      const rate = isVipGranted ? config.vipGatherMultiplier : config.gatherMultiplier;
      addSystemChat(`<color=#ce422b>[${config.name}]</color> Multiplicador atual: <color=#2ecc71>${rate}x</color>${isVipGranted ? ' (Bônus VIP Ativo)' : ' (Padrão)'}. Auto-Smelt: ${config.enableAutoSmelt ? 'Ligado' : 'Desligado'}.`);
    } else if (cmd === '/gather_sim') {
      // Simulate gathering
      const mult = isVipGranted ? config.vipGatherMultiplier : config.gatherMultiplier;
      const woodGain = Math.floor(100 * mult);
      const stoneGain = Math.floor(50 * mult);
      setInventoryStats(prev => ({
        ...prev,
        wood: prev.wood + woodGain,
        stone: prev.stone + stoneGain
      }));
      soundEffects.playLootClaim();
      addSystemChat(`<color=#2ecc71>[Coleta ${mult}x]</color> +${woodGain} Madeira, +${stoneGain} Pedra coletados!`);
    } else if (cmd === '/help') {
      addSystemChat(`<color=#ce422b>[${config.name}]</color> Comandos: <color=#f39c12>/kit</color>, <color=#f39c12>/sethome <nome></color>, <color=#f39c12>/home <nome></color>, <color=#f39c12>/ad</color>, <color=#f39c12>/rates</color>, <color=#f39c12>/gather_sim</color>`);
    } else {
      addSystemChat(`<color=#e74c3c>[${config.name}]</color> Comando desconhecido. Digite <color=#f39c12>/help</color>`);
    }
  };

  const handleClaimKit = (kitId: string) => {
    const targetKit = config.kits.find(k => k.id === kitId) || config.kits[0];
    if (kitCooldowns[kitId] && kitCooldowns[kitId] > 0) {
      soundEffects.playError();
      addSystemChat(`<color=#e74c3c>[${config.name}]</color> Kit '${targetKit?.name || kitId}' em recarga! Aguarde mais ${kitCooldowns[kitId]} segundos.`);
      return;
    }

    if (targetKit?.permissionRequired && !isVipGranted) {
      soundEffects.playError();
      addSystemChat(`<color=#e74c3c>[${config.name}]</color> Você precisa da permissão <color=#f39c12>rustelitecore.vip</color>! Execute no console: oxide.grant user GamerBR rustelitecore.vip`);
      return;
    }

    soundEffects.playLootClaim();

    if (kitId === 'starter') {
      setInventoryStats(prev => ({ ...prev, wood: prev.wood + 1000, stone: prev.stone + 1000 }));
      setKitCooldowns(prev => ({ ...prev, [kitId]: targetKit?.cooldownSeconds || 120 }));
      addSystemChat(`<color=#2ecc71>[${config.name}]</color> Kit STARTER resgatado! (+Machado de Pedra, +Picareta de Pedra, +3 Bandagens, +1000 Madeira, +1000 Pedra)`);
    } else if (kitId === 'builder') {
      setInventoryStats(prev => ({ ...prev, wood: prev.wood + 5000, stone: prev.stone + 5000, metal: prev.metal + 2000 }));
      setKitCooldowns(prev => ({ ...prev, [kitId]: targetKit?.cooldownSeconds || 600 }));
      addSystemChat(`<color=#2ecc71>[${config.name}]</color> Kit BUILDER PRO resgatado! (+Plano, +Martelo, +5000 Madeira, +5000 Pedra, +2000 Metal, +2 Portas de Metal, +2 Code Locks)`);
    } else if (kitId === 'vip') {
      setInventoryStats(prev => ({ ...prev, scrap: prev.scrap + 250 }));
      setKitCooldowns(prev => ({ ...prev, [kitId]: targetKit?.cooldownSeconds || 1800 }));
      addSystemChat(`<color=#2ecc71>[${config.name}]</color> Kit VIP ELITE resgatado! (+AK-47, +128 Munição 5.56, +4 Seringas, +Máscara de Metal, +Colete de Metal, +Casaco, +Calça, +250 Scrap)`);
    } else {
      setKitCooldowns(prev => ({ ...prev, [kitId]: targetKit?.cooldownSeconds || 300 }));
      addSystemChat(`<color=#2ecc71>[${config.name}]</color> Kit ${targetKit.name} resgatado com sucesso!`);
    }

    setShowCuiMenu(false);
  };

  const handleExecuteConsole = () => {
    const trimmed = consoleInput.trim();
    if (!trimmed) return;
    setConsoleInput('');

    soundEffects.playClick();
    addConsoleLog(`> ${trimmed}`, 'info');

    if (trimmed.startsWith('oxide.grant user GamerBR rustelite.vip') || trimmed.includes('grant') && trimmed.includes('vip')) {
      setIsVipGranted(true);
      addConsoleLog(`[Oxide] User 'GamerBR' (76561198012345678) granted permission 'rustelite.vip'`, 'oxide');
      addSystemChat(`<color=#2ecc71>[Oxide Console]</color> Permissão VIP concedida para GamerBR!`);
    } else if (trimmed.startsWith('oxide.revoke user GamerBR rustelite.vip')) {
      setIsVipGranted(false);
      addConsoleLog(`[Oxide] User 'GamerBR' revoked permission 'rustelite.vip'`, 'oxide');
      addSystemChat(`<color=#e74c3c>[Oxide Console]</color> Permissão VIP revogada.`);
    } else if (trimmed.startsWith('oxide.reload') || trimmed.startsWith('reload')) {
      soundEffects.playLootClaim();
      addConsoleLog(`[Oxide] Unloading plugin ${config.name}...`, 'oxide');
      addConsoleLog(`[Oxide] [Info] ${config.name} v${config.version} was compiled successfully in 0.038s!`, 'oxide');
      addSystemChat(`<color=#3498db>[Oxide]</color> Plugin ${config.name} recarregado no servidor!`);
    } else if (trimmed.startsWith('oxide.version') || trimmed.startsWith('version')) {
      addConsoleLog(`[Oxide] Oxide.Rust Version: 2.0.4025 (Rust Protocol: 2420)`, 'oxide');
    } else {
      addConsoleLog(`[Oxide] Unknown console command: '${trimmed}'. Try: 'oxide.grant user GamerBR rustelite.vip' or 'oxide.reload ${config.name}'`, 'warn');
    }
  };

  // Helper to parse colored tags in chat
  const renderFormattedText = (raw: string) => {
    const parts = raw.split(/(<color=#[a-fA-F0-9]{6}>.*?<\/color>)/g);
    return parts.map((part, index) => {
      const match = part.match(/<color=(#[a-fA-F0-9]{6})>(.*?)<\/color>/);
      if (match) {
        return (
          <span key={index} style={{ color: match[1] }} className="font-semibold">
            {match[2]}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="w-full bg-[#080d09] p-4 lg:p-6 flex flex-col gap-4">
      {/* Viewport Control Bar - Military HUD Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c140e] p-3 border border-[#1c3021] shadow-md shadow-black/40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { soundEffects.playClick(); setViewMode('hud'); }}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              viewMode === 'hud'
                ? 'bg-[#22c55e] text-[#061408] border border-[#4ade80]'
                : 'text-[#8fa794] hover:text-white bg-[#0f1a12] border border-[#1e3422]'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            {lang === 'pt-BR' ? 'Visão do Jogador (HUD)' : 'Player Viewport (HUD)'}
          </button>

          <button
            onClick={() => { soundEffects.playClick(); setViewMode('console'); }}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              viewMode === 'console'
                ? 'bg-[#22c55e] text-[#061408] border border-[#4ade80]'
                : 'text-[#8fa794] hover:text-white bg-[#0f1a12] border border-[#1e3422]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            {lang === 'pt-BR' ? 'Terminal Oxide (RCON)' : 'Oxide Server Console'}
          </button>
        </div>

        {/* Quick Simulator Toggles */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsVipGranted(!isVipGranted);
              addSystemChat(!isVipGranted ? `<color=#2ecc71>[Permissão]</color> Cargo VIP ativado no simulador!` : `<color=#e74c3c>[Permissão]</color> Cargo VIP desativado.`);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer uppercase tracking-wider ${
              isVipGranted
                ? 'bg-[#183a1f] border-[#22c55e] text-[#4ade80]'
                : 'bg-[#0f1a12] border-[#1e3422] text-[#8fa794] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>VIP: {isVipGranted ? (lang === 'pt-BR' ? 'Ativo (5x)' : 'Active (5x)') : (lang === 'pt-BR' ? 'Inativo' : 'No VIP')}</span>
          </button>

          <button
            onClick={() => handleExecuteCommand('/gather_sim')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#0f1a12] hover:bg-[#16271a] border border-[#1e3422] text-[#b2c9b6] transition-colors cursor-pointer uppercase tracking-wider"
          >
            <Play className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>{lang === 'pt-BR' ? 'Simular Mineração' : 'Simulate Gather'}</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playLootClaim();
              addConsoleLog(`[Oxide] Reloading plugin ${config.name}...`, 'oxide');
              addSystemChat(`<color=#2ecc71>[Oxide]</color> Plugin ${config.name} recarregado instantaneamente!`);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-[#0f1a12] hover:bg-[#16271a] border border-[#1e3422] text-[#b2c9b6] cursor-pointer"
            title="Recarregar Plugin / Reload Plugin"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#22c55e]" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'hud' ? (
        <div className="relative w-full aspect-[16/9] min-h-[520px] overflow-hidden border-2 border-[#1c3021] select-none shadow-2xl bg-black">
          {/* Authentic Rust Dome Monument Backdrop */}
          <img
            src={domeBackdrop}
            alt="Rust Environment"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Atmospheric Tactical Green Scrim Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-[#071109]/30 to-black/60 pointer-events-none" />

          {/* Top Compass - Military HUD Style */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-1 bg-black/80 border border-[#223b28] font-mono text-xs text-[#b2c9b6] font-bold tracking-widest shadow-md">
            <span className="text-[#597560]">240</span>
            <span className="text-[#4ade80]">W</span>
            <span className="text-[#809a86]">285</span>
            <span className="text-white">NW</span>
            <span className="text-[#22c55e]">N</span>
            <span className="text-[#809a86]">035</span>
            <span className="text-white">NE</span>
          </div>

          {/* Active Teleport Notification */}
          {teleportTimer !== null && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#0c160f]/95 border-2 border-[#22c55e] px-6 py-3 shadow-2xl flex items-center gap-3 animate-pulse font-mono">
              <Sparkles className="w-5 h-5 text-[#22c55e]" />
              <div className="text-center">
                <div className="text-xs uppercase tracking-wider text-[#8fa794] font-bold">[TELEPORTE EM ANDAMENTO]</div>
                <div className="text-lg font-black text-white">
                  {teleportTimer}s <span className="text-xs font-normal text-[#8fa794]">para o destino</span>
                </div>
              </div>
            </div>
          )}

          {/* In-Game Chat Box (Bottom-Left) */}
          <div className="absolute bottom-20 left-4 w-96 max-w-[calc(100%-2rem)] flex flex-col gap-2 z-10 font-mono">
            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['/kit', '/sethome base', '/home base', '/ad', '/rates'].map(cmd => (
                <button
                  key={cmd}
                  onClick={() => handleExecuteCommand(cmd)}
                  className="px-2 py-0.5 text-[11px] font-mono bg-black/85 hover:bg-[#22c55e] hover:text-[#061408] text-[#b2c9b6] border border-[#223b28] transition-colors cursor-pointer"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Chat Stream Messages */}
            <div className="h-44 overflow-y-auto flex flex-col gap-1.5 p-2.5 bg-black/80 border border-[#223b28] text-xs font-mono text-[#e1eee4] shadow-lg">
              {chatMessages.map(msg => (
                <div key={msg.id} className="leading-snug break-words">
                  {!msg.isSystem && (
                    <span className="text-[#8fa794] mr-1.5">[{msg.timestamp}] <span className="text-[#4ade80]">GamerBR:</span></span>
                  )}
                  {renderFormattedText(msg.text)}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="flex items-center gap-1.5 bg-black/90 border border-[#223b28] p-1">
              <input
                type="text"
                placeholder={lang === 'pt-BR' ? "Digite /kit, /home ou comando..." : "Type /kit, /home or command..."}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleExecuteCommand(chatInput);
                    setChatInput('');
                  }
                }}
                className="flex-1 bg-transparent px-2.5 py-1 text-xs text-white placeholder-[#58735f] font-mono focus:outline-none"
              />
              <button
                onClick={() => {
                  handleExecuteCommand(chatInput);
                  setChatInput('');
                }}
                className="p-1.5 text-[#b2c9b6] hover:text-white hover:bg-[#16271a] transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#22c55e]" />
              </button>
            </div>
          </div>

          {/* Rust Hotbar (Bottom Center) - Military HUD Grid */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 bg-black/85 border border-[#223b28] shadow-2xl">
            {[
              { name: 'AK-47', code: 'rifle.ak', qty: 1, ammo: '30/30' },
              { name: 'Seringa Médica', code: 'syringe.medical', qty: 4, ammo: '' },
              { name: 'Plano de Base', code: 'building.planner', qty: 1, ammo: '' },
              { name: 'Machado Pedra', code: 'stone.hatchet', qty: 1, ammo: '100%' },
              { name: 'Madeira', code: 'wood', qty: inventoryStats.wood, ammo: '' },
              { name: 'Scrap', code: 'scrap', qty: inventoryStats.scrap, ammo: '' },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => { soundEffects.playClick(); setActiveSlot(idx); }}
                className={`relative w-14 h-14 flex flex-col justify-between p-1 cursor-pointer transition-colors ${
                  activeSlot === idx
                    ? 'border-2 border-[#22c55e] bg-[#142817]/70'
                    : 'border border-[#203624] bg-black/60 hover:bg-[#101b13]'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-[#8fa794] leading-none">{idx + 1}</span>
                <span className="text-[10px] font-mono font-medium text-[#d7e6dc] leading-tight truncate text-center">
                  {item.name}
                </span>
                <div className="flex justify-between items-center text-[9px] font-mono text-[#8fa794]">
                  <span>{item.ammo}</span>
                  <span className="font-bold text-[#4ade80]">x{item.qty}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Player Vitals HUD (Bottom Right) */}
          <div className="absolute bottom-3 right-4 flex flex-col gap-1.5 w-44 font-mono text-xs">
            {/* Health Bar */}
            <div className="flex items-center justify-between px-2 py-1 bg-black/85 border border-[#223b28]">
              <span className="font-bold text-[#8fa794]">HP</span>
              <span className="font-bold text-[#22c55e] tabular-nums">100</span>
              <div className="w-16 h-2 bg-[#0c160f] border border-[#1b3120] overflow-hidden">
                <div className="w-full h-full bg-[#22c55e]" />
              </div>
            </div>

            {/* Hydration Bar */}
            <div className="flex items-center justify-between px-2 py-1 bg-black/85 border border-[#223b28]">
              <span className="font-bold text-[#8fa794]">H2O</span>
              <span className="font-bold text-[#4ade80] tabular-nums">250</span>
              <div className="w-16 h-2 bg-[#0c160f] border border-[#1b3120] overflow-hidden">
                <div className="w-full h-full bg-[#4ade80]" />
              </div>
            </div>

            {/* Hunger Bar */}
            <div className="flex items-center justify-between px-2 py-1 bg-black/85 border border-[#223b28]">
              <span className="font-bold text-[#8fa794]">FOOD</span>
              <span className="font-bold text-[#86efac] tabular-nums">500</span>
              <div className="w-16 h-2 bg-[#0c160f] border border-[#1b3120] overflow-hidden">
                <div className="w-full h-full bg-[#86efac]" />
              </div>
            </div>
          </div>

          {/* Real In-Game CUI Interface Overlay (Opens with /kit) */}
          {showCuiMenu && (
            <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-150">
              <div className="relative w-full max-w-xl bg-[#0c150e] border-2 border-[#22c55e] shadow-2xl overflow-hidden flex flex-col font-mono">
                {/* CUI Header */}
                <div className="bg-[#122416] border-b border-[#22c55e] px-4 py-3 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#22c55e]" />
                    <span className="font-bold text-xs uppercase tracking-wider text-[#4ade80]">
                      [CUI.MENU] - {config.name.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => { soundEffects.playClick(); setShowCuiMenu(false); }}
                    className="p-1 hover:bg-[#1a3320] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4 text-[#b2c9b6]" />
                  </button>
                </div>

                {/* CUI Content Body */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {config.kits.map(kit => {
                    const isCooldown = (kitCooldowns[kit.id] || 0) > 0;
                    const requiresVip = kit.permissionRequired && !isVipGranted;

                    return (
                      <div
                        key={kit.id}
                        className="bg-[#080d09] border border-[#1e3422] p-3 flex flex-col justify-between gap-3 font-mono"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1 border-b border-[#18291c] pb-1">
                            <span className="font-bold text-xs text-white">{kit.name}</span>
                            {kit.permissionRequired && (
                              <span className="text-[10px] bg-[#142918] text-[#4ade80] border border-[#234e2c] px-1 font-bold">
                                VIP
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#8fa794] line-clamp-2 leading-relaxed font-sans">
                            {kit.description}
                          </p>

                          {/* Kit Items Quick Preview */}
                          <div className="mt-2 pt-2 border-t border-[#18291c] flex flex-col gap-1 text-[10px] text-[#b2c9b6]">
                            {kit.items.slice(0, 3).map((it, i) => (
                              <div key={i} className="flex justify-between">
                                <span className="truncate">{it.name}</span>
                                <span className="text-[#4ade80] font-bold">x{it.amount}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          disabled={isCooldown || Boolean(requiresVip)}
                          onClick={() => handleClaimKit(kit.id)}
                          className={`w-full py-2 px-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            requiresVip
                              ? 'bg-[#0f1710] text-[#556d5b] cursor-not-allowed border border-[#1b2b1d]'
                              : isCooldown
                              ? 'bg-[#1a1c11] text-[#eab308] border border-[#eab308]/40 cursor-not-allowed'
                              : 'bg-[#22c55e] hover:bg-[#16a34a] text-[#061408] border border-[#4ade80]'
                          }`}
                        >
                          {requiresVip
                            ? 'Requer VIP'
                            : isCooldown
                            ? `${kitCooldowns[kit.id]}s`
                            : 'Resgatar Kit'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* CUI Footer */}
                <div className="bg-[#080d09] px-4 py-2.5 border-t border-[#18291c] flex items-center justify-between text-[11px] text-[#8fa794]">
                  <span>Renderizado via Oxide CUI (CuiHelper.AddUi)</span>
                  <button
                    onClick={() => { soundEffects.playClick(); setShowCuiMenu(false); }}
                    className="px-3 py-1 bg-[#122316] hover:bg-[#18311f] border border-[#223e27] text-white font-medium text-xs transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Server Oxide RCON Console View - High Tech Military Green Phosphor CRT */
        <div className="w-full aspect-[16/9] min-h-[520px] bg-[#050a06] border-2 border-[#1c3021] flex flex-col overflow-hidden font-mono text-xs shadow-2xl military-scanline">
          {/* Console Header */}
          <div className="bg-[#0b140d] px-4 py-2.5 border-b border-[#1c3021] flex items-center justify-between text-[#8fa794]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#22c55e]" />
              <span className="font-bold text-white tracking-wide">[RCON.TERMINAL] Oxide Dedicated Server 127.0.0.1:28015</span>
            </div>
            <span className="text-[11px] text-[#55705d]">Protocol 2420 · Oxide 2.0.4025</span>
          </div>

          {/* Console Output Log */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-1.5 text-[#b2c9b6]">
            {consoleLogs.map(log => (
              <div key={log.id} className="leading-relaxed">
                <span className="text-[#496350] mr-2">[{log.time}]</span>
                {log.type === 'oxide' && <span className="text-[#22c55e] font-bold mr-1">[Oxide]</span>}
                {log.type === 'warn' && <span className="text-[#eab308] font-bold mr-1">[Warning]</span>}
                {log.type === 'chat' && <span className="text-[#4ade80] font-bold mr-1">[Chat]</span>}
                <span className={log.type === 'warn' ? 'text-[#eab308]' : 'text-[#d7e6dc]'}>{log.text}</span>
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>

          {/* Console Input Bar */}
          <div className="bg-[#09110a] p-2.5 border-t border-[#1c3021] flex items-center gap-2">
            <span className="text-[#22c55e] font-bold text-sm">&gt;</span>
            <input
              type="text"
              placeholder="Digite comando RCON (ex: oxide.grant user GamerBR rustelite.vip, oxide.reload RustEliteCore)..."
              value={consoleInput}
              onChange={e => setConsoleInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleExecuteConsole();
              }}
              className="flex-1 bg-transparent text-[#e1eee4] placeholder-[#4f6755] focus:outline-none font-mono"
            />
            <button
              onClick={handleExecuteConsole}
              className="px-4 py-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-[#061408] font-mono font-bold uppercase tracking-wider transition-colors text-xs cursor-pointer border border-[#4ade80]"
            >
              Executar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

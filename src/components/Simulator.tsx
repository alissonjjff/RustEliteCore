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
    if (kitCooldowns[kitId] && kitCooldowns[kitId] > 0) {
      soundEffects.playError();
      addSystemChat(`<color=#e74c3c>[${config.name}]</color> Kit '${kitId}' em recarga! Aguarde mais ${kitCooldowns[kitId]} segundos.`);
      return;
    }

    if (kitId === 'vip' && !isVipGranted) {
      soundEffects.playError();
      addSystemChat(`<color=#e74c3c>[${config.name}]</color> Você precisa da permissão <color=#f39c12>rustelite.vip</color>! Execute no console: oxide.grant user GamerBR rustelite.vip`);
      return;
    }

    soundEffects.playLootClaim();

    if (kitId === 'starter') {
      setInventoryStats(prev => ({ ...prev, wood: prev.wood + 1000, stone: prev.stone + 1000 }));
      setKitCooldowns(prev => ({ ...prev, [kitId]: 120 }));
      addSystemChat(`<color=#2ecc71>[${config.name}]</color> Kit STARTER resgatado! (+Machado, +Picareta, +1000 Madeira/Pedra)`);
    } else if (kitId === 'builder') {
      setInventoryStats(prev => ({ ...prev, wood: prev.wood + 5000, stone: prev.stone + 5000, metal: prev.metal + 2000 }));
      setKitCooldowns(prev => ({ ...prev, [kitId]: 600 }));
      addSystemChat(`<color=#2ecc71>[${config.name}]</color> Kit BUILDER resgatado! (+Plano, +Martelo, +Recursos de Base)`);
    } else if (kitId === 'vip') {
      setInventoryStats(prev => ({ ...prev, scrap: prev.scrap + 250 }));
      setKitCooldowns(prev => ({ ...prev, [kitId]: 1800 }));
      addSystemChat(`<color=#2ecc71>[${config.name}]</color> Kit VIP ELITE resgatado! (+AK-47, +128 Munição 5.56, +Seringas, +250 Scrap)`);
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
    <div className="w-full bg-[#0c0d10] p-4 lg:p-6 flex flex-col gap-4">
      {/* Viewport Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#14161d] p-3 rounded-lg border border-[#232732]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { soundEffects.playClick(); setViewMode('hud'); }}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              viewMode === 'hud'
                ? 'bg-[#ce422b] text-white'
                : 'text-neutral-400 hover:text-white bg-[#1b1e27]'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            {lang === 'pt-BR' ? 'Visão do Jogador (HUD)' : 'Player Viewport (HUD)'}
          </button>

          <button
            onClick={() => { soundEffects.playClick(); setViewMode('console'); }}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              viewMode === 'console'
                ? 'bg-[#ce422b] text-white'
                : 'text-neutral-400 hover:text-white bg-[#1b1e27]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            {lang === 'pt-BR' ? 'Terminal Oxide (RCON)' : 'Oxide Server Console'}
          </button>
        </div>

        {/* Quick Simulator Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsVipGranted(!isVipGranted);
              addSystemChat(!isVipGranted ? `<color=#2ecc71>[Permissão]</color> Cargo VIP ativado no simulador!` : `<color=#e74c3c>[Permissão]</color> Cargo VIP desativado.`);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
              isVipGranted
                ? 'bg-[#f39c12]/20 border-[#f39c12] text-[#f39c12]'
                : 'bg-[#1b1e27] border-[#2b2f3d] text-neutral-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>VIP: {isVipGranted ? (lang === 'pt-BR' ? 'Ativo (5x)' : 'Granted (5x)') : (lang === 'pt-BR' ? 'Não Concedido' : 'No VIP')}</span>
          </button>

          <button
            onClick={() => handleExecuteCommand('/gather_sim')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-[#1b1e27] hover:bg-[#252a36] border border-[#2b2f3d] text-neutral-200 transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-[#ce422b]" />
            <span>{lang === 'pt-BR' ? 'Simular Mineração' : 'Simulate Gather'}</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playLootClaim();
              addConsoleLog(`[Oxide] Reloading plugin ${config.name}...`, 'oxide');
              addSystemChat(`<color=#3498db>[Oxide]</color> Plugin ${config.name} recarregado instantaneamente!`);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded bg-[#1b1e27] hover:bg-[#252a36] border border-[#2b2f3d] text-neutral-300"
            title="Recarregar Plugin / Reload Plugin"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'hud' ? (
        <div className="relative w-full aspect-[16/9] min-h-[520px] rounded-xl overflow-hidden border border-[#252936] select-none shadow-2xl bg-black">
          {/* Authentic Rust Dome Monument Backdrop */}
          <img
            src={domeBackdrop}
            alt="Rust Environment"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Atmospheric Tint Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50 pointer-events-none" />

          {/* Top Compass */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded font-mono text-xs text-neutral-300 font-bold tracking-widest shadow-md">
            <span className="text-neutral-500">240</span>
            <span className="text-[#ce422b]">W</span>
            <span className="text-neutral-400">285</span>
            <span className="text-white">NW</span>
            <span className="text-[#ce422b]">N</span>
            <span className="text-neutral-400">035</span>
            <span className="text-white">NE</span>
          </div>

          {/* Active Teleport Notification */}
          {teleportTimer !== null && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#1e2029]/95 border-2 border-[#ce422b] px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-pulse">
              <Sparkles className="w-5 h-5 text-[#ce422b]" />
              <div className="text-center">
                <div className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Teleporte em Andamento</div>
                <div className="text-lg font-black text-white">
                  {teleportTimer}s <span className="text-xs font-normal text-neutral-300">para o destino</span>
                </div>
              </div>
            </div>
          )}

          {/* In-Game Chat Box (Bottom-Left) */}
          <div className="absolute bottom-20 left-4 w-96 max-w-[calc(100%-2rem)] flex flex-col gap-2 z-10">
            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['/kit', '/sethome base', '/home base', '/ad', '/rates'].map(cmd => (
                <button
                  key={cmd}
                  onClick={() => handleExecuteCommand(cmd)}
                  className="px-2 py-0.5 text-[11px] font-mono bg-black/75 hover:bg-[#ce422b] text-neutral-300 hover:text-white rounded border border-white/15 backdrop-blur transition-colors cursor-pointer"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Chat Stream Messages */}
            <div className="h-44 overflow-y-auto flex flex-col gap-1.5 p-2.5 bg-black/70 backdrop-blur-md rounded border border-white/10 text-xs font-mono text-white shadow-lg">
              {chatMessages.map(msg => (
                <div key={msg.id} className="leading-snug break-words">
                  {!msg.isSystem && (
                    <span className="text-neutral-400 mr-1.5">[{msg.timestamp}] <span className="text-[#3498db]">GamerBR:</span></span>
                  )}
                  {renderFormattedText(msg.text)}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur border border-white/20 rounded p-1">
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
                className="flex-1 bg-transparent px-2.5 py-1 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none"
              />
              <button
                onClick={() => {
                  handleExecuteCommand(chatInput);
                  setChatInput('');
                }}
                className="p-1.5 text-neutral-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rust Hotbar (Bottom Center) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 bg-black/80 backdrop-blur-md border border-white/15 rounded-md shadow-2xl">
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
                className={`relative w-14 h-14 rounded flex flex-col justify-between p-1 cursor-pointer transition-all ${
                  activeSlot === idx
                    ? 'border-2 border-[#ce422b] bg-white/15'
                    : 'border border-white/10 bg-black/50 hover:bg-white/10'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-neutral-400 leading-none">{idx + 1}</span>
                <span className="text-[10px] font-sans font-medium text-neutral-200 leading-tight truncate text-center">
                  {item.name}
                </span>
                <div className="flex justify-between items-center text-[9px] font-mono text-neutral-300">
                  <span>{item.ammo}</span>
                  <span className="font-bold text-white">x{item.qty}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Player Vitals HUD (Bottom Right) */}
          <div className="absolute bottom-3 right-4 flex flex-col gap-1.5 w-44 font-mono text-xs">
            {/* Health Bar */}
            <div className="flex items-center justify-between px-2 py-1 bg-black/75 backdrop-blur border border-white/15 rounded">
              <span className="font-bold text-neutral-300">HP</span>
              <span className="font-bold text-[#2ecc71] tabular-nums">100</span>
              <div className="w-16 h-2 bg-neutral-800 rounded-sm overflow-hidden">
                <div className="w-full h-full bg-[#2ecc71]" />
              </div>
            </div>

            {/* Hydration Bar */}
            <div className="flex items-center justify-between px-2 py-1 bg-black/75 backdrop-blur border border-white/15 rounded">
              <span className="font-bold text-neutral-300">H2O</span>
              <span className="font-bold text-[#3498db] tabular-nums">250</span>
              <div className="w-16 h-2 bg-neutral-800 rounded-sm overflow-hidden">
                <div className="w-full h-full bg-[#3498db]" />
              </div>
            </div>

            {/* Hunger Bar */}
            <div className="flex items-center justify-between px-2 py-1 bg-black/75 backdrop-blur border border-white/15 rounded">
              <span className="font-bold text-neutral-300">FOOD</span>
              <span className="font-bold text-[#e67e22] tabular-nums">500</span>
              <div className="w-16 h-2 bg-neutral-800 rounded-sm overflow-hidden">
                <div className="w-full h-full bg-[#e67e22]" />
              </div>
            </div>
          </div>

          {/* Real In-Game CUI Interface Overlay (Opens with /kit) */}
          {showCuiMenu && (
            <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
              <div className="relative w-full max-w-xl bg-[#181a20]/95 border-2 border-[#ce422b] rounded-lg shadow-2xl overflow-hidden flex flex-col">
                {/* CUI Header */}
                <div className="bg-[#ce422b] px-4 py-3 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span className="font-black text-sm uppercase tracking-wider">
                      MENU DE KITS - {config.name.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => { soundEffects.playClick(); setShowCuiMenu(false); }}
                    className="p-1 hover:bg-black/20 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
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
                        className="bg-[#121318] border border-[#2c303d] rounded p-3 flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-xs text-white">{kit.name}</span>
                            {kit.permissionRequired && (
                              <span className="text-[10px] bg-[#f39c12]/20 text-[#f39c12] px-1.5 py-0.5 rounded font-mono font-bold">
                                VIP
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                            {kit.description}
                          </p>

                          {/* Kit Items Quick Preview */}
                          <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-col gap-1 text-[10px] font-mono text-neutral-300">
                            {kit.items.slice(0, 3).map((it, i) => (
                              <div key={i} className="flex justify-between">
                                <span className="truncate">{it.name}</span>
                                <span className="text-[#ce422b] font-bold">x{it.amount}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          disabled={isCooldown || Boolean(requiresVip)}
                          onClick={() => handleClaimKit(kit.id)}
                          className={`w-full py-2 px-3 text-xs font-bold rounded uppercase transition-colors cursor-pointer ${
                            requiresVip
                              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                              : isCooldown
                              ? 'bg-[#e74c3c]/20 text-[#e74c3c] border border-[#e74c3c]/40 cursor-not-allowed'
                              : 'bg-[#ce422b] hover:bg-[#b5341f] text-white shadow-md'
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
                <div className="bg-[#111216] px-4 py-2.5 border-t border-[#232732] flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Interface renderizada via Oxide CUI (CuiHelper.AddUi)</span>
                  <button
                    onClick={() => { soundEffects.playClick(); setShowCuiMenu(false); }}
                    className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-medium text-xs transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Server Oxide RCON Console View */
        <div className="w-full aspect-[16/9] min-h-[520px] bg-[#0b0c0f] border border-[#232732] rounded-xl flex flex-col overflow-hidden font-mono text-xs shadow-2xl">
          {/* Console Header */}
          <div className="bg-[#14161f] px-4 py-2.5 border-b border-[#232732] flex items-center justify-between text-neutral-300">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#ce422b]" />
              <span className="font-bold">Oxide RCON Terminal — Rust Dedicated Server 127.0.0.1:28015</span>
            </div>
            <span className="text-[11px] text-neutral-500">Protocol 2420 · Oxide 2.0.4025</span>
          </div>

          {/* Console Output Log */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-1.5 text-neutral-300">
            {consoleLogs.map(log => (
              <div key={log.id} className="leading-relaxed">
                <span className="text-neutral-600 mr-2">[{log.time}]</span>
                {log.type === 'oxide' && <span className="text-[#ce422b] font-bold mr-1">[Oxide]</span>}
                {log.type === 'warn' && <span className="text-[#f39c12] font-bold mr-1">[Warning]</span>}
                {log.type === 'chat' && <span className="text-[#3498db] font-bold mr-1">[Chat]</span>}
                <span className={log.type === 'warn' ? 'text-[#f39c12]' : 'text-neutral-200'}>{log.text}</span>
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>

          {/* Console Input Bar */}
          <div className="bg-[#12141c] p-2.5 border-t border-[#232732] flex items-center gap-2">
            <span className="text-[#ce422b] font-bold">&gt;</span>
            <input
              type="text"
              placeholder="Digite comando RCON (ex: oxide.grant user GamerBR rustelite.vip, oxide.reload RustEliteCore)..."
              value={consoleInput}
              onChange={e => setConsoleInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleExecuteConsole();
              }}
              className="flex-1 bg-transparent text-white placeholder-neutral-600 focus:outline-none"
            />
            <button
              onClick={handleExecuteConsole}
              className="px-4 py-1.5 bg-[#ce422b] hover:bg-[#b73722] text-white font-bold rounded transition-colors text-xs"
            >
              Executar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

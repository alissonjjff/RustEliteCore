import React, { useState, useEffect, useRef } from 'react';
import { PluginConfig, SupportedLanguage } from '../types/plugin';
import { soundEffects } from '../utils/audio';
import { Send, Terminal, Play, Shield, RefreshCw, X, Crosshair, Sparkles, ShieldCheck, Lock, Layers } from 'lucide-react';
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
  const [hasBuildingPrivilege, setHasBuildingPrivilege] = useState<boolean>(true);
  const [isOnFoundation, setIsOnFoundation] = useState<boolean>(true);
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
      const homeName = args[0] ? args[0].toLowerCase() : 'base';
      const requireTC = config.requireBuildingPrivilege !== false;

      // Verificação de privilégio de construção na base (TC / Tool Cupboard)
      if (requireTC && !hasBuildingPrivilege) {
        soundEffects.playError();
        addSystemChat(`<color=#e74c3c>[${config.name}]</color> <color=#ff6b6b>Construção Bloqueada:</color> Você não possui autorização no Armário (Building Privilege / TC) para criar uma home nesta base!`);
        addConsoleLog(`[Homes] GamerBR tentou executar /sethome '${homeName}' em base não autorizada (Building Blocked)`, 'warn');
        return;
      }

      // Verificação se exige estar em cima de uma Fundação
      const requireFoundation = config.requireFoundationOnHome === true;
      if (requireFoundation && !isOnFoundation) {
        soundEffects.playError();
        addSystemChat(`<color=#e74c3c>[${config.name}]</color> <color=#ff6b6b>Fundação Necessária:</color> Você precisa estar pisando em cima de uma Fundação (Foundation) para salvar esta home!`);
        addConsoleLog(`[Homes] GamerBR tentou executar /sethome '${homeName}' fora de uma fundação (Exigência ativa)`, 'warn');
        return;
      }

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
        addSystemChat(`<color=#2ecc71>[${config.name}]</color> Home '<color=#f39c12>${homeName}</color>' criada na sua base com sucesso! (${Object.keys(homes).length + (homes[homeName] ? 0 : 1)}/${maxAllowed})`);
        addConsoleLog(`[Homes] GamerBR definiu /sethome '${homeName}' com sucesso na base autorizada.`, 'info');
      }
    } else if (cmd === '/home') {
      if (!args[0] || args[0].toLowerCase() === 'list') {
        const homeList = Object.keys(homes);
        const maxAllowed = isVipGranted ? config.maxHomesVip : config.maxHomesDefault;
        if (homeList.length === 0) {
          addSystemChat(`<color=#e74c3c>[${config.name}]</color> Você não possui nenhuma home salva. Use <color=#f39c12>/sethome <nome></color>.`);
        } else {
          addSystemChat(`<color=#2ecc71>[${config.name}]</color> Suas homes salvas (${homeList.length}/${maxAllowed}): <color=#f39c12>${homeList.join(', ')}</color>. Digite <color=#3498db>/home <nome></color> para teleportar.`);
        }
        return;
      }
      const homeName = args[0].toLowerCase();
      if (!homes[homeName]) {
        soundEffects.playError();
        addSystemChat(`<color=#e74c3c>[${config.name}]</color> Home '<color=#f39c12>${homeName}</color>' não encontrada. Suas homes: ${Object.keys(homes).join(', ') || 'nenhuma'}`);
      } else {
        addSystemChat(`<color=#3498db>[${config.name}]</color> Teleportando para '<color=#f39c12>${homeName}</color>' em ${config.teleportCountdownSeconds}s. Não se mova!`);
        setTeleportTimer(config.teleportCountdownSeconds);
      }
    } else if (cmd === '/delhome' || cmd === '/removehome') {
      const homeName = args[0] ? args[0].toLowerCase() : '';
      if (!homeName) {
        soundEffects.playError();
        addSystemChat(`<color=#e74c3c>[${config.name}]</color> Uso correto: <color=#f39c12>/delhome <nome></color>`);
      } else if (!homes[homeName]) {
        soundEffects.playError();
        addSystemChat(`<color=#e74c3c>[${config.name}]</color> Home '<color=#f39c12>${homeName}</color>' não existe para remover.`);
      } else {
        const updated = { ...homes };
        delete updated[homeName];
        setHomes(updated);
        soundEffects.playClick();
        addSystemChat(`<color=#2ecc71>[${config.name}]</color> Home '<color=#f39c12>${homeName}</color>' deletada com sucesso! Vaga liberada no seu limite.`);
      }
    } else if (cmd === '/canceltp') {
      if (teleportTimer !== null) {
        setTeleportTimer(null);
        addSystemChat(`<color=#e74c3c>[${config.name}]</color> Teleporte cancelado com sucesso.`);
      } else {
        addSystemChat(`<color=#7f9984>[${config.name}]</color> Nenhum teleporte ativo para cancelar.`);
      }
    } else if (cmd === '/ad' || cmd === '/autodoor') {
      soundEffects.playDoor();
      const nextState = !autoDoorsActive;
      setAutoDoorsActive(nextState);
      addSystemChat(`<color=#2ecc71>[${config.name}]</color> AutoDoor: ${nextState ? '<color=#2ecc71>ATIVADO (fechando em 5s)</color>' : '<color=#e74c3c>DESATIVADO</color>'}`);
    } else if (cmd === '/rates' || cmd === '/taxas' || cmd === '/gather') {
      if (!config.enableGatherMultiplier) {
        soundEffects.playError();
        addSystemChat(`<color=#e74c3c>[${config.name}]</color> O módulo de Taxas de Coleta (Gather Rates) está <color=#e74c3c>DESATIVADO</color> no editor.`);
        return;
      }
      const rate = isVipGranted ? config.vipGatherMultiplier : config.gatherMultiplier;
      addSystemChat(`<color=#ce422b>[${config.name}]</color> Multiplicador atual: <color=#2ecc71>${rate}x</color>${isVipGranted ? ' <color=#f1c40f>[Bônus VIP Ativo]</color>' : ' <color=#7f8c8d>[Padrão]</color>'}. Padrão: <color=#f39c12>${config.gatherMultiplier}x</color> | VIP: <color=#f1c40f>${config.vipGatherMultiplier}x</color>.`);
      addSystemChat(`<color=#ce422b>[${config.name}]</color> Eficiência de Ferramentas: ${config.enableFullGatherEfficiency ? '<color=#2ecc71>FORÇADA 100% (Todas as ferramentas rendem 100%)</color>' : '<color=#e67e22>VANILLA PROGRESSIVO (Britadeira=100%, Picareta Metal=77.5%, Pedra=64.5%)</color>'}. Auto-Smelt: ${config.enableAutoSmelt ? '<color=#2ecc71>LIGADO</color>' : '<color=#e74c3c>DESLIGADO</color>'}.`);
    } else if (cmd === '/gather_sim' || cmd === '/farm' || cmd === '/minar') {
      if (!config.enableGatherMultiplier) {
        soundEffects.playError();
        addSystemChat(`<color=#e74c3c>[${config.name}]</color> O módulo de Taxas de Coleta está <color=#e74c3c>DESATIVADO</color> nas configurações.`);
        return;
      }
      
      const mult = isVipGranted ? config.vipGatherMultiplier : config.gatherMultiplier;
      const targetTool = (args[0] || 'jackhammer').toLowerCase();
      
      let toolName = 'Britadeira (Jackhammer)';
      let baseYield = 1000;
      let nativeEfficiency = '100%';
      let hitsYield = 750;
      let bonusYield = 250;

      if (targetTool.includes('metal') || targetTool.includes('pickaxe')) {
        toolName = 'Picareta de Metal';
        nativeEfficiency = '77.5%';
        if (config.enableFullGatherEfficiency) {
          baseYield = 1000;
          hitsYield = 750;
          bonusYield = 250;
        } else {
          baseYield = 775;
          hitsYield = 581;
          bonusYield = 194;
        }
      } else if (targetTool.includes('stone') || targetTool.includes('pedra')) {
        toolName = 'Picareta de Pedra';
        nativeEfficiency = '64.5%';
        if (config.enableFullGatherEfficiency) {
          baseYield = 1000;
          hitsYield = 750;
          bonusYield = 250;
        } else {
          baseYield = 645;
          hitsYield = 484;
          bonusYield = 161;
        }
      } else if (targetTool.includes('rock')) {
        toolName = 'Pedra Inicial (Rock)';
        nativeEfficiency = '40.0%';
        if (config.enableFullGatherEfficiency) {
          baseYield = 1000;
          hitsYield = 1000;
          bonusYield = 0;
        } else {
          baseYield = 400;
          hitsYield = 400;
          bonusYield = 0;
        }
      } else {
        // Jackhammer / Britadeira
        toolName = 'Britadeira / Jackhammer';
        nativeEfficiency = '100%';
        baseYield = 1000;
        hitsYield = 750;
        bonusYield = 250;
      }

      const totalStoneGain = Math.round(baseYield * mult);
      const hitsStoneGain = Math.round(hitsYield * mult);
      const bonusStoneGain = Math.round(bonusYield * mult);

      setInventoryStats(prev => ({
        ...prev,
        stone: prev.stone + totalStoneGain,
        metal: prev.metal + (config.enableAutoSmelt ? Math.round(200 * mult) : 0),
      }));
      soundEffects.playLootClaim();

      addSystemChat(`<color=#ce422b>[${config.name}]</color> <color=#4ade80>⛏️ Mineração de 1 Nó de Pedra (1.000 HP Vanilla)</color>`);
      addSystemChat(`  • Ferramenta: <color=#f1c40f>${toolName}</color> (Eficiência Vanilla: ${nativeEfficiency})`);
      addSystemChat(`  • Modo Forçar 100%: ${config.enableFullGatherEfficiency ? '<color=#4ade80>ATIVADO (Forçado 100% Flat)</color>' : '<color=#86efac>DESATIVADO (Sistema Natural de Eficiência Ativo)</color>'}`);
      addSystemChat(`  • Rendimento: <color=#2ecc71>+${totalStoneGain.toLocaleString()} Pedra</color> coletadas! (${hitsStoneGain.toLocaleString()} nas batidas + ${bonusStoneGain.toLocaleString()} bônus final OnDispenserBonus)`);
    } else if (cmd === '/tc' || cmd === '/buildingprivilege') {
      const next = !hasBuildingPrivilege;
      setHasBuildingPrivilege(next);
      if (next) {
        soundEffects.playClick();
        addSystemChat(`<color=#2ecc71>[Base / TC]</color> Status alterado para: <color=#a7f3d0>BUILDING PRIVILEGE</color> (Autorizado no Armário da base).`);
        addConsoleLog(`[Player] GamerBR obteve autorização no TC (Building Privilege).`, 'info');
      } else {
        soundEffects.playError();
        addSystemChat(`<color=#e74c3c>[Base / TC]</color> Status alterado para: <color=#ff6b6b>BUILDING BLOCKED</color> (Sem permissão no Armário desta base!).`);
        addConsoleLog(`[Player] GamerBR está agora sem permissão na base (Building Blocked).`, 'warn');
      }
    } else if (cmd === '/foundation' || cmd === '/fundacao') {
      const next = !isOnFoundation;
      setIsOnFoundation(next);
      if (next) {
        soundEffects.playClick();
        addSystemChat(`<color=#2ecc71>[Posição / Piso]</color> Você agora está <color=#a7f3d0>PISANDO EM UMA FUNDAÇÃO</color> (Foundation).`);
        addConsoleLog(`[Player] GamerBR subiu em cima de uma fundação.`, 'info');
      } else {
        soundEffects.playClick();
        addSystemChat(`<color=#38bdf8>[Posição / Piso]</color> Você saiu da fundação (está pisando na <color=#fde047>Grama / Chão / Telhado</color>).`);
        addConsoleLog(`[Player] GamerBR saiu da fundação (agora no solo/terreno).`, 'info');
      }
    } else if (cmd === '/help') {
      addSystemChat(`<color=#ce422b>[${config.name}]</color> Comandos: <color=#f39c12>/kit</color>, <color=#f39c12>/sethome <nome></color>, <color=#f39c12>/home [nome]</color>, <color=#f39c12>/delhome <nome></color>, <color=#f39c12>/tc</color>, <color=#f39c12>/foundation</color>, <color=#f39c12>/ad</color>, <color=#f39c12>/rates</color>, <color=#f39c12>/gather_sim</color>`);
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

    let addWood = 0;
    let addStone = 0;
    let addMetal = 0;
    let addScrap = 0;

    if (targetKit && targetKit.items) {
      targetKit.items.forEach(it => {
        const s = (it.shortname || '').toLowerCase();
        if (s === 'wood') addWood += it.amount;
        if (s === 'stones' || s === 'stone') addStone += it.amount;
        if (s === 'metal.fragments') addMetal += it.amount;
        if (s === 'scrap') addScrap += it.amount;
      });
    }

    setInventoryStats(prev => ({
      ...prev,
      wood: prev.wood + addWood,
      stone: prev.stone + addStone,
      metal: prev.metal + addMetal,
      scrap: prev.scrap + addScrap
    }));

    setKitCooldowns(prev => ({ ...prev, [kitId]: targetKit?.cooldownSeconds || 120 }));
    const summary = targetKit?.items?.map(it => `+${it.amount}x ${it.name}`).join(', ') || 'recompensas';
    addSystemChat(`<color=#2ecc71>[${config.name}]</color> Kit ${targetKit?.name?.toUpperCase() || kitId.toUpperCase()} resgatado! (${summary})`);

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

          {/* Building Privilege / TC Simulator Toggle Button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              const next = !hasBuildingPrivilege;
              setHasBuildingPrivilege(next);
              if (next) {
                addSystemChat(`<color=#2ecc71>[Base / TC]</color> Você agora possui autorização no Armário (<color=#a7f3d0>BUILDING PRIVILEGE</color>).`);
                addConsoleLog(`[Player] GamerBR obteve autorização no Armário (TC).`, 'info');
              } else {
                addSystemChat(`<color=#e74c3c>[Base / TC]</color> Você está sem permissão na base (<color=#ff6b6b>BUILDING BLOCKED</color>).`);
                addConsoleLog(`[Player] GamerBR entrou em área sem autorização no TC (Building Blocked).`, 'warn');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer uppercase tracking-wider ${
              hasBuildingPrivilege
                ? 'bg-[#183a1f] border-[#22c55e] text-[#4ade80]'
                : 'bg-[#331414] border-[#ef4444] text-[#f87171] animate-pulse'
            }`}
            title="Clique para alternar permissão de construção na base (TC)"
          >
            {hasBuildingPrivilege ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-[#ef4444]" />}
            <span>TC: {hasBuildingPrivilege ? (lang === 'pt-BR' ? 'Autorizado' : 'Authorized') : (lang === 'pt-BR' ? 'Sem TC (Blocked)' : 'Blocked')}</span>
          </button>

          {/* Player Floor / Foundation Position Toggle Button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              const next = !isOnFoundation;
              setIsOnFoundation(next);
              if (next) {
                addSystemChat(`<color=#2ecc71>[Posição / Piso]</color> Você agora está <color=#a7f3d0>PISANDO EM UMA FUNDAÇÃO</color> (Foundation).`);
                addConsoleLog(`[Player] GamerBR subiu em cima de uma fundação.`, 'info');
              } else {
                addSystemChat(`<color=#38bdf8>[Posição / Piso]</color> Você saiu da fundação (está pisando na <color=#fde047>Grama / Chão / Telhado</color>).`);
                addConsoleLog(`[Player] GamerBR desceu para o solo/grama.`, 'info');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer uppercase tracking-wider ${
              isOnFoundation
                ? 'bg-[#183a1f] border-[#22c55e] text-[#4ade80]'
                : 'bg-[#14232e] border-[#3b82f6] text-[#93c5fd]'
            }`}
            title="Clique para alternar se o jogador está pisando em fundação física ou não (/foundation)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Piso: {isOnFoundation ? (lang === 'pt-BR' ? 'Em Fundação' : 'On Foundation') : (lang === 'pt-BR' ? 'Solo / Grama' : 'Ground / Floor')}</span>
          </button>

          {/* Tool Mining Simulation Buttons */}
          <div className="flex items-center gap-1 bg-[#09110b] p-0.5 border border-[#1e3422]">
            <button
              onClick={() => handleExecuteCommand('/minar jackhammer')}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold bg-[#142819] hover:bg-[#1e3c25] border border-[#235830] text-[#4ade80] transition-colors cursor-pointer"
              title="Testar mineração de nó de pedra com Britadeira (100% de rendimento)"
            >
              <span>⚡ Britadeira (100%)</span>
            </button>

            <button
              onClick={() => handleExecuteCommand('/minar metal')}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold bg-[#1a1b12] hover:bg-[#282a1a] border border-[#48401c] text-[#fbbf24] transition-colors cursor-pointer"
              title="Testar mineração com Picareta de Metal (77.5% vanilla / 100% se forçado)"
            >
              <span>⛏️ Picareta Metal</span>
            </button>

            <button
              onClick={() => handleExecuteCommand('/minar stone')}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold bg-[#151718] hover:bg-[#202426] border border-[#30363a] text-[#9ca3af] transition-colors cursor-pointer"
              title="Testar mineração com Picareta de Pedra (64.5% vanilla / 100% se forçado)"
            >
              <span>🪨 Picareta Pedra</span>
            </button>
          </div>

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

          {/* Tactical Resource HUD (Top Right) */}
          <div className="absolute top-3 right-4 hidden sm:flex items-center gap-2 bg-black/85 border border-[#223b28] px-3 py-1 font-mono text-[11px] text-[#b2c9b6] shadow-md z-10">
            <span className="text-[#8fa794]">RECURSOS:</span>
            <span className="text-white">Madeira: <strong className="text-[#4ade80]">{inventoryStats.wood}</strong></span>
            <span className="text-[#3a5740]">|</span>
            <span className="text-white">Pedra: <strong className="text-[#4ade80]">{inventoryStats.stone}</strong></span>
            <span className="text-[#3a5740]">|</span>
            <span className="text-white">Metal: <strong className="text-[#4ade80]">{inventoryStats.metal}</strong></span>
            <span className="text-[#3a5740]">|</span>
            <span className="text-white">Scrap: <strong className="text-[#4ade80]">{inventoryStats.scrap}</strong></span>
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
              {['/kit', '/home base', '/rates', '/minar jackhammer', '/minar metal', '/minar stone', '/minar rock', '/tc', '/ad'].map(cmd => (
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
              { name: 'Machado Pedra', code: 'stonehatchet', qty: 1, ammo: '100%' },
              { name: 'Picareta Pedra', code: 'stone.pickaxe', qty: 1, ammo: '100%' },
              { name: 'Pedra', code: 'stones', qty: inventoryStats.stone, ammo: '' },
              { name: 'Madeira', code: 'wood', qty: inventoryStats.wood, ammo: '' },
              { name: 'AK-47', code: 'rifle.ak', qty: 1, ammo: '30/30' },
              { name: 'Seringa Médica', code: 'syringe.medical', qty: 4, ammo: '' },
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
            {/* Building Privilege / Blocked HUD Widget - Rust Authentic */}
            <div
              onClick={() => {
                soundEffects.playClick();
                const next = !hasBuildingPrivilege;
                setHasBuildingPrivilege(next);
                if (next) {
                  addSystemChat(`<color=#2ecc71>[Base / TC]</color> Status: <color=#a7f3d0>BUILDING PRIVILEGE</color> (Autorizado no Armário).`);
                } else {
                  addSystemChat(`<color=#e74c3c>[Base / TC]</color> Status: <color=#ff6b6b>BUILDING BLOCKED</color> (Sem permissão nesta base!).`);
                }
              }}
              title="Clique para alternar permissão de construção na base"
              className={`flex items-center justify-between px-2.5 py-1 border text-xs cursor-pointer select-none transition-colors ${
                hasBuildingPrivilege
                  ? 'bg-[#0d2212]/90 border-[#22c55e] text-[#4ade80]'
                  : 'bg-[#2b0f0f]/90 border-[#ef4444] text-[#f87171] animate-pulse'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-[10px] tracking-wider uppercase">
                {hasBuildingPrivilege ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e]" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[#ef4444]" />
                )}
                <span>{hasBuildingPrivilege ? 'BUILDING PRIVILEGE' : 'BUILDING BLOCKED'}</span>
              </div>
              <span className={`text-[9px] px-1 py-0.2 font-mono font-bold ${
                hasBuildingPrivilege
                  ? 'bg-[#16381e] text-[#a7f3d0] border border-[#22c55e]/50'
                  : 'bg-[#451212] text-[#fca5a5] border border-[#ef4444]/50'
              }`}>
                {hasBuildingPrivilege ? 'TC ATIVO' : 'SEM TC'}
              </span>
            </div>

            {/* Foundation Status HUD Widget */}
            <div
              onClick={() => {
                soundEffects.playClick();
                const next = !isOnFoundation;
                setIsOnFoundation(next);
                if (next) {
                  addSystemChat(`<color=#2ecc71>[Posição / Piso]</color> Status: <color=#a7f3d0>EM FUNDAÇÃO</color> (Piso válido).`);
                } else {
                  addSystemChat(`<color=#38bdf8>[Posição / Piso]</color> Status: <color=#fde047>FORA DE FUNDAÇÃO</color> (Grama / Chão).`);
                }
              }}
              title="Clique para alternar se o jogador está pisando em fundação física"
              className={`flex items-center justify-between px-2.5 py-0.5 border text-xs cursor-pointer select-none transition-colors ${
                isOnFoundation
                  ? 'bg-[#0a180e]/90 border-[#22c55e]/70 text-[#86efac]'
                  : 'bg-[#0f1922]/90 border-[#3b82f6]/70 text-[#93c5fd]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-[9px] tracking-wider uppercase">
                <Layers className="w-3 h-3 text-[#38bdf8]" />
                <span>{isOnFoundation ? 'SOBRE FUNDAÇÃO' : 'FORA DE FUNDAÇÃO'}</span>
              </div>
              <span className={`text-[8px] px-1 py-0.2 font-mono font-bold border ${
                isOnFoundation
                  ? 'bg-[#122e19] text-[#a7f3d0] border-[#22c55e]/40'
                  : 'bg-[#12202e] text-[#bae6fd] border-[#3b82f6]/40'
              }`}>
                {isOnFoundation ? 'FOUNDATION' : 'GROUND'}
              </span>
            </div>

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

                          {/* Kit Items Full Preview */}
                          <div className="mt-2 pt-2 border-t border-[#18291c] flex flex-col gap-1">
                            <div className="flex items-center justify-between text-[10px] text-[#8fa794]">
                              <span>ITENS INCLUSOS:</span>
                              <span className="text-[#4ade80] font-bold">{kit.items.length} itens</span>
                            </div>
                            <div className="max-h-28 overflow-y-auto pr-1 flex flex-col gap-1 text-[10px] text-[#b2c9b6]">
                              {kit.items.map((it, i) => (
                                <div key={i} className="flex justify-between items-center bg-[#050a06] px-1.5 py-0.5 border border-[#142316]">
                                  <span className="truncate pr-1">{it.name}</span>
                                  <span className="text-[#4ade80] font-bold shrink-0">x{it.amount}</span>
                                </div>
                              ))}
                            </div>
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

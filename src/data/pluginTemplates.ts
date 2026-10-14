import { PluginConfig } from '../types/plugin';

export const PLUGIN_TEMPLATES: Record<string, PluginConfig> = {
  rustEliteCore: {
    name: 'RustEliteCore',
    title: 'Rust Elite Core Suite',
    author: 'brtaskgamer',
    version: '2.2.3',
    description: 'Plugin completo de utilidades essenciais para Rust: Kits com CUI, Homes & Teleporte com verificação de combate, Multiplicador de Coleta (Rates), AutoDoors inteligentes e Alertas de Raid.',
    resourceId: 'rust-elite-core',

    enableKits: true,
    enableHomes: true,
    enableTeleport: true,
    enableGatherMultiplier: true,
    enableAutoSmelt: true,
    enableAutoDoors: true,
    enableRaidAlerts: true,
    enableCui: true,

    gatherMultiplier: 3.0,
    vipGatherMultiplier: 5.0,
    enableFullGatherEfficiency: false,
    maxHomesDefault: 3,
    maxHomesVip: 6,
    teleportCountdownSeconds: 15,
    teleportCooldownSeconds: 60,
    combatBlockSeconds: 30,
    requireBuildingPrivilege: true,
    requireFoundationOnHome: false,
    autoDoorDefaultSeconds: 5,
    discordWebhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL_HERE',

    kits: [
      {
        id: 'starter',
        name: 'Starter',
        description: 'Kit inicial essencial para sobreviver após o wipe.',
        cooldownSeconds: 120,
        icon: 'pickaxe',
        items: [
          { shortname: 'stonehatchet', name: 'Machado de Pedra', amount: 1, container: 'belt' },
          { shortname: 'stone.pickaxe', name: 'Picareta de Pedra', amount: 1, container: 'belt' },
          { shortname: 'bandage', name: 'Bandagem', amount: 3, container: 'belt' },
          { shortname: 'wood', name: 'Madeira', amount: 1000, container: 'main' },
          { shortname: 'stones', name: 'Pedra', amount: 1000, container: 'main' }
        ]
      },
      {
        id: 'builder',
        name: 'Builder Pro',
        description: 'Recursos e ferramentas de construção de bases.',
        cooldownSeconds: 600,
        icon: 'hammer',
        items: [
          { shortname: 'building.planner', name: 'Plano de Construção', amount: 1, container: 'belt' },
          { shortname: 'hammer', name: 'Martelo', amount: 1, container: 'belt' },
          { shortname: 'wood', name: 'Madeira', amount: 5000, container: 'main' },
          { shortname: 'stones', name: 'Pedra', amount: 5000, container: 'main' },
          { shortname: 'metal.fragments', name: 'Fragmentos de Metal', amount: 2000, container: 'main' },
          { shortname: 'door.hinged.metal', name: 'Porta de Metal', amount: 2, container: 'main' },
          { shortname: 'lock.code', name: 'Code Lock', amount: 2, container: 'main' }
        ]
      },
      {
        id: 'vip',
        name: 'VIP Elite',
        description: 'Equipamento tático premium para jogadores com permissão VIP.',
        cooldownSeconds: 1800,
        permissionRequired: 'rustelitecore.vip',
        icon: 'shield',
        items: [
          { shortname: 'rifle.ak', name: 'Assault Rifle (AK-47)', amount: 1, container: 'belt' },
          { shortname: 'ammo.rifle', name: 'Munição 5.56', amount: 128, container: 'main' },
          { shortname: 'syringe.medical', name: 'Seringa Médica', amount: 4, container: 'belt' },
          { shortname: 'metal.facemask', name: 'Máscara Facial de Metal', amount: 1, container: 'wear' },
          { shortname: 'metal.plate.torso', name: 'Colete de Metal', amount: 1, container: 'wear' },
          { shortname: 'hoodie', name: 'Casaco Militar', amount: 1, container: 'wear' },
          { shortname: 'pants', name: 'Calça Tática', amount: 1, container: 'wear' },
          { shortname: 'scrap', name: 'Scrap (Sucata)', amount: 250, container: 'main' }
        ]
      }
    ],

    permissions: [
      { key: 'rustelitecore.use', description: 'Permissão padrão para comandos de jogador (/kit, /home, /tpa)' },
      { key: 'rustelitecore.vip', description: 'Permissão VIP (mais homes, kit VIP e multiplicador 5x)' },
      { key: 'rustelitecore.admin', description: 'Acesso total administrativo e bypass de cooldowns' }
    ],

    cuiPrimaryColor: '0.81 0.26 0.17 0.95', // Rust orange
    cuiSecondaryColor: '0.12 0.13 0.16 0.92', // Dark metallic
    cuiTextColor: '0.95 0.95 0.95 1.0'
  },

  rustVipKits: {
    name: 'RustVipKits',
    title: 'Rust VIP & Kits Pro',
    author: 'brtaskgamer',
    version: '1.0.4',
    description: 'Sistema profissional de Kits com interface gráfica CUI personalizada, tempo de recarga individual, permissões por cargo e concessão automática no primeiro nascimento.',
    resourceId: 'rust-vip-kits',

    enableKits: true,
    enableHomes: false,
    enableTeleport: false,
    enableGatherMultiplier: false,
    enableAutoSmelt: false,
    enableAutoDoors: false,
    enableRaidAlerts: false,
    enableCui: true,

    gatherMultiplier: 1.0,
    vipGatherMultiplier: 1.0,
    maxHomesDefault: 0,
    maxHomesVip: 0,
    teleportCountdownSeconds: 0,
    teleportCooldownSeconds: 0,
    combatBlockSeconds: 0,
    autoDoorDefaultSeconds: 0,
    discordWebhookUrl: '',

    kits: [
      {
        id: 'starter',
        name: 'Kit Sobrevivente',
        description: 'Ferramentas de pedra e comida para início de wipe.',
        cooldownSeconds: 60,
        icon: 'pickaxe',
        items: [
          { shortname: 'stonehatchet', name: 'Machado de Pedra', amount: 1, container: 'belt' },
          { shortname: 'stone.pickaxe', name: 'Picareta de Pedra', amount: 1, container: 'belt' },
          { shortname: 'can.beans', name: 'Lata de Feijão', amount: 2, container: 'main' }
        ]
      },
      {
        id: 'pvp',
        name: 'Kit PvP Arena',
        description: 'Armas e munição para combates imediatos.',
        cooldownSeconds: 900,
        permissionRequired: 'rustvipkits.pvp',
        icon: 'sword',
        items: [
          { shortname: 'smg.thompson', name: 'Thompson SMG', amount: 1, container: 'belt' },
          { shortname: 'ammo.pistol', name: 'Munição 9mm', amount: 120, container: 'main' },
          { shortname: 'bandage', name: 'Bandagens', amount: 5, container: 'belt' }
        ]
      },
      {
        id: 'vip',
        name: 'Kit Titânio VIP',
        description: 'Kit de alto nível com armadura de metal e explosivos.',
        cooldownSeconds: 3600,
        permissionRequired: 'rustvipkits.vip',
        icon: 'shield',
        items: [
          { shortname: 'rifle.ak', name: 'Assault Rifle', amount: 1, container: 'belt' },
          { shortname: 'ammo.rifle', name: 'Munição 5.56', amount: 200, container: 'main' },
          { shortname: 'surveycharge', name: 'Carga de Detonação', amount: 2, container: 'main' }
        ]
      }
    ],

    permissions: [
      { key: 'rustvipkits.use', description: 'Acesso ao comando /kit' },
      { key: 'rustvipkits.pvp', description: 'Acesso ao kit de combate' },
      { key: 'rustvipkits.vip', description: 'Acesso ao kit VIP supremo' }
    ],

    cuiPrimaryColor: '0.81 0.26 0.17 0.95',
    cuiSecondaryColor: '0.12 0.13 0.16 0.92',
    cuiTextColor: '1 1 1 1'
  },

  rustGatherX: {
    name: 'GatherXAutoSmelt',
    title: 'GatherX & Auto-Smelt Master',
    author: 'brtaskgamer',
    version: '1.1.0',
    description: 'Multiplicador configurável de coleta de recursos (madeira, pedras, enxofre, metal) com fundição automática de minérios direto para o inventário.',
    resourceId: 'gather-x-smelt',

    enableKits: false,
    enableHomes: false,
    enableTeleport: false,
    enableGatherMultiplier: true,
    enableAutoSmelt: true,
    enableAutoDoors: false,
    enableRaidAlerts: false,
    enableCui: false,

    gatherMultiplier: 5.0,
    vipGatherMultiplier: 10.0,
    maxHomesDefault: 0,
    maxHomesVip: 0,
    teleportCountdownSeconds: 0,
    teleportCooldownSeconds: 0,
    combatBlockSeconds: 0,
    autoDoorDefaultSeconds: 0,
    discordWebhookUrl: '',

    kits: [],
    permissions: [
      { key: 'gatherx.default', description: 'Multiplicador de taxa padrão' },
      { key: 'gatherx.vip', description: 'Multiplicador acelerado para doadores VIP' },
      { key: 'gatherx.autosmelt', description: 'Permissão para fundição automática de minérios' }
    ],

    cuiPrimaryColor: '0.2 0.6 0.3 0.9',
    cuiSecondaryColor: '0.1 0.12 0.14 0.95',
    cuiTextColor: '1 1 1 1'
  },

  rustHomesPro: {
    name: 'RustHomesPro',
    title: 'Rust Homes & Safe Teleport',
    author: 'brtaskgamer',
    version: '2.0.1',
    description: 'Sistema de teleporte seguro: /sethome em fundações próprias, /home com temporizador, bloqueio anti-combate (PvP block) e proteção contra raids ativas.',
    resourceId: 'rust-homes-pro',

    enableKits: false,
    enableHomes: true,
    enableTeleport: true,
    enableGatherMultiplier: false,
    enableAutoSmelt: false,
    enableAutoDoors: false,
    enableRaidAlerts: false,
    enableCui: false,

    gatherMultiplier: 1.0,
    vipGatherMultiplier: 1.0,
    maxHomesDefault: 3,
    maxHomesVip: 8,
    teleportCountdownSeconds: 10,
    teleportCooldownSeconds: 45,
    combatBlockSeconds: 30,
    requireBuildingPrivilege: true,
    requireFoundationOnHome: false,
    autoDoorDefaultSeconds: 0,
    discordWebhookUrl: '',

    kits: [],
    permissions: [
      { key: 'rusthomes.use', description: 'Acesso a criar e teleportar para bases (/sethome, /home)' },
      { key: 'rusthomes.vip', description: 'Permite criar até 8 homes com tempo de espera reduzido' },
      { key: 'rusthomes.tpa', description: 'Acesso a pedidos de teleporte entre amigos (/tpa, /tpaccept)' }
    ],

    cuiPrimaryColor: '0.15 0.5 0.8 0.95',
    cuiSecondaryColor: '0.08 0.1 0.15 0.95',
    cuiTextColor: '1 1 1 1'
  },

  rustAutoDoors: {
    name: 'RustAutoDoors',
    title: 'Smart AutoDoors & Team Auth',
    author: 'brtaskgamer',
    version: '1.0.2',
    description: 'Fecha portas automaticamente após passar por elas para evitar invasões (deep raid). Permite configurar tempo em segundos por jogador via /ad.',
    resourceId: 'rust-auto-doors',

    enableKits: false,
    enableHomes: false,
    enableTeleport: false,
    enableGatherMultiplier: false,
    enableAutoSmelt: false,
    enableAutoDoors: true,
    enableRaidAlerts: false,
    enableCui: false,

    gatherMultiplier: 1.0,
    vipGatherMultiplier: 1.0,
    maxHomesDefault: 0,
    maxHomesVip: 0,
    teleportCountdownSeconds: 0,
    teleportCooldownSeconds: 0,
    combatBlockSeconds: 0,
    autoDoorDefaultSeconds: 4,
    discordWebhookUrl: '',

    kits: [],
    permissions: [
      { key: 'autodoors.use', description: 'Permissão para usar o sistema de fechamento automático' }
    ],

    cuiPrimaryColor: '0.8 0.4 0.1 0.9',
    cuiSecondaryColor: '0.1 0.1 0.1 0.95',
    cuiTextColor: '1 1 1 1'
  },

  rustRaidAlarm: {
    name: 'RustRaidAlarm',
    title: 'Raid Alarm & Discord Alerts',
    author: 'brtaskgamer',
    version: '1.3.0',
    description: 'Detecta explosões de C4, Foguetes e Satchels em construções de jogadores e envia alertas sonoros in-game e notificações automáticas no Discord.',
    resourceId: 'rust-raid-alarm',

    enableKits: false,
    enableHomes: false,
    enableTeleport: false,
    enableGatherMultiplier: false,
    enableAutoSmelt: false,
    enableAutoDoors: false,
    enableRaidAlerts: true,
    enableCui: false,

    gatherMultiplier: 1.0,
    vipGatherMultiplier: 1.0,
    maxHomesDefault: 0,
    maxHomesVip: 0,
    teleportCountdownSeconds: 0,
    teleportCooldownSeconds: 0,
    combatBlockSeconds: 60,
    autoDoorDefaultSeconds: 0,
    discordWebhookUrl: 'https://discord.com/api/webhooks/123456789/rust-raid-alerts',

    kits: [],
    permissions: [
      { key: 'raidalarm.use', description: 'Ativa notificações sonoras e alertas de raid para o proprietário da base' }
    ],

    cuiPrimaryColor: '0.9 0.2 0.2 0.95',
    cuiSecondaryColor: '0.12 0.05 0.05 0.95',
    cuiTextColor: '1 1 1 1'
  }
};

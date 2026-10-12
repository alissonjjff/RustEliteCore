export interface KitItem {
  shortname: string;
  name: string;
  amount: number;
  container: 'main' | 'wear' | 'belt';
  skinId?: number;
}

export interface KitDefinition {
  id: string;
  name: string;
  description: string;
  cooldownSeconds: number;
  permissionRequired?: string;
  items: KitItem[];
  icon: string;
}

export interface HomeDefinition {
  name: string;
  x: number;
  y: number;
  z: number;
  createdTime: number;
}

export interface PluginConfig {
  name: string;
  title: string;
  author: string;
  version: string;
  description: string;
  resourceId?: string;

  // Features enabled
  enableKits: boolean;
  enableHomes: boolean;
  enableTeleport: boolean;
  enableGatherMultiplier: boolean;
  enableAutoSmelt: boolean;
  enableAutoDoors: boolean;
  enableRaidAlerts: boolean;
  enableCui: boolean;

  // Parameters
  gatherMultiplier: number;
  vipGatherMultiplier: number;
  maxHomesDefault: number;
  maxHomesVip: number;
  teleportCountdownSeconds: number;
  teleportCooldownSeconds: number;
  combatBlockSeconds: number;
  requireBuildingPrivilege?: boolean;
  requireFoundationOnHome?: boolean;
  autoDoorDefaultSeconds: number;
  discordWebhookUrl: string;

  // Kits
  kits: KitDefinition[];

  // Permissions
  permissions: {
    key: string;
    description: string;
  }[];

  // Custom UI colors
  cuiPrimaryColor: string;
  cuiSecondaryColor: string;
  cuiTextColor: string;
}

export type SupportedLanguage = 'pt-BR' | 'en';

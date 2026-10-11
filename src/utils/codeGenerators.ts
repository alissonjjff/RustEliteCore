import { PluginConfig } from '../types/plugin';

export function generatePluginCSharp(config: PluginConfig): string {
  const className = config.name.replace(/[^a-zA-Z0-9]/g, '') || 'RustPluginCore';
  const hasKits = config.enableKits;
  const hasHomes = config.enableHomes || config.enableTeleport;
  const hasGather = config.enableGatherMultiplier;
  const hasAutoDoors = config.enableAutoDoors;
  const hasRaid = config.enableRaidAlerts;
  const hasCui = config.enableCui;

  return `// =========================================================================
// Plugin Gerado por Rust Plugin Studio para Oxide/uMod & Carbon
// Compatível com Facepunch Rust Dedicated Server
// Salve este arquivo como: oxide/plugins/${className}.cs
// =========================================================================

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Newtonsoft.Json;
using Oxide.Core;
using Oxide.Core.Libraries.Covalence;
using Oxide.Core.Plugins;
${hasCui ? 'using Oxide.Game.Rust.Cui;\n' : ''}using UnityEngine;

namespace Oxide.Plugins
{
    [Info("${className}", "${config.author || 'brtaskgamer'}", "${config.version || '1.0.0'}")]
    [Description("${(config.description || 'Custom Rust Plugin').replace(/"/g, '\\"')}")]
    public class ${className} : RustPlugin
    {
        #region Fields & Declarations

        private PluginConfig _config;
        private readonly Dictionary<ulong, PlayerData> _playerData = new Dictionary<ulong, PlayerData>();
        ${hasHomes ? 'private readonly Dictionary<ulong, float> _combatTimers = new Dictionary<ulong, float>();\n' : ''}
        ${config.permissions.map(p => `private const string Perm${p.key.split('.').pop()?.toUpperCase() || 'USE'} = "${p.key}";`).join('\n        ')}

        private class PlayerData
        {
            public Dictionary<string, Vector3> Homes { get; set; } = new Dictionary<string, Vector3>();
            public Dictionary<string, double> KitCooldowns { get; set; } = new Dictionary<string, double>();
            public bool AutoDoorEnabled { get; set; } = true;
            public float AutoDoorDelay { get; set; } = ${config.autoDoorDefaultSeconds}.0f;
        }

        #endregion

        #region Configuration

        private class PluginConfig
        {
            [JsonProperty(PropertyName = "ConfiguracoesGerais")]
            public GeneralSettings General { get; set; } = new GeneralSettings();

            ${hasGather ? `[JsonProperty(PropertyName = "MultiplicadoresDeColeta")]
            public GatherSettings Gather { get; set; } = new GatherSettings();\n` : ''}
            ${hasHomes ? `[JsonProperty(PropertyName = "ConfiguracoesDeHomes")]
            public HomeSettings Homes { get; set; } = new HomeSettings();\n` : ''}
            ${hasAutoDoors ? `[JsonProperty(PropertyName = "ConfiguracoesAutoDoor")]
            public AutoDoorSettings AutoDoors { get; set; } = new AutoDoorSettings();\n` : ''}
            ${hasRaid ? `[JsonProperty(PropertyName = "ConfiguracoesRaidAlarm")]
            public RaidSettings Raid { get; set; } = new RaidSettings();\n` : ''}
        }

        private class GeneralSettings
        {
            [JsonProperty("PrefixoChat")]
            public string ChatPrefix { get; set; } = "<color=#ce422b>[${className}]</color>";

            [JsonProperty("AtivarNotificacoesSonoras")]
            public bool EnableSoundEffects { get; set; } = true;
        }

        ${hasGather ? `private class GatherSettings
        {
            [JsonProperty("MultiplicadorPadrao")]
            public float DefaultMultiplier { get; set; } = ${config.gatherMultiplier.toFixed(1)}f;

            [JsonProperty("MultiplicadorVIP")]
            public float VipMultiplier { get; set; } = ${config.vipGatherMultiplier.toFixed(1)}f;

            [JsonProperty("FundirMineriosAutomaticamente")]
            public bool AutoSmeltOres { get; set; } = ${config.enableAutoSmelt ? 'true' : 'false'};
        }` : ''}

        ${hasHomes ? `private class HomeSettings
        {
            [JsonProperty("MaximoHomesPadrao")]
            public int MaxHomesDefault { get; set; } = ${config.maxHomesDefault};

            [JsonProperty("MaximoHomesVIP")]
            public int MaxHomesVip { get; set; } = ${config.maxHomesVip};

            [JsonProperty("TempoContagemTeleporteSegundos")]
            public int CountdownSeconds { get; set; } = ${config.teleportCountdownSeconds};

            [JsonProperty("TempoRecargaTeleporteSegundos")]
            public int CooldownSeconds { get; set; } = ${config.teleportCooldownSeconds};

            [JsonProperty("BloqueioEmCombateSegundos")]
            public int CombatBlockSeconds { get; set; } = ${config.combatBlockSeconds};
        }` : ''}

        ${hasAutoDoors ? `private class AutoDoorSettings
        {
            [JsonProperty("TempoPadraoFechamentoSegundos")]
            public float DefaultCloseDelay { get; set; } = ${config.autoDoorDefaultSeconds}.0f;
        }` : ''}

        ${hasRaid ? `private class RaidSettings
        {
            [JsonProperty("DiscordWebhookUrl")]
            public string DiscordWebhook { get; set; } = "${config.discordWebhookUrl}";

            [JsonProperty("RaioDeteccaoExplosaoMetros")]
            public float DetectionRadius { get; set; } = 40.0f;
        }` : ''}

        protected override void LoadDefaultConfig()
        {
            PrintWarning("Criando novo arquivo de configuracao para " + Name + "...");
            _config = new PluginConfig();
        }

        protected override void LoadConfig()
        {
            base.LoadConfig();
            try
            {
                _config = Config.ReadObject<PluginConfig>();
                if (_config == null) LoadDefaultConfig();
            }
            catch
            {
                LoadDefaultConfig();
            }
            SaveConfig();
        }

        protected override void SaveConfig() => Config.WriteObject(_config, true);

        #endregion

        #region Lifecycle Hooks

        private void Init()
        {
            // Registro de permissoes Oxide
            ${config.permissions.map(p => `permission.RegisterPermission("${p.key}", this);`).join('\n            ')}

            RegisterMessages();
        }

        private void OnServerInitialized()
        {
            Puts($"{className} v{Version} inicializado com sucesso!");
        }

        private void Unload()
        {
            ${hasCui ? `foreach (BasePlayer player in BasePlayer.activePlayerList)
            {
                CuiHelper.DestroyUi(player, "RustPlugin_MainCui");
            }` : ''}
            Puts($"{className} descarregado com seguranca.");
        }

        #endregion

        #region Localization

        private void RegisterMessages()
        {
            lang.RegisterMessages(new Dictionary<string, string>
            {
                ["NoPermission"] = "<color=#e74c3c>Acesso Negado:</color> Voce nao possui permissao para usar este comando.",
                ["HomeSet"] = "<color=#2ecc71>Sucesso:</color> Home '<color=#f39c12>{0}</color>' criada com sucesso!",
                ["HomeLimitReached"] = "<color=#e74c3c>Limite:</color> Voce atingiu o limite maximo de {0} homes.",
                ["HomeNotFound"] = "<color=#e74c3c>Erro:</color> Nao encontramos nenhuma home com o nome '{0}'.",
                ["TeleportStarting"] = "<color=#3498db>Teleporte:</color> Teleportando para '{0}' em {1} segundos. Nao se mova!",
                ["CombatBlocked"] = "<color=#e74c3c>Bloqueado:</color> Voce esta em combate! Aguarde {0}s para se teleportar.",
                ["KitClaimed"] = "<color=#2ecc71>Kit Resgatado:</color> Voce recebeu o kit <color=#f39c12>{0}</color>!",
                ["KitCooldown"] = "<color=#e74c3c>Aguarde:</color> Este kit estara disponivel em {0} segundos.",
                ["AutoDoorToggled"] = "<color=#2ecc71>AutoDoor:</color> Portas automaticas {0} com tempo de {1}s.",
                ["RaidAlert"] = "<color=#e74c3c>[ALERTA DE RAID]</color> Explosao detectada proxima a sua base!"
            }, this, "pt-BR");

            lang.RegisterMessages(new Dictionary<string, string>
            {
                ["NoPermission"] = "<color=#e74c3c>Access Denied:</color> You do not have permission to execute this command.",
                ["HomeSet"] = "<color=#2ecc71>Success:</color> Home '<color=#f39c12>{0}</color>' set successfully!",
                ["HomeLimitReached"] = "<color=#e74c3c>Limit:</color> You have reached your maximum limit of {0} homes.",
                ["HomeNotFound"] = "<color=#e74c3c>Error:</color> Home '{0}' does not exist.",
                ["TeleportStarting"] = "<color=#3498db>Teleport:</color> Teleporting to '{0}' in {1} seconds. Do not move!",
                ["CombatBlocked"] = "<color=#e74c3c>Blocked:</color> You are in combat! Teleport available in {0}s.",
                ["KitClaimed"] = "<color=#2ecc71>Kit Claimed:</color> You received kit <color=#f39c12>{0}</color>!",
                ["KitCooldown"] = "<color=#e74c3c>Cooldown:</color> Kit will be ready in {0} seconds.",
                ["AutoDoorToggled"] = "<color=#2ecc71>AutoDoor:</color> Automatic doors {0} with delay of {1}s.",
                ["RaidAlert"] = "<color=#e74c3c>[RAID ALERT]</color> Explosives detonated near your base!"
            }, this, "en");
        }

        private string GetMessage(string key, BasePlayer player, params object[] args)
        {
            string message = lang.GetMessage(key, this, player.UserIDString);
            return string.Format(message, args);
        }

        #endregion

        #region Chat Commands

        ${hasHomes ? `[ChatCommand("sethome")]
        private void CmdSetHome(BasePlayer player, string command, string[] args)
        {
            if (!permission.UserHasPermission(player.UserIDString, "rustelite.use"))
            {
                SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("NoPermission", player)}");
                return;
            }

            if (args.Length == 0)
            {
                SendReply(player, $"{_config.General.ChatPrefix} Uso correto: /sethome <nome>");
                return;
            }

            string homeName = args[0].ToLower();
            PlayerData data = GetOrCreatePlayerData(player.userID);

            bool isVip = permission.UserHasPermission(player.UserIDString, "rustelite.vip");
            int maxAllowed = isVip ? _config.Homes.MaxHomesVip : _config.Homes.MaxHomesDefault;

            if (data.Homes.Count >= maxAllowed && !data.Homes.ContainsKey(homeName))
            {
                SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("HomeLimitReached", player, maxAllowed)}");
                return;
            }

            data.Homes[homeName] = player.transform.position;
            SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("HomeSet", player, homeName)}");
            Effect.server.Run("assets/prefabs/tools/c4/effects/c4_stick.prefab", player.transform.position);
        }

        [ChatCommand("home")]
        private void CmdHome(BasePlayer player, string command, string[] args)
        {
            if (args.Length == 0)
            {
                PlayerData data = GetOrCreatePlayerData(player.userID);
                if (data.Homes.Count == 0)
                {
                    SendReply(player, $"{_config.General.ChatPrefix} Voce nao possui homes criadas. Use /sethome <nome>.");
                    return;
                }
                string list = string.Join(", ", data.Homes.Keys);
                SendReply(player, $"{_config.General.ChatPrefix} Suas homes: <color=#f39c12>{list}</color>");
                return;
            }

            string homeName = args[0].ToLower();
            PlayerData pData = GetOrCreatePlayerData(player.userID);

            if (!pData.Homes.TryGetValue(homeName, out Vector3 targetPos))
            {
                SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("HomeNotFound", player, homeName)}");
                return;
            }

            // Verificacao de combate PvP
            if (_combatTimers.TryGetValue(player.userID, out float combatTime) && (Time.realtimeSinceStartup - combatTime) < _config.Homes.CombatBlockSeconds)
            {
                float remain = _config.Homes.CombatBlockSeconds - (Time.realtimeSinceStartup - combatTime);
                SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("CombatBlocked", player, Mathf.CeilToInt(remain))}");
                return;
            }

            SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("TeleportStarting", player, homeName, _config.Homes.CountdownSeconds)}");

            timer.Once(_config.Homes.CountdownSeconds, () =>
            {
                if (player == null || !player.IsConnected) return;
                player.Teleport(targetPos);
                SendReply(player, $"{_config.General.ChatPrefix} Teleportado com sucesso!");
            });
        }` : ''}

        ${hasKits ? `[ChatCommand("kit")]
        private void CmdKit(BasePlayer player, string command, string[] args)
        {
            if (args.Length == 0)
            {
                ${hasCui ? 'OpenKitCui(player);' : `
                SendReply(player, $"{_config.General.ChatPrefix} Kits disponiveis: starter, builder, vip. Use /kit <nome>.");
                `}
                return;
            }

            string kitName = args[0].ToLower();
            ClaimKit(player, kitName);
        }` : ''}

        ${hasAutoDoors ? `[ChatCommand("ad")]
        private void CmdAutoDoor(BasePlayer player, string command, string[] args)
        {
            PlayerData data = GetOrCreatePlayerData(player.userID);
            if (args.Length > 0 && float.TryParse(args[0], out float delay))
            {
                data.AutoDoorDelay = Mathf.Clamp(delay, 1.0f, 30.0f);
                data.AutoDoorEnabled = true;
            }
            else
            {
                data.AutoDoorEnabled = !data.AutoDoorEnabled;
            }

            string status = data.AutoDoorEnabled ? "<color=#2ecc71>ATIVADO</color>" : "<color=#e74c3c>DESATIVADO</color>";
            SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("AutoDoorToggled", player, status, data.AutoDoorDelay)}");
        }` : ''}

        #endregion

        #region Game Hooks & Mechanics

        ${hasGather ? `// Multiplicador inteligente de coleta
        private void OnDispenserGather(ResourceDispenser dispenser, BaseEntity entity, Item item)
        {
            BasePlayer player = entity as BasePlayer;
            if (player == null || item == null) return;

            bool isVip = permission.UserHasPermission(player.UserIDString, "rustelite.vip");
            float multiplier = isVip ? _config.Gather.VipMultiplier : _config.Gather.DefaultMultiplier;

            item.amount = (int)(item.amount * multiplier);

            // Fundicao automatica opcional
            if (_config.Gather.AutoSmeltOres)
            {
                if (item.info.shortname == "metal.ore")
                {
                    item.info = ItemManager.FindItemDefinition("metal.fragments");
                }
                else if (item.info.shortname == "sulfur.ore")
                {
                    item.info = ItemManager.FindItemDefinition("sulfur");
                }
            }
        }` : ''}

        ${hasAutoDoors ? `// Fechamento automatico de portas
        private void OnDoorOpened(Door door, BasePlayer player)
        {
            if (door == null || player == null) return;
            PlayerData data = GetOrCreatePlayerData(player.userID);
            if (!data.AutoDoorEnabled) return;

            timer.Once(data.AutoDoorDelay, () =>
            {
                if (door != null && door.IsOpen())
                {
                    door.SetOpen(false);
                }
            });
        }` : ''}

        // Registro de combate para evitar fuga com teleporte
        private void OnEntityTakeDamage(BaseCombatEntity entity, HitInfo info)
        {
            if (info?.InitiatorPlayer == null) return;
            BasePlayer victim = entity as BasePlayer;
            if (victim != null)
            {
                _combatTimers[victim.userID] = Time.realtimeSinceStartup;
                _combatTimers[info.InitiatorPlayer.userID] = Time.realtimeSinceStartup;
            }

            ${hasRaid ? `// Deteccao de Raid em bases
            if (entity is BuildingBlock && (info.damageTypes.Has(Rust.DamageType.Explosion)))
            {
                BasePlayer owner = BasePlayer.FindByID(entity.OwnerID);
                if (owner != null && owner.IsConnected)
                {
                    SendReply(owner, $"{_config.General.ChatPrefix} {GetMessage("RaidAlert", owner)}");
                    Effect.server.Run("assets/prefabs/weapons/satchelcharge/effects/satchel_charge_explosion.prefab", entity.transform.position);
                }
            }` : ''}
        }

        #endregion

        #region Kits Logic & CUI Menu

        private void ClaimKit(BasePlayer player, string kitId)
        {
            PlayerData data = GetOrCreatePlayerData(player.userID);
            double now = GrabCurrentTime();

            if (data.KitCooldowns.TryGetValue(kitId, out double readyAt) && now < readyAt)
            {
                int remaining = (int)(readyAt - now);
                SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("KitCooldown", player, remaining)}");
                return;
            }

            if (kitId == "starter")
            {
                player.inventory.GiveItem(ItemManager.CreateByName("stone.hatchet", 1));
                player.inventory.GiveItem(ItemManager.CreateByName("stone.pickaxe", 1));
                player.inventory.GiveItem(ItemManager.CreateByName("wood", 1000));
                player.inventory.GiveItem(ItemManager.CreateByName("stone", 1000));
                data.KitCooldowns[kitId] = now + 120;
            }
            else if (kitId == "builder")
            {
                player.inventory.GiveItem(ItemManager.CreateByName("building.planner", 1));
                player.inventory.GiveItem(ItemManager.CreateByName("hammer", 1));
                player.inventory.GiveItem(ItemManager.CreateByName("wood", 5000));
                player.inventory.GiveItem(ItemManager.CreateByName("stone", 5000));
                data.KitCooldowns[kitId] = now + 600;
            }
            else if (kitId == "vip")
            {
                if (!permission.UserHasPermission(player.UserIDString, "rustelite.vip"))
                {
                    SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("NoPermission", player)}");
                    return;
                }
                player.inventory.GiveItem(ItemManager.CreateByName("rifle.ak", 1));
                player.inventory.GiveItem(ItemManager.CreateByName("ammo.rifle", 128));
                player.inventory.GiveItem(ItemManager.CreateByName("syringe.medical", 4));
                data.KitCooldowns[kitId] = now + 1800;
            }

            SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("KitClaimed", player, kitId.ToUpper())}");
        }

        ${hasCui ? `public void OpenKitCui(BasePlayer player)
        {
            CuiHelper.DestroyUi(player, "RustPlugin_MainCui");

            CuiElementContainer container = new CuiElementContainer();

            // Fundo escuro semi-transparente
            container.Add(new CuiPanel
            {
                Image = { Color = "${config.cuiSecondaryColor}" },
                RectTransform = { AnchorMin = "0.2 0.2", AnchorMax = "0.8 0.8" },
                CursorEnabled = true
            }, "Overlay", "RustPlugin_MainCui");

            // Barra de titulo Rust
            container.Add(new CuiPanel
            {
                Image = { Color = "${config.cuiPrimaryColor}" },
                RectTransform = { AnchorMin = "0 0.90", AnchorMax = "1 1" }
            }, "RustPlugin_MainCui", "RustPlugin_Header");

            container.Add(new CuiLabel
            {
                Text = { Text = "MENU DE KITS - ${className.toUpperCase()}", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, "RustPlugin_Header");

            // Botoes dos kits
            container.Add(new CuiButton
            {
                Button = { Command = "kit starter", Color = "0.2 0.5 0.3 0.9" },
                RectTransform = { AnchorMin = "0.1 0.6", AnchorMax = "0.4 0.75" },
                Text = { Text = "RESGATAR STARTER\\n<size=11>Kit Basico</size>", FontSize = 14, Align = TextAnchor.MiddleCenter }
            }, "RustPlugin_MainCui");

            container.Add(new CuiButton
            {
                Button = { Command = "kit builder", Color = "0.2 0.4 0.6 0.9" },
                RectTransform = { AnchorMin = "0.6 0.6", AnchorMax = "0.9 0.75" },
                Text = { Text = "RESGATAR BUILDER\\n<size=11>Construcao</size>", FontSize = 14, Align = TextAnchor.MiddleCenter }
            }, "RustPlugin_MainCui");

            container.Add(new CuiButton
            {
                Button = { Command = "kit vip", Color = "0.7 0.3 0.1 0.9" },
                RectTransform = { AnchorMin = "0.35 0.35", AnchorMax = "0.65 0.5" },
                Text = { Text = "RESGATAR VIP ELITE\\n<size=11>Exclusivo VIP</size>", FontSize = 14, Align = TextAnchor.MiddleCenter }
            }, "RustPlugin_MainCui");

            // Botao Fechar
            container.Add(new CuiButton
            {
                Button = { Close = "RustPlugin_MainCui", Color = "0.8 0.2 0.2 0.9" },
                RectTransform = { AnchorMin = "0.4 0.08", AnchorMax = "0.6 0.18" },
                Text = { Text = "FECHAR", FontSize = 13, Align = TextAnchor.MiddleCenter }
            }, "RustPlugin_MainCui");

            CuiHelper.AddUi(player, container);
        }` : ''}

        #endregion

        #region Helpers

        private PlayerData GetOrCreatePlayerData(ulong userId)
        {
            if (!_playerData.TryGetValue(userId, out PlayerData data))
            {
                data = new PlayerData();
                _playerData[userId] = data;
            }
            return data;
        }

        private static double GrabCurrentTime()
        {
            return DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalSeconds;
        }

        #endregion
    }
}
`;
}

export function generatePluginConfigJson(config: PluginConfig): string {
  const cfg = {
    ConfiguracoesGerais: {
      PrefixoChat: `<color=#ce422b>[${config.name}]</color>`,
      AtivarNotificacoesSonoras: true
    },
    MultiplicadoresDeColeta: {
      MultiplicadorPadrao: config.gatherMultiplier,
      MultiplicadorVIP: config.vipGatherMultiplier,
      FundirMineriosAutomaticamente: config.enableAutoSmelt
    },
    ConfiguracoesDeHomes: {
      MaximoHomesPadrao: config.maxHomesDefault,
      MaximoHomesVIP: config.maxHomesVip,
      TempoContagemTeleporteSegundos: config.teleportCountdownSeconds,
      TempoRecargaTeleporteSegundos: config.teleportCooldownSeconds,
      BloqueioEmCombateSegundos: config.combatBlockSeconds
    },
    ConfiguracoesAutoDoor: {
      TempoPadraoFechamentoSegundos: config.autoDoorDefaultSeconds
    },
    ConfiguracoesRaidAlarm: {
      DiscordWebhookUrl: config.discordWebhookUrl,
      RaioDeteccaoExplosaoMetros: 40.0
    }
  };

  return JSON.stringify(cfg, null, 2);
}

export function generatePluginLangJson(lang: 'pt-BR' | 'en'): string {
  if (lang === 'pt-BR') {
    return JSON.stringify({
      NoPermission: "<color=#e74c3c>Acesso Negado:</color> Você não possui permissão para usar este comando.",
      HomeSet: "<color=#2ecc71>Sucesso:</color> Home '<color=#f39c12>{0}</color>' criada com sucesso!",
      HomeLimitReached: "<color=#e74c3c>Limite:</color> Você atingiu o limite máximo de {0} homes.",
      HomeNotFound: "<color=#e74c3c>Erro:</color> Não encontramos nenhuma home com o nome '{0}'.",
      TeleportStarting: "<color=#3498db>Teleporte:</color> Teleportando para '{0}' em {1} segundos. Não se mova!",
      CombatBlocked: "<color=#e74c3c>Bloqueado:</color> Você está em combate! Aguarde {0}s para se teleportar.",
      KitClaimed: "<color=#2ecc71>Kit Resgatado:</color> Você recebeu o kit <color=#f39c12>{0}</color>!",
      KitCooldown: "<color=#e74c3c>Aguarde:</color> Este kit estará disponível em {0} segundos.",
      AutoDoorToggled: "<color=#2ecc71>AutoDoor:</color> Portas automáticas {0} com tempo de {1}s.",
      RaidAlert: "<color=#e74c3c>[ALERTA DE RAID]</color> Explosão detectada próxima à sua base!"
    }, null, 2);
  }

  return JSON.stringify({
    NoPermission: "<color=#e74c3c>Access Denied:</color> You do not have permission to execute this command.",
    HomeSet: "<color=#2ecc71>Success:</color> Home '<color=#f39c12>{0}</color>' set successfully!",
    HomeLimitReached: "<color=#e74c3c>Limit:</color> You have reached your maximum limit of {0} homes.",
    HomeNotFound: "<color=#e74c3c>Error:</color> Home '{0}' does not exist.",
    TeleportStarting: "<color=#3498db>Teleport:</color> Teleporting to '{0}' in {1} seconds. Do not move!",
    CombatBlocked: "<color=#e74c3c>Blocked:</color> You are in combat! Teleport available in {0}s.",
    KitClaimed: "<color=#2ecc71>Kit Claimed:</color> You received kit <color=#f39c12>{0}</color>!",
    KitCooldown: "<color=#e74c3c>Cooldown:</color> Kit will be ready in {0} seconds.",
    AutoDoorToggled: "<color=#2ecc71>AutoDoor:</color> Automatic doors {0} with delay of {1}s.",
    RaidAlert: "<color=#e74c3c>[RAID ALERT]</color> Explosives detonated near your base!"
  }, null, 2);
}

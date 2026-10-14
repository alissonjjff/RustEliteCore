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
        private readonly Dictionary<ulong, float> _combatTimers = new Dictionary<ulong, float>();

        private const string PermUSE = "${className.toLowerCase()}.use";
        private const string PermVIP = "${className.toLowerCase()}.vip";
        private const string PermADMIN = "${className.toLowerCase()}.admin";

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
            ${hasKits ? `[JsonProperty(PropertyName = "ListaDeKits")]
            public List<KitConfig> Kits { get; set; } = new List<KitConfig>();\n` : ''}
        }

        ${hasKits ? `public class KitConfig
        {
            [JsonProperty("Id")]
            public string Id { get; set; }

            [JsonProperty("Nome")]
            public string Name { get; set; }

            [JsonProperty("Descricao")]
            public string Description { get; set; }

            [JsonProperty("CooldownSegundos")]
            public int CooldownSeconds { get; set; }

            [JsonProperty("PermissaoRequerida")]
            public string PermissionRequired { get; set; }

            [JsonProperty("Itens")]
            public List<KitItemConfig> Items { get; set; } = new List<KitItemConfig>();
        }

        public class KitItemConfig
        {
            [JsonProperty("Shortname")]
            public string Shortname { get; set; }

            [JsonProperty("Nome")]
            public string Name { get; set; }

            [JsonProperty("Quantidade")]
            public int Amount { get; set; }
        }` : ''}

        private class GeneralSettings
        {
            [JsonProperty("PrefixoChat")]
            public string ChatPrefix { get; set; } = "<color=#ce422b>[${className}]</color>";

            [JsonProperty("AtivarNotificacoesSonoras")]
            public bool EnableSoundEffects { get; set; } = true;

            [JsonProperty("AtivarModuloKits")]
            public bool EnableKits { get; set; } = ${config.enableKits ? 'true' : 'false'};

            [JsonProperty("AtivarModuloHomes")]
            public bool EnableHomes { get; set; } = ${config.enableHomes ? 'true' : 'false'};

            [JsonProperty("AtivarModuloMultiplicadorColeta")]
            public bool EnableGather { get; set; } = ${config.enableGatherMultiplier ? 'true' : 'false'};

            [JsonProperty("AtivarModuloAutoDoors")]
            public bool EnableAutoDoors { get; set; } = ${config.enableAutoDoors ? 'true' : 'false'};

            [JsonProperty("AtivarModuloAlarmeRaid")]
            public bool EnableRaidAlarm { get; set; } = ${config.enableRaidAlerts ? 'true' : 'false'};
        }

        ${hasGather ? `private class GatherSettings
        {
            [JsonProperty("MultiplicadorPadrao")]
            public float DefaultMultiplier { get; set; } = ${config.gatherMultiplier.toFixed(1)}f;

            [JsonProperty("MultiplicadorVIP")]
            public float VipMultiplier { get; set; } = ${config.vipGatherMultiplier.toFixed(1)}f;

            [JsonProperty("FundirMineriosAutomaticamente")]
            public bool AutoSmeltOres { get; set; } = ${config.enableAutoSmelt ? 'true' : 'false'};

            [JsonProperty("ForcarEficienciaMaxima100Porcento")]
            public bool FullGatherEfficiency { get; set; } = ${config.enableFullGatherEfficiency ? 'true' : 'false'};
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

            [JsonProperty("ExigirAutorizacaoArmarioTC")]
            public bool RequireBuildingPrivilege { get; set; } = ${config.requireBuildingPrivilege !== false ? 'true' : 'false'};

            [JsonProperty("ExigirEstarEmCimaDeFundacao")]
            public bool RequireFoundation { get; set; } = ${config.requireFoundationOnHome === true ? 'true' : 'false'};
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
            _config = new PluginConfig
            {
                ${hasKits ? `Kits = GetDefaultKits()` : ''}
            };
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

            ${hasKits ? `SyncDefaultKits();\n` : ''}
            SaveConfig();
        }

        ${hasKits ? `private void SyncDefaultKits()
        {
            if (_config == null) return;
            if (_config.Kits == null) _config.Kits = new List<KitConfig>();

            List<KitConfig> defaults = GetDefaultKits();
            bool modified = false;

            foreach (KitConfig defKit in defaults)
            {
                if (!_config.Kits.Any(k => k.Id != null && k.Id.Equals(defKit.Id, StringComparison.OrdinalIgnoreCase)))
                {
                    _config.Kits.Add(defKit);
                    modified = true;
                    Puts($"[Config] Novo kit '{defKit.Name}' adicionado automaticamente ao arquivo de configuracao JSON!");
                }
            }

            if (modified)
            {
                SaveConfig();
            }
        }

        private List<KitConfig> GetDefaultKits()
        {
            return new List<KitConfig>
            {
                ${config.kits.map(k => `new KitConfig
                {
                    Id = "${k.id}",
                    Name = "${k.name.replace(/"/g, '\\"')}",
                    Description = "${k.description.replace(/"/g, '\\"')}",
                    CooldownSeconds = ${k.cooldownSeconds},
                    PermissionRequired = "${k.permissionRequired || ''}",
                    Items = new List<KitItemConfig>
                    {
                        ${k.items.map(it => `new KitItemConfig { Shortname = "${it.shortname}", Name = "${it.name.replace(/"/g, '\\"')}", Amount = ${it.amount} }`).join(',\n                        ')}
                    }
                }`).join(',\n                ')}
            };
        }` : ''}

        protected override void SaveConfig() => Config.WriteObject(_config, true);

        #endregion

        #region Lifecycle Hooks

        private void Init()
        {
            // Registro de permissoes oficiais do plugin (reconhecidas pelo Oxide e gerenciadores de permissao)
            permission.RegisterPermission(PermUSE, this);
            permission.RegisterPermission(PermVIP, this);
            permission.RegisterPermission(PermADMIN, this);

            // Registro de alias legado/simplificado
            if (PermUSE != "rustelite.use")
            {
                permission.RegisterPermission("rustelite.use", this);
                permission.RegisterPermission("rustelite.vip", this);
                permission.RegisterPermission("rustelite.admin", this);
            }

            RegisterMessages();
        }

        private bool HasPermission(BasePlayer player, string perm)
        {
            if (player == null) return false;
            if (permission.UserHasPermission(player.UserIDString, perm)) return true;
            if (perm.Contains(".") && permission.UserHasPermission(player.UserIDString, perm.Replace("${className.toLowerCase()}.", "rustelite."))) return true;
            return false;
        }

        private bool IsVip(BasePlayer player) => HasPermission(player, PermVIP);

        private void OnServerInitialized()
        {
            Puts($"{Name} v{Version} inicializado com sucesso!");
        }

        private void Unload()
        {
            ${hasCui ? `foreach (BasePlayer player in BasePlayer.activePlayerList)
            {
                CuiHelper.DestroyUi(player, "RustPlugin_MainCui");
            }` : ''}
            Puts($"{Name} descarregado com seguranca.");
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
                ["NoBuildingPrivilege"] = "<color=#e74c3c>Construcao Bloqueada:</color> Voce nao possui autorizacao no Armario (Building Privilege / TC) para criar uma home nesta base!",
                ["NotOnFoundation"] = "<color=#e74c3c>Fundacao Necessaria:</color> Voce precisa estar pisando em cima de uma Fundacao (Foundation) para salvar esta home!",
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
                ["NoBuildingPrivilege"] = "<color=#e74c3c>Building Blocked:</color> You do not have Building Privilege (TC authorization) to set a home in this base!",
                ["NotOnFoundation"] = "<color=#e74c3c>Foundation Required:</color> You must be standing directly on a Foundation to set a home here!",
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
            if (!_config.General.EnableHomes)
            {
                SendReply(player, $"{_config.General.ChatPrefix} O sistema de homes esta temporariamente desativado no servidor.");
                return;
            }

            if (!HasPermission(player, PermUSE))
            {
                SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("NoPermission", player)}");
                return;
            }

            if (args.Length == 0)
            {
                SendReply(player, $"{_config.General.ChatPrefix} Uso correto: /sethome <nome>");
                return;
            }

            string homeName = args[0].ToLowerInvariant();
            PlayerData data = GetOrCreatePlayerData(player.userID);

            bool isVip = IsVip(player);
            int maxAllowed = isVip ? _config.Homes.MaxHomesVip : _config.Homes.MaxHomesDefault;

            if (data.Homes.Count >= maxAllowed && !data.Homes.ContainsKey(homeName))
            {
                SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("HomeLimitReached", player, maxAllowed)}");
                return;
            }

            if (_config.Homes.RequireBuildingPrivilege && !player.CanBuild())
            {
                SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("NoBuildingPrivilege", player)}");
                return;
            }

            if (_config.Homes.RequireFoundation && !IsPlayerOnFoundation(player))
            {
                SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("NotOnFoundation", player)}");
                return;
            }

            data.Homes[homeName] = player.transform.position;
            SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("HomeSet", player, homeName)}");
            Effect.server.Run("assets/prefabs/tools/c4/effects/c4_stick.prefab", player.transform.position);
        }

        [ChatCommand("home")]
        private void CmdHome(BasePlayer player, string command, string[] args)
        {
            if (!_config.General.EnableHomes)
            {
                SendReply(player, $"{_config.General.ChatPrefix} O sistema de homes esta temporariamente desativado no servidor.");
                return;
            }

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

            string homeName = args[0].ToLowerInvariant();
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
        }

        [ChatCommand("delhome")]
        private void CmdDelHome(BasePlayer player, string command, string[] args)
        {
            if (!_config.General.EnableHomes)
            {
                SendReply(player, $"{_config.General.ChatPrefix} O sistema de homes esta temporariamente desativado no servidor.");
                return;
            }

            if (args.Length == 0)
            {
                SendReply(player, $"{_config.General.ChatPrefix} Uso correto: /delhome <nome>");
                return;
            }

            string homeName = args[0].ToLowerInvariant();
            PlayerData pData = GetOrCreatePlayerData(player.userID);

            if (!pData.Homes.ContainsKey(homeName))
            {
                SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("HomeNotFound", player, homeName)}");
                return;
            }

            pData.Homes.Remove(homeName);
            SendReply(player, $"{_config.General.ChatPrefix} Home '<color=#f39c12>{homeName}</color>' removida com sucesso!");
        }

        [ChatCommand("removehome")]
        private void CmdRemoveHome(BasePlayer player, string command, string[] args) => CmdDelHome(player, command, args);` : ''}

        ${hasKits ? `[ChatCommand("kit")]
        private void CmdKit(BasePlayer player, string command, string[] args)
        {
            if (!_config.General.EnableKits)
            {
                SendReply(player, $"{_config.General.ChatPrefix} O sistema de kits esta temporariamente desativado no servidor.");
                return;
            }

            if (args.Length == 0)
            {
                ${hasCui ? 'OpenKitCui(player);' : `
                SendReply(player, $"{_config.General.ChatPrefix} Kits disponiveis: starter, builder, vip. Use /kit <nome>.");
                `}
                return;
            }

            string subCmd = args[0].ToLowerInvariant();

            // Comandos administrativos para criacao e edicao in-game de kits
            if (subCmd == "add" || subCmd == "create" || subCmd == "criar")
            {
                if (!HasPermission(player, PermADMIN) && !player.IsAdmin)
                {
                    SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("NoPermission", player)}");
                    return;
                }

                if (args.Length < 2)
                {
                    SendReply(player, $"{_config.General.ChatPrefix} <color=#f39c12>Uso:</color> /kit add <nome> [cooldown_segundos] [vip]");
                    SendReply(player, $"{_config.General.ChatPrefix} <color=#7f8c8d>Dica: Organize seu inventario com os itens desejados antes de executar.</color>");
                    return;
                }

                string kitName = args[1];
                int cooldown = 300;
                bool isVip = false;

                if (args.Length >= 3 && int.TryParse(args[2], out int cd)) cooldown = cd;
                if (args.Length >= 4 && (args[3].ToLowerInvariant() == "vip" || args[3].ToLowerInvariant() == "true")) isVip = true;

                CreateKitFromPlayerInventory(player, kitName, cooldown, isVip);
                return;
            }

            if (subCmd == "remove" || subCmd == "delete" || subCmd == "del")
            {
                if (!HasPermission(player, PermADMIN) && !player.IsAdmin)
                {
                    SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("NoPermission", player)}");
                    return;
                }

                if (args.Length < 2)
                {
                    SendReply(player, $"{_config.General.ChatPrefix} <color=#f39c12>Uso:</color> /kit remove <nome>");
                    return;
                }

                RemoveKit(player, args[1]);
                return;
            }

            if (subCmd == "list" || subCmd == "listar")
            {
                if (!HasPermission(player, PermADMIN) && !player.IsAdmin)
                {
                    SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("NoPermission", player)}");
                    return;
                }

                ListKitsAdmin(player);
                return;
            }

            ClaimKit(player, subCmd);
        }

        private void CreateKitFromPlayerInventory(BasePlayer player, string kitName, int cooldown, bool isVip)
        {
            if (_config.Kits == null) _config.Kits = new List<KitConfig>();

            string id = kitName.ToLowerInvariant().Replace(" ", "_");
            KitConfig existing = _config.Kits.FirstOrDefault(k => (k.Id != null && k.Id.Equals(id, StringComparison.OrdinalIgnoreCase)) || (k.Name != null && k.Name.Equals(kitName, StringComparison.OrdinalIgnoreCase)));

            List<KitItemConfig> items = new List<KitItemConfig>();

            if (player.inventory?.containerBelt?.itemList != null)
            {
                foreach (Item item in player.inventory.containerBelt.itemList)
                {
                    if (item?.info == null) continue;
                    items.Add(new KitItemConfig { Shortname = item.info.shortname, Name = item.info.displayName.translated ?? item.info.shortname, Amount = item.amount });
                }
            }

            if (player.inventory?.containerMain?.itemList != null)
            {
                foreach (Item item in player.inventory.containerMain.itemList)
                {
                    if (item?.info == null) continue;
                    items.Add(new KitItemConfig { Shortname = item.info.shortname, Name = item.info.displayName.translated ?? item.info.shortname, Amount = item.amount });
                }
            }

            if (player.inventory?.containerWear?.itemList != null)
            {
                foreach (Item item in player.inventory.containerWear.itemList)
                {
                    if (item?.info == null) continue;
                    items.Add(new KitItemConfig { Shortname = item.info.shortname, Name = item.info.displayName.translated ?? item.info.shortname, Amount = item.amount });
                }
            }

            if (items.Count == 0)
            {
                SendReply(player, $"{_config.General.ChatPrefix} <color=#e74c3c>Erro:</color> Seu inventario esta vazio! Coloque no seu inventario os itens que farao parte do kit.");
                return;
            }

            if (existing != null)
            {
                existing.Name = kitName;
                existing.CooldownSeconds = cooldown;
                existing.PermissionRequired = isVip ? PermVIP : string.Empty;
                existing.Items = items;
                SendReply(player, $"{_config.General.ChatPrefix} <color=#2ecc71>Sucesso:</color> Kit <color=#f39c12>{kitName}</color> atualizado com {items.Count} itens do seu inventario!");
            }
            else
            {
                KitConfig newKit = new KitConfig
                {
                    Id = id,
                    Name = kitName,
                    Description = isVip ? "Kit exclusivo para membros VIP." : "Kit criado in-game pelo administrador.",
                    CooldownSeconds = cooldown,
                    PermissionRequired = isVip ? PermVIP : string.Empty,
                    Items = items
                };
                _config.Kits.Add(newKit);
                SendReply(player, $"{_config.General.ChatPrefix} <color=#2ecc71>Sucesso:</color> Novo kit <color=#f39c12>{kitName}</color> criado com {items.Count} itens do seu inventario!");
            }

            SaveConfig();
            Effect.server.Run("assets/bundled/prefabs/fx/notice/loot.drag.drop.fx.prefab", player.transform.position);
            Puts($"[Kits] Administrador {player.displayName} ({player.UserIDString}) salvou o kit '{kitName}' com {items.Count} itens.");
        }

        private void RemoveKit(BasePlayer player, string kitName)
        {
            if (_config.Kits == null) return;
            string id = kitName.ToLowerInvariant().Replace(" ", "_");
            int removed = _config.Kits.RemoveAll(k => (k.Id != null && k.Id.Equals(id, StringComparison.OrdinalIgnoreCase)) || (k.Name != null && k.Name.Equals(kitName, StringComparison.OrdinalIgnoreCase)));

            if (removed > 0)
            {
                SaveConfig();
                SendReply(player, $"{_config.General.ChatPrefix} <color=#2ecc71>Sucesso:</color> O kit <color=#f39c12>{kitName}</color> foi removido com sucesso!");
                Puts($"[Kits] Administrador {player.displayName} removeu o kit '{kitName}'.");
            }
            else
            {
                SendReply(player, $"{_config.General.ChatPrefix} <color=#e74c3c>Erro:</color> Kit '{kitName}' nao encontrado.");
            }
        }

        private void ListKitsAdmin(BasePlayer player)
        {
            if (_config.Kits == null || _config.Kits.Count == 0)
            {
                SendReply(player, $"{_config.General.ChatPrefix} Nenhum kit cadastrado no momento.");
                return;
            }

            SendReply(player, $"{_config.General.ChatPrefix} <color=#3498db>=== KITS REGISTRADOS NO SERVIDOR ===</color>");
            foreach (KitConfig k in _config.Kits)
            {
                string vipTag = !string.IsNullOrEmpty(k.PermissionRequired) ? "<color=#f1c40f>[VIP]</color>" : "<color=#2ecc71>[Livre]</color>";
                int itemCount = k.Items != null ? k.Items.Count : 0;
                SendReply(player, $"{vipTag} <color=#f39c12>{k.Name}</color> (ID: {k.Id}) - Recarga: {k.CooldownSeconds}s - Itens: {itemCount}");
            }
            SendReply(player, $"{_config.General.ChatPrefix} <color=#7f8c8d>Comandos: /kit add <nome> [cd] [vip] | /kit remove <nome></color>");
        }` : ''}

        ${hasAutoDoors ? `[ChatCommand("ad")]
        private void CmdAutoDoor(BasePlayer player, string command, string[] args)
        {
            if (!_config.General.EnableAutoDoors)
            {
                SendReply(player, $"{_config.General.ChatPrefix} O sistema de AutoDoors esta desativado no servidor.");
                return;
            }

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

        ${hasGather ? `[ChatCommand("rates")]
        private void CmdRates(BasePlayer player, string command, string[] args)
        {
            if (!_config.General.EnableGather)
            {
                SendReply(player, $"{_config.General.ChatPrefix} O modulo de taxas de coleta esta desativado no servidor.");
                return;
            }

            bool isAdmin = HasPermission(player, PermADMIN) || player.IsAdmin;

            // Suporte para administradores alterarem as taxas e configs em tempo real sem precisar reiniciar
            if (isAdmin && args.Length >= 2)
            {
                string subCmd = args[0].ToLowerInvariant();
                if ((subCmd == "set" || subCmd == "padrao" || subCmd == "default") && float.TryParse(args[1], out float newRate))
                {
                    _config.Gather.DefaultMultiplier = Mathf.Max(1.0f, newRate);
                    SaveConfig();
                    SendReply(player, $"{_config.General.ChatPrefix} <color=#2ecc71>Sucesso!</color> Taxa padrao atualizada para <color=#f39c12>{_config.Gather.DefaultMultiplier}x</color> e salva no JSON.");
                    return;
                }
                if ((subCmd == "vip") && float.TryParse(args[1], out float newVipRate))
                {
                    _config.Gather.VipMultiplier = Mathf.Max(1.0f, newVipRate);
                    SaveConfig();
                    SendReply(player, $"{_config.General.ChatPrefix} <color=#2ecc71>Sucesso!</color> Taxa VIP atualizada para <color=#f1c40f>{_config.Gather.VipMultiplier}x</color> e salva no JSON.");
                    return;
                }
                if (subCmd == "efficiency" || subCmd == "eficiencia")
                {
                    string val = args[1].ToLowerInvariant();
                    _config.Gather.FullGatherEfficiency = (val == "on" || val == "true" || val == "1" || val == "ativar");
                    SaveConfig();
                    string st = _config.Gather.FullGatherEfficiency ? "<color=#2ecc71>FORCADA 100% (Todas as ferramentas rendem 100% do no)</color>" : "<color=#e67e22>VANILLA PROGRESSIVO (Britadeira 100%, Picareta Metal 77.5%, Pedra 64.5%)</color>";
                    SendReply(player, $"{_config.General.ChatPrefix} Eficiencia de ferramentas alterada para: {st} e salva no JSON.");
                    return;
                }
                if (subCmd == "smelt" || subCmd == "autosmelt")
                {
                    string val = args[1].ToLowerInvariant();
                    _config.Gather.AutoSmeltOres = (val == "on" || val == "true" || val == "1" || val == "ativar");
                    SaveConfig();
                    string st = _config.Gather.AutoSmeltOres ? "<color=#2ecc71>ATIVADA</color>" : "<color=#e74c3c>DESATIVADA</color>";
                    SendReply(player, $"{_config.General.ChatPrefix} Fundicao automatica alterada para: {st} e salva no JSON.");
                    return;
                }
            }

            bool isVip = IsVip(player);
            float currentRate = isVip ? _config.Gather.VipMultiplier : _config.Gather.DefaultMultiplier;
            string statusVip = isVip ? "<color=#f1c40f>[VIP Ativo]</color>" : "<color=#7f8c8d>[Padrao]</color>";
            string smeltStatus = _config.Gather.AutoSmeltOres ? "<color=#2ecc71>Ativado</color>" : "<color=#e74c3c>Desativado</color>";
            string effStatus = _config.Gather.FullGatherEfficiency ? "<color=#2ecc71>Forcada 100%</color>" : "<color=#e67e22>Vanilla Progressivo (Padrao do Rust)</color>";

            SendReply(player, $"{_config.General.ChatPrefix} <color=#3498db>=== TAXAS DE COLETA (GATHER RATES) ===</color>");
            SendReply(player, $"{_config.General.ChatPrefix} Sua taxa atual: <color=#2ecc71>{currentRate}x</color> {statusVip}");
            SendReply(player, $"{_config.General.ChatPrefix} Multiplicador: Padrao <color=#f39c12>{_config.Gather.DefaultMultiplier}x</color> | VIP <color=#f1c40f>{_config.Gather.VipMultiplier}x</color>");
            SendReply(player, $"{_config.General.ChatPrefix} Eficiencia de Ferramentas: {effStatus}");
            SendReply(player, $"{_config.General.ChatPrefix} Fundicao Automatica (Auto-Smelt): {smeltStatus}");
            if (isAdmin)
            {
                SendReply(player, $"{_config.General.ChatPrefix} <color=#7f8c8d>Comandos Admin ao vivo:</color>");
                SendReply(player, $"{_config.General.ChatPrefix} <color=#95a5a6>/rates set <1-20></color> | <color=#95a5a6>/rates vip <1-50></color>");
                SendReply(player, $"{_config.General.ChatPrefix} <color=#95a5a6>/rates efficiency on/off</color> | <color=#95a5a6>/rates smelt on/off</color>");
            }
        }

        [ChatCommand("taxas")]
        private void CmdTaxas(BasePlayer player, string command, string[] args) => CmdRates(player, command, args);` : ''}

        #endregion

        #region Game Hooks & Mechanics

        ${hasGather ? `// Processador central de multiplicador e fundicao de itens de dispensers (arvores, minerios, animais)
        private void ProcessDispenserItem(BasePlayer player, Item item)
        {
            if (player == null || item == null) return;

            bool isVip = IsVip(player);
            float multiplier = isVip ? _config.Gather.VipMultiplier : _config.Gather.DefaultMultiplier;

            // Compensacao opcional de ferramentas para render 100% do no (evita perda nativa de picareta comum)
            if (_config.Gather.FullGatherEfficiency && player.GetHeldEntity() != null)
            {
                string held = player.GetHeldEntity().ShortPrefabName?.ToLower() ?? "";
                if (held.Contains("pickaxe") && !held.Contains("icepick") && !held.Contains("stone") && !held.Contains("jackhammer"))
                {
                    multiplier *= 1.29032f; // Picareta de Metal normal (77.5% -> 100%)
                }
                else if (held.Contains("stone_pickaxe") || held.Contains("stone.pickaxe"))
                {
                    multiplier *= 1.55038f; // Picareta de Pedra (64.5% -> 100%)
                }
                else if (held.Contains("rock"))
                {
                    multiplier *= 2.5f; // Pedra inicial (40% -> 100%)
                }
                else if (held.Contains("hatchet") && !held.Contains("stone"))
                {
                    multiplier *= 1.33333f; // Machado de metal (75% -> 100%)
                }
                else if (held.Contains("stonehatchet") || held.Contains("stone_hatchet"))
                {
                    multiplier *= 1.66666f; // Machado de pedra (60% -> 100%)
                }
            }

            if (multiplier > 1.0f)
            {
                item.amount = (int)(item.amount * multiplier);
            }

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
        }

        // Multiplicador inteligente de coleta (arvores, pedras/minerios e animais - batidas regulares)
        private void OnDispenserGather(ResourceDispenser dispenser, BaseEntity entity, Item item)
        {
            if (!_config.General.EnableGather) return;
            BasePlayer player = entity as BasePlayer;
            if (player == null) return;
            ProcessDispenserItem(player, item);
        }

        // Multiplicador do BONUS FINAL de no de minerio e arvores (hotspot e quebra final do no)
        // CRUCIAL: Sem este hook, o bonus final de 250 pedra saia em 1x vanilla (750x10=7500 + 250 = 7750)
        private void OnDispenserBonus(ResourceDispenser dispenser, BasePlayer player, Item item)
        {
            if (!_config.General.EnableGather) return;
            if (player == null) return;
            ProcessDispenserItem(player, item);
        }

        // Multiplicador para recursos coletados do chao (pedras soltas, madeira, enxofre e tecido)
        private void OnCollectiblePickup(Item item, BasePlayer player)
        {
            if (!_config.General.EnableGather) return;
            if (player == null || item == null) return;

            bool isVip = IsVip(player);
            float multiplier = isVip ? _config.Gather.VipMultiplier : _config.Gather.DefaultMultiplier;

            if (multiplier > 1.0f)
            {
                item.amount = (int)(item.amount * multiplier);
            }

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
        }

        // Multiplicador para colheita de plantas (tecido de hemp, aboboras, milho, bagas)
        private void OnGrowableGathered(GrowableEntity plant, Item item, BasePlayer player)
        {
            if (!_config.General.EnableGather) return;
            if (player == null || item == null) return;

            bool isVip = IsVip(player);
            float multiplier = isVip ? _config.Gather.VipMultiplier : _config.Gather.DefaultMultiplier;

            if (multiplier > 1.0f)
            {
                item.amount = (int)(item.amount * multiplier);
            }
        }` : ''}

        ${hasAutoDoors ? `// Fechamento automatico de portas
        private void OnDoorOpened(Door door, BasePlayer player)
        {
            if (!_config.General.EnableAutoDoors) return;
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
            if (_config.General.EnableRaidAlarm && entity is BuildingBlock && (info.damageTypes.Has(Rust.DamageType.Explosion)))
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

        #region Console Commands (CUI Callbacks)

        [ConsoleCommand("rustelite.claimkit")]
        private void ConsoleCmdClaimKit(ConsoleSystem.Arg arg)
        {
            BasePlayer player = arg.Connection?.player as BasePlayer;
            if (player == null) player = arg.Player();
            if (player == null) return;

            string kitName = (arg.GetString(0, string.Empty) ?? string.Empty).ToLowerInvariant();
            if (string.IsNullOrEmpty(kitName)) return;

            ClaimKit(player, kitName);
            CuiHelper.DestroyUi(player, "RustPlugin_MainCui");
        }

        [ConsoleCommand("kit.claim")]
        private void ConsoleCmdKitClaim(ConsoleSystem.Arg arg)
        {
            ConsoleCmdClaimKit(arg);
        }

        #endregion

        #region Kits Logic & CUI Menu

        private void ClaimKit(BasePlayer player, string kitId)
        {
            if (!_config.General.EnableKits)
            {
                SendReply(player, $"{_config.General.ChatPrefix} O sistema de kits esta temporariamente desativado no servidor.");
                return;
            }

            PlayerData data = GetOrCreatePlayerData(player.userID);
            double now = GrabCurrentTime();

            if (data.KitCooldowns.TryGetValue(kitId, out double readyAt) && now < readyAt)
            {
                int remaining = (int)(readyAt - now);
                SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("KitCooldown", player, remaining)}");
                return;
            }

            // 1. Tenta carregar da lista de kits da configuracao JSON (permite editar ou criar novos kits diretamente no arquivo oxide/config/)
            KitConfig cfgKit = _config.Kits != null ? _config.Kits.FirstOrDefault(k => (k.Id != null && k.Id.Equals(kitId, StringComparison.OrdinalIgnoreCase)) || (k.Name != null && k.Name.Equals(kitId, StringComparison.OrdinalIgnoreCase))) : null;

            string kitDisplayName = cfgKit?.Name;

            if (cfgKit != null)
            {
                if (!string.IsNullOrEmpty(cfgKit.PermissionRequired) && !HasPermission(player, cfgKit.PermissionRequired))
                {
                    SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("NoPermission", player)}");
                    return;
                }

                if (cfgKit.Items != null)
                {
                    foreach (KitItemConfig item in cfgKit.Items)
                    {
                        GivePlayerItemSafe(player, item.Shortname, item.Amount);
                    }
                }

                data.KitCooldowns[kitId] = now + cfgKit.CooldownSeconds;
            }
            else
            {
                ${config.kits.map((kit, index) => `
                ${index === 0 ? 'if' : 'else if'} (kitId.Equals("${kit.id}", StringComparison.OrdinalIgnoreCase) || kitId.Equals("${kit.name.toLowerCase().replace(/"/g, '\\"')}", StringComparison.OrdinalIgnoreCase))
                {
                    kitDisplayName = "${kit.name.replace(/"/g, '\\"')}";
                    ${kit.permissionRequired ? `if (!IsVip(player))
                    {
                        SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("NoPermission", player)}");
                        return;
                    }` : ''}
                    ${kit.items.map(item => `GivePlayerItemSafe(player, "${item.shortname === 'stone' ? 'stones' : item.shortname === 'stone.hatchet' ? 'stonehatchet' : item.shortname}", ${item.amount});`).join('\n                    ')}
                    data.KitCooldowns[kitId] = now + ${kit.cooldownSeconds};
                }`).join('\n')}
                else
                {
                    SendReply(player, $"{_config.General.ChatPrefix} Kit nao encontrado.");
                    return;
                }
            }

            if (string.IsNullOrEmpty(kitDisplayName))
            {
                kitDisplayName = kitId.ToUpper();
            }

            SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("KitClaimed", player, kitDisplayName)}");
            Effect.server.Run("assets/bundled/prefabs/fx/notice/loot.drag.drop.fx.prefab", player.transform.position);
        }

        ${hasCui ? `public void OpenKitCui(BasePlayer player)
        {
            CuiHelper.DestroyUi(player, "RustPlugin_MainCui");

            CuiElementContainer container = new CuiElementContainer();

            // Fundo escuro semi-transparente
            container.Add(new CuiPanel
            {
                Image = { Color = "${config.cuiSecondaryColor}" },
                RectTransform = { AnchorMin = "0.15 0.15", AnchorMax = "0.85 0.85" },
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

            // Botoes dos kits renderizados em tempo de execucao a partir de _config.Kits
            List<KitConfig> activeKits = (_config.Kits != null && _config.Kits.Count > 0) ? _config.Kits : GetDefaultKits();

            for (int i = 0; i < activeKits.Count && i < 6; i++)
            {
                KitConfig kit = activeKits[i];
                int col = i % 3;
                int row = i / 3;
                float minX = 0.05f + col * 0.32f;
                float maxX = minX + 0.28f;
                float minY = 0.58f - row * 0.24f;
                float maxY = minY + 0.20f;
                string color = !string.IsNullOrEmpty(kit.PermissionRequired) ? "0.7 0.3 0.1 0.9" : (i % 2 == 0 ? "0.2 0.5 0.3 0.9" : "0.2 0.4 0.6 0.9");
                string desc = !string.IsNullOrEmpty(kit.Description) ? kit.Description : "Kit disponivel";

                container.Add(new CuiButton
                {
                    Button = { Command = "rustelite.claimkit " + kit.Id, Color = color },
                    RectTransform = { AnchorMin = $"{minX.ToString(System.Globalization.CultureInfo.InvariantCulture)} {minY.ToString(System.Globalization.CultureInfo.InvariantCulture)}", AnchorMax = $"{maxX.ToString(System.Globalization.CultureInfo.InvariantCulture)} {maxY.ToString(System.Globalization.CultureInfo.InvariantCulture)}" },
                    Text = { Text = $"RESGATAR {kit.Name.ToUpper()}\\n<size=10>{desc}</size>", FontSize = 13, Align = TextAnchor.MiddleCenter }
                }, "RustPlugin_MainCui");
            }

            // Dica de administracao in-game para administradores
            bool isAdmin = HasPermission(player, PermADMIN) || player.IsAdmin;
            if (isAdmin)
            {
                container.Add(new CuiLabel
                {
                    Text = { Text = "<color=#f1c40f>[ADMIN]:</color> Crie/atualize kits montando seu inventario e usando <color=#3498db>/kit add <nome> [cooldown] [vip]</color>", FontSize = 11, Align = TextAnchor.MiddleCenter },
                    RectTransform = { AnchorMin = "0.05 0.15", AnchorMax = "0.95 0.21" }
                }, "RustPlugin_MainCui");
            }

            // Botao Fechar
            container.Add(new CuiButton
            {
                Button = { Close = "RustPlugin_MainCui", Color = "0.8 0.2 0.2 0.9" },
                RectTransform = { AnchorMin = "0.4 0.04", AnchorMax = "0.6 0.13" },
                Text = { Text = "FECHAR", FontSize = 13, Align = TextAnchor.MiddleCenter }
            }, "RustPlugin_MainCui");

            CuiHelper.AddUi(player, container);
        }` : ''}

        #endregion

        #region Helpers

        private string NormalizeItemShortname(string shortname)
        {
            if (string.IsNullOrEmpty(shortname)) return string.Empty;
            string s = shortname.Trim().ToLowerInvariant();
            if (s == "stone") return "stones";
            if (s == "stone.hatchet") return "stonehatchet";
            return s;
        }

        private void GivePlayerItemSafe(BasePlayer player, string shortname, int amount)
        {
            if (player == null || amount <= 0) return;
            string actualShortname = NormalizeItemShortname(shortname);
            Item item = ItemManager.CreateByName(actualShortname, amount);
            if (item != null)
            {
                player.inventory.GiveItem(item);
            }
            else
            {
                Puts($"[Aviso] Falha ao criar item com shortname '{shortname}' (normalizado: '{actualShortname}') para o jogador {player.displayName}.");
            }
        }

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

        private bool IsPlayerOnFoundation(BasePlayer player)
        {
            if (player == null) return false;
            RaycastHit hit;
            if (UnityEngine.Physics.Raycast(player.transform.position + Vector3.up * 0.5f, Vector3.down, out hit, 2.0f, UnityEngine.LayerMask.GetMask("Construction")))
            {
                BuildingBlock block = hit.GetEntity() as BuildingBlock;
                if (block != null && (block.PrefabName.Contains("foundation") || block.blockDefinition?.hierachyName?.ToLowerInvariant().Contains("foundation") == true))
                {
                    return true;
                }
            }
            return false;
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
      AtivarNotificacoesSonoras: true,
      AtivarModuloKits: config.enableKits,
      AtivarModuloHomes: config.enableHomes,
      AtivarModuloMultiplicadorColeta: config.enableGatherMultiplier,
      AtivarModuloAutoDoors: config.enableAutoDoors,
      AtivarModuloAlarmeRaid: config.enableRaidAlerts
    },
    MultiplicadoresDeColeta: {
      MultiplicadorPadrao: config.gatherMultiplier,
      MultiplicadorVIP: config.vipGatherMultiplier,
      FundirMineriosAutomaticamente: config.enableAutoSmelt,
      ForcarEficienciaMaxima100Porcento: config.enableFullGatherEfficiency === true
    },
    ConfiguracoesDeHomes: {
      MaximoHomesPadrao: config.maxHomesDefault,
      MaximoHomesVIP: config.maxHomesVip,
      TempoContagemTeleporteSegundos: config.teleportCountdownSeconds,
      TempoRecargaTeleporteSegundos: config.teleportCooldownSeconds,
      BloqueioEmCombateSegundos: config.combatBlockSeconds,
      ExigirAutorizacaoArmarioTC: config.requireBuildingPrivilege !== false,
      ExigirEstarEmCimaDeFundacao: config.requireFoundationOnHome === true
    },
    ConfiguracoesAutoDoor: {
      TempoPadraoFechamentoSegundos: config.autoDoorDefaultSeconds
    },
    ConfiguracoesRaidAlarm: {
      DiscordWebhookUrl: config.discordWebhookUrl,
      RaioDeteccaoExplosaoMetros: 40.0
    },
    ListaDeKits: config.kits.map(k => ({
      Id: k.id,
      Nome: k.name,
      Descricao: k.description,
      CooldownSegundos: k.cooldownSeconds,
      PermissaoRequerida: k.permissionRequired || "",
      Itens: k.items.map(it => {
        let shortname = it.shortname;
        if (shortname === 'stone') shortname = 'stones';
        if (shortname === 'stone.hatchet') shortname = 'stonehatchet';
        return {
          Shortname: shortname,
          Nome: it.name,
          Quantidade: it.amount
        };
      })
    }))
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
      NoBuildingPrivilege: "<color=#e74c3c>Construção Bloqueada:</color> Você não possui autorização no Armário (Building Privilege / TC) para criar uma home nesta base!",
      NotOnFoundation: "<color=#e74c3c>Fundação Necessária:</color> Você precisa estar pisando em cima de uma Fundação (Foundation) para salvar esta home!",
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
    NoBuildingPrivilege: "<color=#e74c3c>Building Blocked:</color> You do not have Building Privilege (TC authorization) to set a home in this base!",
    NotOnFoundation: "<color=#e74c3c>Foundation Required:</color> You must be standing directly on a Foundation to set a home here!",
    AutoDoorToggled: "<color=#2ecc71>AutoDoor:</color> Automatic doors {0} with delay of {1}s.",
    RaidAlert: "<color=#e74c3c>[RAID ALERT]</color> Explosives detonated near your base!"
  }, null, 2);
}

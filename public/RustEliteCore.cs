// =========================================================================
// Plugin Gerado por Rust Plugin Studio para Oxide/uMod & Carbon
// Compatível com Facepunch Rust Dedicated Server
// Salve este arquivo como: oxide/plugins/RustEliteCore.cs
// =========================================================================

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Newtonsoft.Json;
using Oxide.Core;
using Oxide.Core.Libraries.Covalence;
using Oxide.Core.Plugins;
using Oxide.Game.Rust.Cui;
using UnityEngine;

namespace Oxide.Plugins
{
    [Info("RustEliteCore", "brtaskgamer", "2.2.3")]
    [Description("Plugin completo de utilidades essenciais para Rust: Kits com CUI, Homes & Teleporte com verificação de combate, Multiplicador de Coleta (Rates), AutoDoors inteligentes e Alertas de Raid.")]
    public class RustEliteCore : RustPlugin
    {
        #region Fields & Declarations

        private PluginConfig _config;
        private readonly Dictionary<ulong, PlayerData> _playerData = new Dictionary<ulong, PlayerData>();
        private readonly Dictionary<ulong, float> _combatTimers = new Dictionary<ulong, float>();

        private const string PermUSE = "rustelitecore.use";
        private const string PermVIP = "rustelitecore.vip";
        private const string PermADMIN = "rustelitecore.admin";

        private class PlayerData
        {
            public Dictionary<string, Vector3> Homes { get; set; } = new Dictionary<string, Vector3>();
            public Dictionary<string, double> KitCooldowns { get; set; } = new Dictionary<string, double>();
            public bool AutoDoorEnabled { get; set; } = true;
            public float AutoDoorDelay { get; set; } = 5.0f;
        }

        #endregion

        #region Configuration

        private class PluginConfig
        {
            [JsonProperty(PropertyName = "ConfiguracoesGerais")]
            public GeneralSettings General { get; set; } = new GeneralSettings();

            [JsonProperty(PropertyName = "MultiplicadoresDeColeta")]
            public GatherSettings Gather { get; set; } = new GatherSettings();

            [JsonProperty(PropertyName = "ConfiguracoesDeHomes")]
            public HomeSettings Homes { get; set; } = new HomeSettings();

            [JsonProperty(PropertyName = "ConfiguracoesAutoDoor")]
            public AutoDoorSettings AutoDoors { get; set; } = new AutoDoorSettings();

            [JsonProperty(PropertyName = "ConfiguracoesRaidAlarm")]
            public RaidSettings Raid { get; set; } = new RaidSettings();

            [JsonProperty(PropertyName = "ListaDeKits")]
            public List<KitConfig> Kits { get; set; } = new List<KitConfig>();

        }

        public class KitConfig
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
        }

        private class GeneralSettings
        {
            [JsonProperty("PrefixoChat")]
            public string ChatPrefix { get; set; } = "<color=#ce422b>[RustEliteCore]</color>";

            [JsonProperty("AtivarNotificacoesSonoras")]
            public bool EnableSoundEffects { get; set; } = true;

            [JsonProperty("AtivarModuloKits")]
            public bool EnableKits { get; set; } = true;

            [JsonProperty("AtivarModuloHomes")]
            public bool EnableHomes { get; set; } = true;

            [JsonProperty("AtivarModuloMultiplicadorColeta")]
            public bool EnableGather { get; set; } = true;

            [JsonProperty("AtivarModuloAutoDoors")]
            public bool EnableAutoDoors { get; set; } = true;

            [JsonProperty("AtivarModuloAlarmeRaid")]
            public bool EnableRaidAlarm { get; set; } = true;
        }

        private class GatherSettings
        {
            [JsonProperty("MultiplicadorPadrao")]
            public float DefaultMultiplier { get; set; } = 3.0f;

            [JsonProperty("MultiplicadorVIP")]
            public float VipMultiplier { get; set; } = 5.0f;

            [JsonProperty("FundirMineriosAutomaticamente")]
            public bool AutoSmeltOres { get; set; } = true;
        }

        private class HomeSettings
        {
            [JsonProperty("MaximoHomesPadrao")]
            public int MaxHomesDefault { get; set; } = 3;

            [JsonProperty("MaximoHomesVIP")]
            public int MaxHomesVip { get; set; } = 6;

            [JsonProperty("TempoContagemTeleporteSegundos")]
            public int CountdownSeconds { get; set; } = 15;

            [JsonProperty("TempoRecargaTeleporteSegundos")]
            public int CooldownSeconds { get; set; } = 60;

            [JsonProperty("BloqueioEmCombateSegundos")]
            public int CombatBlockSeconds { get; set; } = 30;
        }

        private class AutoDoorSettings
        {
            [JsonProperty("TempoPadraoFechamentoSegundos")]
            public float DefaultCloseDelay { get; set; } = 5.0f;
        }

        private class RaidSettings
        {
            [JsonProperty("DiscordWebhookUrl")]
            public string DiscordWebhook { get; set; } = "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL_HERE";

            [JsonProperty("RaioDeteccaoExplosaoMetros")]
            public float DetectionRadius { get; set; } = 40.0f;
        }

        protected override void LoadDefaultConfig()
        {
            PrintWarning("Criando novo arquivo de configuracao para " + Name + "...");
            _config = new PluginConfig
            {
                Kits = GetDefaultKits()
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

            SyncDefaultKits();

            SaveConfig();
        }

        private void SyncDefaultKits()
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
                new KitConfig
                {
                    Id = "starter",
                    Name = "Starter",
                    Description = "Kit inicial essencial para sobreviver após o wipe.",
                    CooldownSeconds = 120,
                    PermissionRequired = "",
                    Items = new List<KitItemConfig>
                    {
                        new KitItemConfig { Shortname = "stone.hatchet", Name = "Machado de Pedra", Amount = 1 },
                        new KitItemConfig { Shortname = "stone.pickaxe", Name = "Picareta de Pedra", Amount = 1 },
                        new KitItemConfig { Shortname = "bandage", Name = "Bandagem", Amount = 3 },
                        new KitItemConfig { Shortname = "wood", Name = "Madeira", Amount = 1000 },
                        new KitItemConfig { Shortname = "stone", Name = "Pedra", Amount = 1000 }
                    }
                },
                new KitConfig
                {
                    Id = "builder",
                    Name = "Builder Pro",
                    Description = "Recursos e ferramentas de construção de bases.",
                    CooldownSeconds = 600,
                    PermissionRequired = "",
                    Items = new List<KitItemConfig>
                    {
                        new KitItemConfig { Shortname = "building.planner", Name = "Plano de Construção", Amount = 1 },
                        new KitItemConfig { Shortname = "hammer", Name = "Martelo", Amount = 1 },
                        new KitItemConfig { Shortname = "wood", Name = "Madeira", Amount = 5000 },
                        new KitItemConfig { Shortname = "stone", Name = "Pedra", Amount = 5000 },
                        new KitItemConfig { Shortname = "metal.fragments", Name = "Fragmentos de Metal", Amount = 2000 },
                        new KitItemConfig { Shortname = "door.hinged.metal", Name = "Porta de Metal", Amount = 2 },
                        new KitItemConfig { Shortname = "lock.code", Name = "Code Lock", Amount = 2 }
                    }
                },
                new KitConfig
                {
                    Id = "vip",
                    Name = "VIP Elite",
                    Description = "Equipamento tático premium para jogadores com permissão VIP.",
                    CooldownSeconds = 1800,
                    PermissionRequired = "rustelitecore.vip",
                    Items = new List<KitItemConfig>
                    {
                        new KitItemConfig { Shortname = "rifle.ak", Name = "Assault Rifle (AK-47)", Amount = 1 },
                        new KitItemConfig { Shortname = "ammo.rifle", Name = "Munição 5.56", Amount = 128 },
                        new KitItemConfig { Shortname = "syringe.medical", Name = "Seringa Médica", Amount = 4 },
                        new KitItemConfig { Shortname = "metal.facemask", Name = "Máscara Facial de Metal", Amount = 1 },
                        new KitItemConfig { Shortname = "metal.plate.torso", Name = "Colete de Metal", Amount = 1 },
                        new KitItemConfig { Shortname = "hoodie", Name = "Casaco Militar", Amount = 1 },
                        new KitItemConfig { Shortname = "pants", Name = "Calça Tática", Amount = 1 },
                        new KitItemConfig { Shortname = "scrap", Name = "Scrap (Sucata)", Amount = 250 }
                    }
                }
            };
        }

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
            if (perm.Contains(".") && permission.UserHasPermission(player.UserIDString, perm.Replace("rustelitecore.", "rustelite."))) return true;
            return false;
        }

        private bool IsVip(BasePlayer player) => HasPermission(player, PermVIP);

        private void OnServerInitialized()
        {
            Puts($"{Name} v{Version} inicializado com sucesso!");
        }

        private void Unload()
        {
            foreach (BasePlayer player in BasePlayer.activePlayerList)
            {
                CuiHelper.DestroyUi(player, "RustPlugin_MainCui");
            }
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

        [ChatCommand("sethome")]
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

        [ChatCommand("kit")]
        private void CmdKit(BasePlayer player, string command, string[] args)
        {
            if (!_config.General.EnableKits)
            {
                SendReply(player, $"{_config.General.ChatPrefix} O sistema de kits esta temporariamente desativado no servidor.");
                return;
            }

            if (args.Length == 0)
            {
                OpenKitCui(player);
                return;
            }

            string kitName = args[0].ToLowerInvariant();
            ClaimKit(player, kitName);
        }

        [ChatCommand("ad")]
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
        }

        #endregion

        #region Game Hooks & Mechanics

        // Multiplicador inteligente de coleta
        private void OnDispenserGather(ResourceDispenser dispenser, BaseEntity entity, Item item)
        {
            if (!_config.General.EnableGather) return;

            BasePlayer player = entity as BasePlayer;
            if (player == null || item == null) return;

            bool isVip = IsVip(player);
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
        }

        // Fechamento automatico de portas
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
        }

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

            // Deteccao de Raid em bases
            if (_config.General.EnableRaidAlarm && entity is BuildingBlock && (info.damageTypes.Has(Rust.DamageType.Explosion)))
            {
                BasePlayer owner = BasePlayer.FindByID(entity.OwnerID);
                if (owner != null && owner.IsConnected)
                {
                    SendReply(owner, $"{_config.General.ChatPrefix} {GetMessage("RaidAlert", owner)}");
                    Effect.server.Run("assets/prefabs/weapons/satchelcharge/effects/satchel_charge_explosion.prefab", entity.transform.position);
                }
            }
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
                        player.inventory.GiveItem(ItemManager.CreateByName(item.Shortname, item.Amount));
                    }
                }

                data.KitCooldowns[kitId] = now + cfgKit.CooldownSeconds;
            }
            else
            {
                
                if (kitId.Equals("starter", StringComparison.OrdinalIgnoreCase) || kitId.Equals("starter", StringComparison.OrdinalIgnoreCase))
                {
                    kitDisplayName = "Starter";
                    
                    player.inventory.GiveItem(ItemManager.CreateByName("stone.hatchet", 1));
                    player.inventory.GiveItem(ItemManager.CreateByName("stone.pickaxe", 1));
                    player.inventory.GiveItem(ItemManager.CreateByName("bandage", 3));
                    player.inventory.GiveItem(ItemManager.CreateByName("wood", 1000));
                    player.inventory.GiveItem(ItemManager.CreateByName("stone", 1000));
                    data.KitCooldowns[kitId] = now + 120;
                }

                else if (kitId.Equals("builder", StringComparison.OrdinalIgnoreCase) || kitId.Equals("builder pro", StringComparison.OrdinalIgnoreCase))
                {
                    kitDisplayName = "Builder Pro";
                    
                    player.inventory.GiveItem(ItemManager.CreateByName("building.planner", 1));
                    player.inventory.GiveItem(ItemManager.CreateByName("hammer", 1));
                    player.inventory.GiveItem(ItemManager.CreateByName("wood", 5000));
                    player.inventory.GiveItem(ItemManager.CreateByName("stone", 5000));
                    player.inventory.GiveItem(ItemManager.CreateByName("metal.fragments", 2000));
                    player.inventory.GiveItem(ItemManager.CreateByName("door.hinged.metal", 2));
                    player.inventory.GiveItem(ItemManager.CreateByName("lock.code", 2));
                    data.KitCooldowns[kitId] = now + 600;
                }

                else if (kitId.Equals("vip", StringComparison.OrdinalIgnoreCase) || kitId.Equals("vip elite", StringComparison.OrdinalIgnoreCase))
                {
                    kitDisplayName = "VIP Elite";
                    if (!IsVip(player))
                    {
                        SendReply(player, $"{_config.General.ChatPrefix} {GetMessage("NoPermission", player)}");
                        return;
                    }
                    player.inventory.GiveItem(ItemManager.CreateByName("rifle.ak", 1));
                    player.inventory.GiveItem(ItemManager.CreateByName("ammo.rifle", 128));
                    player.inventory.GiveItem(ItemManager.CreateByName("syringe.medical", 4));
                    player.inventory.GiveItem(ItemManager.CreateByName("metal.facemask", 1));
                    player.inventory.GiveItem(ItemManager.CreateByName("metal.plate.torso", 1));
                    player.inventory.GiveItem(ItemManager.CreateByName("hoodie", 1));
                    player.inventory.GiveItem(ItemManager.CreateByName("pants", 1));
                    player.inventory.GiveItem(ItemManager.CreateByName("scrap", 250));
                    data.KitCooldowns[kitId] = now + 1800;
                }
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

        public void OpenKitCui(BasePlayer player)
        {
            CuiHelper.DestroyUi(player, "RustPlugin_MainCui");

            CuiElementContainer container = new CuiElementContainer();

            // Fundo escuro semi-transparente
            container.Add(new CuiPanel
            {
                Image = { Color = "0.12 0.13 0.16 0.92" },
                RectTransform = { AnchorMin = "0.15 0.15", AnchorMax = "0.85 0.85" },
                CursorEnabled = true
            }, "Overlay", "RustPlugin_MainCui");

            // Barra de titulo Rust
            container.Add(new CuiPanel
            {
                Image = { Color = "0.81 0.26 0.17 0.95" },
                RectTransform = { AnchorMin = "0 0.90", AnchorMax = "1 1" }
            }, "RustPlugin_MainCui", "RustPlugin_Header");

            container.Add(new CuiLabel
            {
                Text = { Text = "MENU DE KITS - RUSTELITECORE", FontSize = 18, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, "RustPlugin_Header");

            // Botoes dos kits gerados dinamicamente com comando de console registrado
            container.Add(new CuiButton
            {
                Button = { Command = "rustelite.claimkit starter", Color = "0.2 0.5 0.3 0.9" },
                RectTransform = { AnchorMin = "0.05 0.58", AnchorMax = "0.33 0.78" },
                Text = { Text = "RESGATAR STARTER\n<size=10>Kit inicial essencial para sobreviver após o wipe.</size>", FontSize = 13, Align = TextAnchor.MiddleCenter }
            }, "RustPlugin_MainCui");

            container.Add(new CuiButton
            {
                Button = { Command = "rustelite.claimkit builder", Color = "0.2 0.4 0.6 0.9" },
                RectTransform = { AnchorMin = "0.37 0.58", AnchorMax = "0.65 0.78" },
                Text = { Text = "RESGATAR BUILDER PRO\n<size=10>Recursos e ferramentas de construção de bases.</size>", FontSize = 13, Align = TextAnchor.MiddleCenter }
            }, "RustPlugin_MainCui");

            container.Add(new CuiButton
            {
                Button = { Command = "rustelite.claimkit vip", Color = "0.7 0.3 0.1 0.9" },
                RectTransform = { AnchorMin = "0.69 0.58", AnchorMax = "0.97 0.78" },
                Text = { Text = "RESGATAR VIP ELITE\n<size=10>Equipamento tático premium para jogadores com permissão VIP.</size>", FontSize = 13, Align = TextAnchor.MiddleCenter }
            }, "RustPlugin_MainCui");

            // Botao Fechar
            container.Add(new CuiButton
            {
                Button = { Close = "RustPlugin_MainCui", Color = "0.8 0.2 0.2 0.9" },
                RectTransform = { AnchorMin = "0.4 0.08", AnchorMax = "0.6 0.18" },
                Text = { Text = "FECHAR", FontSize = 13, Align = TextAnchor.MiddleCenter }
            }, "RustPlugin_MainCui");

            CuiHelper.AddUi(player, container);
        }

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

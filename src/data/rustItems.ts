export interface RustItemOption {
  shortname: string;
  name: string;
  category: 'armas' | 'municoes' | 'recursos' | 'ferramentas' | 'medicos' | 'armaduras' | 'construcao';
  defaultAmount: number;
}

export const POPULAR_RUST_ITEMS: RustItemOption[] = [
  // Armas
  { shortname: 'rifle.ak', name: 'Assault Rifle (AK-47)', category: 'armas', defaultAmount: 1 },
  { shortname: 'rifle.bolt', name: 'Bolt Action Rifle', category: 'armas', defaultAmount: 1 },
  { shortname: 'rifle.l96', name: 'L96 Sniper', category: 'armas', defaultAmount: 1 },
  { shortname: 'smg.thompson', name: 'Thompson SMG', category: 'armas', defaultAmount: 1 },
  { shortname: 'smg.mp5', name: 'MP5A4', category: 'armas', defaultAmount: 1 },
  { shortname: 'smg.2', name: 'Custom SMG', category: 'armas', defaultAmount: 1 },
  { shortname: 'pistol.semiauto', name: 'Semi-Automatic Pistol (SAP)', category: 'armas', defaultAmount: 1 },
  { shortname: 'shotgun.pump', name: 'Pump Shotgun', category: 'armas', defaultAmount: 1 },
  { shortname: 'rocket.launcher', name: 'Rocket Launcher', category: 'armas', defaultAmount: 1 },
  { shortname: 'explosive.timed', name: 'C4 (Timed Explosive)', category: 'armas', defaultAmount: 2 },
  { shortname: 'explosive.satchel', name: 'Satchel Charge', category: 'armas', defaultAmount: 4 },

  // Munições
  { shortname: 'ammo.rifle', name: 'Munição 5.56', category: 'municoes', defaultAmount: 128 },
  { shortname: 'ammo.pistol', name: 'Munição 9mm', category: 'municoes', defaultAmount: 120 },
  { shortname: 'ammo.shotgun', name: 'Cartuchos Calibre 12', category: 'municoes', defaultAmount: 32 },
  { shortname: 'ammo.rocket.basic', name: 'Foguete Básico', category: 'municoes', defaultAmount: 4 },

  // Médicos
  { shortname: 'syringe.medical', name: 'Seringa Médica', category: 'medicos', defaultAmount: 4 },
  { shortname: 'bandage', name: 'Bandagem', category: 'medicos', defaultAmount: 5 },
  { shortname: 'medkit', name: 'Large Medkit', category: 'medicos', defaultAmount: 2 },

  // Recursos
  { shortname: 'wood', name: 'Madeira', category: 'recursos', defaultAmount: 1000 },
  { shortname: 'stones', name: 'Pedra', category: 'recursos', defaultAmount: 1000 },
  { shortname: 'metal.fragments', name: 'Fragmentos de Metal', category: 'recursos', defaultAmount: 1000 },
  { shortname: 'metal.refined', name: 'Metal de Alta Qualidade (HQM)', category: 'recursos', defaultAmount: 50 },
  { shortname: 'sulfur', name: 'Enxofre Refinado', category: 'recursos', defaultAmount: 500 },
  { shortname: 'scrap', name: 'Scrap (Sucata)', category: 'recursos', defaultAmount: 250 },
  { shortname: 'cloth', name: 'Tecido (Cloth)', category: 'recursos', defaultAmount: 200 },
  { shortname: 'lowgradefuel', name: 'Combustível de Baixa Qualidade', category: 'recursos', defaultAmount: 100 },

  // Construção e Ferramentas
  { shortname: 'building.planner', name: 'Plano de Construção', category: 'construcao', defaultAmount: 1 },
  { shortname: 'hammer', name: 'Martelo', category: 'construcao', defaultAmount: 1 },
  { shortname: 'door.hinged.metal', name: 'Porta de Metal', category: 'construcao', defaultAmount: 2 },
  { shortname: 'door.hinged.toptier', name: 'Porta Blindada (Armored)', category: 'construcao', defaultAmount: 1 },
  { shortname: 'lock.code', name: 'Code Lock', category: 'construcao', defaultAmount: 2 },
  { shortname: 'stonehatchet', name: 'Machado de Pedra', category: 'ferramentas', defaultAmount: 1 },
  { shortname: 'stone.pickaxe', name: 'Picareta de Pedra', category: 'ferramentas', defaultAmount: 1 },
  { shortname: 'axe.salvaged', name: 'Machado Refinado', category: 'ferramentas', defaultAmount: 1 },
  { shortname: 'icepick.salvaged', name: 'Picareta de Gelo', category: 'ferramentas', defaultAmount: 1 },

  // Armaduras
  { shortname: 'metal.facemask', name: 'Máscara Facial de Metal', category: 'armaduras', defaultAmount: 1 },
  { shortname: 'metal.plate.torso', name: 'Colete de Metal', category: 'armaduras', defaultAmount: 1 },
  { shortname: 'hoodie', name: 'Casaco Militar', category: 'armaduras', defaultAmount: 1 },
  { shortname: 'pants', name: 'Calça Tática', category: 'armaduras', defaultAmount: 1 },
  { shortname: 'roadsign.jacket', name: 'Colete Roadsign', category: 'armaduras', defaultAmount: 1 },
  { shortname: 'roadsign.kilt', name: 'Kilt Roadsign', category: 'armaduras', defaultAmount: 1 },
  { shortname: 'hazmatsuit', name: 'Roupa Hazmat', category: 'armaduras', defaultAmount: 1 }
];

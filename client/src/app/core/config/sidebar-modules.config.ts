/**
 * Mapeo de ministerios/grupos a módulos del sidebar.
 * Si el usuario pertenece a un grupo, verá los módulos asignados.
 */

export const SIDEBAR_MODULES = {
  dashboard: 'dashboard',
  eventos: 'eventos',
  usuarios: 'usuarios',
  admin: 'admin',
  foro: 'foro',
  servSocial: 'serv-social',
  biblia: 'biblia',
} as const;

export type SidebarModuleKey = (typeof SIDEBAR_MODULES)[keyof typeof SIDEBAR_MODULES];

/** Grupos que dan acceso a cada módulo (por nombre del grupo) */
export const GROUP_TO_MODULES: Record<string, SidebarModuleKey[]> = {
  'Servicio Social': [SIDEBAR_MODULES.servSocial],
  'Departamento Staff': [
    SIDEBAR_MODULES.dashboard,
    SIDEBAR_MODULES.eventos,
    SIDEBAR_MODULES.usuarios,
    SIDEBAR_MODULES.foro,
    SIDEBAR_MODULES.servSocial,
    SIDEBAR_MODULES.biblia,
  ],
  'Departamento Visión Juvenil': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia],
  'Departamento Adoremos': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia],
  'Departamento Escuela de Formación': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia],
  'Ministerio Exploradores del Rey': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia],
  'Departamento Salvación': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia],
  'Departamento Audiovisuales': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia],
  'Departamento Mujeres que Reinan': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia],
  'Departamento Varones Amigos de Dios': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia],
  'Departamento Danza Kadosh': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia],
  'Departamento Intercesión': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia],
  'Departamento Entrelazados': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia],
  'Departamento Protocolo': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia],
};

/** Módulos que ven todos los usuarios con grupos (por defecto) */
export const DEFAULT_GROUP_MODULES: SidebarModuleKey[] = [
  SIDEBAR_MODULES.dashboard,
  SIDEBAR_MODULES.eventos,
  SIDEBAR_MODULES.foro,
  SIDEBAR_MODULES.biblia,
];

export function getModulesForGroups(groupNames: string[]): Set<SidebarModuleKey> {
  const modules = new Set<SidebarModuleKey>();

  for (const name of groupNames) {
    const groupModules = GROUP_TO_MODULES[name];
    if (groupModules) {
      groupModules.forEach((m) => modules.add(m));
    } else {
      DEFAULT_GROUP_MODULES.forEach((m) => modules.add(m));
    }
  }

  if (modules.size === 0) {
    DEFAULT_GROUP_MODULES.forEach((m) => modules.add(m));
  }

  return modules;
}

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
  // Módulos por ministerio (cada uno tiene su ítem en el sidebar)
  deptStaff: 'dept-staff',
  deptVisionJuvenil: 'dept-vision-juvenil',
  deptAdoremos: 'dept-adoremos',
  deptEscuelaFormacion: 'dept-escuela-formacion',
  deptExploradoresRey: 'dept-exploradores-rey',
  deptSalvacion: 'dept-salvacion',
  deptAudiovisuales: 'dept-audiovisuales',
  deptMujeresReinan: 'dept-mujeres-reinan',
  deptVaronesAmigosDios: 'dept-varones-amigos-dios',
  deptDanzaKadosh: 'dept-danza-kadosh',
  deptIntercesion: 'dept-intercesion',
  deptEntrelazados: 'dept-entrelazados',
  deptProtocolo: 'dept-protocolo',
} as const;

export type SidebarModuleKey = (typeof SIDEBAR_MODULES)[keyof typeof SIDEBAR_MODULES];

/** Iconos SVG (path) por departamento. Heroicons outline. */
export const DEPT_ICONS: Record<string, string> = {
  staff: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  'vision-juvenil': 'M13 10V3L4 14h7v7l9-11h-7z',
  adoremos: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
  'escuela-formacion': 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
  'exploradores-rey': 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  salvacion: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  audiovisuales: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  'mujeres-reinan': 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  'varones-amigos-dios': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  'danza-kadosh': 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  intercesion: 'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11',
  entrelazados: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  protocolo: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
};

/** Lista de ministerios con slug para rutas. */
export const MINISTERIOS = [
  { name: 'Departamento Staff', slug: 'staff', module: 'dept-staff' as const },
  { name: 'Departamento Visión Juvenil', slug: 'vision-juvenil', module: 'dept-vision-juvenil' as const },
  { name: 'Departamento Adoremos', slug: 'adoremos', module: 'dept-adoremos' as const },
  { name: 'Departamento Escuela de Formación', slug: 'escuela-formacion', module: 'dept-escuela-formacion' as const },
  { name: 'Ministerio Exploradores del Rey', slug: 'exploradores-rey', module: 'dept-exploradores-rey' as const },
  { name: 'Departamento Salvación', slug: 'salvacion', module: 'dept-salvacion' as const },
  { name: 'Departamento Audiovisuales', slug: 'audiovisuales', module: 'dept-audiovisuales' as const },
  { name: 'Departamento Mujeres que Reinan', slug: 'mujeres-reinan', module: 'dept-mujeres-reinan' as const },
  { name: 'Departamento Varones Amigos de Dios', slug: 'varones-amigos-dios', module: 'dept-varones-amigos-dios' as const },
  { name: 'Departamento Danza Kadosh', slug: 'danza-kadosh', module: 'dept-danza-kadosh' as const },
  { name: 'Departamento Intercesión', slug: 'intercesion', module: 'dept-intercesion' as const },
  { name: 'Departamento Entrelazados', slug: 'entrelazados', module: 'dept-entrelazados' as const },
  { name: 'Departamento Protocolo', slug: 'protocolo', module: 'dept-protocolo' as const },
];

/** Mapeo de departamentos a módulos del sidebar. Incluye módulo propio de cada uno. */
export const GROUP_TO_MODULES: Record<string, SidebarModuleKey[]> = {
  'Servicio Social': [
    SIDEBAR_MODULES.dashboard,
    SIDEBAR_MODULES.eventos,
    SIDEBAR_MODULES.foro,
    SIDEBAR_MODULES.servSocial,
    SIDEBAR_MODULES.biblia,
  ],
  'Departamento Staff': [
    SIDEBAR_MODULES.dashboard,
    SIDEBAR_MODULES.eventos,
    SIDEBAR_MODULES.usuarios,
    SIDEBAR_MODULES.foro,
    SIDEBAR_MODULES.servSocial,
    SIDEBAR_MODULES.biblia,
    SIDEBAR_MODULES.deptStaff,
  ],
  'Departamento Visión Juvenil': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia, SIDEBAR_MODULES.deptVisionJuvenil],
  'Departamento Adoremos': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia, SIDEBAR_MODULES.deptAdoremos],
  'Departamento Escuela de Formación': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia, SIDEBAR_MODULES.deptEscuelaFormacion],
  'Ministerio Exploradores del Rey': [
    SIDEBAR_MODULES.dashboard,
    SIDEBAR_MODULES.eventos,
    SIDEBAR_MODULES.foro,
    SIDEBAR_MODULES.biblia,
    SIDEBAR_MODULES.deptExploradoresRey,
  ],
  'Departamento Salvación': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia, SIDEBAR_MODULES.deptSalvacion],
  'Departamento Audiovisuales': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia, SIDEBAR_MODULES.deptAudiovisuales],
  'Departamento Mujeres que Reinan': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia, SIDEBAR_MODULES.deptMujeresReinan],
  'Departamento Varones Amigos de Dios': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia, SIDEBAR_MODULES.deptVaronesAmigosDios],
  'Departamento Danza Kadosh': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia, SIDEBAR_MODULES.deptDanzaKadosh],
  'Departamento Intercesión': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia, SIDEBAR_MODULES.deptIntercesion],
  'Departamento Entrelazados': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia, SIDEBAR_MODULES.deptEntrelazados],
  'Departamento Protocolo': [SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia, SIDEBAR_MODULES.deptProtocolo],
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

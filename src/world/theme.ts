export type ThemeName = 'light' | 'dark';
export const sceneThemes = {
  light: { sky: '#e9efed', stone: '#ced1c7', rock: '#acb7b0', wall: '#e4e6df', frame: '#6b8081',
    glass: '#a8c6cc', path: '#e3dbcd', foliage: '#97ad83', foliageDark: '#738e6b', trunk: '#a9957e',
    metal: '#788b97', window: '#e4c995', water: '#badadb', ground: '#d8ded2', avatar: '#3a515b',
    key: '#fff6e8', ambient: '#e8f2f1', windowEmission: '#9e7845', exposure: 1.12 },
  dark: { sky: '#172128', stone: '#64747c', rock: '#40525c', wall: '#87979b', frame: '#405d68',
    glass: '#648a9b', path: '#7f8887', foliage: '#526d65', foliageDark: '#3c5852', trunk: '#786f68',
    metal: '#697f90', window: '#e6be86', water: '#447c8b', ground: '#62766f', avatar: '#bad0cc',
    key: '#c2d5ef', ambient: '#829cb7', windowEmission: '#efb670', exposure: 1.08 },
} as const;
export type MaterialRole = Exclude<keyof typeof sceneThemes.light, 'key' | 'ambient' | 'exposure' | 'sky' | 'windowEmission'>;

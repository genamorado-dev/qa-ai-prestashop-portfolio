export const environments = {
  local: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
    adminURL: process.env.ADMIN_URL || 'http://localhost:8080/admin',
  },
  // TODO: añadir entornos de staging y producción cuando existan
} as const;

export type EnvironmentName = keyof typeof environments;
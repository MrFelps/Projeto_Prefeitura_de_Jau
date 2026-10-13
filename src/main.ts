/**
 * Totemize - Ponto de Entrada TypeScript
 * Conecta tipos, dados de cidades e estado global
 */

import { CITIES_CONFIG } from './data/cities';
import { totemState } from './services/totemState';
import type { CityId, ReferencePoint } from './types';

console.info('🚀 Totemize TypeScript Core Inicializado.');
console.info(`📦 Cidades configuradas: ${Object.keys(CITIES_CONFIG).join(', ')}`);
console.info(`⚡ Status Operacional: ${totemState.getState().offlineStatus}`);

export { CITIES_CONFIG, totemState };
export type { CityId, ReferencePoint };

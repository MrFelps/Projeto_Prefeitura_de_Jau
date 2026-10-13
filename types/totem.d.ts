/**
 * Tipagens e Contratos de Dados do Projeto Totemize (Prefeitura de Jaú)
 * Totem Inteligente de Utilidade Pública - Operação 100% Offline
 */

export type CityId = 'jau' | 'itapui' | 'bauru';

export type ReferencePointCategory = 
  | 'ponto_atual'
  | 'praca'
  | 'saude'
  | 'terminal'
  | 'comercio'
  | 'turismo'
  | 'servico';

export interface ReferencePoint {
  id: string;
  name: string;
  badge: string;
  distance: string;
  walkTime: string;
  category: ReferencePointCategory;
  address: string;
  details: string;
  qrPayload: string;
}

export interface HomeCard {
  title: string;
  tag: string;
  description: string;
  actionText: string;
  viewId: string;
  icon?: string;
}

export interface AdBanner {
  title: string;
  tag: string;
  description: string;
  phone?: string;
  address?: string;
  badgeBg?: string;
}

export interface CityData {
  name: string;
  badge: string;
  alertText: string;
  homeCards: {
    bus: HomeCard;
    shoes: HomeCard;
    tourism: HomeCard;
    services: HomeCard;
    health: HomeCard;
    events: HomeCard;
    transparent: HomeCard;
    contact: HomeCard;
    help: HomeCard;
  };
  ads: AdBanner[];
  busTitle: string;
  referencePoints: ReferencePoint[];
  busHtml?: string;
  shoesHtml?: string;
  tourismHtml?: string;
  servicesHtml?: string;
}

export interface HardwareComponent {
  id: string;
  name: string;
  tag: string;
  icon: string;
  specs: string[];
  powerWatts?: number;
  voltage?: string;
  status: 'active' | 'standby' | 'alert';
  offlineOnly: boolean;
}

export interface TotemState {
  currentCity: CityId;
  activeView: string;
  isIdle: boolean;
  idleTimer: number | null;
  librasActive: boolean;
  solarActive: boolean;
  solarWattage: number;
  batteryPercentage: number;
  offlineStatus: '100% OFFLINE - DADOS LOCAIS';
}

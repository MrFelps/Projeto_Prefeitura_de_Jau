import { CityId, TotemState } from '../types';
import { CITIES_CONFIG } from '../data/cities';

/**
 * Gerenciador de Estado Reativo e Tipado do Totemize
 * Suporta ciclo de vida offline, temporizador de ociosidade e alternância de cidades
 */
export class TotemStateManager {
  private state: TotemState;
  private listeners: Array<(state: TotemState) => void> = [];

  constructor(initialCity: CityId = 'jau') {
    this.state = {
      currentCity: initialCity,
      activeView: 'view-home',
      isIdle: false,
      idleTimer: null,
      librasActive: false,
      solarActive: true,
      solarWattage: 450,
      batteryPercentage: 98,
      offlineStatus: '100% OFFLINE - DADOS LOCAIS'
    };
  }

  public getState(): Readonly<TotemState> {
    return this.state;
  }

  public subscribe(callback: (state: TotemState) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify(): void {
    this.listeners.forEach(cb => cb({ ...this.state }));
  }

  public setCity(cityId: CityId): void {
    if (!CITIES_CONFIG[cityId]) {
      console.warn(`[TotemState] Cidade não encontrada: ${cityId}`);
      return;
    }
    this.state.currentCity = cityId;
    this.notify();
  }

  public setActiveView(viewId: string): void {
    this.state.activeView = viewId;
    this.state.isIdle = false;
    this.notify();
  }

  public setIdle(isIdle: boolean): void {
    this.state.isIdle = isIdle;
    this.notify();
  }

  public toggleLibras(): boolean {
    this.state.librasActive = !this.state.librasActive;
    this.notify();
    return this.state.librasActive;
  }

  public updateTelemetry(solarWattage: number, batteryPercentage: number): void {
    this.state.solarWattage = solarWattage;
    this.state.batteryPercentage = batteryPercentage;
    this.notify();
  }
}

export const totemState = new TotemStateManager('jau');

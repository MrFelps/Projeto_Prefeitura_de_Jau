/**
 * Declarações de Variáveis Globais e Bibliotecas CDN
 */

import * as THREE from 'three';

declare global {
  interface Window {
    THREE: typeof THREE;
    QRCode: any;
    html2pdf?: () => any;
    
    // Funções globais de navegação do Totem
    navigateTo: (viewId: string) => void;
    showBusDetails: (name: string, dist: string, addr: string) => void;
    closeQrModal: () => void;
    openHardwareSchematics: () => void;
    closeHardwareSchematics: () => void;
    openContractModal: () => void;
    closeContractModal: () => void;
    openBudgetModal: () => void;
    closeBudgetModal: () => void;
    selectCity: (cityId: string) => void;
    resetInactivityTimer: () => void;
    toggleAutoRotate: () => void;
    reset3DView: () => void;
    toggleAllInOnePc: () => void;
    toggleCabinetShell: () => void;
    toggleDoor: () => void;
  }
}

export {};

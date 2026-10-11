/**
 * TOTEM INTELIGENTE DE JAÚ (TOTEMIZE)
 * Script Funcional do Mockup Interativo
 */

class TotemApp {
  constructor() {
    this.currentView = 'view-home';
    this.inactivityLimit = 45; // segundos para modo vitrine
    this.inactivityRemaining = this.inactivityLimit;
    this.inactivityInterval = null;
    this.isVoiceActive = false;
    this.isHighContrast = false;
    this.isWheelchairMode = false;
    this.fontScale = 1.0;
    this.qrInstance = null;
    this.viewer3D = null;

    // Publicidades DOOH rotativas
    this.ads = [
      "👠 Calçados Jaú: Visite a maior feira da região neste fim de semana!",
      "🛍️ Território do Calçado: Mais de 150 lojas com estacionamento grátis.",
      "🌿 Defesa Civil: Faça o descarte correto de materiais recicláveis.",
      "🎭 Teatro Municipal de Jaú: Confira as atrações culturais deste mês!",
      "🚌 Mobilidade Jaú: Baixe o itinerário do seu ônibus via QR Code sem papel."
    ];
    this.adIndex = 0;

    this.init();
  }

  init() {
    this.setupClock();
    this.setupNavigation();
    this.setupAccessibility();
    this.setupSimulatorControls();
    this.setupEnergyTimer();
    this.setupDOOHCarousel();
    this.setupFilters();
    this.setup3DViewer();
  }

  setup3DViewer() {
    if (window.Totem3DViewer) {
      this.viewer3D = new window.Totem3DViewer('totem-3d-stage');
      this.viewer3D.init();
    }
  }

  // 1. RELÓGIO E DATA EM TEMPO REAL
  setupClock() {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long' });
      
      const elTime = document.getElementById('clock-time');
      const elDate = document.getElementById('clock-date');
      if (elTime) elTime.textContent = timeStr;
      if (elDate) elDate.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  // 2. NAVEGAÇÃO ENTRE TELAS
  setupNavigation() {
    // Cliques em cards de módulos na home
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = btn.getAttribute('data-view');
        this.navigateTo(targetView);
      });
    });

    // Botão isolado no canto inferior: Contatos de Acionamento de Socorro
    const btnContacts = document.getElementById('btn-emergency-contacts');
    if (btnContacts) {
      btnContacts.addEventListener('click', () => {
        this.openModal('modal-contacts');
        this.falar('Contatos de acionamento de socorro e prefeitura.');
      });
    }

    // Interações resetam o timer de inatividade
    const totemScreen = document.getElementById('totem-screen');
    if (totemScreen) {
      ['click', 'touchstart', 'mousemove'].forEach(evt => {
        totemScreen.addEventListener(evt, () => this.resetInactivityTimer());
      });
    }
  }

  navigateTo(viewId) {
    this.resetInactivityTimer();
    
    // Esconde todas
    document.querySelectorAll('.view-screen').forEach(el => el.classList.remove('active'));
    
    // Mostra a selecionada
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
      this.currentView = viewId;
      
      // Sincroniza tela do modelo 3D 360°
      const screenMap = {
        'view-home': 'home',
        'view-bus': 'bus',
        'view-shoes': 'shoes',
        'view-tourism': 'tourism',
        'view-services': 'services'
      };
      const mapped = screenMap[viewId] || 'home';
      if (this.viewer3D) {
        this.viewer3D.syncFromApp({ screenState: mapped });
      }
      document.querySelectorAll('[data-3d-screen]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-3d-screen') === mapped);
      });

      // Feedback por voz se áudio estiver ativo
      const title = target.querySelector('h2') ? target.querySelector('h2').innerText : 'Início';
      this.falar(`Abrindo ${title}`);
    }
  }

  // 3. ACESSIBILIDADE UNIVERSAL (Áudio, Libras, Baixa Estatura, Alto Contraste)
  setupAccessibility() {
    // Botão de Voz (Síntese)
    const btnVoice = document.getElementById('btn-voice');
    if (btnVoice) {
      btnVoice.addEventListener('click', () => {
        this.isVoiceActive = !this.isVoiceActive;
        btnVoice.classList.toggle('active', this.isVoiceActive);
        if (this.isVoiceActive) {
          this.falar('Leitura por voz ativada. Toque nos botões para ouvir as opções.');
        } else {
          this.falar('Leitura por voz desativada.');
        }
      });
    }

    // Botão de Libras
    const btnVLibras = document.getElementById('btn-vlibras');
    if (btnVLibras) {
      btnVLibras.addEventListener('click', () => {
        btnVLibras.classList.toggle('active');
        this.initVLibras();
      });
    }

    // Botão Modo Cadeirante / Baixa Estatura
    const btnWheelchair = document.getElementById('btn-wheelchair');
    const screen = document.getElementById('totem-screen');
    if (btnWheelchair && screen) {
      btnWheelchair.addEventListener('click', () => {
        this.isWheelchairMode = !this.isWheelchairMode;
        btnWheelchair.classList.toggle('active', this.isWheelchairMode);
        screen.classList.toggle('mode-wheelchair', this.isWheelchairMode);
        if (this.viewer3D) {
          this.viewer3D.syncFromApp({ isWheelchair: this.isWheelchairMode });
        }
        this.falar(this.isWheelchairMode ? 'Modo de alcance ativado. Interface rebaixada.' : 'Modo normal restaurado.');
      });
    }

    // Botão Alto Contraste
    const btnContrast = document.getElementById('btn-contrast');
    if (btnContrast && screen) {
      btnContrast.addEventListener('click', () => {
        this.isHighContrast = !this.isHighContrast;
        btnContrast.classList.toggle('active', this.isHighContrast);
        screen.classList.toggle('high-contrast', this.isHighContrast);
        if (this.viewer3D) {
          this.viewer3D.syncFromApp({ isHighContrast: this.isHighContrast });
        }
        this.falar(this.isHighContrast ? 'Alto contraste ativado.' : 'Contraste padrão.');
      });
    }

    // Botão Aumentar Letra
    const btnFontPlus = document.getElementById('btn-font-plus');
    const btnFontReset = document.getElementById('btn-font-reset');
    if (btnFontPlus) {
      btnFontPlus.addEventListener('click', () => {
        this.fontScale = Math.min(1.4, this.fontScale + 0.1);
        document.body.style.setProperty('--font-scale', this.fontScale);
        this.falar('Tamanho da letra aumentado.');
      });
    }
    if (btnFontReset) {
      btnFontReset.addEventListener('click', () => {
        this.fontScale = 1.0;
        document.body.style.setProperty('--font-scale', this.fontScale);
        this.falar('Tamanho da letra padrão.');
      });
    }
  }

  // Leitor de Voz Nativo (Web Speech API)
  falar(texto) {
    if (!this.isVoiceActive && !texto.includes('ativad') && !texto.includes('desativad')) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Carregamento do VLibras
  initVLibras() {
    if (!document.getElementById('vlibras-script')) {
      const script = document.createElement('script');
      script.id = 'vlibras-script';
      script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
      script.onload = () => {
        if (window.VLibras) {
          new window.VLibras.Widget('https://vlibras.gov.br/app');
          this.falar('Widget oficial de Libras carregado com sucesso.');
        }
      };
      document.body.appendChild(script);
    }
    this.falar('Acessibilidade em Libras ativada.');
  }

  // 4. SIMULAÇÃO DE ENERGIA E ESG (TIMER + STANDBY + PIR)
  setupEnergyTimer() {
    const progressBar = document.getElementById('inactivity-progress');
    const timerText = document.getElementById('timer-text');
    const statPower = document.getElementById('stat-power');

    this.inactivityInterval = setInterval(() => {
      this.inactivityRemaining--;
      if (this.inactivityRemaining < 0) this.inactivityRemaining = 0;

      // Atualiza barra
      const percent = (this.inactivityRemaining / this.inactivityLimit) * 100;
      if (progressBar) progressBar.style.width = `${percent}%`;
      if (timerText) timerText.textContent = `Retorno automático em: ${this.inactivityRemaining}s`;

      // Se zerou, ativa Modo Vitrine
      if (this.inactivityRemaining === 0) {
        this.enterIdleMode();
      }
    }, 1000);
  }

  resetInactivityTimer() {
    this.inactivityRemaining = this.inactivityLimit;
    const idleOverlay = document.getElementById('screen-idle-overlay');
    const sleepOverlay = document.getElementById('screen-sleep-overlay');
    const statPower = document.getElementById('stat-power');

    const screenMap = {
      'view-home': 'home',
      'view-bus': 'bus',
      'view-shoes': 'shoes',
      'view-tourism': 'tourism',
      'view-services': 'services'
    };

    if (idleOverlay && !idleOverlay.classList.contains('hidden')) {
      idleOverlay.classList.add('hidden');
      if (statPower) statPower.textContent = "145 W (Normal)";
      if (this.viewer3D) this.viewer3D.syncFromApp({ screenState: screenMap[this.currentView] || 'home' });
    }
    if (sleepOverlay && !sleepOverlay.classList.contains('hidden')) {
      sleepOverlay.classList.add('hidden');
      if (statPower) statPower.textContent = "145 W (Normal)";
      if (this.viewer3D) this.viewer3D.syncFromApp({ screenState: screenMap[this.currentView] || 'home' });
      this.falar('Totem ativado pelo sensor de presença.');
    }
  }

  enterIdleMode() {
    const idleOverlay = document.getElementById('screen-idle-overlay');
    const statPower = document.getElementById('stat-power');
    if (idleOverlay) {
      idleOverlay.classList.remove('hidden');
      if (statPower) statPower.textContent = "75 W (Modo Vitrine -25% Brilho)";
    }
    if (this.viewer3D) {
      this.viewer3D.syncFromApp({ screenState: 'idle' });
    }
  }

  enterSleepMode() {
    const sleepOverlay = document.getElementById('screen-sleep-overlay');
    const idleOverlay = document.getElementById('screen-idle-overlay');
    const statPower = document.getElementById('stat-power');
    if (idleOverlay) idleOverlay.classList.add('hidden');
    if (sleepOverlay) {
      sleepOverlay.classList.remove('hidden');
      if (statPower) statPower.textContent = "15 W (Standby Noturno -90% Brilho)";
    }
    if (this.viewer3D) {
      this.viewer3D.syncFromApp({ screenState: 'sleep' });
    }
  }

  // 5. PAINEL DE CONTROLE DO SIMULADOR (PARA A BANCA & TABLET)
  setupSimulatorControls() {
    const simulatorPanel = document.getElementById('simulator-controls');
    const btnTogglePanel = document.getElementById('btn-toggle-panel');
    const btnClosePanel = document.getElementById('btn-close-panel');
    const btnFloatFullscreen = document.getElementById('btn-float-fullscreen');

    // Auto-colapsar em tablets e telas verticais no carregamento inicial
    if (window.innerWidth <= 1024 && simulatorPanel) {
      simulatorPanel.classList.add('collapsed');
    }

    // BOTÃO DE 3 PONTINHOS: Recolhe ou Abre a Aba Lateral
    const toggleSidebar = () => {
      if (!simulatorPanel) return;
      simulatorPanel.classList.toggle('collapsed');
      if (this.viewer3D) {
        setTimeout(() => this.viewer3D.handleResize(), 350);
      }
    };

    if (btnTogglePanel) btnTogglePanel.addEventListener('click', toggleSidebar);
    if (btnClosePanel) btnClosePanel.addEventListener('click', () => {
      if (simulatorPanel) simulatorPanel.classList.add('collapsed');
      if (this.viewer3D) setTimeout(() => this.viewer3D.handleResize(), 350);
    });

    // BOTÃO EXPANDIR MONITOR (TELA CHEIA NATIVA NO TABLET)
    if (btnFloatFullscreen) {
      btnFloatFullscreen.addEventListener('click', () => {
        // Alterna tela cheia do navegador
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
          if (simulatorPanel) simulatorPanel.classList.add('collapsed');
        } else {
          document.exitFullscreen().catch(() => {});
        }
        if (this.viewer3D) {
          setTimeout(() => this.viewer3D.handleResize(), 200);
        }
      });
    }

    // BOTÃO "📱 VER MENU DO TOTEM": Abre a tela 2D por cima do 3D sem distorção
    const btnOpenMenuModal = document.getElementById('btn-open-menu-modal');
    const btnCloseMenuOverlay = document.getElementById('btn-close-menu-overlay');
    const menuOverlay = document.getElementById('totem-menu-overlay');

    if (btnOpenMenuModal) {
      btnOpenMenuModal.addEventListener('click', () => {
        if (menuOverlay) {
          menuOverlay.classList.remove('hidden');
          this.resetInactivityTimer();
          this.falar('Abrindo menu interativo do totem.');
        }
      });
    }

    if (btnCloseMenuOverlay) {
      btnCloseMenuOverlay.addEventListener('click', () => {
        if (menuOverlay) {
          menuOverlay.classList.add('hidden');
          if (this.viewer3D) {
            setTimeout(() => this.viewer3D.handleResize(), 50);
          }
        }
      });
    }

    // Toggle Moldura 2D vs Tela Cheia vs Visão 3D 360° (pelo painel lateral)
    const btnToggleFrame = document.getElementById('btn-toggle-frame');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const btnToggle3D = document.getElementById('btn-toggle-3d');
    const chassis = document.getElementById('totem-chassis');
    const stage3D = document.getElementById('totem-3d-stage');

    const activateMode = (mode) => {
      [btnToggleFrame, btnFullscreen, btnToggle3D].forEach(b => b && b.classList.remove('active'));

      if (mode === '3d') {
        if (menuOverlay) menuOverlay.classList.add('hidden');
        if (stage3D) stage3D.classList.remove('hidden');
        if (btnToggle3D) btnToggle3D.classList.add('active');
        // Na visão 3D, recolhe a aba lateral automaticamente no tablet para ver só o totem
        if (window.innerWidth <= 1024 && simulatorPanel) {
          simulatorPanel.classList.add('collapsed');
        }
        if (this.viewer3D) {
          setTimeout(() => this.viewer3D.handleResize(), 100);
        }
      } else if (mode === 'frame' || mode === 'fullscreen') {
        // Abre o menu do totem
        if (menuOverlay) menuOverlay.classList.remove('hidden');
        if (mode === 'frame') {
          if (btnToggleFrame) btnToggleFrame.classList.add('active');
        } else {
          if (btnFullscreen) btnFullscreen.classList.add('active');
          if (simulatorPanel) simulatorPanel.classList.add('collapsed');
        }
      }
    };

    if (btnToggleFrame) btnToggleFrame.addEventListener('click', () => activateMode('frame'));
    if (btnFullscreen) btnFullscreen.addEventListener('click', () => activateMode('fullscreen'));
    if (btnToggle3D) btnToggle3D.addEventListener('click', () => activateMode('3d'));

    // Seletor rápido de telas dentro do Estúdio 3D
    document.querySelectorAll('[data-3d-screen]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sc = btn.getAttribute('data-3d-screen');
        const viewMap = {
          'home': 'view-home',
          'bus': 'view-bus',
          'shoes': 'view-shoes',
          'tourism': 'view-tourism',
          'services': 'view-services'
        };
        if (viewMap[sc]) {
          this.navigateTo(viewMap[sc]);
        }
      });
    });

    // Botões de Simulação de Energia
    const btnSimIdle = document.getElementById('btn-sim-idle');
    const btnSimSleep = document.getElementById('btn-sim-sleep');
    const btnSimPir = document.getElementById('btn-sim-pir');

    if (btnSimIdle) btnSimIdle.addEventListener('click', () => this.enterIdleMode());
    if (btnSimSleep) btnSimSleep.addEventListener('click', () => this.enterSleepMode());
    if (btnSimPir) btnSimPir.addEventListener('click', () => this.resetInactivityTimer());

    // Clicar nos overlays acorda a tela
    const idleOverlay = document.getElementById('screen-idle-overlay');
    const sleepOverlay = document.getElementById('screen-sleep-overlay');
    if (idleOverlay) idleOverlay.addEventListener('click', () => this.resetInactivityTimer());
    if (sleepOverlay) sleepOverlay.addEventListener('click', () => this.resetInactivityTimer());
  }

  // 6. CARROSSEL DOOH (PUBLICIDADE DE PARCEIROS)
  setupDOOHCarousel() {
    const adTextEl = document.getElementById('dooh-text');
    if (!adTextEl) return;
    setInterval(() => {
      this.adIndex = (this.adIndex + 1) % this.ads.length;
      adTextEl.textContent = this.ads[this.adIndex];
    }, 6000);
  }

  // 7. FILTROS DE ÔNIBUS
  setupFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.getAttribute('data-filter');
        document.querySelectorAll('.bus-item').forEach(item => {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // 8. MODAL DE QR CODE DINÂMICO
  showBusDetails(title, route, times) {
    const url = `https://maps.google.com/?q=Jau+Onibus+${encodeURIComponent(title)}`;
    this.openQRModal(title, `Itinerário: ${route} | Próximas saídas: ${times}`, url);
    this.falar(`Detalhes da ${title}. Aponte a câmera para levar os horários no celular.`);
  }

  showStoreQR(name, address, mapUrl) {
    this.openQRModal(name, `Endereço: ${address}`, mapUrl);
    this.falar(`${name}. Escaneie para rota no mapa ou contato.`);
  }

  showTourQR(name, address, mapUrl) {
    this.openQRModal(name, `Ponto Turístico: ${address}`, mapUrl);
    this.falar(`${name}. Escaneie para traçar sua rota até o local.`);
  }

  showGenericQR(title, url) {
    this.openQRModal(title, 'Acesse o portal oficial diretamente pelo seu celular:', url);
    this.falar(`Abrindo código para ${title}`);
  }

  openQRModal(title, desc, url) {
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const qrContainer = document.getElementById('qrcode-container');

    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    if (qrContainer) {
      qrContainer.innerHTML = '';
      if (window.QRCode) {
        new QRCode(qrContainer, {
          text: url,
          width: 180,
          height: 180,
          colorDark: "#0f172a",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    }
    this.openModal('modal-qr');
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  }

  closeModal() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
    this.resetInactivityTimer();
  }
}

// Inicializa a aplicação
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new TotemApp();
});

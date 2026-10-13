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
    this.setup3DViewer();
    this.setupClock();
    this.setupNavigation();
    this.setupAccessibility();
    this.setupModals();
    this.setupLibrasClickReader();
    this.setupSimulatorControls();
    this.setupEnergyTimer();
    this.setupDOOHCarousel();
    this.setupFilters();
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
    const vlibrasBox = document.getElementById('vlibras-kiosk-box');
    const btnCloseVLibras = document.getElementById('btn-close-vlibras');
    
    const setVLibrasVisible = (show) => {
      this.isVLibrasActive = show;
      const totemScreen = document.getElementById('totem-screen');
      if (totemScreen) totemScreen.classList.toggle('libras-active', show);
      if (vlibrasBox) {
        if (show) {
          vlibrasBox.classList.remove('hidden');
          this.initVLibras();
          if (this.playLibrasSequence) {
            this.playLibrasSequence('Olá! Bem-vindo ao Totem de Jaú. Toque em qualquer texto.');
          }
          this.falar('Tradutor de Libras ativado. Toque em qualquer item para ver a tradução em sinais.');
        } else {
          vlibrasBox.classList.add('hidden');
          vlibrasBox.classList.remove('interpreting');
          clearInterval(this._librasStepInterval);
          clearTimeout(this._librasTimeout);
          this.falar('Tradutor de Libras fechado.');
        }
      }
      if (btnVLibras) btnVLibras.classList.toggle('active', show);
      if (this.viewer3D) {
        this.viewer3D.syncFromApp({ isVLibrasActive: show, isInterpretingLibras: false });
      }
    };

    if (btnVLibras) {
      btnVLibras.addEventListener('click', () => {
        const isCurrentlyHidden = vlibrasBox ? vlibrasBox.classList.contains('hidden') : true;
        setVLibrasVisible(isCurrentlyHidden);
      });
    }
    if (btnCloseVLibras) {
      btnCloseVLibras.addEventListener('click', (e) => {
        e.stopPropagation();
        setVLibrasVisible(false);
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

  // Máquina 100% Visual ("Só Tela" — Sem saída de som física)
  falar(_texto) {
    // Desativado: o totem físico não possui saída de som nem mosca de alto-falante
    return;
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

  // 5. CONTROLE DOS 4 BOTÕES (SUPERIOR ESQUERDO) E 1 BOTÃO 360° (INFERIOR DIREITO)
  setupSimulatorControls() {
    const menuOverlay = document.getElementById('totem-menu-overlay');
    const btnCloseMenuOverlay = document.getElementById('btn-close-menu-overlay');
    const modalSchematics = document.getElementById('modal-hardware-schematics');
    const modalEstrutura = document.getElementById('modal-estrutura-blueprint');

    // Os 4 Botões no Canto Superior Esquerdo
    const btnOrbScreen = document.getElementById('btn-orb-screen');       // 1º: Visão da Tela do Totem
    const btnOrbXray = document.getElementById('btn-orb-xray');           // 2º: Totem do Lado Interno a Raio-X
    const btnOrbTech = document.getElementById('btn-orb-tech');           // 3º: Texto com a Parte Técnica
    const btnOrbEstrutura = document.getElementById('btn-orb-estrutura'); // 4º: Estrutura (Caixa Desmontada, Dobras, Furação e Interior)

    // O Botão no Canto Inferior Direito (Características para o 360 do Totem)
    const btnOrb360 = document.getElementById('btn-orb-360');
    const popover360 = document.getElementById('orb-360-popover');
    const btnClosePopover360 = document.getElementById('btn-close-360-popover');

    window.triggerTopLeftButton = (action) => {
      if (action === 'screen') {
        const isCurrentlyHidden = menuOverlay ? menuOverlay.classList.contains('hidden') : true;
        if (isCurrentlyHidden) {
          if (menuOverlay) menuOverlay.classList.remove('hidden');
          if (modalSchematics) modalSchematics.classList.add('hidden');
          if (modalEstrutura) modalEstrutura.classList.add('hidden');
          if (btnOrbScreen) btnOrbScreen.classList.add('active');
          if (btnOrbTech) btnOrbTech.classList.remove('active');
          if (btnOrbEstrutura) btnOrbEstrutura.classList.remove('active');
          this.resetInactivityTimer();
          this.falar('Abrindo visão da tela interativa do totem.');
        } else {
          if (menuOverlay) menuOverlay.classList.add('hidden');
          if (btnOrbScreen) btnOrbScreen.classList.remove('active');
          if (this.viewer3D) setTimeout(() => this.viewer3D.handleResize(), 80);
        }
      } else if (action === 'xray') {
        // Fecha overlays para exibir o Totem 3D no centro com Raio-X Interno
        if (menuOverlay) menuOverlay.classList.add('hidden');
        if (modalSchematics) modalSchematics.classList.add('hidden');
        if (modalEstrutura) modalEstrutura.classList.add('hidden');
        if (btnOrbScreen) btnOrbScreen.classList.remove('active');
        if (btnOrbTech) btnOrbTech.classList.remove('active');
        if (btnOrbEstrutura) btnOrbEstrutura.classList.remove('active');

        if (!this.viewer3D && window.Totem3DViewer) {
          this.setup3DViewer();
        }
        if (this.viewer3D) {
          const nextState = !this.viewer3D.isHardwareMode;
          this.viewer3D.hardwareViewMode = 'xray';
          this.viewer3D.setHardwareMode(nextState);
          if (btnOrbXray) btnOrbXray.classList.toggle('active', nextState);
          this.falar(nextState ? 'Visão do totem do lado interno a raio-x ativada.' : 'Visão externa do totem restaurada.');
        }
      } else if (action === 'tech') {
        if (!modalSchematics) return;
        const isHidden = modalSchematics.classList.contains('hidden');
        if (isHidden) {
          if (menuOverlay) menuOverlay.classList.add('hidden');
          if (modalEstrutura) modalEstrutura.classList.add('hidden');
          if (btnOrbScreen) btnOrbScreen.classList.remove('active');
          if (btnOrbEstrutura) btnOrbEstrutura.classList.remove('active');
          modalSchematics.classList.remove('hidden');
          if (btnOrbTech) btnOrbTech.classList.add('active');
          this.falar('Abrindo documento com a parte técnica e arquitetura do totem.');
        } else {
          modalSchematics.classList.add('hidden');
          if (btnOrbTech) btnOrbTech.classList.remove('active');
        }
      } else if (action === 'estrutura') {
        if (!modalEstrutura) return;
        const isHidden = modalEstrutura.classList.contains('hidden');
        if (isHidden) {
          if (menuOverlay) menuOverlay.classList.add('hidden');
          if (modalSchematics) modalSchematics.classList.add('hidden');
          if (btnOrbScreen) btnOrbScreen.classList.remove('active');
          if (btnOrbTech) btnOrbTech.classList.remove('active');
          modalEstrutura.classList.remove('hidden');
          if (btnOrbEstrutura) btnOrbEstrutura.classList.add('active');
          this.falar('Abrindo plano de estrutura: caixa desmontada, dobras, furação e estrutura interna.');
        } else {
          modalEstrutura.classList.add('hidden');
          if (btnOrbEstrutura) btnOrbEstrutura.classList.remove('active');
        }
      }
    };

    // Fechar e alternar abas do Modal da 4ª Bolinha (ESTRUTURA)
    const btnCloseEstModal = document.getElementById('btn-close-estrutura-modal');
    const btnCloseEstFoot = document.getElementById('btn-close-estrutura-foot');
    const closeEstruturaModal = () => {
      if (modalEstrutura) modalEstrutura.classList.add('hidden');
      if (btnOrbEstrutura) btnOrbEstrutura.classList.remove('active');
    };
    if (btnCloseEstModal) btnCloseEstModal.addEventListener('click', closeEstruturaModal);
    if (btnCloseEstFoot) btnCloseEstFoot.addEventListener('click', closeEstruturaModal);
    if (modalEstrutura) {
      modalEstrutura.addEventListener('click', (e) => {
        if (e.target === modalEstrutura) closeEstruturaModal();
      });
    }

    document.querySelectorAll('.btn-est-tab[data-est-tab]').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        const targetKey = tabBtn.getAttribute('data-est-tab');
        document.querySelectorAll('.btn-est-tab').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        document.querySelectorAll('.est-tab-pane').forEach(pane => {
          pane.classList.toggle('active', pane.id === `est-tab-content-${targetKey}`);
        });
      });
    });

    if (btnCloseMenuOverlay) {
      btnCloseMenuOverlay.addEventListener('click', () => {
        if (menuOverlay) menuOverlay.classList.add('hidden');
        if (btnOrbScreen) btnOrbScreen.classList.remove('active');
        if (this.viewer3D) setTimeout(() => this.viewer3D.handleResize(), 80);
      });
    }

    // Botão do Canto Inferior Direito: Abre/Fecha menu de Características do 360°
    window.triggerBottomRight360 = (e) => {
      if (e) e.stopPropagation();
      if (!popover360 || !btnOrb360) return;
      const isHidden = popover360.classList.contains('hidden');
      popover360.classList.toggle('hidden', !isHidden);
      btnOrb360.classList.toggle('active', isHidden);
    };

    if (popover360 && btnOrb360) {
      if (btnClosePopover360) {
        btnClosePopover360.addEventListener('click', (e) => {
          e.stopPropagation();
          popover360.classList.add('hidden');
          btnOrb360.classList.remove('active');
        });
      }

      popover360.addEventListener('click', (e) => e.stopPropagation());

      // Fechar popover do 360° ao clicar fora
      document.addEventListener('click', (e) => {
        if (!popover360.classList.contains('hidden') &&
            !e.target.closest('#orb-360-popover') &&
            !e.target.closest('#btn-orb-360') &&
            !e.target.closest('#totem-color-picker-modal')) {
          popover360.classList.add('hidden');
          btnOrb360.classList.remove('active');
        }
      });
    }

    // Seletor rápido de telas dentro do menu 360°
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

  // 8. MODAL DE QR CODE DINÂMICO (MOSTRA ONDE É O PONTO NO MAPA)
  showBusDetails(title, route, times, mapUrl) {
    const url = mapUrl || `https://maps.google.com/?q=Ponto+de+Onibus+Jau+${encodeURIComponent(title)}`;
    this.openQRModal(title, `📍 ${route} | Horários: ${times}`, url);
    this.falar(`Localização do ponto: ${title}. Aponte a câmera para ver no mapa onde é o ponto e os horários.`);
  }

  showPointLocationQR(title, addressDesc, mapUrl) {
    const url = mapUrl || 'https://maps.google.com/?q=Praca+da+Republica+Jau+SP';
    this.openQRModal(title, `📍 Localização exata do ponto: ${addressDesc}`, url);
    this.falar(`${title}. Escaneie o QR Code para ver no celular onde é o ponto.`);
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

  showEsgModal() {
    this.openModal('modal-esg-advantages');
    this.falar('Vantagens ambientais e compromisso ESG do Totem Inteligente de Jaú. Sistema paperless, energia solar limpa e inclusão social.');
  }

  closeEsgModal() {
    const modalEsg = document.getElementById('modal-esg-advantages');
    if (modalEsg) modalEsg.classList.add('hidden');
    this.resetInactivityTimer();
  }

  // 8. MODAL DE QR CODE DINÂMICO E FECHAMENTO INTELIGENTE
  setupModals() {
    // 1. Fechar Modal de QR Code ao clicar no fundo escuro (backdrop)
    const modalQR = document.getElementById('modal-qr');
    if (modalQR) {
      const qrCard = modalQR.querySelector('.modal-card');
      if (qrCard) qrCard.addEventListener('click', (e) => e.stopPropagation());

      ['click', 'touchend'].forEach(evt => {
        modalQR.addEventListener(evt, (e) => {
          if (e.target === modalQR) {
            this.closeModal();
          }
        });
      });
    }

    // 2. Fechar Modal de Vantagens ESG ao clicar no backdrop
    const modalEsg = document.getElementById('modal-esg-advantages');
    if (modalEsg) {
      const esgCard = modalEsg.querySelector('.modal-card-esg');
      if (esgCard) esgCard.addEventListener('click', (e) => e.stopPropagation());

      ['click', 'touchend'].forEach(evt => {
        modalEsg.addEventListener(evt, (e) => {
          if (e.target === modalEsg) {
            this.closeEsgModal();
          }
        });
      });
    }

    // 3. Fechar Tela de Contatos de Socorro ao clicar fora do painel central
    const modalContacts = document.getElementById('modal-contacts');
    if (modalContacts) {
      const contactsPanel = modalContacts.querySelector('.contacts-central-panel');
      if (contactsPanel) contactsPanel.addEventListener('click', (e) => e.stopPropagation());

      ['click', 'touchend'].forEach(evt => {
        modalContacts.addEventListener(evt, (e) => {
          if (e.target === modalContacts || e.target.classList.contains('frosted-side')) {
            this.closeModal();
          }
        });
      });
    }

    // 4. Suporte universal a tecla Esc para fechar qualquer modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.closeEsgModal();
      }
    });
  }

  // 9. LEITOR INTERATIVO DE LIBRAS: ONDE CLICAR OU SELECIONAR, O BONECO INTERPRETA PALAVRA POR PALAVRA
  setupLibrasClickReader() {
    const totemScreen = document.getElementById('totem-screen');
    if (!totemScreen) return;

    this._lastLibrasText = 'Olá! Bem-vindo ao Totem de Jaú.';

    this.playLibrasSequence = (rawText, targetEl) => {
      if (!rawText) return;
      const clean = rawText.trim().replace(/\s+/g, ' ');
      if (!clean || clean.length < 2) return;

      this._lastLibrasText = clean;

      const subText = document.getElementById('vlibras-subtitle-text');
      const vlibrasBox = document.getElementById('vlibras-kiosk-box');
      const signBadge = document.getElementById('vlibras-sign-badge');
      const statusTag = document.getElementById('vlibras-status-tag');

      // Formata a legenda (exibe texto resumido legível)
      const preview = clean.length > 64 ? clean.substring(0, 61) + '...' : clean;

      // Extrai palavras significativas (sinais da frase em Libras)
      const rawWords = preview
        .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 2);
      const signWords = rawWords.length > 0 ? rawWords.slice(0, 10) : [preview];

      // Efeito de destaque visual no elemento clicado
      if (targetEl) {
        document.querySelectorAll('.libras-inspecting').forEach(el => el.classList.remove('libras-inspecting'));
        targetEl.classList.add('libras-inspecting');
        setTimeout(() => targetEl.classList.remove('libras-inspecting'), 2200);
      }

      clearInterval(this._librasStepInterval);
      clearTimeout(this._librasTimeout);

      if (vlibrasBox) {
        vlibrasBox.classList.add('interpreting');
      }
      if (statusTag) {
        statusTag.textContent = 'SINALIZANDO...';
      }

      let step = 0;
      const totalSteps = signWords.length;

      const renderSignStep = () => {
        if (step >= totalSteps) {
          clearInterval(this._librasStepInterval);
          if (vlibrasBox) {
            vlibrasBox.classList.remove('interpreting');
            vlibrasBox.removeAttribute('data-pose');
          }
          if (signBadge) {
            signBadge.textContent = '🤟 TRADUÇÃO CONCLUÍDA';
          }
          if (statusTag) {
            statusTag.textContent = 'LIBRAS • AO VIVO';
          }
          if (subText) {
            subText.textContent = preview;
          }
          if (this.viewer3D) {
            this.viewer3D.syncFromApp({ vlibrasSub: preview, isInterpretingLibras: false, librasPose: 0 });
          }
          return;
        }

        const currentWord = signWords[step];
        const poseIndex = step % 4;

        if (vlibrasBox) {
          vlibrasBox.setAttribute('data-pose', String(poseIndex));
        }
        if (signBadge) {
          signBadge.textContent = `🤟 SINAL [${step + 1}/${totalSteps}]: ${currentWord.toUpperCase()}`;
        }

        // Destaca a palavra atual na legenda
        if (subText) {
          subText.innerHTML = signWords
            .map((w, idx) => idx === step ? `<span class="libras-word-active">${w}</span>` : w)
            .join(' ');
        }

        // Sincroniza pose do boneco com o Totem 3D
        if (this.viewer3D) {
          this.viewer3D.syncFromApp({
            vlibrasSub: `${currentWord.toUpperCase()} (${step + 1}/${totalSteps})`,
            isInterpretingLibras: true,
            librasPose: poseIndex
          });
        }

        step++;
      };

      // Executa o primeiro sinal imediatamente e avança palavra por palavra
      renderSignStep();
      this._librasStepInterval = setInterval(renderSignStep, 680);

      // Se síntese de voz também estiver ativa, vocaliza
      if (this.isVoiceActive) {
        this.falar(preview);
      }
    };

    // Botão de repetir sinais ou clique no palco do boneco
    const btnReplay = document.getElementById('btn-replay-libras');
    const avatarStage = document.querySelector('.vlibras-avatar-stage');
    if (btnReplay) {
      btnReplay.addEventListener('click', (e) => {
        e.stopPropagation();
        this.playLibrasSequence(this._lastLibrasText);
      });
    }
    if (avatarStage) {
      avatarStage.addEventListener('click', (e) => {
        e.stopPropagation();
        this.playLibrasSequence(this._lastLibrasText);
      });
    }

    // Suporte a seleção de texto com o mouse/toque
    document.addEventListener('mouseup', () => {
      if (!this.isVLibrasActive) return;
      const sel = window.getSelection ? window.getSelection().toString().trim() : '';
      if (sel && sel.length >= 2) {
        this.playLibrasSequence(sel);
      }
    });

    totemScreen.addEventListener('click', (e) => {
      if (!this.isVLibrasActive) return;

      // Ignora cliques dentro da própria caixinha do VLibras ou nos botões de controle
      if (e.target.closest('#vlibras-kiosk-box') || 
          e.target.closest('#btn-vlibras') || 
          e.target.closest('.modal-close') || 
          e.target.closest('.btn-close-contacts')) {
        return;
      }

      // Procura o elemento mais significativo com texto
      const candidate = e.target.closest(
        '.module-card, .bus-item, .store-card, .tour-card, .phone-btn, .contact-card, .filter-tab, .quick-service-pill, ' +
        '.featured-strip, .alert-banner, .brand-title, .brand-sub, .temp, .date, .time, .dooh-carousel, ' +
        'h1, h2, h3, h4, p, button, .screen-subhead'
      ) || e.target;

      if (candidate && candidate.innerText) {
        this.playLibrasSequence(candidate.innerText, candidate);
      }
    }, true);
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  }

  closeModal() {
    const modalQR = document.getElementById('modal-qr');
    if (modalQR) modalQR.classList.add('hidden');
    const modalContacts = document.getElementById('modal-contacts');
    if (modalContacts) modalContacts.classList.add('hidden');
    document.querySelectorAll('.modal-backdrop, .contacts-screen-backdrop').forEach(m => m.classList.add('hidden'));
    this.resetInactivityTimer();
  }
}

// Inicializa a aplicação
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new TotemApp();
});

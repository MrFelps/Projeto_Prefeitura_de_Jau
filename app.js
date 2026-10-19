/**
 * TOTEM INTELIGENTE DE JAÚ E ITAPUÍ (TOTEMIZE)
 * Script Funcional do Mockup Interativo com Alternância de Municípios
 */

const CITIES_DATA = {
  jau: {
    key: 'jau',
    name: 'Jaú',
    state: 'SP',
    brandChassis: 'PREFEITURA DE JAÚ • SP',
    brandTitle: 'PREFEITURA DE JAÚ',
    brandSub: 'Terminal de Utilidade Pública',
    locationName: 'Praça da República (Jardim de Baixo)',
    govCityName: 'Jaú',
    orbTag: 'JAÚ',
    alertText: 'Praça da República (Jardim de Baixo) • Informações Fixas Locais (Sem Internet)',
    crestSvg: `<svg viewBox="0 0 36 40" width="28" height="30" fill="none">
      <!-- Coroa Mural Prateada/Dourada -->
      <path d="M6 4h4v3h3V4h4v3h3V4h4v3h3V4h3v6H6V4z" fill="#ffcd07"/>
      <!-- Escudo Clássico Municipal -->
      <path d="M5 11h26v13c0 8.5-5.8 13.5-13 15-7.2-1.5-13-6.5-13-15V11z" fill="#0c326f" stroke="#ffcd07" stroke-width="2"/>
      <!-- Faixa Ondulada do Rio Jaú -->
      <path d="M7 22c4-2 7 2 11 0s7 2 11 0v4c-4 2-7-2-11 0s-7-2-11 0v-4z" fill="#38bdf8"/>
      <!-- Estrela da Estância Turística -->
      <polygon points="18,13 19.3,16 22.5,16.3 20,18.4 20.8,21.5 18,19.8 15.2,21.5 16,18.4 13.5,16.3 16.7,16" fill="#ffcd07"/>
    </svg>`,
    homeCards: {
      bus: {
        tag: 'DISTÂNCIAS A PÉ',
        title: 'Mapa e Pontos de Referência',
        desc: 'Distâncias a pé e endereços fixos da Rodoviária, Centro, Praças e Saúde.',
        action: 'Ver 4 pontos fixos'
      },
      shoes: {
        tag: 'A 3 MIN A PÉ',
        title: 'Polo do Calçado',
        desc: 'Rua Major Prado, Shopping do Calçado e lojas de fábrica.',
        action: 'Como chegar'
      },
      tourism: {
        tag: 'LAZER GRÁTIS',
        title: 'Turismo e Parques',
        desc: 'Igreja Matriz a 150m, Parque do Rio Jaú e Teatro Municipal.',
        action: 'Ver locais'
      },
      services: {
        tag: 'DIRETO NO CELULAR',
        title: 'Ouvidoria e Serviços',
        desc: 'Ouvidoria 156, Farmácia 24h, mapa deste ponto e telefones.',
        action: 'Abrir serviços'
      }
    },
    ads: [
      "Shopping Território do Calçado: mais de 150 lojas abertas de Seg a Sáb até 20h.",
      "Rua Major Prado: polo central de calçados a 3 minutos a pé (250m) desta praça.",
      "Parque do Rio Jaú: aberto todos os dias das 06h às 21h com entrada gratuita.",
      "Santa Casa e Farmácia Municipal: atendimento de saúde a 8 minutos a pé (650m).",
      "Mapa Local Fixo: escaneie o QR Code de qualquer ponto para abrir a localização no celular."
    ],
    busTitle: 'Mapa de Localização e Pontos de Referência',
    busHtml: `
      <!-- Ponto 1: Praça da República (Você está aqui) -->
      <div class="bus-item bus-item-here" data-category="centro">
        <div class="bus-eta-box live">
          <span class="eta-num">0m</span>
          <span class="eta-unit">AQUI</span>
        </div>
        <div class="bus-info">
          <div class="bus-title-row">
            <span class="bus-line-tag">PONTO ATUAL</span>
            <span class="bus-here-badge">VOCÊ ESTÁ AQUI</span>
          </div>
          <h4>Praça da República (Jardim de Baixo)</h4>
          <p class="bus-times-inline">Endereço Fixo: <strong>Centro Histórico — Entre Rua Major Prado e Rua Lourenço Prado</strong></p>
        </div>
        <button class="btn-bus-action" onclick="app.showBusDetails('Praça da República (Jardim de Baixo)', 'Ponto Atual do Totem ➜ Centro Histórico de Jaú', 'Ao lado do Calçadão e da Rua Major Prado', 'https://maps.google.com/?q=Praca+da+Republica+Jau+SP')">Mapa QR</button>
      </div>

      <!-- Ponto 2: Praça da Matriz -->
      <div class="bus-item" data-category="centro">
        <div class="bus-eta-box live">
          <span class="eta-num">150m</span>
          <span class="eta-unit">2 min</span>
        </div>
        <div class="bus-info">
          <div class="bus-title-row">
            <span class="bus-line-tag">CENTRO HISTÓRICO</span>
            <span class="bus-stop-note">A 2 min a pé daqui</span>
          </div>
          <h4>Praça da Matriz (N. Sra. do Patrocínio)</h4>
          <p class="bus-times-inline">Endereço Fixo: <strong>Subindo a quadra central pela Rua Edgard Ferraz (150 metros)</strong></p>
        </div>
        <button class="btn-bus-action" onclick="app.showBusDetails('Praça da Matriz — Centro', 'Distância fixa: 150 metros (2 minutos a pé subindo a praça)', 'Praça N. Sra. do Patrocínio, Centro', 'https://maps.google.com/?q=Igreja+Matriz+Jau+SP')">Mapa QR</button>
      </div>

      <!-- Ponto 3: Santa Casa e Farmácia Municipal -->
      <div class="bus-item" data-category="bairros">
        <div class="bus-eta-box live">
          <span class="eta-num">650m</span>
          <span class="eta-unit">8 min</span>
        </div>
        <div class="bus-info">
          <div class="bus-title-row">
            <span class="bus-line-tag">SAÚDE 24H</span>
            <span class="bus-stop-note">Rua Riachuelo, 480</span>
          </div>
          <h4>Santa Casa de Jaú &amp; Farmácia Municipal</h4>
          <p class="bus-times-inline">Endereço Fixo: <strong>Pronto-Socorro 24h e Farmácia Municipal a 8 min de caminhada</strong></p>
        </div>
        <button class="btn-bus-action" onclick="app.showBusDetails('Santa Casa & Farmácia Municipal', 'Distância fixa: 650 metros (8 min a pé pelo Centro)', 'Rua Riachuelo, 480 / Rua Amaral Gurgel', 'https://maps.google.com/?q=Santa+Casa+ de+Jau+SP')">Mapa QR</button>
      </div>

      <!-- Ponto 4: Terminal Rodoviário Municipal -->
      <div class="bus-item" data-category="bairros">
        <div class="bus-eta-box waiting">
          <span class="eta-num">1,2</span>
          <span class="eta-unit">km</span>
        </div>
        <div class="bus-info">
          <div class="bus-title-row">
            <span class="bus-line-tag">TERMINAL RODOVIÁRIO</span>
            <span class="bus-stop-note">15 min a pé</span>
          </div>
          <h4>Terminal Rodoviário Municipal de Jaú</h4>
          <p class="bus-times-inline">Endereço Fixo: <strong>Rua Quintino Bocaiúva, s/n — Centro / Acesso Regional</strong></p>
        </div>
        <button class="btn-bus-action" onclick="app.showBusDetails('Terminal Rodoviário Municipal de Jaú', 'Distância fixa: 1,2 km da Praça da República (15 min a pé)', 'Rua Quintino Bocaiúva, Centro - Jaú/SP', 'https://maps.google.com/?q=Terminal+Rodoviario+Jau+SP')">Mapa QR</button>
      </div>
    `,
    shoesTitle: 'Onde Comprar Calçados em Jaú',
    shoesHtml: `
      <!-- Local 1: Rua Major Prado -->
      <div class="tour-card">
        <div class="tour-icon icon-shoes-box" aria-label="Comércio Centro">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/></svg>
        </div>
        <div class="tour-content">
          <div class="place-meta-row">
            <span class="distance-pill walk">A 3 min a pé daqui (250m)</span>
            <span class="open-status">Seg a Sáb • 09h às 18h</span>
          </div>
          <h4>Rua Major Prado (Comércio Central)</h4>
          <p>Dezenas de lojas de calçados, bolsas e moda feminina a duas quadras desta praça.</p>
          <button class="btn-tour-action" onclick="app.showStoreQR('Rua Major Prado — Centro', 'A 250m da Praça da República (3 min a pé)', 'https://maps.google.com/?q=Rua+Major+Prado+Jau')">
            Abrir Rota no Celular
          </button>
        </div>
      </div>

      <!-- Local 2: Espaço Noivas e Festa -->
      <div class="tour-card">
        <div class="tour-icon icon-shoes-box" aria-label="Calçados de Festa">
          <svg viewBox="0 0 512 512" width="28" height="28" fill="currentColor">
            <path d="M507.2 193.9c-11.5 54.6-38.9 124.7-45.2 269.3h-33.4c0 0 0-175.9-42.4-233.1v-36.2l121 0z"/>
            <path d="M507.2 193.9c3.3-15.5 4.8-27.2 4.8-42.2 0-67.7-34.2-103-34.2-103C300.9 131.1 251.2 205.7 195.4 304.4c-17.1 30.3-102.5-2.7-150 25.1C19.1 345 0 374.7 0 434.4c0 0 76.2 28.9 159.8 28.9s101.3-19.2 131-86.2C362.1 215.9 423.4 193.9 507.2 193.9z"/>
          </svg>
        </div>
        <div class="tour-content">
          <div class="place-meta-row">
            <span class="distance-pill walk">A 5 min a pé daqui (400m)</span>
            <span class="open-status">Rua Amaral Gurgel, 210</span>
          </div>
          <h4>Polo Noivas e Calçados de Festa</h4>
          <p>Lojas especializadas em calçados sociais, noivas, formaturas e sob medida.</p>
          <button class="btn-tour-action" onclick="app.showStoreQR('Polo Noivas e Festa', 'Rua Amaral Gurgel, 210 - Centro (5 min a pé)', 'https://maps.google.com/?q=Rua+Amaral+Gurgel+210+Jau')">
            Abrir Rota no Celular
          </button>
        </div>
      </div>

      <!-- Local 3: Shopping Território do Calçado -->
      <div class="tour-card">
        <div class="tour-icon icon-shoes-box" aria-label="Shopping do Calçado">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3h-6c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/></svg>
        </div>
        <div class="tour-content">
          <div class="place-meta-row">
            <span class="distance-pill drive">8 min de carro (3,5 km)</span>
            <span class="open-status">Seg a Sáb • 09h às 20h</span>
          </div>
          <h4>Shopping Território do Calçado</h4>
          <p>Mais de 150 lojas de fábrica, estacionamento gratuito e praça de alimentação.</p>
          <button class="btn-tour-action" onclick="app.showStoreQR('Shopping Território do Calçado', 'Av. Hermínio Pires de Oliveira Netto, 400 (8 min de carro)', 'https://maps.google.com/?q=Territorio+do+Calcado+Jau')">
            Abrir Rota no Celular
          </button>
        </div>
      </div>
    `,
    tourismTitle: 'Passeios e Lazer em Jaú',
    tourismHtml: `
      <!-- Turismo 1: Igreja Matriz -->
      <div class="tour-card">
        <div class="tour-icon icon-tour-box" aria-label="Igreja Matriz de Jaú">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
            <path d="M11.5 1h1v1.5h1.5v1h-1.5v1.5h-1V3.5h-1.5v-1h1.5z"/>
            <path d="M12 5.5 L8.5 10 L8.5 22 L15.5 22 L15.5 10 Z"/>
            <path d="M4 13 L8.5 10 L8.5 22 L4 22 Z"/>
            <path d="M20 13 L15.5 10 L15.5 22 L20 22 Z"/>
            <path d="M10.5 17 a1.5 1.5 0 0 1 3 0 L13.5 22 L10.5 22 Z" fill="#ffffff"/>
            <circle cx="12" cy="12.5" r="1.3" fill="#ffffff"/>
          </svg>
        </div>
        <div class="tour-content">
          <div class="place-meta-row">
            <span class="distance-pill walk">A 2 min a pé daqui (150m)</span>
            <span class="open-status">Entrada Gratuita</span>
          </div>
          <h4>Igreja Matriz N. Sra. do Patrocínio</h4>
          <p>Igreja histórica na praça superior, vitrais clássicos e jardins arborizados.</p>
          <button class="btn-tour-action" onclick="app.showTourQR('Igreja Matriz de Jaú', 'Praça N. Sra. do Patrocínio - Centro (a 150m daqui)', 'https://maps.google.com/?q=Igreja+Matriz+Jau')">
            Ver Mapa no Celular
          </button>
        </div>
      </div>

      <!-- Turismo 2: Parque do Rio Jaú -->
      <div class="tour-card">
        <div class="tour-icon icon-tour-box" aria-label="Parque do Rio Jaú">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
            <path d="M12 2 C8.5 2 6 4.5 6 7.5 C4.5 8 3.5 9.5 3.5 11.5 C3.5 14 5.5 16 8 16 L16 16 C18.5 16 20.5 14 20.5 11.5 C20.5 9.5 19.5 8 18 7.5 C18 4.5 15.5 2 12 2 Z"/>
            <path d="M11 16 L11 20 L13 20 L13 16 Z"/>
            <path d="M2 21 C4.5 19.5 7.5 22.5 10 21 C12.5 19.5 15.5 22.5 18 21 C19.5 20 21 21 22 21" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="tour-content">
          <div class="place-meta-row">
            <span class="distance-pill drive">6 min de carro (2,2 km)</span>
            <span class="open-status">06h às 21h • Grátis</span>
          </div>
          <h4>Parque Municipal do Rio Jaú</h4>
          <p>Pista de caminhada, lago, quiosques, quadras e área de lazer para famílias.</p>
          <button class="btn-tour-action" onclick="app.showTourQR('Parque do Rio Jaú', 'Av. Dr. Quinzinho (2,2 km do Centro)', 'https://maps.google.com/?q=Parque+do+Rio+Jau')">
            Ver Mapa no Celular
          </button>
        </div>
      </div>

      <!-- Turismo 3: Teatro Municipal -->
      <div class="tour-card">
        <div class="tour-icon icon-tour-box" aria-label="Teatro Municipal">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
            <path d="M2 4v6c0 4.97 3.58 9 8 9s8-4.03 8-9V4H2zm5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-3 8c-2.21 0-4-1.34-4-3h8c0 1.66-1.79 3-4 3zm12-7h-2v2c0 5.55-3.84 10.22-9 11.45.95.35 1.96.55 3 .55 4.42 0 8-4.03 8-9V9z"/>
          </svg>
        </div>
        <div class="tour-content">
          <div class="place-meta-row">
            <span class="distance-pill drive">5 min de carro (1,4 km)</span>
            <span class="open-status">Rua Paissandu, 1562</span>
          </div>
          <h4>Teatro Municipal Elza Munerato</h4>
          <p>Espetáculos gratuitos e pagos de teatro, música e dança da Secretaria de Cultura.</p>
          <button class="btn-tour-action" onclick="app.showTourQR('Teatro Municipal Elza Munerato', 'Rua Paissandu, 1562 - Jaú/SP', 'https://maps.google.com/?q=Teatro+Municipal+Jau')">
            Ver Mapa no Celular
          </button>
        </div>
      </div>
    `,
    quickBarHtml: `
      <button type="button" class="quick-service-pill" onclick="app.openModal('modal-contacts')">
        <span class="q-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#dc2626"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z"/></svg>
        </span>
        <span class="q-txt">SAMU <strong>192</strong></span>
      </button>
      <button type="button" class="quick-service-pill" onclick="app.openModal('modal-contacts')">
        <span class="q-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#1351b4"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/></svg>
        </span>
        <span class="q-txt">Guarda <strong>153</strong></span>
      </button>
      <button type="button" class="quick-service-pill" onclick="app.showGenericQR('Ouvidoria 156 — Prefeitura de Jaú', 'https://www.jau.sp.gov.br/ouvidoria')">
        <span class="q-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#d97706"><path d="M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2a7 7 0 0 1 14 0v2h-4v8h4c1.1 0 2-.9 2-2v-7a9 9 0 0 0-9-9z"/></svg>
        </span>
        <span class="q-txt">Ouvidoria <strong>156</strong></span>
      </button>
      <button type="button" class="quick-service-pill" onclick="app.showStoreQR('Farmácia Municipal de Jaú', 'Rua Riachuelo, 480 - Centro (A 4 min a pé daqui)', 'https://maps.google.com/?q=Farmacia+Municipal+Jau+SP')">
        <span class="q-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#168821"><path d="M10.5 2h3v8.5H22v3h-8.5V22h-3v-8.5H2v-3h8.5V2z"/></svg>
        </span>
        <span class="q-txt">Farmácia <strong>24h</strong></span>
      </button>
    `,
    servicesHtml: `
      <!-- Coluna Ouvidoria & Localização Rápida -->
      <div class="service-box">
        <h3>Atendimento Direto no Celular (QR Code)</h3>
        <div class="ouvidoria-card">
          <div class="ouvidoria-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#1351b4"><path d="M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2a7 7 0 0 1 14 0v2h-4v8h4c1.1 0 2-.9 2-2v-7a9 9 0 0 0-9-9z"/></svg>
          </div>
          <div>
            <strong>Ouvidoria Municipal 156</strong>
            <p>Solicite tapa-buraco, iluminação ou limpeza sem fila.</p>
          </div>
          <button class="btn-ouvidoria" onclick="app.showGenericQR('Ouvidoria 156 — Prefeitura de Jaú', 'https://www.jau.sp.gov.br/ouvidoria')">Abrir QR</button>
        </div>

        <div class="ouvidoria-card" style="margin-top:8px;">
          <div class="ouvidoria-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#168821"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
          </div>
          <div>
            <strong>Localização Deste Ponto (Praça da República)</strong>
            <p>Salve no celular onde você está agora para compartilhar ou voltar.</p>
          </div>
          <button class="btn-ouvidoria" onclick="app.showPointLocationQR('Você está em: Praça da República', 'Jardim de Baixo — Centro de Jaú/SP', 'https://maps.google.com/?q=Praca+da+Republica+Jau+SP')">Abrir QR</button>
        </div>
      </div>

      <!-- Coluna Telefones Úteis -->
      <div class="service-box">
        <h3>Telefones de Emergência (Ligação Gratuita)</h3>
        <div class="phone-grid">
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">192</span>
            <span class="p-label">SAMU</span>
          </div>
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">193</span>
            <span class="p-label">Bombeiros</span>
          </div>
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">153</span>
            <span class="p-label">Guarda Municipal</span>
          </div>
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">190</span>
            <span class="p-label">Polícia Militar</span>
          </div>
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">199</span>
            <span class="p-label">Defesa Civil</span>
          </div>
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">180 / 100</span>
            <span class="p-label">Proteção Social</span>
          </div>
        </div>
      </div>
    `,
    contacts: {
      gcmTitle: 'Guarda Civil Municipal de Jaú',
      gcmDesc: 'Apoio nas praças, patrulhamento municipal e auxílio ao cidadão.',
      adminBadge: 'JAÚ',
      adminTitle: 'Plantão Social • Assistência Social de Jaú',
      adminPhone: '(14) 3602-5777',
      adminDesc: 'Acolhimento a pessoas em vulnerabilidade ou situação de rua.',
      footNote: 'Você está na <strong>Praça da República (Jardim de Baixo — Centro de Jaú)</strong>. Informe este local ao pedir socorro.'
    }
  },

  itapui: {
    key: 'itapui',
    name: 'Itapuí',
    state: 'SP',
    brandChassis: 'PREFEITURA DE ITAPUÍ • SP',
    brandTitle: 'PREFEITURA DE ITAPUÍ',
    brandSub: 'Terminal de Utilidade Pública • Prainha & Tradições',
    locationName: 'Praça da Matriz (Jardim das Topiarias)',
    govCityName: 'Itapuí',
    orbTag: 'ITAPUÍ',
    alertText: 'Praça da Matriz (Jardim das Topiarias) • Guia Local Fixo (100% Offline)',
    crestSvg: `<svg viewBox="0 0 36 40" width="28" height="30" fill="none">
      <!-- Coroa Mural Prateada/Dourada -->
      <path d="M6 4h4v3h3V4h4v3h3V4h4v3h3V4h3v6H6V4z" fill="#ffcd07"/>
      <!-- Escudo Clássico Municipal Esmeralda -->
      <path d="M5 11h26v13c0 8.5-5.8 13.5-13 15-7.2-1.5-13-6.5-13-15V11z" fill="#065f46" stroke="#ffcd07" stroke-width="2"/>
      <!-- Faixa Ondulada do Rio Tietê -->
      <path d="M7 23c4-2 7 2 11 0s7 2 11 0v4c-4 2-7-2-11 0s-7-2-11 0v-4z" fill="#38bdf8"/>
      <!-- Sol Dourado das Águas e Turismo -->
      <circle cx="18" cy="17" r="4.5" fill="#ffcd07"/>
    </svg>`,
    homeCards: {
      bus: {
        tag: 'DISTÂNCIAS A PÉ',
        title: 'Mapa e Pontos de Referência',
        desc: 'Distâncias a pé e endereços fixos da Praça, Hospital, Prainha e Balsa.',
        action: 'Ver 4 pontos fixos'
      },
      shoes: {
        tag: 'A 2 MIN A PÉ',
        title: 'Comércio e Serviços Locais',
        desc: 'Comércio da Praça, gastronomia do Rio Tietê e artesanato local.',
        action: 'Conhecer comércio'
      },
      tourism: {
        tag: 'TRADIÇÃO & LAZER',
        title: 'Festas e Ecoturismo',
        desc: 'Festa do Peão, Quermesse Santo Antônio, Carnaval e Prainha.',
        action: 'Ver atrações'
      },
      services: {
        tag: 'CANAL DO CIDADÃO',
        title: 'Serviços e Prefeitura',
        desc: 'Paço Municipal, Hospital São José, Postos de Saúde e Telefones.',
        action: 'Abrir serviços'
      }
    },
    ads: [
      "Festa do Peão de Itapuí: o maior rodeio e festival sertanejo da região com entrada solidária.",
      "Quermesse da Paróquia Santo Antônio: tradição, comidas típicas e bênção na Praça da Matriz.",
      "Carnaval de Rua de Itapuí: folia familiar, blocos tradicionais e matinês na orla.",
      "Prainha Municipal de Itapuí: orla do Rio Tietê aberta ao público com quiosques e área de camping.",
      "Balsa Itapuí ⇄ Boracéia: travessia pública no Rio Tietê com operação ininterrupta 24 horas."
    ],
    busTitle: 'Mapa de Localização e Pontos de Referência (Itapuí)',
    busHtml: `
      <!-- Ponto 1: Praça da Matriz (Você está aqui) -->
      <div class="bus-item bus-item-here" data-category="centro">
        <div class="bus-eta-box live">
          <span class="eta-num">0m</span>
          <span class="eta-unit">AQUI</span>
        </div>
        <div class="bus-info">
          <div class="bus-title-row">
            <span class="bus-line-tag">PONTO ATUAL</span>
            <span class="bus-here-badge">VOCÊ ESTÁ AQUI</span>
          </div>
          <h4>Praça da Matriz (Jardim das Topiarias)</h4>
          <p class="bus-times-inline">Endereço Fixo: <strong>Praça da Matriz, nº 73 — Centro Histórico de Itapuí/SP</strong></p>
        </div>
        <button class="btn-bus-action" onclick="app.showBusDetails('Praça da Matriz — Itapuí', 'Ponto Atual do Totem ➜ Jardim das Topiarias e Paróquia Santo Antônio', 'Centro Histórico de Itapuí/SP', 'https://maps.google.com/?q=Praca+da+Matriz+Itapui+SP')">Mapa QR</button>
      </div>

      <!-- Ponto 2: Hospital São José & Paço Municipal -->
      <div class="bus-item" data-category="centro">
        <div class="bus-eta-box live">
          <span class="eta-num">300m</span>
          <span class="eta-unit">4 min</span>
        </div>
        <div class="bus-info">
          <div class="bus-title-row">
            <span class="bus-line-tag" style="background:#059669; color:#fff;">SAÚDE &amp; PAÇO</span>
            <span class="bus-stop-note">A 4 min a pé daqui</span>
          </div>
          <h4>Hospital São José &amp; Paço Municipal</h4>
          <p class="bus-times-inline">Endereço Fixo: <strong>Rua Santo Antônio, 285 — Atendimento 24h no Centro</strong></p>
        </div>
        <button class="btn-bus-action" onclick="app.showBusDetails('Hospital São José & Paço Municipal', 'Distância fixa: 300 metros da Praça da Matriz (4 min a pé)', 'Rua Santo Antônio, 285 - Centro, Itapuí/SP', 'https://maps.google.com/?q=Hospital+Sao+Jose+Itapui+SP')">Mapa QR</button>
      </div>

      <!-- Ponto 3: Prainha Municipal do Rio Tietê -->
      <div class="bus-item" data-category="bairros">
        <div class="bus-eta-box live">
          <span class="eta-num">2,5</span>
          <span class="eta-unit">km</span>
        </div>
        <div class="bus-info">
          <div class="bus-title-row">
            <span class="bus-line-tag">LAZER &amp; ORLA</span>
            <span class="bus-stop-note">Av. Beira-Rio</span>
          </div>
          <h4>Prainha Municipal do Rio Tietê</h4>
          <p class="bus-times-inline">Endereço Fixo: <strong>Orla do Rio Tietê — Balneário, quiosques e área de lazer</strong></p>
        </div>
        <button class="btn-bus-action" onclick="app.showBusDetails('Prainha Municipal de Itapuí', 'Distância fixa: 2,5 km do Centro (acesso pela Av. Beira-Rio)', 'Margem do Rio Tietê - Itapuí/SP', 'https://maps.google.com/?q=Prainha+Municipal+Itapui+SP')">Mapa QR</button>
      </div>

      <!-- Ponto 4: Porto da Balsa & Rodoviária -->
      <div class="bus-item" data-category="bairros">
        <div class="bus-eta-box waiting">
          <span class="eta-num">3,0</span>
          <span class="eta-unit">km</span>
        </div>
        <div class="bus-info">
          <div class="bus-title-row">
            <span class="bus-line-tag">TRAVESSIA FLUVIAL</span>
            <span class="bus-stop-note">Porto do Rio Tietê</span>
          </div>
          <h4>Porto da Balsa Itapuí ⇄ Boracéia &amp; Rodoviária</h4>
          <p class="bus-times-inline">Endereço Fixo: <strong>Acesso à Rodovia SP-225 (Jaú 14 km) e Porto do Rio Tietê</strong></p>
        </div>
        <button class="btn-bus-action" onclick="app.showBusDetails('Porto da Balsa Itapuí ⇄ Boracéia', 'Distância fixa: 3,0 km do Centro — Travessia do Rio Tietê', 'Porto Fluvial de Itapuí / Acesso SP-225', 'https://maps.google.com/?q=Balsa+Itapui+Boraceia+SP')">Mapa QR</button>
      </div>
    `,
    shoesTitle: 'Comércio Local e Gastronomia em Itapuí',
    shoesHtml: `
      <!-- Local 1: Comércio Praça da Matriz -->
      <div class="tour-card">
        <div class="tour-icon icon-shoes-box" aria-label="Comércio Centro">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/></svg>
        </div>
        <div class="tour-content">
          <div class="place-meta-row">
            <span class="distance-pill walk">A 2 min a pé daqui (150m)</span>
            <span class="open-status">Seg a Sáb • 08h às 18h</span>
          </div>
          <h4>Comércio Central da Praça da Matriz</h4>
          <p>Lojas de confecções, farmácias, padarias artesanais e serviços essenciais em volta da praça.</p>
          <button class="btn-tour-action" onclick="app.showStoreQR('Comércio Central de Itapuí', 'Praça da Matriz, Centro - Itapuí/SP (a 2 min a pé)', 'https://maps.google.com/?q=Praca+da+Matriz+Itapui+SP')">
            Abrir Rota no Celular
          </button>
        </div>
      </div>

      <!-- Local 2: Gastronomia Ribeirinha -->
      <div class="tour-card">
        <div class="tour-icon icon-shoes-box" aria-label="Gastronomia Rio Tietê">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
        </div>
        <div class="tour-content">
          <div class="place-meta-row">
            <span class="distance-pill drive">4 min de carro (1,8 km)</span>
            <span class="open-status">Diariamente • 10h às 22h</span>
          </div>
          <h4>Gastronomia & Peixarias do Rio Tietê</h4>
          <p>Restaurantes ribeirinhos tradicionais com tucunaré frito, peixes nobres e gastronomia de água doce.</p>
          <button class="btn-tour-action" onclick="app.showStoreQR('Gastronomia Ribeirinha — Itapuí', 'Av. Beira-Rio / Acesso Prainha - Itapuí/SP', 'https://maps.google.com/?q=Restaurantes+Itapui+SP')">
            Abrir Rota no Celular
          </button>
        </div>
      </div>

      <!-- Local 3: Artesanato e Doces Caseiros -->
      <div class="tour-card">
        <div class="tour-icon icon-shoes-box" aria-label="Artesanato Local">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3h-6c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/></svg>
        </div>
        <div class="tour-content">
          <div class="place-meta-row">
            <span class="distance-pill walk">A 3 min a pé daqui (200m)</span>
            <span class="open-status">Feiras e Fins de Semana</span>
          </div>
          <h4>Feira de Artesanato & Doces Caseiros</h4>
          <p>Bordados manuais, doces tradicionais caseiros de compota, mel e lembranças de Itapuí.</p>
          <button class="btn-tour-action" onclick="app.showStoreQR('Artesanato de Itapuí', 'Entorno da Praça da Matriz - Centro de Itapuí/SP', 'https://maps.google.com/?q=Praca+da+Matriz+Itapui+SP')">
            Abrir Rota no Celular
          </button>
        </div>
      </div>
    `,
    tourismTitle: 'Eventos Tradicionais e Atrações de Itapuí',
    tourismHtml: `
      <!-- Evento 1: Festa do Peão de Itapuí -->
      <div class="tour-card" style="border: 2px solid #f59e0b; background: rgba(245, 158, 11, 0.04);">
        <div class="tour-icon icon-tour-box" style="background:#b45309; color:#fff;" aria-label="Festa do Peão de Itapuí">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
        <div class="tour-content">
          <div class="place-meta-row">
            <span class="distance-pill drive" style="background:#b45309; color:#fff;">GRANDE EVENTO TRADICIONAL</span>
            <span class="open-status">Recinto de Eventos</span>
          </div>
          <h4>Festa do Peão de Itapuí</h4>
          <p>Grande tradição sertaneja com rodeio em touros, montarias, shows nacionais, praça de alimentação com queima do alho e entrada solidária.</p>
          <button class="btn-tour-action" onclick="app.showTourQR('Festa do Peão de Itapuí', 'Recinto de Exposições e Eventos de Itapuí / SP', 'https://maps.google.com/?q=Festa+do+Peao+Itapui+SP')">
            Ver Local do Rodeio
          </button>
        </div>
      </div>

      <!-- Evento 2: Quermesse da Paróquia Santo Antônio -->
      <div class="tour-card" style="border: 2px solid #059669; background: rgba(5, 150, 105, 0.04);">
        <div class="tour-icon icon-tour-box" style="background:#047857; color:#fff;" aria-label="Quermesse Santo Antônio">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
            <path d="M11.5 1h1v1.5h1.5v1h-1.5v1.5h-1V3.5h-1.5v-1h1.5z"/>
            <path d="M12 5.5 L8.5 10 L8.5 22 L15.5 22 L15.5 10 Z"/>
            <path d="M4 13 L8.5 10 L8.5 22 L4 22 Z"/>
            <path d="M20 13 L15.5 10 L15.5 22 L20 22 Z"/>
            <path d="M10.5 17 a1.5 1.5 0 0 1 3 0 L13.5 22 L10.5 22 Z" fill="#ffffff"/>
            <circle cx="12" cy="12.5" r="1.3" fill="#ffffff"/>
          </svg>
        </div>
        <div class="tour-content">
          <div class="place-meta-row">
            <span class="distance-pill walk" style="background:#047857; color:#fff;">TRADIÇÃO NA PRAÇA (150m)</span>
            <span class="open-status">Paróquia Santo Antônio</span>
          </div>
          <h4>Quermesse da Paróquia Santo Antônio</h4>
          <p>Festa do padroeiro com comidas típicas, bolo abençoado de Santo Antônio, barracas familiares, bingos e shows no coreto central.</p>
          <button class="btn-tour-action" onclick="app.showTourQR('Quermesse da Paróquia Santo Antônio', 'Praça da Matriz, Centro - Itapuí/SP (Em frente ao totem)', 'https://maps.google.com/?q=Paroquia+Santo+Antonio+Itapui+SP')">
            Ver Mapa da Paróquia
          </button>
        </div>
      </div>

      <!-- Evento 3: Carnaval de Rua de Itapuí -->
      <div class="tour-card" style="border: 2px solid #8b5cf6; background: rgba(139, 92, 246, 0.04);">
        <div class="tour-icon icon-tour-box" style="background:#7c3aed; color:#fff;" aria-label="Carnaval de Rua">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div class="tour-content">
          <div class="place-meta-row">
            <span class="distance-pill walk" style="background:#7c3aed; color:#fff;">FOLIA TRADICIONAL DE RUA</span>
            <span class="open-status">Circuito Central</span>
          </div>
          <h4>Carnaval de Rua de Itapuí</h4>
          <p>Carnaval popular e acolhedor com desfile dos blocos tradicionais da cidade, trio elétrico, matinês infantis e festa segura para toda a família.</p>
          <button class="btn-tour-action" onclick="app.showTourQR('Carnaval de Rua de Itapuí', 'Circuito de Rua do Centro / Orla - Itapuí/SP', 'https://maps.google.com/?q=Carnaval+Itapui+SP')">
            Ver Circuito da Folia
          </button>
        </div>
      </div>

      <!-- Ponto 4: Prainha Municipal do Rio Tietê -->
      <div class="tour-card">
        <div class="tour-icon icon-tour-box" aria-label="Prainha Municipal de Itapuí">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
            <path d="M12 2 C8.5 2 6 4.5 6 7.5 C4.5 8 3.5 9.5 3.5 11.5 C3.5 14 5.5 16 8 16 L16 16 C18.5 16 20.5 14 20.5 11.5 C20.5 9.5 19.5 8 18 7.5 C18 4.5 15.5 2 12 2 Z"/>
            <path d="M11 16 L11 20 L13 20 L13 16 Z"/>
            <path d="M2 21 C4.5 19.5 7.5 22.5 10 21 C12.5 19.5 15.5 22.5 18 21 C19.5 20 21 21 22 21" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="tour-content">
          <div class="place-meta-row">
            <span class="distance-pill drive">5 min de carro (2,5 km)</span>
            <span class="open-status">08h às 19h • Acesso Livre</span>
          </div>
          <h4>Prainha Municipal do Rio Tietê</h4>
          <p>Balneário de água doce limpa, orla arborizada, quiosques com churrasqueiras, área de camping, quadras e pesca esportiva.</p>
          <button class="btn-tour-action" onclick="app.showTourQR('Prainha Municipal de Itapuí', 'Margem do Rio Tietê - Acesso pela Av. Beira-Rio (2,5 km)', 'https://maps.google.com/?q=Prainha+Municipal+Itapui+SP')">
            Ver Mapa no Celular
          </button>
        </div>
      </div>

      <!-- Ponto 5: Praça da Matriz (Jardim das Topiarias) -->
      <div class="tour-card">
        <div class="tour-icon icon-tour-box" aria-label="Praça da Matriz de Itapuí">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/>
          </svg>
        </div>
        <div class="tour-content">
          <div class="place-meta-row">
            <span class="distance-pill walk">Neste Ponto (Em frente ao Totem)</span>
            <span class="open-status">Espaço Público 24h</span>
          </div>
          <h4>Praça da Matriz (Jardim das Topiarias)</h4>
          <p>Conhecida regionalmente pelo artesanato botânico em árvores esculpidas (topiarias), coreto clássico, chafariz e jardins históricos.</p>
          <button class="btn-tour-action" onclick="app.showTourQR('Praça da Matriz de Itapuí', 'Praça da Matriz nº 73 - Centro, Itapuí/SP', 'https://maps.google.com/?q=Praca+da+Matriz+Itapui+SP')">
            Ver Mapa no Celular
          </button>
        </div>
      </div>
    `,
    quickBarHtml: `
      <button type="button" class="quick-service-pill" onclick="app.openModal('modal-contacts')">
        <span class="q-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#dc2626"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z"/></svg>
        </span>
        <span class="q-txt">SAMU <strong>192</strong></span>
      </button>
      <button type="button" class="quick-service-pill" onclick="app.showBusDetails('Porto da Balsa Itapuí ⇄ Boracéia', 'Porto Fluvial do Rio Tietê (3,0 km do Centro)', 'Travessia Itapuí ⇄ Boracéia', 'https://maps.google.com/?q=Balsa+Itapui+Boraceia+SP')">
        <span class="q-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#059669"><path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.47L19 11V7l-4-4H9L5 7v4l-2.28.07c-.26.05-.48.23-.6.47s-.14.52-.06.78L3.95 19z"/></svg>
        </span>
        <span class="q-txt">Porto <strong>Balsa</strong></span>
      </button>
      <button type="button" class="quick-service-pill" onclick="app.showGenericQR('Prefeitura Municipal de Itapuí', 'https://www.itapui.sp.gov.br')">
        <span class="q-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#d97706"><path d="M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2a7 7 0 0 1 14 0v2h-4v8h4c1.1 0 2-.9 2-2v-7a9 9 0 0 0-9-9z"/></svg>
        </span>
        <span class="q-txt">Paço <strong>(14) 3664-8040</strong></span>
      </button>
      <button type="button" class="quick-service-pill" onclick="app.showStoreQR('Hospital e Maternidade São José', 'Rua Santo Antônio, 285 - Centro, Itapuí/SP (A 4 min a pé daqui)', 'https://maps.google.com/?q=Hospital+Sao+Jose+Itapui+SP')">
        <span class="q-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#168821"><path d="M10.5 2h3v8.5H22v3h-8.5V22h-3v-8.5H2v-3h8.5V2z"/></svg>
        </span>
        <span class="q-txt">Hospital <strong>3664-1222</strong></span>
      </button>
    `,
    servicesHtml: `
      <!-- Coluna Atendimento & Localização Rápida -->
      <div class="service-box">
        <h3>Atendimento Direto no Celular (QR Code)</h3>
        <div class="ouvidoria-card">
          <div class="ouvidoria-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#059669"><path d="M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2a7 7 0 0 1 14 0v2h-4v8h4c1.1 0 2-.9 2-2v-7a9 9 0 0 0-9-9z"/></svg>
          </div>
          <div>
            <strong>Paço Municipal de Itapuí</strong>
            <p>Serviços municipais, telefone útil (14) 3664-8040 e localização do Paço.</p>
          </div>
          <button class="btn-ouvidoria" onclick="app.showGenericQR('Prefeitura Municipal de Itapuí', 'https://www.itapui.sp.gov.br')">Abrir QR</button>
        </div>

        <div class="ouvidoria-card" style="margin-top:8px;">
          <div class="ouvidoria-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#168821"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
          </div>
          <div>
            <strong>Localização Deste Ponto (Praça da Matriz)</strong>
            <p>Praça da Matriz (Jardim das Topiarias) — Centro de Itapuí/SP.</p>
          </div>
          <button class="btn-ouvidoria" onclick="app.showPointLocationQR('Você está em: Praça da Matriz', 'Jardim das Topiarias — Centro de Itapuí/SP', 'https://maps.google.com/?q=Praca+da+Matriz+Itapui+SP')">Abrir QR</button>
        </div>
      </div>

      <!-- Coluna Telefones Úteis -->
      <div class="service-box">
        <h3>Telefones de Emergência e Saúde de Itapuí</h3>
        <div class="phone-grid">
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">192</span>
            <span class="p-label">SAMU</span>
          </div>
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">3664-1222</span>
            <span class="p-label">Hospital S. José</span>
          </div>
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">3664-8040</span>
            <span class="p-label">Paço Municipal</span>
          </div>
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">190</span>
            <span class="p-label">Polícia Militar</span>
          </div>
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">199</span>
            <span class="p-label">Defesa Civil</span>
          </div>
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">180 / 100</span>
            <span class="p-label">Proteção Social</span>
          </div>
        </div>
      </div>
    `,
    contacts: {
      gcmTitle: 'Defesa Civil e Segurança Municipal de Itapuí',
      gcmDesc: 'Patrulhamento comunitário, apoio nos eventos e defesa do cidadão.',
      adminBadge: 'ITAPUÍ',
      adminTitle: 'Paço Municipal • Prefeitura de Itapuí',
      adminPhone: '(14) 3664-8040',
      adminDesc: 'Atendimento ao munícipe, serviços urbanos, saúde e assistência social.',
      footNote: 'Você está na <strong>Praça da Matriz (Jardim das Topiarias — Centro de Itapuí)</strong>. Hospital São José: (14) 3664-1222.'
    }
  },

  bauru: {
    key: 'bauru',
    name: 'Bauru',
    state: 'SP',
    brandChassis: 'PREFEITURA DE BAURU • SP',
    brandTitle: 'PREFEITURA DE BAURU',
    brandSub: 'Terminal de Utilidade Pública • Cidade Sem Limites',
    locationName: 'Praça Rui Barbosa (Centro • Calçadão)',
    govCityName: 'Bauru',
    orbTag: 'BAURU',
    alertText: 'Praça Rui Barbosa (Centro • Calçadão) • Guia Local Fixo (100% Offline)',
    crestSvg: `<svg viewBox="0 0 36 40" width="28" height="30" fill="none">
      <!-- Coroa Mural Dourada (5 Torres) -->
      <path d="M6 4h4v3h3V4h4v3h3V4h4v3h3V4h3v6H6V4z" fill="#ffcd07"/>
      <!-- Escudo Ibérico Clássico de Bauru -->
      <path d="M5 11h26v13c0 8.5-5.8 13.5-13 15-7.2-1.5-13-6.5-13-15V11z" fill="#1351b4" stroke="#ffcd07" stroke-width="2"/>
      <!-- Chefe com as 3 Estrelas das Ferrovias (Noroeste, Paulista, Sorocabana) -->
      <circle cx="11.5" cy="15.5" r="2.1" fill="#ffcd07"/>
      <circle cx="18" cy="14.8" r="2.4" fill="#ffcd07"/>
      <circle cx="24.5" cy="15.5" r="2.1" fill="#ffcd07"/>
      <!-- Silhueta da Suçuarana Passante (Custos Vigilat) -->
      <path d="M10 24c2-3 6-3 10-2s5 1 6-2c0 3-2 5-5 5H11l-1-1z" fill="#f59e0b"/>
      <!-- Ondas do Rio Bauru / Entroncamento na Campanha -->
      <path d="M8 29c3-1.5 6 1.5 10 0s7 1.5 10 0v2.5c-3 1.5-6-1.5-10 0s-7-1.5-10 0V29z" fill="#38bdf8"/>
    </svg>`,
    homeCards: {
      bus: {
        tag: 'DISTÂNCIAS A PÉ',
        title: 'Mapa e Pontos de Referência',
        desc: 'Distâncias a pé e endereços fixos do Calçadão, Poupatempo, Saúde e Terminal.',
        action: 'Ver 4 pontos fixos'
      },
      shoes: {
        tag: 'AO LADO DA PRAÇA',
        title: 'Calçadão e Comércio',
        desc: 'Calçadão da Batista de Carvalho, Shoppings e Sanduíche Bauru.',
        action: 'Ver comércio'
      },
      tourism: {
        tag: 'ZOO & BOTÂNICO',
        title: 'Turismo, Parques e Cultura',
        desc: 'Zoo de Bauru, Jardim Botânico, Vitória Régia e Museu Ferroviário.',
        action: 'Ver atrações'
      },
      services: {
        tag: 'POUPATEMPO & 156',
        title: 'Serviços e Saúde 24h',
        desc: 'Palácio das Cerejeiras, DAE Bauru, Poupatempo e UPAs 24h.',
        action: 'Abrir serviços'
      }
    },
    ads: [
      "Parque Zoológico e Jardim Botânico de Bauru: lazer ecológico e conservação do Cerrado na Rodovia SP-225/SP-300.",
      "Calçadão da Batista de Carvalho: o maior corredor comercial a céu aberto do Centro-Oeste Paulista ao lado da Praça Rui Barbosa.",
      "Sanduíche Bauru Patrimônio Imaterial: experimente a receita oficial com rosbife e queijo derretido em banho-maria.",
      "Poupatempo Bauru (Av. Nações Unidas, 4-44) e DAE Bauru 24h (0800-7710195): atendimento rápido ao cidadão.",
      "Conexão Regional SP-225: integração direta entre Bauru, Itapuí (40 km) e Jaú (47 km)."
    ],
    busTitle: 'Mapa de Localização e Pontos de Referência (Bauru)',
    busHtml: `
      <!-- Ponto 1: Praça Rui Barbosa & Calçadão -->
      <div class="bus-item bus-item-here" data-category="centro">
        <div class="bus-eta-box live">
          <span class="eta-num">0m</span>
          <span class="eta-unit">AQUI</span>
        </div>
        <div class="bus-info">
          <div class="bus-title-row">
            <span class="bus-line-tag">PONTO ATUAL</span>
            <span class="bus-here-badge">VOCÊ ESTÁ AQUI</span>
          </div>
          <h4>Praça Rui Barbosa &amp; Calçadão Central</h4>
          <p class="bus-times-inline">Endereço Fixo: <strong>Centro de Bauru — Entre Av. Rodrigues Alves e Rua Batista de Carvalho</strong></p>
        </div>
        <button class="btn-bus-action" onclick="app.showBusDetails('Praça Rui Barbosa & Calçadão (Bauru)', 'Ponto Atual do Totem ➜ Centro Comercial de Bauru', 'Av. Rodrigues Alves c/ Rua Batista de Carvalho', 'https://maps.google.com/?q=Praca+Rui+Barbosa+Bauru+SP')">Mapa QR</button>
      </div>

      <!-- Ponto 2: Pronto-Socorro Central & Poupatempo -->
      <div class="bus-item" data-category="centro">
        <div class="bus-eta-box live">
          <span class="eta-num">450m</span>
          <span class="eta-unit">6 min</span>
        </div>
        <div class="bus-info">
          <div class="bus-title-row">
            <span class="bus-line-tag">SERVIÇO E SAÚDE</span>
            <span class="bus-stop-note">A 6 min a pé daqui</span>
          </div>
          <h4>Pronto-Socorro Central (PSC 24h) &amp; Poupatempo</h4>
          <p class="bus-times-inline">Endereço Fixo: <strong>Rua Rubens Arruda, Q. 7 / Av. Nações Unidas, 4-44 — Centro</strong></p>
        </div>
        <button class="btn-bus-action" onclick="app.showBusDetails('Pronto-Socorro Central & Poupatempo Bauru', 'Distância fixa: 450 metros da Praça Rui Barbosa (6 min a pé)', 'Rua Rubens Arruda, Q. 7 / Av. Nações Unidas, 4-44', 'https://maps.google.com/?q=Poupatempo+Bauru+SP')">Mapa QR</button>
      </div>

      <!-- Ponto 3: Terminal Rodoviário Municipal -->
      <div class="bus-item" data-category="bairros">
        <div class="bus-eta-box waiting">
          <span class="eta-num">1,5</span>
          <span class="eta-unit">km</span>
        </div>
        <div class="bus-info">
          <div class="bus-title-row">
            <span class="bus-line-tag">TERMINAL RODOVIÁRIO</span>
            <span class="bus-stop-note">Praça João Paulo II</span>
          </div>
          <h4>Terminal Rodoviário Municipal de Bauru</h4>
          <p class="bus-times-inline">Endereço Fixo: <strong>Praça João Paulo II, 30 — Acesso às Rodovias SP-225 e SP-300</strong></p>
        </div>
        <button class="btn-bus-action" onclick="app.showBusDetails('Terminal Rodoviário de Bauru', 'Distância fixa: 1,5 km do Centro', 'Praça João Paulo II, 30 - Bauru/SP', 'https://maps.google.com/?q=Terminal+Rodoviario+de+Bauru+SP')">Mapa QR</button>
      </div>

      <!-- Ponto 4: Parque Vitória Régia & Palácio das Cerejeiras -->
      <div class="bus-item" data-category="bairros">
        <div class="bus-eta-box waiting">
          <span class="eta-num">2,4</span>
          <span class="eta-unit">km</span>
        </div>
        <div class="bus-info">
          <div class="bus-title-row">
            <span class="bus-line-tag" style="background:#d97706; color:#fff;">LAZER &amp; PREFEITURA</span>
            <span class="bus-stop-note">Av. Nações Unidas</span>
          </div>
          <h4>Parque Vitória Régia &amp; Palácio das Cerejeiras</h4>
          <p class="bus-times-inline">Endereço Fixo: <strong>Av. Nações Unidas, Quadra 25 / Praça das Cerejeiras, 1-59</strong></p>
        </div>
        <button class="btn-bus-action" onclick="app.showBusDetails('Parque Vitória Régia & Prefeitura de Bauru', 'Distância fixa: 2,4 km pela Av. Nações Unidas', 'Av. Nações Unidas, Q. 25 - Bauru/SP', 'https://maps.google.com/?q=Parque+Vitoria+Regia+Bauru+SP')">Mapa QR</button>
      </div>
    `,
    shoesTitle: 'Comércio, Shoppings e Gastronomia de Bauru',
    shoesHtml: `
      <div class="tour-card">
        <div class="tour-icon" style="background: #ffedd5; color: #ea580c;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
        <div class="tour-content">
          <div class="tour-header">
            <h3>Calçadão da Rua Batista de Carvalho</h3>
            <span class="tour-tag" style="background:#ffedd5; color:#c2410c;">AO LADO DA PRAÇA RUI BARBOSA</span>
          </div>
          <p>O mais famoso calçadão comercial do Centro-Oeste Paulista (Quadras 1 a 7), reunindo mais de 300 lojas, cafés históricos, bancos e serviços bem ao lado da Praça Rui Barbosa.</p>
          <div class="tour-meta">
            <span>📍 Rua Batista de Carvalho, Quadras 1 a 7 — Centro, Bauru/SP</span>
            <span>🕒 Seg a Sex: 09h às 18h • Sáb: 09h às 17h</span>
          </div>
          <button class="btn-tour-action" onclick="app.showStoreQR('Calçadão da Rua Batista de Carvalho', 'Rua Batista de Carvalho, Quadras 1 a 7 — Centro, Bauru/SP', 'https://maps.google.com/?q=Calcadao+Batista+de+Carvalho+Bauru+SP')">Rota no Celular (QR Code)</button>
        </div>
      </div>

      <div class="tour-card">
        <div class="tour-icon" style="background: #dbeafe; color: #1d4ed8;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </div>
        <div class="tour-content">
          <div class="tour-header">
            <h3>Bauru Shopping & Boulevard Shopping Bauru</h3>
            <span class="tour-tag" style="background:#dbeafe; color:#1d4ed8;">SHOPPINGS REGIONAIS</span>
          </div>
          <p>Grandes centros regionais de compras, moda, tecnologia, cinemas e praças de alimentação que atendem Bauru, Jaú, Itapuí e toda a região administrativa.</p>
          <div class="tour-meta">
            <span>📍 Rua Henrique Savi, 15-55 / Rua Gal. Marcondes Salgado, 11-39 — Bauru/SP</span>
            <span>🕒 Seg a Sáb: 10h às 22h • Dom: 14h às 20h</span>
          </div>
          <button class="btn-tour-action" onclick="app.showStoreQR('Bauru Shopping & Boulevard Shopping', 'Rua Henrique Savi, 15-55 / Rua Gal. Marcondes Salgado, 11-39 — Bauru/SP', 'https://maps.google.com/?q=Bauru+Shopping+Bauru+SP')">Rota no Celular (QR Code)</button>
        </div>
      </div>

      <div class="tour-card">
        <div class="tour-icon" style="background: #dcfce7; color: #15803d;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>
        </div>
        <div class="tour-content">
          <div class="tour-header">
            <h3>Rota do Sanduíche Bauru Original & Av. Getúlio Vargas</h3>
            <span class="tour-tag" style="background:#dcfce7; color:#15803d;">PATRIMÔNIO IMATERIAL</span>
          </div>
          <p>Saboreie o autêntico Sanduíche Bauru certificado (pão francês sem miolo, rosbife, queijos derretidos em banho-maria, tomate e picles) e os restaurantes da Av. Getúlio Vargas.</p>
          <div class="tour-meta">
            <span>📍 Centro Histórico e Av. Getúlio Vargas — Bauru/SP</span>
            <span>🕒 Todos os dias: Almoço, Café e Jantar</span>
          </div>
          <button class="btn-tour-action" onclick="app.showStoreQR('Rota Gastronômica — Sanduíche Bauru & Getúlio Vargas', 'Centro e Av. Getúlio Vargas — Bauru/SP', 'https://maps.google.com/?q=Avenida+Getulio+Vargas+Bauru+SP')">Rota no Celular (QR Code)</button>
        </div>
      </div>
    `,
    tourismTitle: 'Turismo, Parques e Cultura em Bauru',
    tourismHtml: `
      <div class="tour-card">
        <div class="tour-icon" style="background: #dcfce7; color: #15803d;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div class="tour-content">
          <div class="tour-header">
            <h3>Parque Zoológico Municipal de Bauru</h3>
            <span class="tour-tag" style="background:#dcfce7; color:#15803d;">REFERÊNCIA NACIONAL</span>
          </div>
          <p>Reconhecido como um dos melhores zoológicos públicos do Brasil, abriga mais de 800 animais de 200 espécies, centro de educação ambiental e lazer completo na Rodovia Comandante João Ribeiro de Barros (SP-225).</p>
          <div class="tour-meta">
            <span>📍 Rodovia Comandante João Ribeiro de Barros (SP-225), Km 232 — Bauru/SP</span>
            <span>🕒 Ter a Dom e Feriados: 08h às 16h30</span>
          </div>
          <button class="btn-tour-action" onclick="app.showTourQR('Parque Zoológico Municipal de Bauru', 'Rodovia Comandante João Ribeiro de Barros (SP-225), Km 232 — Bauru/SP', 'https://maps.google.com/?q=Zoologico+de+Bauru+SP')">Rota no Celular (QR Code)</button>
        </div>
      </div>

      <div class="tour-card">
        <div class="tour-icon" style="background: #d1fae5; color: #047857;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8c.7-1 1-2.2 1-3.5C18 2 15 2 12 2S6 2 6 4.5C6 5.8 6.3 7 7 8"/><path d="M12 2v20"/><path d="M5 12c-1.7 0-3 1.3-3 3s1.3 3 3 3h14c1.7 0 3-1.3 3-3s-1.3-3-3-3"/></svg>
        </div>
        <div class="tour-content">
          <div class="tour-header">
            <h3>Jardim Botânico Municipal de Bauru</h3>
            <span class="tour-tag" style="background:#d1fae5; color:#047857;">ECOTURISMO & CERRADO</span>
          </div>
          <p>Com 321 hectares de mata nativa preservada do Cerrado, orquidário, bromeliário, mirante de madeira, praça dos bambus e trilhas ecológicas gratuitas ao lado do Zoológico.</p>
          <div class="tour-meta">
            <span>📍 Rodovia Comandante João Ribeiro de Barros (SP-225), Km 232 — Bauru/SP</span>
            <span>🕒 Todos os dias: 08h às 16h • Entrada Gratuita</span>
          </div>
          <button class="btn-tour-action" onclick="app.showTourQR('Jardim Botânico Municipal de Bauru', 'Rodovia Comandante João Ribeiro de Barros (SP-225), Km 232 — Bauru/SP', 'https://maps.google.com/?q=Jardim+Botanico+Municipal+de+Bauru+SP')">Rota no Celular (QR Code)</button>
        </div>
      </div>

      <div class="tour-card">
        <div class="tour-icon" style="background: #e0f2fe; color: #0369a1;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 8-6 8 6"/></svg>
        </div>
        <div class="tour-content">
          <div class="tour-header">
            <h3>Parque Vitória Régia (Av. Nações Unidas)</h3>
            <span class="tour-tag" style="background:#e0f2fe; color:#0369a1;">CARTÃO-POSTAL</span>
          </div>
          <p>O grande anfiteatro ao ar livre sobre o espelho d'água de Bauru. Palco da festa de aniversário "Viva Bauru", feiras culturais, shows sinfônicos e caminhadas em família.</p>
          <div class="tour-meta">
            <span>📍 Av. Nações Unidas, Quadra 25 — Bauru/SP</span>
            <span>🕒 Aberto 24h • Entrada Gratuita</span>
          </div>
          <button class="btn-tour-action" onclick="app.showTourQR('Parque Vitória Régia — Bauru', 'Av. Nações Unidas, Quadra 25 — Bauru/SP', 'https://maps.google.com/?q=Parque+Vitoria+Regia+Bauru+SP')">Rota no Celular (QR Code)</button>
        </div>
      </div>

      <div class="tour-card">
        <div class="tour-icon" style="background: #fef3c7; color: #b45309;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="15" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 18-2 3"/><path d="m16 18 2 3"/></svg>
        </div>
        <div class="tour-content">
          <div class="tour-header">
            <h3>Museu Ferroviário Regional & Estação Central</h3>
            <span class="tour-tag" style="background:#fef3c7; color:#b45309;">HISTÓRIA DAS 3 FERROVIAS</span>
          </div>
          <p>Preserva a memória do maior entroncamento ferroviário do interior paulista (Estradas de Ferro Noroeste do Brasil, Paulista e Sorocabana), com locomotivas a vapor originais.</p>
          <div class="tour-meta">
            <span>📍 Rua Primeiro de Agosto, Quadra 1 (Praça Machado de Mello) — Centro, Bauru/SP</span>
            <span>🕒 Ter a Sex: 08h30 às 17h • Entrada Gratuita</span>
          </div>
          <button class="btn-tour-action" onclick="app.showTourQR('Museu Ferroviário Regional de Bauru', 'Rua Primeiro de Agosto, Quadra 1 (Praça Machado de Mello) — Centro, Bauru/SP', 'https://maps.google.com/?q=Museu+Ferroviario+Regional+de+Bauru+SP')">Rota no Celular (QR Code)</button>
        </div>
      </div>
    `,
    quickBarHtml: `
      <span class="quick-bar-label">Acesso 1-Toque (Bauru):</span>
      <button class="quick-service-pill" onclick="app.showGenericQR('2ª Via de IPTU e Tributos - Prefeitura de Bauru', 'https://www2.bauru.sp.gov.br/financas/iptu.aspx')">
        <span class="qs-icon">📄</span>
        <span class="qs-text"><strong>2ª Via IPTU</strong> Bauru</span>
      </button>
      <button class="quick-service-pill" onclick="app.showGenericQR('DAE Bauru - 2ª Via de Água e Esgoto', 'https://www.daebauru.sp.gov.br')">
        <span class="qs-icon">💧</span>
        <span class="qs-text"><strong>DAE Água</strong> 2ª Via</span>
      </button>
      <button class="quick-service-pill" onclick="app.showPointLocationQR('Poupatempo Bauru (Av. Nações Unidas)', 'Av. Nações Unidas, 4-44 — Centro, Bauru/SP (RG, CNH e Serviços Estaduais)', 'https://maps.google.com/?q=Poupatempo+Bauru+SP')">
        <span class="qs-icon">🪪</span>
        <span class="qs-text"><strong>Poupatempo</strong> Bauru</span>
      </button>
      <button class="quick-service-pill" onclick="app.showPointLocationQR('Pronto-Socorro Central (PSC) & UPAs 24h Bauru', 'Rua Rubens Arruda, Quadra 7 — Centro, Bauru/SP (Atendimento Médico 24h)', 'https://maps.google.com/?q=Pronto+Socorro+Central+Bauru+SP')">
        <span class="qs-icon">🏥</span>
        <span class="qs-text"><strong>UPA / PSC 24h</strong> Saúde</span>
      </button>
      <button class="quick-service-pill" onclick="app.showGenericQR('Ouvidoria e Protocolo Digital - Prefeitura de Bauru', 'https://www2.bauru.sp.gov.br/ouvidoria/')">
        <span class="qs-icon">📢</span>
        <span class="qs-text"><strong>Ouvidoria</strong> Bauru</span>
      </button>
    `,
    servicesHtml: `
      <!-- Coluna Ouvidoria & Serviços Digitais de Bauru -->
      <div class="service-box ouvidoria-card">
        <div class="service-box-header">
          <div class="s-icon" style="background: #dbeafe; color: #1351B4;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <h3>Palácio das Cerejeiras • Bauru Digital</h3>
            <span class="s-sub">Prefeitura Municipal de Bauru (Praça das Cerejeiras, 1-59)</span>
          </div>
        </div>
        <p class="service-desc">
          Acesse pelo celular o portal oficial da <strong>Prefeitura de Bauru</strong>: emita 2ª via de IPTU, consulte protocolos, agende atendimento no <strong>Poupatempo Bauru</strong> (Av. Nações Unidas, 4-44) ou solicite serviços do <strong>DAE Bauru</strong>.
        </p>
        <div class="ouvidoria-channels">
          <div class="channel-item">
            <strong>📞 PABX Prefeitura:</strong> (14) 3235-1000
          </div>
          <div class="channel-item">
            <strong>💧 DAE Bauru 24h:</strong> 0800-7710195
          </div>
          <div class="channel-item">
            <strong>🕒 Atendimento Presencial:</strong> Seg a Sex, 08h às 17h
          </div>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:auto;">
          <button class="btn-primary-gov" style="flex:1;" onclick="app.showGenericQR('Portal Oficial - Prefeitura Municipal de Bauru', 'https://www2.bauru.sp.gov.br')">
            Portal Prefeitura (QR)
          </button>
          <button class="btn-primary-gov" style="flex:1; background:#0f766e;" onclick="app.showPointLocationQR('Você está em: Praça Rui Barbosa (Centro de Bauru)', 'Coração comercial de Bauru/SP — Ao lado do Calçadão da Rua Batista de Carvalho', 'https://maps.google.com/?q=Praca+Rui+Barbosa+Bauru+SP')">
            📍 Onde Estou? (Mapa)
          </button>
        </div>
      </div>

      <!-- Coluna Telefones Úteis de Bauru -->
      <div class="service-box">
        <h3>Telefones de Emergência e Utilidade de Bauru</h3>
        <div class="phone-grid">
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">192</span>
            <span class="p-label">SAMU Regional</span>
          </div>
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">193</span>
            <span class="p-label">Bombeiros</span>
          </div>
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">3235-1000</span>
            <span class="p-label">Prefeitura Bauru</span>
          </div>
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">0800-7710195</span>
            <span class="p-label">DAE Água 24h</span>
          </div>
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">3233-9000</span>
            <span class="p-label">EMDURB Trânsito</span>
          </div>
          <div class="phone-btn" onclick="app.openModal('modal-contacts')">
            <span class="p-num">199 / 190</span>
            <span class="p-label">Defesa Civil / PM</span>
          </div>
        </div>
      </div>
    `,
    contacts: {
      gcmTitle: 'GOT / EMDURB & Defesa Civil de Bauru',
      gcmDesc: 'Fiscalização de trânsito 24h, apoio viário (GOT) e Defesa Civil Municipal.',
      adminBadge: 'BAURU',
      adminTitle: 'Palácio das Cerejeiras • Prefeitura de Bauru',
      adminPhone: '(14) 3235-1000',
      adminDesc: 'Praça das Cerejeiras, 1-59 • DAE Bauru 24h: 0800-7710195 • EMDURB: (14) 3233-9000.',
      footNote: 'Você está na <strong>Praça Rui Barbosa (Centro de Bauru — ao lado do Calçadão da Batista de Carvalho)</strong>. Pronto-Socorro Central: Rua Rubens Arruda, Q. 7.'
    }
  }
};

class TotemApp {
  constructor() {
    this.currentView = 'view-home';
    this.currentCity = 'jau'; // 'jau', 'itapui' ou 'bauru'
    this.inactivityLimit = 45; // segundos para modo vitrine
    this.inactivityRemaining = this.inactivityLimit;
    this.inactivityInterval = null;
    this.isHighContrast = false;
    this.isWheelchairMode = false;
    this.fontScale = 1.0;
    this.qrInstance = null;
    this.viewer3D = null;

    // Avisos locais rotativos da cidade ativa
    this.ads = CITIES_DATA.jau.ads;
    this.adIndex = 0;

    this.init();
  }

  init() {
    window.appInstance = this;
    this.setupTabletLock();
    this.setup3DViewer();
    this.setupClock();
    this.setupNavigation();
    this.setupCitySwitcher();
    this.setupAccessibility();
    this.setupModals();
    this.setupLibrasClickReader();
    this.setupSimulatorControls();
    this.setupTourPresentation();
    this.setupEnergyTimer();
    this.setupDOOHCarousel();
    this.setupFilters();
  }

  // 0. TRAVA TOTAL DE ZOOM E ROLAGEM VERTICAL NO TABLET (QUIOSQUE FIXO)
  setupTabletLock() {
    // Bloqueia gestos nativos de pinça do iPadOS / iOS Safari para a tela nunca dar zoom junto
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(evt => {
      document.addEventListener(evt, (e) => {
        e.preventDefault();
      }, { passive: false });
    });

    // Bloqueia zoom do navegador via Ctrl + roda/pinça
    window.addEventListener('wheel', (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    }, { passive: false });

    // Bloqueia início de gesto com 2+ dedos fora do canvas 3D para o navegador nunca dar zoom na tela
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        if (e.cancelable) e.preventDefault();
      }
    }, { passive: false });

    // Bloqueia rolagem indesejada do fundo da tela, MAS permite rolagem fluida com toque dentro de popovers, modais e do menu 360
    document.addEventListener('touchmove', (e) => {
      const scrollable = e.target.closest('.orb-360-popover, .popover-360-body, .modal-card, .tour-body-content, .modal-body, .color-matrix-grid, [data-scrollable]');
      if (scrollable) {
        // Permite rolar livremente dentro de menus, paleta de cores e modais no tablet
        return;
      }
      if (e.cancelable) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  setup3DViewer() {
    if (window.Totem3DViewer) {
      this.viewer3D = new window.Totem3DViewer('totem-3d-stage');
      this.viewer3D.init();
      if (this.currentCity) {
        this.viewer3D.setCity(this.currentCity);
      }
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
      btn.addEventListener('click', () => {
        const targetView = btn.getAttribute('data-view');
        this.navigateTo(targetView);
      });
    });

    // Botão isolado no canto inferior: Contatos de Acionamento de Socorro
    const btnContacts = document.getElementById('btn-emergency-contacts');
    if (btnContacts) {
      btnContacts.addEventListener('click', () => {
        this.openModal('modal-contacts');
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
    }
  }

  // 3. ACESSIBILIDADE VISUAL & TÁTIL (1º Libras, 2º Contraste, 3º Baixar Tela + Fonte)
  setupAccessibility() {
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
        } else {
          vlibrasBox.classList.add('hidden');
          vlibrasBox.classList.remove('interpreting');
          clearInterval(this._librasStepInterval);
          clearTimeout(this._librasTimeout);
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

    // Botão Modo Cadeirante / Baixar Tela
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
      });
    }

    // Botão Aumentar Letra
    const btnFontPlus = document.getElementById('btn-font-plus');
    const btnFontReset = document.getElementById('btn-font-reset');
    if (btnFontPlus) {
      btnFontPlus.addEventListener('click', () => {
        this.fontScale = Math.min(1.4, this.fontScale + 0.1);
        document.body.style.setProperty('--font-scale', this.fontScale);
      });
    }
    if (btnFontReset) {
      btnFontReset.addEventListener('click', () => {
        this.fontScale = 1.0;
        document.body.style.setProperty('--font-scale', this.fontScale);
      });
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
        }
      };
      document.body.appendChild(script);
    }
  }

  // 4. GESTÃO DE ENERGIA E MODO VITRINE (DESPERTAR POR TOQUE NA TELA)
  setupEnergyTimer() {
    const progressBar = document.getElementById('inactivity-progress');
    const timerText = document.getElementById('timer-text');

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

    // Os 5 Botões no Canto Superior Esquerdo
    const btnOrbScreen = document.getElementById('btn-orb-screen');       // 1º: Visão da Tela do Totem
    const btnOrbXray = document.getElementById('btn-orb-xray');           // 2º: Totem do Lado Interno a Raio-X
    const btnOrbTech = document.getElementById('btn-orb-tech');           // 3º: Texto com a Parte Técnica
    const btnOrbEstrutura = document.getElementById('btn-orb-estrutura'); // 4º: Estrutura (Caixa Desmontada, Dobras, Furação e Interior)
    const btnOrbTour = document.getElementById('btn-orb-tour');           // 5º: Tour Interativo e Apresentação por Partes
    const modalTour = document.getElementById('modal-tour-presentation');

    // O Botão no Canto Inferior Direito (Características para o 360 do Totem)
    const btnOrb360 = document.getElementById('btn-orb-360');
    const popover360 = document.getElementById('orb-360-popover');
    const btnClosePopover360 = document.getElementById('btn-close-360-popover');

    let lastOrbTriggerTime = 0;
    window.triggerTopLeftButton = (action) => {
      const now = Date.now();
      if (now - lastOrbTriggerTime < 300) return;
      lastOrbTriggerTime = now;
      if (action === 'screen') {
        const isCurrentlyHidden = menuOverlay ? menuOverlay.classList.contains('hidden') : true;
        if (isCurrentlyHidden) {
          if (menuOverlay) menuOverlay.classList.remove('hidden');
          document.body.classList.add('menu-overlay-active');
          if (modalSchematics) modalSchematics.classList.add('hidden');
          if (modalEstrutura) modalEstrutura.classList.add('hidden');
          if (modalTour) modalTour.classList.add('hidden');
          if (btnOrbScreen) btnOrbScreen.classList.add('active');
          if (btnOrbTech) btnOrbTech.classList.remove('active');
          if (btnOrbEstrutura) btnOrbEstrutura.classList.remove('active');
          if (btnOrbTour) btnOrbTour.classList.remove('active');
          this.resetInactivityTimer();
        } else {
          if (menuOverlay) menuOverlay.classList.add('hidden');
          document.body.classList.remove('menu-overlay-active');
          if (btnOrbScreen) btnOrbScreen.classList.remove('active');
          if (this.viewer3D) setTimeout(() => this.viewer3D.handleResize(), 80);
        }
      } else if (action === 'xray') {
        // Fecha overlays para exibir o Totem 3D no centro com Raio-X Interno
        if (menuOverlay) menuOverlay.classList.add('hidden');
        document.body.classList.remove('menu-overlay-active');
        if (modalSchematics) modalSchematics.classList.add('hidden');
        if (modalEstrutura) modalEstrutura.classList.add('hidden');
        if (modalTour) modalTour.classList.add('hidden');
        if (btnOrbScreen) btnOrbScreen.classList.remove('active');
        if (btnOrbTech) btnOrbTech.classList.remove('active');
        if (btnOrbEstrutura) btnOrbEstrutura.classList.remove('active');
        if (btnOrbTour) btnOrbTour.classList.remove('active');

        if (!this.viewer3D && window.Totem3DViewer) {
          this.setup3DViewer();
        }
        if (this.viewer3D) {
          const nextState = !this.viewer3D.isHardwareMode;
          this.viewer3D.hardwareViewMode = 'xray';
          this.viewer3D.setHardwareMode(nextState);
          if (btnOrbXray) btnOrbXray.classList.toggle('active', nextState);
        }
      } else if (action === 'tech') {
        if (!modalSchematics) return;
        const isHidden = modalSchematics.classList.contains('hidden');
        if (isHidden) {
          if (menuOverlay) menuOverlay.classList.add('hidden');
          document.body.classList.remove('menu-overlay-active');
          if (modalEstrutura) modalEstrutura.classList.add('hidden');
          if (modalTour) modalTour.classList.add('hidden');
          if (btnOrbScreen) btnOrbScreen.classList.remove('active');
          if (btnOrbEstrutura) btnOrbEstrutura.classList.remove('active');
          if (btnOrbTour) btnOrbTour.classList.remove('active');
          modalSchematics.classList.remove('hidden');
          if (btnOrbTech) btnOrbTech.classList.add('active');
        } else {
          modalSchematics.classList.add('hidden');
          if (btnOrbTech) btnOrbTech.classList.remove('active');
        }
      } else if (action === 'estrutura') {
        if (!modalEstrutura) return;
        const isHidden = modalEstrutura.classList.contains('hidden');
        if (isHidden) {
          if (menuOverlay) menuOverlay.classList.add('hidden');
          document.body.classList.remove('menu-overlay-active');
          if (modalSchematics) modalSchematics.classList.add('hidden');
          if (modalTour) modalTour.classList.add('hidden');
          if (btnOrbScreen) btnOrbScreen.classList.remove('active');
          if (btnOrbTech) btnOrbTech.classList.remove('active');
          if (btnOrbTour) btnOrbTour.classList.remove('active');
          modalEstrutura.classList.remove('hidden');
          if (btnOrbEstrutura) btnOrbEstrutura.classList.add('active');
        } else {
          modalEstrutura.classList.add('hidden');
          if (btnOrbEstrutura) btnOrbEstrutura.classList.remove('active');
        }
      } else if (action === 'tour') {
        if (!modalTour) return;
        const isHidden = modalTour.classList.contains('hidden');
        if (isHidden) {
          if (menuOverlay) menuOverlay.classList.add('hidden');
          document.body.classList.remove('menu-overlay-active');
          if (modalSchematics) modalSchematics.classList.add('hidden');
          if (modalEstrutura) modalEstrutura.classList.add('hidden');
          if (btnOrbScreen) btnOrbScreen.classList.remove('active');
          if (btnOrbTech) btnOrbTech.classList.remove('active');
          if (btnOrbEstrutura) btnOrbEstrutura.classList.remove('active');
          modalTour.classList.remove('hidden');
          if (btnOrbTour) btnOrbTour.classList.add('active');
          this.goToTourStep(this.currentTourStep || 1);
        } else {
          modalTour.classList.add('hidden');
          if (btnOrbTour) btnOrbTour.classList.remove('active');
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
        document.body.classList.remove('menu-overlay-active');
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

      const btnJumpColor = document.getElementById('btn-jump-to-color');
      if (btnJumpColor) {
        btnJumpColor.addEventListener('click', (e) => {
          e.stopPropagation();
          const rowColor = document.getElementById('row-cor-carcaca');
          if (rowColor) {
            rowColor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            rowColor.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
            rowColor.style.borderColor = '#38bdf8';
            rowColor.style.boxShadow = '0 0 15px rgba(56, 189, 248, 0.5)';
            setTimeout(() => {
              rowColor.style.borderColor = 'rgba(148, 163, 184, 0.14)';
              rowColor.style.boxShadow = 'none';
            }, 1800);
          }
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

  // 5.1 TOUR INTERATIVO & APRESENTAÇÃO DA MÁQUINA POR PARTES (NEXUS JAÚ)
  // 5.1 TOUR INTERATIVO AO VIVO & APRESENTAÇÃO DA MÁQUINA POR PARTES (NEXUS JAÚ)
  setupTourPresentation() {
    this.currentTourStep = 1;
    this.tourSteps = [
      {
        num: 1,
        navTitle: "1. Medidas",
        title: "1. Medidas Reais & Escala Urbana (2,20m x 0,70m x 0,35m)",
        tag: "MEDIDAS 3D • ESCALA HUMANA",
        status3D: "📐 Mostrando no Totem 3D: Linhas métricas reais (2,20m x 0,70m x 0,35m) ativadas ao redor da máquina!",
        specs: [
          { lbl: "Altura Total", val: "2,20 metros (Escala Humana)" },
          { lbl: "Largura Frontal", val: "0,70 metros (Slim)" },
          { lbl: "Profundidade", val: "0,35 metros (Base Firme)" },
          { lbl: "Base Chumbada", val: "1,05m x 0,55m Parabolts M12" }
        ],
        impact: "INVISÍVEL NUNCA MAIS: O MOBILIÁRIO URBANO INTELIGENTE QUE TRANSFORMA A PRAÇA EM PONTO DE REFERÊNCIA 24 HORAS.",
        speech: [
          "Apresentamos o Totem Urbano Nexus Jaú, projetado rigorosamente na escala urbana humana (2,20m x 0,70m), moderno e imponente sem obstruir a visão dos pedestres nem as vitrines dos lojistas.",
          "Instalação sobre o calçadão histórico de Jaú com piso tátil integrado de acessibilidade e pedestal metálico reforçado.",
          "Presença física nobre no calçadão, substituindo totens de papelão e placas desatualizadas por tecnologia perene e de alto padrão."
        ],
        qa: {
          q: "Esse totem não vai poluir visualmente a praça ou atrapalhar os pedestres?",
          a: "O perfil slim de 0,35m e a altura de 2,20m foram calculados para se harmonizar com o mobiliário urbano sem gerar poluição visual ou bloquear as fachadas comerciais do centro."
        },
        camPreset: "front"
      },
      {
        num: 2,
        navTitle: "2. Carcaça",
        title: "2. Carcaça em Aço Escovado (#8E96A0) & Vedação IP66",
        tag: "CHASSI BLINDADO • IP66",
        status3D: "🛡️ Mostrando no Totem 3D: Perspectiva 3/4 destacando carcaça em aço escovado e topo curvo sem marquise.",
        specs: [
          { lbl: "Chapa Estrutural", val: "Aço Carbono 2,5mm Corte CNC" },
          { lbl: "Acabamento", val: "Aço Escovado Acetinado (#8E96A0)" },
          { lbl: "Vedação Climática", val: "Grau IP66 (Chuva Torrencial)" },
          { lbl: "Perfil Superior", val: "Canto Curvo Suave (Sem Marquise)" }
        ],
        impact: "CUSTO ZERO DE MANUTENÇÃO EXTERNA: ESTRUTURA BLINDADA PARA RESISTIR AO CALOR DE 35°C DE JAÚ E TEMPESTADES DE VENTO.",
        speech: [
          "Carcaça construída em chapa industrial de aço de 2,5mm com corte a laser e acabamento em aço escovado acetinado neutro (#8E96A0).",
          "Gabinete 100% monolítico e vertical: ZERO marquises, abas projetadas ou telhados salientes que possam acumular sujeira ou sofrer com rajadas de vento.",
          "Vedação perimetral em borracha EPDM grau IP66 que protege contra chuvas torrenciais e sol forte por mais de 10 anos ao relento."
        ],
        qa: {
          q: "E se chover forte de vento, não corre o risco de entrar água ou queimar?",
          a: "Não. A vedação perimetral em EPDM e o design sem venezianas abertas garantem certificação IP66. A dissipação de calor é passiva pela massa do chassi metálico."
        },
        camPreset: "perspective"
      },
      {
        num: 3,
        navTitle: "3. Tela 43\"",
        title: "3. Display Touch 43\" de 1500 Nits & Brasão em Relevo",
        tag: "TELA TOUCH • IK10",
        status3D: "📱 Mostrando no Totem 3D: Câmera aproximada na tela Full HD rebaixada 2,5cm e brasão gravado no metal.",
        specs: [
          { lbl: "Tamanho da Tela", val: "43\" Vertical Full HD (96x55cm)" },
          { lbl: "Brilho Solar", val: "1500 Nits (Visível sob Sol Direto)" },
          { lbl: "Proteção de Impacto", val: "Vidro Temperado 8mm IK10" },
          { lbl: "Nicho da Tela", val: "Rebaixado 2,5cm na Carcaça" }
        ],
        impact: "LEITURA PERFEITA DEBAIXO DO SOL DO MEIO-DIA E PROTEÇÃO TOTAL CONTRA QUALQUER TENTATIVA DE IMPACTO.",
        speech: [
          "Display industrial de 43 polegadas com 1500 nits: enquanto telas comuns de TV ficam apagadas de dia, o display do Nexus permanece vibrante sob luz solar direta.",
          "Vidro temperado de segurança com espessura real de 8mm e certificação IK10, resistente a impactos severos de pedras, vandalismo e objetos cortantes.",
          "Nicho da tela rebaixado 2,5 cm para dentro da moldura de aço, impossibilitando que vândalos forcem alavancas ou danifiquem as bordas da tela."
        ],
        qa: {
          q: "Se um vândalo der um soco ou atirar uma pedra na tela?",
          a: "O vidro temperado de 8mm com padrão antivandalismo IK10 absorve o impacto e o rebaixo mecânico de 2,5cm no aço impede que qualquer canto ou quina frágil fique exposto."
        },
        camPreset: "screen"
      },
      {
        num: 4,
        navTitle: "4. Interior",
        title: "4. Porta de Manutenção Aberta & Hardware Fanless Offline",
        tag: "HARDWARE INTERNO • TRILHO DIN",
        status3D: "🚪 Mostrando no Totem 3D: Porta traseira aberta em 3D com pistões a gás, Mini-PC e fiação organizada!",
        specs: [
          { lbl: "Processador", val: "Mini-PC Industrial Fanless (15W)" },
          { lbl: "Acesso Técnico", val: "Porta Traseira com Pistões a Gás" },
          { lbl: "Montagem", val: "Padrão Modular Trilho DIN 35mm" },
          { lbl: "Proteção", val: "Disjuntores + DPS Classe II Surtos" }
        ],
        impact: "SE A INTERNET DA CIDADE CAIR, O TOTEM CONTINUA OPERANDO 100% SEM TRAVAR OU MOSTRAR TELA AZUL.",
        speech: [
          "Vejam no modelo 3D a porta traseira de manutenção aberta: com pistões industriais e chave de segurança Inox 316 para inspeção rápida.",
          "Arquitetura Fanless (sem ventoinhas móveis): zero acúmulo de poeira interna, garantindo que o processador não sobreaqueça mesmo operando 24 horas ininterruptas.",
          "Armazenamento local completo: todos os horários de ônibus, telefones de socorro e rotas do calçado estão gravados dentro do SSD de alta velocidade do totem."
        ],
        qa: {
          q: "E se a operadora de internet tiver uma pane em Jaú?",
          a: "O totem não fica fora do ar. Todo o sistema do cidadão, consultas de ônibus, emergência e turismo roda localmente no hardware da máquina, de forma 100% autônoma."
        },
        camPreset: "back"
      },
      {
        num: 5,
        navTitle: "5. Solar ESG",
        title: "5. Painel Solar Superior & Banco de Baterias LiFePO4",
        tag: "ENERGIA SUSTENTÁVEL • NO-BREAK 24H",
        status3D: "☀️ Mostrando no Totem 3D: Câmera focada no topo plano com placa solar embutida e no-break 24h.",
        specs: [
          { lbl: "Placa Fotovoltaica", val: "Monocristalina 120Wp Embutida" },
          { lbl: "Banco de Baterias", val: "Lítio LiFePO4 12,8V / 40Ah (480Wh)" },
          { lbl: "Controlador", val: "MPPT Inteligente de Carga" },
          { lbl: "Autonomia Noturna", val: "Até 24h em Apagão na Rede" }
        ],
        impact: "EMERGÊNCIA E SERVIÇOS NUNCA APAGAM: ENERGIA SOLAR QUE REDUZ A CONTA DA PREFEITURA E OPERA EM APAGÕES.",
        speech: [
          "No topo plano do totem está embutido o painel solar monocristalino de 120Wp, conectado a baterias de Lítio LiFePO4 de longa vida útil.",
          "O equipamento funciona como um No-Break sustentável: economiza energia da prefeitura durante o dia e garante que em caso de apagão no centro, a máquina continue ligada por até 24h.",
          "Pontuação máxima em metas ESG (Ambiental, Social e Governança) para a gestão pública municipal de Jaú."
        ],
        qa: {
          q: "Se faltar energia elétrica no centro ou der um temporal à noite, o totem desliga?",
          a: "Não. O banco de baterias LiFePO4 garante autonomia completa de até 24 horas para iluminação, botões de socorro e serviços essenciais."
        },
        camPreset: "solar"
      },
      {
        num: 6,
        navTitle: "6. Software",
        title: "6. Rotas, Comércio Local, Ouvidoria 156 & Modo Acessível",
        tag: "SISTEMA DA CIDADE • INCLUSÃO",
        status3D: "🗺️ Mostrando no Totem 3D: Tela do totem operando com mapa do Polo Calçadista de Jaú.",
        specs: [
          { lbl: "Rotas de Ônibus", val: "Linhas & Itinerários Atualizados" },
          { lbl: "Polo Calçadista", val: "+150 Lojas do Circuito Feminino" },
          { lbl: "Acessibilidade", val: "Modo Cadeirante + VLibras Avatar" },
          { lbl: "Botão Socorro", val: "SAMU 192 • Bombeiros 193 • GCM 153" }
        ],
        impact: "DINHEIRO QUE FICA EM JAÚ: FORTALECIMENTO DIRETO DAS LOJAS LOCAIS E FIM DOS PANFLETOS QUE SUJAM A RUA.",
        speech: [
          "O software foi desenhado sob medida para Jaú: horários de ônibus por bairro com QR Code para acompanhar no celular.",
          "Guia comercial completo do Circuito do Calçado Feminino: o turista que chega em Jaú descobre instantaneamente onde comprar, como chegar e quais lojas estão abertas.",
          "Acessibilidade total: botão que rebaixa os controles para a altura de cadeirantes (ABNT NBR 9050), alto contraste e intérprete em Libras."
        ],
        qa: {
          q: "Pessoas idosas ou sem familiaridade com celular conseguem navegar?",
          a: "Sim, os botões têm tipografia extra grande e alto contraste. O sistema tem modo acessível para cadeirantes e avatar com intérprete em Libras."
        },
        camPreset: "front"
      },
      {
        num: 7,
        navTitle: "7. DOOH & ESG",
        title: "7. Viabilidade Financeira: Custo Zero por Concessão DOOH",
        tag: "VIABILIDADE • RETORNO",
        status3D: "🔄 Mostrando no Totem 3D: Giro orbital suave 360° com iluminação sobre o calçadão.",
        specs: [
          { lbl: "Custo p/ Município", val: "Possibilidade de CUSTO ZERO" },
          { lbl: "Modelo Financeiro", val: "Patrocínio DOOH (Mídia Legal)" },
          { lbl: "Índice Smart City", val: "Pontuação Máxima em ESG Municipal" },
          { lbl: "Economia de Papel", val: "100% Paperless com QR Code" }
        ],
        impact: "INOVAÇÃO QUE SE PAGA SOZINHA: A ADMINISTRAÇÃO ENTREGA MODERNIDADE SEM ONERAR O ORÇAMENTO MUNICIPAL.",
        speech: [
          "O projeto pode ser implantado e mantido com custo zero para a Prefeitura por meio de concessão ou cotas de patrocínio privado para comércio e bancos locais.",
          "O rodapé de publicidade legal (DOOH) gera receita e visibilidade qualificada, valorizando as marcas jauenses em um canal digital de altíssimo tráfego.",
          "Conquista de pontuação máxima em metas ESG, posicionando Jaú como referência estadual em Cidades Inteligentes."
        ],
        qa: {
          q: "Qual o custo que isso vai gerar para os cofres públicos?",
          a: "O projeto pode ter custo ZERO se adotado o modelo de concessão de mídia privada DOOH, onde os parceiros comerciais custeiam a estrutura e a manutenção em troca de visibilidade."
        },
        camPreset: "perspective"
      }
    ];

    const btnCloseTour = document.getElementById('btn-close-tour-modal');
    const modalTour = document.getElementById('modal-tour-presentation');
    const btnOrbTour = document.getElementById('btn-orb-tour');
    const btnToggleCollapse = document.getElementById('btn-tour-toggle-collapse');
    const tourCard = document.getElementById('tour-card-element');

    if (btnToggleCollapse && tourCard) {
      btnToggleCollapse.addEventListener('click', () => {
        const isCollapsed = tourCard.classList.toggle('collapsed');
        btnToggleCollapse.textContent = isCollapsed ? '👁️ Mostrar' : '👁️ Ocultar';
      });
    }

    const closeTour = () => {
      if (modalTour) modalTour.classList.add('hidden');
      if (btnOrbTour) btnOrbTour.classList.remove('active');
      if (this.viewer3D) {
        if (typeof this.viewer3D.setDimensionsVisible === 'function') this.viewer3D.setDimensionsVisible(false);
        if (typeof this.viewer3D.closeRearDoor === 'function') this.viewer3D.closeRearDoor();
        this.viewer3D.autoRotate = false;
        if (typeof this.viewer3D.setCameraPreset === 'function') this.viewer3D.setCameraPreset('perspective');
        if (typeof this.viewer3D.syncFromApp === 'function') this.viewer3D.syncFromApp({ screenState: 'home' });
      }
    };
    if (btnCloseTour) btnCloseTour.addEventListener('click', closeTour);

    const prevBtns = [document.getElementById('btn-tour-prev'), document.getElementById('btn-tour-prev-top')];
    const nextBtns = [document.getElementById('btn-tour-next'), document.getElementById('btn-tour-next-top')];

    prevBtns.forEach(btn => {
      if (btn) btn.addEventListener('click', () => this.goToTourStep(this.currentTourStep - 1));
    });

    nextBtns.forEach(btn => {
      if (btn) btn.addEventListener('click', () => this.goToTourStep(this.currentTourStep + 1));
    });

    document.querySelectorAll('.tour-step-btn[data-step]').forEach(stepBtn => {
      stepBtn.addEventListener('click', () => {
        const stepNum = parseInt(stepBtn.getAttribute('data-step'), 10);
        if (!isNaN(stepNum)) this.goToTourStep(stepNum);
      });
    });

    const btnTour3D = document.getElementById('btn-tour-view-3d');
    if (btnTour3D) {
      btnTour3D.addEventListener('click', () => {
        const step = this.tourSteps.find(s => s.num === this.currentTourStep);
        if (step) {
          this.applyTour3DAction(step);
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (modalTour && !modalTour.classList.contains('hidden')) {
        if (e.key === 'ArrowRight') this.goToTourStep(this.currentTourStep + 1);
        else if (e.key === 'ArrowLeft') this.goToTourStep(this.currentTourStep - 1);
        else if (e.key === 'Escape') closeTour();
      }
    });

    this.goToTourStep(1);
  }

  goToTourStep(stepNum) {
    if (!this.tourSteps || this.tourSteps.length === 0) return;
    const clamped = Math.max(1, Math.min(this.tourSteps.length, stepNum));
    this.currentTourStep = clamped;
    const step = this.tourSteps.find(s => s.num === clamped) || this.tourSteps[0];

    document.querySelectorAll('.tour-step-btn').forEach(btn => {
      const bNum = parseInt(btn.getAttribute('data-step'), 10);
      btn.classList.toggle('active', bNum === clamped);
    });

    const titleEl = document.getElementById('tour-modal-title');
    const counterEl = document.getElementById('tour-step-counter');
    if (titleEl) titleEl.textContent = step.title;
    if (counterEl) counterEl.textContent = `PARTE ${clamped} DE ${this.tourSteps.length}`;

    const isFirst = clamped === 1;
    const isLast = clamped === this.tourSteps.length;
    ['btn-tour-prev', 'btn-tour-prev-top'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = isFirst;
    });
    ['btn-tour-next', 'btn-tour-next-top'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = isLast;
    });

    const btnTour3D = document.getElementById('btn-tour-view-3d');
    if (btnTour3D) {
      btnTour3D.textContent = `🧊 Re-focar 3D: ${step.navTitle}`;
    }

    const container = document.getElementById('tour-body-content');
    if (container) {
      container.innerHTML = `
        <div class="tour-hud-content">
          <div class="tour-3d-status-pill">
            <span class="tour-pulse-dot"></span>
            <span class="tour-status-txt">${step.status3D}</span>
          </div>

          <div class="tour-specs-strip">
            ${step.specs.map(sp => `
              <div class="tour-spec-item">
                <span class="tour-spec-lbl">${sp.lbl}</span>
                <span class="tour-spec-val">${sp.val}</span>
              </div>
            `).join('')}
          </div>

          <div class="tour-block-card tour-block-impact">
            <span class="tour-impact-badge">⚡ Palavra de Impacto</span>
            <div class="tour-impact-text">"${step.impact}"</div>
          </div>

          <div class="tour-block-card tour-block-speech">
            <span class="tour-speech-badge">🗣️ O que Falar para a Prefeitura (Pontos-Chave)</span>
            <ul class="tour-speech-list">
              ${step.speech.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>

          <div class="tour-block-card tour-block-qa">
            <span class="tour-qa-badge">🛡️ Pergunta Difícil &amp; Como Responder</span>
            <div class="tour-qa-q">❓ "${step.qa.q}"</div>
            <div class="tour-qa-a"><strong>Resposta:</strong> ${step.qa.a}</div>
          </div>
        </div>
      `;
      container.scrollTop = 0;
    }

    if (this.viewer3D) {
      this.applyTour3DAction(step);
    }
  }

  applyTour3DAction(step) {
    if (!this.viewer3D || !step) return;
    try {
      // 1. Controle das Cotas Métricas 3D (Medidas 2,20m x 0,70m x 0,35m)
      if (step.num === 1) {
        if (typeof this.viewer3D.setDimensionsVisible === 'function') {
          this.viewer3D.setDimensionsVisible(true);
        }
      } else {
        if (typeof this.viewer3D.setDimensionsVisible === 'function') {
          this.viewer3D.setDimensionsVisible(false);
        }
      }

      // 2. Controle de Câmera 3D
      if (step.camPreset && typeof this.viewer3D.setCameraPreset === 'function') {
        this.viewer3D.setCameraPreset(step.camPreset);
      }

      // 3. Controle da Porta Traseira
      if (step.num === 4) {
        if (typeof this.viewer3D.openRearDoor === 'function') this.viewer3D.openRearDoor(true);
      } else {
        if (typeof this.viewer3D.closeRearDoor === 'function') this.viewer3D.closeRearDoor();
      }

      // 4. Giro Orbital 360 no Passo 7
      if (step.num === 7) {
        this.viewer3D.autoRotate = true;
      } else {
        this.viewer3D.autoRotate = false;
      }

      // 5. Interface da Tela do Totem
      if (step.num === 6) {
        if (typeof this.viewer3D.syncFromApp === 'function') this.viewer3D.syncFromApp({ screenState: 'shoes' });
      } else {
        if (typeof this.viewer3D.syncFromApp === 'function') this.viewer3D.syncFromApp({ screenState: 'home' });
      }
    } catch (e) {
      console.warn("Tour 3D sync:", e);
    }
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

  // 8. MODAL DE QR CODE DINÂMICO (MOSTRA ONDE É O PONTO DE REFERÊNCIA NO MAPA)
  showBusDetails(title, route, times, mapUrl) {
    const url = mapUrl || `https://maps.google.com/?q=Jau+${encodeURIComponent(title)}`;
    this.openQRModal(title, `${route} • Endereço: ${times}`, url);
  }

  showPointLocationQR(title, addressDesc, mapUrl) {
    const url = mapUrl || 'https://maps.google.com/?q=Praca+da+Republica+Jau+SP';
    this.openQRModal(title, `Localização: ${addressDesc}`, url);
  }

  showStoreQR(name, address, mapUrl) {
    this.openQRModal(name, `Endereço: ${address}`, mapUrl);
  }

  showTourQR(name, address, mapUrl) {
    this.openQRModal(name, `Ponto Turístico: ${address}`, mapUrl);
  }

  showGenericQR(title, url) {
    this.openQRModal(title, 'Acesse o portal oficial diretamente pelo seu celular:', url);
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
            signBadge.textContent = 'TRADUÇÃO CONCLUÍDA';
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
          signBadge.textContent = `SINAL [${step + 1}/${totalSteps}]: ${currentWord.toUpperCase()}`;
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

  // 10. CONTROLE DO SELETOR DE CIDADES (JAÚ / ITAPUÍ)
  setupCitySwitcher() {
    const popover = document.getElementById('city-selector-popover');
    const orbBtn = document.getElementById('btn-orb-city');
    const btnClose = document.getElementById('btn-close-city-popover');

    window.triggerCitySwitcher = (e) => {
      if (e) e.stopPropagation();
      if (!popover || !orbBtn) return;
      const isHidden = popover.classList.contains('hidden');
      popover.classList.toggle('hidden', !isHidden);
      orbBtn.classList.toggle('active', isHidden);
    };

    if (btnClose) {
      btnClose.addEventListener('click', (e) => {
        e.stopPropagation();
        if (popover) popover.classList.add('hidden');
        if (orbBtn) orbBtn.classList.remove('active');
      });
    }

    // Fechar ao clicar fora do popover
    document.addEventListener('click', (e) => {
      if (popover && !popover.classList.contains('hidden')) {
        if (!e.target.closest('#city-selector-popover') && !e.target.closest('#btn-orb-city') && !e.target.closest('.gov-city-pill')) {
          popover.classList.add('hidden');
          if (orbBtn) orbBtn.classList.remove('active');
        }
      }
    });

    // Seletor já inicia sincronizado com a cidade padrão
    this.applyCityData(this.currentCity || 'jau');
  }

  applyCityData(cityKey) {
    const data = CITIES_DATA[cityKey] || CITIES_DATA.jau;
    this.currentCity = data.key;

    // 1. Tag da bolinha do canto superior direito
    const orbTag = document.getElementById('orb-city-tag');
    if (orbTag) orbTag.textContent = data.orbTag;

    // 2. Opções no popover
    document.querySelectorAll('.city-option-card').forEach(btn => {
      const isCardActive = btn.getAttribute('data-city') === data.key;
      btn.classList.toggle('active', isCardActive);
      const pill = btn.querySelector('.city-status-pill');
      if (pill) {
        pill.textContent = isCardActive ? 'CIDADE ATIVA' : 'SELECIONAR';
        pill.classList.toggle('active-pill', isCardActive);
      }
    });

    // 3. Cabeçalho e Chassi
    const chassisBrand = document.getElementById('chassis-brand');
    if (chassisBrand) chassisBrand.textContent = data.brandChassis;

    const brandTitle = document.getElementById('brand-title');
    if (brandTitle) brandTitle.textContent = data.brandTitle;

    const brandSub = document.getElementById('brand-sub');
    if (brandSub) brandSub.textContent = data.brandSub;

    const locName = document.getElementById('location-name');
    if (locName) locName.textContent = data.locationName;

    const govCity = document.getElementById('gov-city-name');
    if (govCity) govCity.textContent = data.govCityName;

    const cityCrest = document.getElementById('city-crest');
    if (cityCrest) cityCrest.innerHTML = data.crestSvg;

    // 4. Faixa de Alerta
    const alertText = document.getElementById('alert-text');
    if (alertText) alertText.textContent = data.alertText;

    // 5. Cards da Home
    const cardBusTag = document.getElementById('card-bus-tag');
    if (cardBusTag) cardBusTag.textContent = data.homeCards.bus.tag;
    const cardBusTitle = document.getElementById('card-bus-title');
    if (cardBusTitle) cardBusTitle.textContent = data.homeCards.bus.title;
    const cardBusDesc = document.getElementById('card-bus-desc');
    if (cardBusDesc) cardBusDesc.textContent = data.homeCards.bus.desc;
    const cardBusAction = document.getElementById('card-bus-action');
    if (cardBusAction) cardBusAction.textContent = data.homeCards.bus.action;

    const cardShoesTag = document.getElementById('card-shoes-tag');
    if (cardShoesTag) cardShoesTag.textContent = data.homeCards.shoes.tag;
    const cardShoesTitle = document.getElementById('card-shoes-title');
    if (cardShoesTitle) cardShoesTitle.textContent = data.homeCards.shoes.title;
    const cardShoesDesc = document.getElementById('card-shoes-desc');
    if (cardShoesDesc) cardShoesDesc.textContent = data.homeCards.shoes.desc;
    const cardShoesAction = document.getElementById('card-shoes-action');
    if (cardShoesAction) cardShoesAction.textContent = data.homeCards.shoes.action;

    const cardTourTag = document.getElementById('card-tourism-tag');
    if (cardTourTag) cardTourTag.textContent = data.homeCards.tourism.tag;
    const cardTourTitle = document.getElementById('card-tourism-title');
    if (cardTourTitle) cardTourTitle.textContent = data.homeCards.tourism.title;
    const cardTourDesc = document.getElementById('card-tourism-desc');
    if (cardTourDesc) cardTourDesc.textContent = data.homeCards.tourism.desc;
    const cardTourAction = document.getElementById('card-tourism-action');
    if (cardTourAction) cardTourAction.textContent = data.homeCards.tourism.action;

    // 6. Carrossel DOOH
    this.ads = data.ads;
    this.adIndex = 0;
    const adText = document.getElementById('dooh-text');
    if (adText && this.ads.length > 0) adText.textContent = this.ads[0];

    // 7. Mapa de Localização e Pontos de Referência
    const busTitle = document.getElementById('bus-view-title-text');
    if (busTitle && data.busTitle) busTitle.textContent = data.busTitle;
    const busList = document.getElementById('bus-list');
    if (busList) busList.innerHTML = data.busHtml;

    // Reseta filtros de locais para "all"
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach((tab, idx) => tab.classList.toggle('active', idx === 0));

    // 8. Polo do Calçado / Comércio Local
    const shoesTitle = document.getElementById('shoes-view-title-text');
    if (shoesTitle) shoesTitle.textContent = data.shoesTitle;
    const shoesList = document.getElementById('shoes-tour-list');
    if (shoesList) shoesList.innerHTML = data.shoesHtml;

    // 9. Turismo e Eventos Tradicionais (Festa do Peão, Quermesse, Carnaval, etc.)
    const tourTitle = document.getElementById('tourism-view-title-text');
    if (tourTitle) tourTitle.textContent = data.tourismTitle;
    const tourList = document.getElementById('tourism-tour-list');
    if (tourList) tourList.innerHTML = data.tourismHtml;

    // 10. Acesso Rápido na Home
    const quickBar = document.getElementById('city-quick-bar');
    if (quickBar) quickBar.innerHTML = data.quickBarHtml;

    // 11. Serviços Públicos
    const servCols = document.getElementById('services-columns');
    if (servCols) servCols.innerHTML = data.servicesHtml;

    // 12. Modal de Contatos de Emergência
    const gcmTitle = document.getElementById('contacts-gcm-title');
    if (gcmTitle) gcmTitle.textContent = data.contacts.gcmTitle;
    const gcmDesc = document.getElementById('contacts-gcm-desc');
    if (gcmDesc) gcmDesc.textContent = data.contacts.gcmDesc;

    const admBadge = document.getElementById('contacts-admin-badge');
    if (admBadge) admBadge.textContent = data.contacts.adminBadge;
    const admTitle = document.getElementById('contacts-admin-title');
    if (admTitle) admTitle.textContent = data.contacts.adminTitle;
    const admPhone = document.getElementById('contacts-admin-phone');
    if (admPhone) admPhone.textContent = data.contacts.adminPhone;
    const admDesc = document.getElementById('contacts-admin-desc');
    if (admDesc) admDesc.textContent = data.contacts.adminDesc;

    const footNote = document.getElementById('contacts-foot-note');
    if (footNote) footNote.innerHTML = data.contacts.footNote;
  }

  setCity(cityKey) {
    this.applyCityData(cityKey);
    if (this.viewer3D) {
      this.viewer3D.setCity(this.currentCity);
    }
    // Fecha o popover se aberto
    const popover = document.getElementById('city-selector-popover');
    const orbBtn = document.getElementById('btn-orb-city');
    if (popover) popover.classList.add('hidden');
    if (orbBtn) orbBtn.classList.remove('active');
    this.resetInactivityTimer();
  }
}

// Inicializa a aplicação
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new TotemApp();
});

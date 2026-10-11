/**
 * TOTEM INTELIGENTE DE JAÚ (TOTEMIZE) - VISUALIZADOR 3D INTERATIVO 360°
 * Baseado no Dossiê Técnico Oficial (2,20m x 0,70m x 0,35m - Aço Galvanizado, ACM, Painel Solar e Tela 43" IP65)
 */

class Totem3DViewer {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.totemGroup = null;

    // Estado da câmera orbital 360° (coordenadas esféricas)
    this.camState = {
      theta: 0.48,        // Ângulo horizontal (radianos) - 360° livre
      phi: 1.34,          // Ângulo vertical (radianos)
      radius: 2.75,       // Distância do zoom - aproximado ao máximo sem cortar nem distorcer
      targetY: 1.10,      // Altura do foco no centro do totem
      targetTheta: 0.48,
      targetPhi: 1.34,
      targetRadius: 2.75,
      targetLookY: 1.10
    };

    this.isDragging = false;
    this.isPanning = false;
    this.prevMouse = { x: 0, y: 0 };
    this.pinchStartDist = 0;

    // Configurações interativas da cena
    this.autoRotate = false;
    this.autoRotateSpeed = 0.005;
    this.isNightMode = false;
    this.showDimensions = true;
    this.showHotspots = true;
    this.designTheme = 'dossie'; // 'dossie' (Grafite & Ouro/Bronze Solar) | 'nexus' (Grafite & Azul Ciano)
    this.screenState = 'home';   // 'home' | 'bus' | 'shoes' | 'tourism' | 'services' | 'idle' | 'sleep'
    this.isWheelchair = false;
    this.isHighContrast = false;

    // Elementos 3D dinâmicos para atualização de tema/luz
    this.dynamicMaterials = {};
    this.dynamicLights = {};
    this.dimensionGroup = null;
    this.hotspotsData = [];
    this.hotspotElements = [];
    this.activeHotspotId = null;

    // Canvas 2D para textura dinâmica da tela 43", cabeçalho, painel inferior (Placa Jaú) e porta traseira de ferro
    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 720;
    this.screenCanvas.height = 1280;
    this.screenCtx = this.screenCanvas.getContext('2d');
    this.screenTexture = null;

    this.headerCanvas = document.createElement('canvas');
    this.headerCanvas.width = 512;
    this.headerCanvas.height = 220;
    this.headerCtx = this.headerCanvas.getContext('2d');
    this.headerTexture = null;

    this.lowerConsoleCanvas = document.createElement('canvas');
    this.lowerConsoleCanvas.width = 512;
    this.lowerConsoleCanvas.height = 420;
    this.lowerConsoleCtx = this.lowerConsoleCanvas.getContext('2d');
    this.lowerTexture = null;

    this.rearCanvas = document.createElement('canvas');
    this.rearCanvas.width = 512;
    this.rearCanvas.height = 1400;
    this.rearCtx = this.rearCanvas.getContext('2d');
    this.rearTexture = null;

    // Cor metálica atual (padrão: Aço/Ferro Escovado Neutro Natural)
    this.currentMetalHex = '#8e96a0';

    this.initialized = false;
    this.animFrameId = null;
  }

  init() {
    if (this.initialized) {
      this.handleResize();
      return;
    }
    this.container = document.getElementById(this.containerId);
    if (!this.container || typeof THREE === 'undefined') return;

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 600;

    // 1. Cena (Fundo Neutro Natural de Estúdio Arquitetônico)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdbe2ea);
    this.scene.fog = new THREE.FogExp2(0xdbe2ea, 0.035);

    // 2. Câmera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);

    // 3. Renderizador WebGL com sombras suaves e exposição natural (sem estouro de branco)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.96;

    const canvasMount = this.container.querySelector('#totem-3d-canvas-mount') || this.container;
    canvasMount.innerHTML = '';
    canvasMount.appendChild(this.renderer.domElement);

    // 4. Iluminação, Cenário Urbano (Praça de Jaú) e Totem 3D
    this.setupLights();
    this.createEnvironment();
    this.createTotemModel();
    this.createDimensionLines();
    this.setupHotspots();
    this.setupInteractionEvents(this.renderer.domElement);
    this.setupUIControls();

    // Atualiza texturas dinâmicas (tela 43", Placa de Jaú e ferro traseiro)
    this.updateScreenTexture();
    this.updateMetalPlatesTextures(this.currentMetalHex);
    setInterval(() => {
      if (this.initialized) this.updateScreenTexture();
    }, 5000);

    window.addEventListener('resize', () => this.handleResize());

    this.initialized = true;
    this.animate();
  }

  // =========================================================================
  // ILUMINAÇÃO EQUILIBRADA E NATURAL (MODO DIA E NOITE)
  // =========================================================================
  setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.62);
    this.scene.add(ambient);
    this.dynamicLights.ambient = ambient;

    const hemi = new THREE.HemisphereLight(0xf8fafc, 0x64748b, 0.48);
    hemi.position.set(0, 10, 0);
    this.scene.add(hemi);
    this.dynamicLights.hemi = hemi;

    // Luz Solar Principal equilibrada (sem filtro branco estourado)
    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.05);
    dirLight.position.set(4.5, 7.5, 5.0);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 20;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);
    this.dynamicLights.sun = dirLight;

    // Luz de preenchimento traseira natural (para destacar a porta de ferro no giro 360°)
    const backLight = new THREE.DirectionalLight(0xcbd5e1, 0.52);
    backLight.position.set(-4.0, 4.0, -5.0);
    this.scene.add(backLight);
    this.dynamicLights.back = backLight;

    // Brilho sutil emitido pela tela frontal
    const screenGlow = new THREE.PointLight(0x38bdf8, 0.25, 2.8);
    screenGlow.position.set(0, 1.15, 0.65);
    this.scene.add(screenGlow);
    this.dynamicLights.screenGlow = screenGlow;
  }

  // =========================================================================
  // AMBIENTE: CALÇADÃO DE PEDRA PORTUGUESA DE JAÚ + PISO TÁTIL
  // =========================================================================
  createEnvironment() {
    const envGroup = new THREE.Group();

    // Textura procedural da calçada de pedra portuguesa de Jaú (ondas tradicionais)
    const paveCanvas = document.createElement('canvas');
    paveCanvas.width = 512;
    paveCanvas.height = 512;
    const pctx = paveCanvas.getContext('2d');

    pctx.fillStyle = '#d6d3d1';
    pctx.fillRect(0, 0, 512, 512);

    // Ondas em mosaico preto/grafite típicas do calçadão de Jaú
    pctx.fillStyle = '#292524';
    for (let y = -64; y < 576; y += 64) {
      pctx.beginPath();
      for (let x = 0; x <= 512; x += 8) {
        const wave = Math.sin((x / 512) * Math.PI * 4) * 18;
        if (x === 0) pctx.moveTo(x, y + wave);
        else pctx.lineTo(x, y + wave);
      }
      for (let x = 512; x >= 0; x -= 8) {
        const wave = Math.sin((x / 512) * Math.PI * 4) * 18;
        pctx.lineTo(x, y + wave + 24);
      }
      pctx.closePath();
      pctx.fill();
    }

    // Juntas das pedrinhas portuguesas
    pctx.strokeStyle = 'rgba(120, 113, 108, 0.35)';
    pctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 16) {
      pctx.beginPath();
      pctx.moveTo(i, 0);
      pctx.lineTo(i, 512);
      pctx.stroke();
      pctx.beginPath();
      pctx.moveTo(0, i);
      pctx.lineTo(512, i);
      pctx.stroke();
    }

    const paveTex = new THREE.CanvasTexture(paveCanvas);
    paveTex.wrapS = THREE.RepeatWrapping;
    paveTex.wrapT = THREE.RepeatWrapping;
    paveTex.repeat.set(3, 3);

    // Plataforma circular chanfrada representando a praça
    const plazaGeo = new THREE.CylinderGeometry(1.85, 1.95, 0.08, 64);
    const plazaMat = new THREE.MeshStandardMaterial({
      map: paveTex,
      roughness: 0.85,
      metalness: 0.05
    });
    const plazaMesh = new THREE.Mesh(plazaGeo, plazaMat);
    plazaMesh.position.y = -0.04;
    plazaMesh.receiveShadow = true;
    envGroup.add(plazaMesh);

    // Anel metálico de borda da plataforma
    const rimGeo = new THREE.TorusGeometry(1.9, 0.025, 16, 64);
    rimGeo.rotateX(Math.PI / 2);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.7,
      roughness: 0.3
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = -0.02;
    envGroup.add(rimMesh);

    // PISO TÁTIL DE ALERTA (Amarelo / Acessibilidade ABNT NBR 9050 ao redor do totem)
    const tactileAlertMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.6,
      metalness: 0.1
    });

    // Faixa de piso tátil frontal e lateral
    const tacFrontGeo = new THREE.BoxGeometry(1.18, 0.012, 0.32);
    const tacFront = new THREE.Mesh(tacFrontGeo, tactileAlertMat);
    tacFront.position.set(0, 0.006, 0.48);
    tacFront.receiveShadow = true;
    envGroup.add(tacFront);

    // Bolinhas em alto relevo do piso tátil de alerta
    const dotGeo = new THREE.CylinderGeometry(0.012, 0.015, 0.006, 12);
    for (let x = -0.52; x <= 0.52; x += 0.065) {
      for (let z = 0.37; z <= 0.59; z += 0.065) {
        const dot = new THREE.Mesh(dotGeo, tactileAlertMat);
        dot.position.set(x, 0.014, z);
        envGroup.add(dot);
      }
    }

    // Trilha direcional levando ao totem
    const tacDirGeo = new THREE.BoxGeometry(0.32, 0.012, 0.85);
    const tacDir = new THREE.Mesh(tacDirGeo, tactileAlertMat);
    tacDir.position.set(0, 0.006, 1.08);
    tacDir.receiveShadow = true;
    envGroup.add(tacDir);

    // Barrinhas direcionais
    const barGeo = new THREE.BoxGeometry(0.022, 0.006, 0.22);
    for (let x = -0.09; x <= 0.09; x += 0.06) {
      for (let z = 0.80; z <= 1.36; z += 0.28) {
        const bar = new THREE.Mesh(barGeo, tactileAlertMat);
        bar.position.set(x, 0.014, z);
        envGroup.add(bar);
      }
    }

    // Grade sutil clara ao redor no piso do estúdio
    const grid = new THREE.GridHelper(10, 20, 0x94a3b8, 0xcbd5e1);
    grid.position.y = -0.085;
    envGroup.add(grid);

    this.scene.add(envGroup);
  }

  // =========================================================================
  // MODELO 3D DO TOTEM INTELIGENTE DE JAÚ (2,20m x 0,70m x 0,35m)
  // =========================================================================
  createTotemModel() {
    this.totemGroup = new THREE.Group();

    // Materiais principais do chassi: AÇO / FERRO ESCOVADO NEUTRO NATURAL (sem filtro branco estourado)
    const rawMetalTextureCanvas = document.createElement('canvas');
    rawMetalTextureCanvas.width = 512;
    rawMetalTextureCanvas.height = 512;
    const mctx = rawMetalTextureCanvas.getContext('2d');
    // Base neutra para multiplicar fielmente qualquer cor escolhida na tabela
    mctx.fillStyle = '#e4e8ee';
    mctx.fillRect(0, 0, 512, 512);
    // Riscos finos horizontais de aço/ferro escovado natural
    mctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    mctx.lineWidth = 1;
    for (let i = 0; i < 380; i++) {
      const y = Math.random() * 512;
      mctx.beginPath();
      mctx.moveTo(0, y);
      mctx.lineTo(512, y + (Math.random() - 0.5) * 3);
      mctx.stroke();
    }
    mctx.strokeStyle = 'rgba(51, 65, 85, 0.16)';
    for (let i = 0; i < 380; i++) {
      const y = Math.random() * 512;
      mctx.beginPath();
      mctx.moveTo(0, y);
      mctx.lineTo(512, y + (Math.random() - 0.5) * 3);
      mctx.stroke();
    }
    const brushedMetalTex = new THREE.CanvasTexture(rawMetalTextureCanvas);
    brushedMetalTex.wrapS = THREE.RepeatWrapping;
    brushedMetalTex.wrapT = THREE.RepeatWrapping;
    brushedMetalTex.repeat.set(2, 4);

    // Chassi em Aço/Ferro Natural Neutro (#8e96a0) — sem emissive artificial
    const bodyMat = new THREE.MeshStandardMaterial({
      map: brushedMetalTex,
      color: 0x8e96a0,
      metalness: 0.30,
      roughness: 0.42
    });
    this.dynamicMaterials.body = bodyMat;

    const darkPanelMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.35,
      roughness: 0.40
    });

    // Material de união / chanfro estrutural em ferro neutro
    const rawSeamMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.32,
      roughness: 0.38
    });
    this.dynamicMaterials.accentTrim = rawSeamMat;

    // Friso lateral metálico neutro
    const ledStripMat = new THREE.MeshStandardMaterial({
      color: 0x78828f,
      metalness: 0.30,
      roughness: 0.38
    });
    this.dynamicMaterials.ledStrip = ledStripMat;

    // -----------------------------------------------------------------------
    // 1. BASE METÁLICA CHUMBADA + PEDESTAL DE FIXAÇÃO (0,00m a 0,16m)
    // -----------------------------------------------------------------------
    const concreteBaseMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.75,
      metalness: 0.10
    });
    const basePedestal = new THREE.Mesh(
      new THREE.BoxGeometry(0.84, 0.10, 0.48),
      concreteBaseMat
    );
    basePedestal.position.set(0, 0.05, 0);
    basePedestal.castShadow = true;
    basePedestal.receiveShadow = true;
    this.totemGroup.add(basePedestal);

    // Flange metálica em chapa de ferro natural
    const flangeMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.35,
      roughness: 0.38
    });
    this.dynamicMaterials.flange = flangeMat;
    const flange = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.04, 0.40),
      flangeMat
    );
    flange.position.set(0, 0.12, 0);
    flange.castShadow = true;
    this.totemGroup.add(flange);

    // 6 Chumbadores / Parafusos sextavados de fixação estrutural
    const boltGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6);
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.45, roughness: 0.30 });
    [
      [-0.34, 0.145, 0.16], [0, 0.145, 0.16], [0.34, 0.145, 0.16],
      [-0.34, 0.145, -0.16], [0, 0.145, -0.16], [0.34, 0.145, -0.16]
    ].forEach(([bx, by, bz]) => {
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      bolt.position.set(bx, by, bz);
      this.totemGroup.add(bolt);
    });

    // -----------------------------------------------------------------------
    // 2. CORPO ESTRUTURAL "QUADRADÃO" COM QUINA SUPERIOR FRONTAL ARREDONDADA
    //    Em chapa maciça de metal cru (aço escovado puro sem pintura)
    // -----------------------------------------------------------------------
    const sideProfile = new THREE.Shape();
    const zBack = -0.175;   // Costa reta
    const zFront = 0.175;   // Frente reta
    const yBottom = 0.12;   // Acima da base chumbada
    const yTop = 2.20;      // Topo plano (altura máxima 2,20m)
    const curveDropY = 0.16; // Quanto a curva desce na quina frontal (até y = 2.04m)
    const curveDepthZ = 0.11; // Largura da faixa arredondada vista de cima
    const zCurveStart = zFront - curveDepthZ; // z = +0.065m

    // Traçado 2D da Vista de Lado (X_shape = Z_world, Y_shape = Y_world)
    sideProfile.moveTo(zBack, yBottom);
    sideProfile.lineTo(zFront, yBottom);
    sideProfile.lineTo(zFront, yTop - curveDropY);
    // Quina superior frontal suavemente arredondada
    sideProfile.quadraticCurveTo(zFront, yTop, zCurveStart, yTop);
    // Parte plana superior onde fica o painel solar
    sideProfile.lineTo(zBack, yTop);
    sideProfile.lineTo(zBack, yBottom);

    const extrudeSettings = {
      depth: 0.692,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.004,
      bevelThickness: 0.004,
      curveSegments: 32
    };

    const mainCabinetGeo = new THREE.ExtrudeGeometry(sideProfile, extrudeSettings);
    const mainCabinet = new THREE.Mesh(mainCabinetGeo, bodyMat);
    mainCabinet.rotation.y = -Math.PI / 2;
    mainCabinet.position.set(0.346, 0, 0);
    mainCabinet.castShadow = true;
    mainCabinet.receiveShadow = true;
    this.totemGroup.add(mainCabinet);

    // Chanfro sutil na junção superior em metal cru (sem detalhes amarelos ou LEDs laterais)
    const dividerBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.696, 0.004, 0.008),
      rawSeamMat
    );
    dividerBar.position.set(0, 2.201, zCurveStart);
    this.totemGroup.add(dividerBar);

    // -----------------------------------------------------------------------
    // 3. TOPO PLANO COM PLACA SOLAR EMBUTIDA (INVISÍVEL PARA QUEM OLHA DE FRENTE!)
    //    Localizada exatamente na área plana traseira do topo (z = -0.165 a +0.055)
    // -----------------------------------------------------------------------
    const solarCanvas = document.createElement('canvas');
    solarCanvas.width = 512;
    solarCanvas.height = 256;
    const sctx = solarCanvas.getContext('2d');
    sctx.fillStyle = '#0a192f';
    sctx.fillRect(0, 0, 512, 256);

    // Células solares monocristalinas de alta eficiência (22%)
    const cols = 8;
    const rows = 4;
    const cw = 512 / cols;
    const ch = 256 / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const grad = sctx.createLinearGradient(c * cw, r * ch, (c + 1) * cw, (r + 1) * ch);
        grad.addColorStop(0, '#172554');
        grad.addColorStop(0.5, '#1e3a8a');
        grad.addColorStop(1, '#0f172a');
        sctx.fillStyle = grad;
        sctx.fillRect(c * cw + 3, r * ch + 3, cw - 6, ch - 6);

        // Trilhas condutoras prateadas (busbars)
        sctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        sctx.lineWidth = 1;
        sctx.beginPath();
        sctx.moveTo(c * cw + cw * 0.33, r * ch + 3);
        sctx.lineTo(c * cw + cw * 0.33, (r + 1) * ch - 3);
        sctx.moveTo(c * cw + cw * 0.66, r * ch + 3);
        sctx.lineTo(c * cw + cw * 0.66, (r + 1) * ch - 3);
        sctx.stroke();
      }
    }
    // Moldura de alumínio anodizado escuro
    sctx.strokeStyle = '#64748b';
    sctx.lineWidth = 8;
    sctx.strokeRect(0, 0, 512, 256);

    const solarTex = new THREE.CanvasTexture(solarCanvas);
    const solarPanelMat = new THREE.MeshStandardMaterial({
      map: solarTex,
      metalness: 0.65,
      roughness: 0.14
    });

    // Placa Solar de 64cm x 21cm (35Wp) embutida de forma plana no topo (y = 2.203m)
    // Como fica atrás da quina arredondada e rente ao topo, quem olha de frente NÃO vê!
    const solarPanelMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.64, 0.008, 0.21),
      solarPanelMat
    );
    solarPanelMesh.position.set(0, 2.203, -0.055);
    this.totemGroup.add(solarPanelMesh);

    // Antena 5G/Wi-Fi low-profile embutida no canto traseiro do topo
    const antennaBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.014, 0.03),
      darkPanelMat
    );
    antennaBase.position.set(0.26, 2.206, -0.145);
    this.totemGroup.add(antennaBase);

    const signalDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.006, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    signalDot.position.set(0.26, 2.215, -0.145);
    this.totemGroup.add(signalDot);

    // -----------------------------------------------------------------------
    // 4. FACE FRONTAL: PLACA SUPERIOR DE IDENTIFICAÇÃO DA MARCA (JAÚ, SP)
    //    Sem câmera em cima. Fica apenas a placa de Jaú, SP e a tela do totem.
    // -----------------------------------------------------------------------
    this.headerTexture = new THREE.CanvasTexture(this.headerCanvas);
    const headerSignMat = new THREE.MeshStandardMaterial({
      map: this.headerTexture,
      roughness: 0.36,
      metalness: 0.26
    });
    this.dynamicMaterials.headerSign = headerSignMat;

    const headerPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(0.58, 0.22),
      headerSignMat
    );
    headerPanel.position.set(0, 1.88, 0.180);
    this.totemGroup.add(headerPanel);

    // -----------------------------------------------------------------------
    // 5. TELA TOUCHSCREEN 43" FULL HD (VIDRO TEMPERADO 8mm)
    // -----------------------------------------------------------------------
    // Moldura protetora da tela (Bezel IP65)
    const screenBezel = new THREE.Mesh(
      new THREE.BoxGeometry(0.60, 1.06, 0.014),
      darkPanelMat
    );
    screenBezel.position.set(0, 1.18, 0.176);
    this.totemGroup.add(screenBezel);

    // Display LCD ativo com Textura Canvas 2D Ao Vivo
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTexture.minFilter = THREE.LinearFilter;
    const screenDisplayMat = new THREE.MeshStandardMaterial({
      map: this.screenTexture,
      emissiveMap: this.screenTexture,
      emissive: 0xffffff,
      emissiveIntensity: 0.16,
      roughness: 0.18,
      metalness: 0.05
    });
    this.dynamicMaterials.screenDisplay = screenDisplayMat;

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 1.00),
      screenDisplayMat
    );
    screenMesh.position.set(0, 1.18, 0.184);
    this.totemGroup.add(screenMesh);

    // A PARTE DE BAIXO É TOTALMENTE LIMPA: APENAS O FERRO MACIÇO DA CARCAÇA E BASE!
    // (Removidos: painel QR/USB/Áudio e botão SOS a pedido do usuário)

    // -----------------------------------------------------------------------
    // 7. FACE TRASEIRA COMPLETA EM FERRO/AÇO NATURAL (PARA VISUALIZAÇÃO 360°!)
    // Porta de Manutenção Antivandalismo, Fechaduras, Aletas de Exaustão e Plaqueta IP65
    // -----------------------------------------------------------------------
    this.rearTexture = new THREE.CanvasTexture(this.rearCanvas);
    const rearDoorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 1.82),
      new THREE.MeshStandardMaterial({
        map: this.rearTexture,
        roughness: 0.40,
        metalness: 0.28
      })
    );
    rearDoorMesh.rotation.y = Math.PI;
    rearDoorMesh.position.set(0, 1.10, -0.180);
    this.totemGroup.add(rearDoorMesh);

    // 2 Fechaduras tubulares antivandalismo em 3D na porta traseira
    [0.75, 1.45].forEach(ly => {
      const lockCylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.016, 16),
        boltMat
      );
      lockCylinder.rotation.x = Math.PI / 2;
      lockCylinder.position.set(-0.23, ly, -0.182);
      this.totemGroup.add(lockCylinder);
    });

    this.scene.add(this.totemGroup);
  }

  // =========================================================================
  // UTILITÁRIOS DE COR E RENDERIZAÇÃO NATURAL DA PLACA DE JAÚ E COSTAS DE FERRO
  // =========================================================================
  hexToRgbObj(hex) {
    const clean = (hex || '#8e96a0').replace('#', '');
    const num = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16) || 0x8e96a0;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  rgbToHexStr(r, g, b) {
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
    return '#' + [clamp(r), clamp(g), clamp(b)].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  shiftColorBrightness(hex, factor) {
    const { r, g, b } = this.hexToRgbObj(hex);
    if (factor >= 0) {
      // Clareia suavemente sem estourar para branco puro
      return this.rgbToHexStr(
        r + (235 - r) * factor,
        g + (238 - g) * factor,
        b + (242 - b) * factor
      );
    } else {
      const f = 1 + factor;
      return this.rgbToHexStr(r * f, g * f, b * f);
    }
  }

  drawBrushedGrain(ctx, x, y, w, h, alphaLight = 0.07, alphaDark = 0.08) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alphaLight})`;
    for (let ly = y; ly < y + h; ly += 4) {
      ctx.beginPath();
      ctx.moveTo(x, ly);
      ctx.lineTo(x + w, ly);
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(15, 23, 42, ${alphaDark})`;
    for (let ly = y + 2; ly < y + h; ly += 4) {
      ctx.beginPath();
      ctx.moveTo(x, ly);
      ctx.lineTo(x + w, ly);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawCornerRivets(ctx, x, y, w, h, inset = 12) {
    const pts = [
      [x + inset, y + inset],
      [x + w - inset, y + inset],
      [x + inset, y + h - inset],
      [x + w - inset, y + h - inset]
    ];
    pts.forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#475569';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rx - 1, ry - 1, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#cbd5e1';
      ctx.fill();
    });
  }

  updateMetalPlatesTextures(baseHex = '#8e96a0') {
    this.currentMetalHex = baseHex;
    const { r, g, b } = this.hexToRgbObj(baseHex);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Evita efeito "negativo" ou branco estourado: mesmo quando o usuário escolhe branco,
    // a placa metálica e a porta traseira mantêm tom metálico natural de aço/ferro escovado
    const metalBase = lum > 0.85 ? '#cfd6df' : baseHex;
    const metalLight = this.shiftColorBrightness(metalBase, 0.18);
    const metalMid = this.shiftColorBrightness(metalBase, 0.06);
    const metalDark = this.shiftColorBrightness(metalBase, -0.22);
    const metalBorder = this.shiftColorBrightness(metalBase, -0.35);

    const isDarkMetal = lum < 0.42;
    const titleColor = isDarkMetal ? '#f8fafc' : '#0c326f';
    const subTitleColor = isDarkMetal ? '#93c5fd' : '#1351b4';
    const bodyTextColor = isDarkMetal ? '#e2e8f0' : '#1e293b';
    const mutedTextColor = isDarkMetal ? '#cbd5e1' : '#334155';
    const greenBadgeColor = isDarkMetal ? '#4ade80' : '#15803d';

    // -----------------------------------------------------------------------
    // 1. PLACA SUPERIOR DE JAÚ (HEADER) — Aço Escovado Natural
    // -----------------------------------------------------------------------
    {
      const ctx = this.headerCtx;
      const w = this.headerCanvas.width;
      const h = this.headerCanvas.height;

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, metalLight);
      grad.addColorStop(0.5, metalBase);
      grad.addColorStop(1, metalDark);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      this.drawBrushedGrain(ctx, 0, 0, w, h, 0.08, 0.08);

      // Moldura chanfrada de ferro/aço natural
      ctx.strokeStyle = metalBorder;
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, w - 12, h - 12);
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 12, w - 24, h - 24);

      this.drawCornerRivets(ctx, 8, 8, w - 16, h - 16, 16);

      ctx.textAlign = 'center';
      ctx.fillStyle = titleColor;
      ctx.font = '800 62px sans-serif';
      ctx.fillText('JAÚ', w / 2, 104);
      ctx.fillStyle = subTitleColor;
      ctx.font = 'bold 23px sans-serif';
      ctx.fillText('SP • CONECTADA COM VOCÊ', w / 2, 152);

      if (this.headerTexture) this.headerTexture.needsUpdate = true;
    }

    // -----------------------------------------------------------------------
    // 2. PAINEL INFERIOR FRONTAL + PLACA MUNICIPAL DE JAÚ — Aço Escovado Natural
    // -----------------------------------------------------------------------
    {
      const lctx = this.lowerConsoleCtx;
      lctx.fillStyle = metalBase;
      lctx.fillRect(0, 0, 512, 420);
      this.drawBrushedGrain(lctx, 0, 0, 512, 420, 0.06, 0.08);

      // Faixa de ícones de conectividade em chapa escovada natural
      lctx.fillStyle = metalLight;
      lctx.fillRect(24, 18, 464, 74);
      lctx.strokeStyle = metalBorder;
      lctx.lineWidth = 2.5;
      lctx.strokeRect(24, 18, 464, 74);

      const badges = [
        { icon: '📲', label: 'QR CODE' },
        { icon: '📶', label: 'WI-FI 5G' },
        { icon: '♿', label: 'LIBRAS/VOZ' },
        { icon: '☀️', label: 'SOLAR ESG' }
      ];
      badges.forEach((b, i) => {
        const bx = 52 + i * 112;
        lctx.font = '23px sans-serif';
        lctx.textAlign = 'center';
        lctx.fillText(b.icon, bx + 36, 51);
        lctx.fillStyle = titleColor;
        lctx.font = 'bold 12px sans-serif';
        lctx.fillText(b.label, bx + 36, 75);
      });

      // Seção de Carregadores USB e Som Direcional (Caixa Esquerda em Metal Natural)
      lctx.save();
      lctx.fillStyle = metalMid;
      lctx.fillRect(24, 110, 286, 118);
      lctx.strokeStyle = metalBorder;
      lctx.lineWidth = 2.5;
      lctx.strokeRect(24, 110, 286, 118);
      lctx.beginPath();
      lctx.rect(26, 112, 282, 114);
      lctx.clip();

      lctx.fillStyle = titleColor;
      lctx.font = 'bold 12px sans-serif';
      lctx.textAlign = 'left';
      lctx.fillText('⚡ CARREGADORES USB & ÁUDIO 10W', 36, 133, 264);

      // Grelha de som direcional perfurada no metal
      lctx.fillStyle = '#1e293b';
      for (let rIdx = 0; rIdx < 4; rIdx++) {
        for (let cIdx = 0; cIdx < 10; cIdx++) {
          lctx.beginPath();
          lctx.arc(46 + cIdx * 14, 156 + rIdx * 14, 3.5, 0, Math.PI * 2);
          lctx.fill();
        }
      }

      // 2 portas USB embutidas
      [218, 262].forEach(ux => {
        lctx.fillStyle = '#0f172a';
        lctx.fillRect(ux, 150, 28, 44);
        lctx.fillStyle = '#38bdf8';
        lctx.fillRect(ux + 6, 158, 16, 28);
        lctx.fillStyle = titleColor;
        lctx.font = 'bold 10px sans-serif';
        lctx.textAlign = 'center';
        lctx.fillText('USB', ux + 14, 210);
      });
      lctx.restore();

      // Caixa Direita: Moldura do Botão Físico de Socorro (SOS)
      lctx.save();
      lctx.fillStyle = isDarkMetal ? '#451a1a' : '#e5d4d4';
      lctx.fillRect(322, 110, 166, 118);
      lctx.strokeStyle = '#b91c1c';
      lctx.lineWidth = 2.5;
      lctx.strokeRect(322, 110, 166, 118);
      lctx.beginPath();
      lctx.rect(324, 112, 162, 114);
      lctx.clip();

      lctx.fillStyle = isDarkMetal ? '#fca5a5' : '#991b1b';
      lctx.font = 'bold 11px sans-serif';
      lctx.textAlign = 'center';
      lctx.fillText('🚨 BOTÃO DE SOCORRO', 405, 130, 150);
      lctx.fillStyle = isDarkMetal ? '#fecaca' : '#7f1d1d';
      lctx.font = 'bold 10px sans-serif';
      lctx.fillText('SAMU 192 • GCM 153', 405, 218, 150);
      lctx.restore();

      // PLACA DE JAÚ (Placa Institucional em Aço Inox / Ferro Escovado Natural)
      const plateGrad = lctx.createLinearGradient(24, 248, 488, 395);
      plateGrad.addColorStop(0, metalLight);
      plateGrad.addColorStop(0.5, metalMid);
      plateGrad.addColorStop(1, metalDark);
      lctx.fillStyle = plateGrad;
      lctx.fillRect(24, 248, 464, 145);
      this.drawBrushedGrain(lctx, 24, 248, 464, 145, 0.08, 0.08);

      lctx.strokeStyle = metalBorder;
      lctx.lineWidth = 3;
      lctx.strokeRect(24, 248, 464, 145);
      this.drawCornerRivets(lctx, 24, 248, 464, 145, 14);

      lctx.fillStyle = titleColor;
      lctx.font = 'bold 21px sans-serif';
      lctx.textAlign = 'center';
      lctx.fillText('🏛️ PREFEITURA MUNICIPAL DE JAÚ', 256, 294, 426);
      lctx.fillStyle = greenBadgeColor;
      lctx.font = 'bold 14.5px sans-serif';
      lctx.fillText('CIDADE INTELIGENTE • SUSTENTÁVEL • ACESSÍVEL', 256, 326, 426);
      lctx.fillStyle = mutedTextColor;
      lctx.font = 'bold 13px sans-serif';
      lctx.fillText('Projeto Integrador Senac Jaú • Totemize Smart City', 256, 356, 426);

      if (this.lowerTexture) this.lowerTexture.needsUpdate = true;
    }

    // -----------------------------------------------------------------------
    // 3. PARTE DE FERRO DAS COSTAS (PORTA TRASEIRA + VENEZIANAS + PLAQUETA TÉCNICA)
    // -----------------------------------------------------------------------
    {
      const rctx = this.rearCtx;
      const doorGrad = rctx.createLinearGradient(0, 0, 512, 1400);
      doorGrad.addColorStop(0, metalMid);
      doorGrad.addColorStop(0.5, metalBase);
      doorGrad.addColorStop(1, metalDark);
      rctx.fillStyle = doorGrad;
      rctx.fillRect(0, 0, 512, 1400);
      this.drawBrushedGrain(rctx, 0, 0, 512, 1400, 0.06, 0.09);

      // Fresta/contorno estrutural da porta de ferro traseira
      rctx.strokeStyle = '#334155';
      rctx.lineWidth = 6;
      rctx.strokeRect(36, 40, 440, 1320);
      rctx.strokeStyle = 'rgba(255,255,255,0.22)';
      rctx.lineWidth = 2;
      rctx.strokeRect(42, 46, 428, 1308);

      // Venezianas / Grelhas de ventilação superior estampadas no ferro
      for (let i = 0; i < 9; i++) {
        rctx.fillStyle = '#1e293b';
        rctx.fillRect(86, 85 + i * 22, 340, 10);
        rctx.fillStyle = metalLight;
        rctx.fillRect(86, 82 + i * 22, 340, 3);
      }

      // Plaqueta Institucional & Técnica Traseira em Aço Escovado Natural (sem branco estourado)
      const rearPlateGrad = rctx.createLinearGradient(68, 340, 444, 760);
      rearPlateGrad.addColorStop(0, metalLight);
      rearPlateGrad.addColorStop(1, metalMid);
      rctx.fillStyle = rearPlateGrad;
      rctx.fillRect(68, 340, 376, 420);
      this.drawBrushedGrain(rctx, 68, 340, 376, 420, 0.07, 0.07);

      rctx.strokeStyle = metalBorder;
      rctx.lineWidth = 3.5;
      rctx.strokeRect(68, 340, 376, 420);
      this.drawCornerRivets(rctx, 68, 340, 376, 420, 16);

      rctx.fillStyle = titleColor;
      rctx.font = 'bold 22px sans-serif';
      rctx.textAlign = 'center';
      rctx.fillText('PREFEITURA DE JAÚ', 256, 405);
      rctx.fillStyle = bodyTextColor;
      rctx.font = 'bold 29px sans-serif';
      rctx.fillText('TOTEM INTELIGENTE', 256, 448);
      rctx.fillStyle = greenBadgeColor;
      rctx.font = 'bold 16.5px sans-serif';
      rctx.fillText('☀️ ENERGIA HÍBRIDA (SOLAR 35Wp + 220V)', 256, 495);

      const specs = [
        '• Estrutura: Chapa de Aço/Ferro Escovado Natural',
        '• Proteção: Vidro Temperado 8mm + Grau IP65',
        '• Exaustão: Venezianas com Cooler Termostático',
        '• Painel Solar Topo: 35Wp (64x21cm Embutido)',
        '• Bateria na Base: Backup LiFePO4 24h (Zona Fria)',
        '• Dimensões: 2,20m (A) x 0,70m (L) x 0,35m (P)',
        '• Peso Aproximado: 120 kg'
      ];
      rctx.fillStyle = bodyTextColor;
      rctx.font = 'bold 14.5px sans-serif';
      rctx.textAlign = 'left';
      specs.forEach((line, idx) => {
        rctx.fillText(line, 88, 548 + idx * 28, 340);
      });

      // Plaqueta de Aviso de Acesso Técnico Restrito em metal natural
      rctx.fillStyle = metalLight;
      rctx.fillRect(106, 810, 300, 64);
      rctx.strokeStyle = metalBorder;
      rctx.lineWidth = 2.5;
      rctx.strokeRect(106, 810, 300, 64);
      rctx.fillStyle = bodyTextColor;
      rctx.font = 'bold 15px sans-serif';
      rctx.textAlign = 'center';
      rctx.fillText('⚡ ACESSO TÉCNICO RESTRITO', 256, 838);
      rctx.fillStyle = mutedTextColor;
      rctx.font = 'bold 11.5px sans-serif';
      rctx.fillText('SISTEMA ELÉTRICO SOLAR + REDE 220V', 256, 858);

      // Venezianas de ventilação inferior no ferro traseiro
      for (let i = 0; i < 8; i++) {
        rctx.fillStyle = '#1e293b';
        rctx.fillRect(86, 1080 + i * 22, 340, 10);
        rctx.fillStyle = metalLight;
        rctx.fillRect(86, 1077 + i * 22, 340, 3);
      }

      if (this.rearTexture) this.rearTexture.needsUpdate = true;
    }
  }

  updateScreenTexture() {
    const ctx = this.screenCtx;
    const w = this.screenCanvas.width;
    const h = this.screenCanvas.height;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // 1. Modo Standby Noturno (ESG 15W)
    if (this.screenState === 'sleep') {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 - 60, 140, 0, Math.PI * 2);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = '90px sans-serif';
      ctx.fillText('🌙', w / 2, h / 2 - 30);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText('MODO ECONOMIA ESG (15W)', w / 2, h / 2 + 120);

      ctx.fillStyle = '#64748b';
      ctx.font = '24px sans-serif';
      ctx.fillText('Backlight reduzido a 10% • Sensor PIR Ativo', w / 2, h / 2 + 170);

      ctx.fillStyle = '#0ea5e9';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('🚶 Aproxime-se ou toque para ativar', w / 2, h / 2 + 260);

      if (this.screenTexture) this.screenTexture.needsUpdate = true;
      return;
    }

    // 2. Modo Vitrine Ocioso (ESG 75W)
    if (this.screenState === 'idle') {
      const idleGrad = ctx.createLinearGradient(0, 0, 0, h);
      idleGrad.addColorStop(0, '#0369a1');
      idleGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = idleGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(140, 180, 440, 54);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('JAÚ CONECTADA • CIDADE INTELIGENTE', w / 2, 216);

      ctx.font = '800 56px sans-serif';
      ctx.fillText('BEM-VINDO A', w / 2, 370);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '800 84px sans-serif';
      ctx.fillText('JAÚ / SP', w / 2, 465);

      ctx.fillStyle = '#e0f2fe';
      ctx.font = '28px sans-serif';
      ctx.fillText('Capital Nacional do Calçado Feminino', w / 2, 540);
      ctx.fillText('Ônibus • Turismo • Comércio • Serviços', w / 2, 585);

      ctx.font = '96px sans-serif';
      ctx.fillText('👆', w / 2, 820);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('TOQUE PARA COMEÇAR', w / 2, 910);

      if (this.screenTexture) this.screenTexture.needsUpdate = true;
      return;
    }

    // 3. Interface Interativa Principal em Fundo Claro (Padrão Gov.br / Suporta Alto Contraste e Modo Cadeirante)
    const hc = this.isHighContrast;
    const wcOffset = this.isWheelchair ? 210 : 0;

    if (hc) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(1, '#eef2f6');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // Se Modo Cadeirante estiver ativo, exibe faixa informativa no topo
    if (this.isWheelchair) {
      ctx.fillStyle = hc ? '#000' : '#ffffff';
      ctx.fillRect(0, 0, w, wcOffset);
      ctx.strokeStyle = hc ? '#ffff00' : '#1351b4';
      ctx.lineWidth = 3;
      ctx.strokeRect(16, 16, w - 32, wcOffset - 32);
      ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
      ctx.textAlign = 'center';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('♿ MODO ALCANCE ACESSÍVEL ATIVO', w / 2, 95);
      ctx.fillStyle = hc ? '#ffff00' : '#475569';
      ctx.font = '22px sans-serif';
      ctx.fillText('Interface rebaixada para cadeirantes (NBR 9050)', w / 2, 140);
    }

    // Header da Tela Touch (Fundo Claro Institucional)
    ctx.fillStyle = hc ? '#000000' : '#ffffff';
    ctx.fillRect(0, wcOffset, w, 175);
    ctx.strokeStyle = hc ? '#ffff00' : '#168821';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, wcOffset + 175);
    ctx.lineTo(w, wcOffset + 175);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
    ctx.font = '800 30px sans-serif';
    ctx.fillText('🏛️ PREFEITURA DE JAÚ', 32, wcOffset + 58);
    ctx.fillStyle = hc ? '#ffff00' : '#1351b4';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Estância Turística • Totemize Smart City', 32, wcOffset + 90);

    // Relógio e Clima no canto direito
    ctx.textAlign = 'right';
    ctx.fillStyle = hc ? '#ffff00' : '#1351b4';
    ctx.font = '800 36px sans-serif';
    ctx.fillText(timeStr, w - 32, wcOffset + 58);
    ctx.fillStyle = hc ? '#ffff00' : '#334155';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('☀️ 28°C Jaú/SP', w - 32, wcOffset + 92);

    // Barra de Acessibilidade Universal
    const accBtns = ['🔊 Áudio', '🦻 Libras', '♿ Alcance', '👁️ Contraste', 'A+'];
    accBtns.forEach((lbl, idx) => {
      const bx = 30 + idx * 134;
      const by = wcOffset + 112;
      ctx.fillStyle = hc ? '#000000' : '#f1f5f9';
      ctx.fillRect(bx, by, 124, 46);
      ctx.strokeStyle = hc ? '#ffff00' : '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, 124, 46);
      ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lbl, bx + 62, by + 30);
    });

    // Conteúdo Central de acordo com a aba selecionada
    const bodyY = wcOffset + 200;

    if (this.screenState === 'bus') {
      this.drawBusScreen(ctx, w, bodyY, hc);
    } else if (this.screenState === 'shoes') {
      this.drawShoesScreen(ctx, w, bodyY, hc);
    } else if (this.screenState === 'tourism') {
      this.drawTourismScreen(ctx, w, bodyY, hc);
    } else if (this.screenState === 'services') {
      this.drawServicesScreen(ctx, w, bodyY, hc);
    } else {
      this.drawHomeScreen(ctx, w, bodyY, hc);
    }

    // Rodapé Fixo Claro com DOOH e Botão de Emergência
    const footY = h - 130;
    ctx.fillStyle = hc ? '#000000' : '#ffffff';
    ctx.fillRect(0, footY, w, 130);
    ctx.strokeStyle = hc ? '#ffff00' : '#0c326f';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, footY, w, 130);

    // Botão Início
    ctx.fillStyle = hc ? '#000000' : '#1351b4';
    ctx.fillRect(24, footY + 22, 110, 86);
    ctx.strokeStyle = hc ? '#ffff00' : '#0c326f';
    ctx.strokeRect(24, footY + 22, 110, 86);
    ctx.fillStyle = hc ? '#ffff00' : '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏠 INÍCIO', 79, footY + 72);

    // Carrossel DOOH (Contido estritamente dentro do seu retângulo claro)
    ctx.save();
    ctx.fillStyle = hc ? '#000000' : '#f8fafc';
    ctx.fillRect(148, footY + 22, 344, 86);
    ctx.strokeStyle = hc ? '#ffff00' : '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(148, footY + 22, 344, 86);
    ctx.beginPath();
    ctx.rect(152, footY + 24, 336, 82);
    ctx.clip();
    ctx.textAlign = 'left';
    ctx.fillStyle = hc ? '#ffff00' : '#1351b4';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('ANÚNCIO PARCEIRO • DOOH ESG', 164, footY + 50, 314);
    ctx.fillStyle = hc ? '#ffff00' : '#1e293b';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('👠 Feira do Calçado de Jaú!', 164, footY + 82, 314);
    ctx.restore();

    // Botão Contatos de Acionamento de Socorro (Contido estritamente nas bordas)
    ctx.save();
    ctx.fillStyle = hc ? '#000000' : '#ffffff';
    ctx.fillRect(506, footY + 22, 190, 86);
    ctx.strokeStyle = hc ? '#ffff00' : '#d32f2f';
    ctx.lineWidth = 3;
    ctx.strokeRect(506, footY + 22, 190, 86);
    ctx.beginPath();
    ctx.rect(510, footY + 25, 182, 80);
    ctx.clip();
    ctx.fillStyle = hc ? '#ffff00' : '#b71c1c';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☎️ CONTATOS DE', 601, footY + 54, 172);
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('SOCORRO • 192/153', 601, footY + 82, 172);
    ctx.restore();

    if (this.screenTexture) this.screenTexture.needsUpdate = true;
  }

  drawHomeScreen(ctx, w, startY, hc) {
    // Banner Defesa Civil Claro
    ctx.fillStyle = hc ? '#000000' : '#fff8e6';
    ctx.fillRect(32, startY, w - 64, 78);
    ctx.strokeStyle = hc ? '#ffff00' : '#d9a400';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, startY, w - 64, 78);
    ctx.textAlign = 'left';
    ctx.fillStyle = hc ? '#ffff00' : '#925400';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('⚠️ DEFESA CIVIL JAÚ • TEMPO ESTÁVEL', 52, startY + 32);
    ctx.fillStyle = hc ? '#ffff00' : '#593900';
    ctx.font = '18px sans-serif';
    ctx.fillText('Campanha de vacinação ativa até 17h nos postos municipais.', 52, startY + 60);

    // Chamada Bem-vindo a Jaú
    ctx.textAlign = 'center';
    ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
    ctx.font = '800 34px sans-serif';
    ctx.fillText('BEM-VINDO A JAÚ • COMO AJUDAR HOJE?', w / 2, startY + 132);

    // Grade de 6 Cards em Fundo Claro (Padrão Gov.br)
    const cards = [
      { icon: '🚌', title: 'ÔNIBUS & ROTAS', sub: 'Itinerários GPS em tempo real', color: '#1351b4' },
      { icon: '👠', title: 'CIRCUITO CALÇADO', sub: 'Lojas de fábrica e rotas', color: '#d97706' },
      { icon: '🏛️', title: 'TURISMO & LAZER', sub: 'Parques, Matriz e Teatro', color: '#168821' },
      { icon: '📋', title: 'SERVIÇOS PÚBLICOS', sub: 'Ouvidoria, Saúde e 156', color: '#0c326f' },
      { icon: '🗺️', title: 'MAPA INTERATIVO', sub: 'Rotas via QR Code sem papel', color: '#2563eb' },
      { icon: '🚨', title: 'SEGURANÇA & SOS', sub: 'Guarda 153, SAMU e Apoio', color: '#dc2626' }
    ];

    cards.forEach((c, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cx = 32 + col * 336;
      const cy = startY + 165 + row * 195;
      const cw = 320;
      const ch = 175;

      ctx.fillStyle = hc ? '#000000' : '#ffffff';
      ctx.fillRect(cx, cy, cw, ch);
      ctx.strokeStyle = hc ? '#ffff00' : '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx, cy, cw, ch);

      // Filete superior colorido padrão Gov.br
      ctx.fillStyle = hc ? '#ffff00' : c.color;
      ctx.fillRect(cx, cy, cw, 8);

      ctx.textAlign = 'left';
      ctx.font = '46px sans-serif';
      ctx.fillText(c.icon, cx + 22, cy + 68);

      ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
      ctx.font = '800 23px sans-serif';
      ctx.fillText(c.title, cx + 22, cy + 116);

      ctx.fillStyle = hc ? '#ffff00' : '#475569';
      ctx.font = '18px sans-serif';
      ctx.fillText(c.sub, cx + 22, cy + 148);
    });

    // Faixa ESG Paperless com QR Code
    const esgY = startY + 760;
    if (esgY < 1050) {
      ctx.fillStyle = hc ? '#000000' : '#f0fdf4';
      ctx.fillRect(32, esgY, w - 64, 92);
      ctx.strokeStyle = hc ? '#ffff00' : '#168821';
      ctx.strokeRect(32, esgY, w - 64, 92);
      ctx.fillStyle = hc ? '#ffff00' : '#168821';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('🌱 CIDADE INTELIGENTE ESG (100% PAPERLESS)', 54, esgY + 40);
      ctx.fillStyle = hc ? '#ffff00' : '#14532d';
      ctx.font = '19px sans-serif';
      ctx.fillText('Escaneie o QR Code na tela para levar rotas e horários no celular.', 54, esgY + 72);
    }
  }

  drawBusScreen(ctx, w, startY, hc) {
    ctx.textAlign = 'left';
    ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
    ctx.font = '800 32px sans-serif';
    ctx.fillText('🚌 TRANSPORTE COLETIVO DE JAÚ (GTFS-RT)', 32, startY + 40);

    const lines = [
      { badge: 'LINHA 01', name: 'Circular Centro ⇄ Pouso Alegre', eta: '4 min', color: '#168821' },
      { badge: 'LINHA 04', name: 'Jd. Pedro Ometto ⇄ Terminal', eta: '12 min', color: '#168821' },
      { badge: 'LINHA 07', name: 'Vila Nova ⇄ Território do Calçado', eta: '21 min', color: '#d97706' },
      { badge: 'LINHA 11', name: 'Distrito Industrial ⇄ Centro', eta: '7 min', color: '#168821' }
    ];

    lines.forEach((l, i) => {
      const ly = startY + 80 + i * 155;
      ctx.fillStyle = hc ? '#000000' : '#ffffff';
      ctx.fillRect(32, ly, w - 64, 135);
      ctx.strokeStyle = hc ? '#ffff00' : '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(32, ly, w - 64, 135);

      ctx.fillStyle = hc ? '#000000' : '#0c326f';
      ctx.fillRect(52, ly + 25, 130, 85);
      ctx.fillStyle = hc ? '#ffff00' : '#ffffff';
      ctx.font = '800 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(l.badge, 117, ly + 75);

      ctx.textAlign = 'left';
      ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(l.name, 205, ly + 55);

      ctx.fillStyle = hc ? '#ffff00' : l.color;
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`● Próximo ônibus: ${l.eta} (GPS Ao Vivo)`, 205, ly + 95);
    });
  }

  drawShoesScreen(ctx, w, startY, hc) {
    ctx.textAlign = 'left';
    ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
    ctx.font = '800 32px sans-serif';
    ctx.fillText('👠 CIRCUITO DO CALÇADO FEMININO', 32, startY + 40);

    const stores = [
      { title: 'Shopping Território do Calçado', addr: 'Av. Hermínio Pires de Oliveira Netto, 400 (+150 lojas)' },
      { title: 'Polo Comercial Rua Major Prado', addr: 'Centro Histórico de Jaú • Lojas e Calçados' },
      { title: 'Espaço Noivas & Calçados de Festa', addr: 'Rua Amaral Gurgel, 210 • Sob Medida' }
    ];

    stores.forEach((s, i) => {
      const sy = startY + 85 + i * 200;
      ctx.fillStyle = hc ? '#000000' : '#ffffff';
      ctx.fillRect(32, sy, w - 64, 175);
      ctx.strokeStyle = hc ? '#ffff00' : '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.strokeRect(32, sy, w - 64, 175);

      ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
      ctx.font = '800 26px sans-serif';
      ctx.fillText(`🛍️ ${s.title}`, 56, sy + 58);

      ctx.fillStyle = hc ? '#ffff00' : '#475569';
      ctx.font = '21px sans-serif';
      ctx.fillText(`📍 ${s.addr}`, 56, sy + 102);

      ctx.fillStyle = hc ? '#ffff00' : '#1351b4';
      ctx.fillRect(56, sy + 120, 280, 40);
      ctx.fillStyle = hc ? '#000000' : '#ffffff';
      ctx.font = 'bold 19px sans-serif';
      ctx.fillText('📲 ROTA VIA QR CODE', 76, sy + 146);
    });
  }

  drawTourismScreen(ctx, w, startY, hc) {
    ctx.textAlign = 'left';
    ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
    ctx.font = '800 32px sans-serif';
    ctx.fillText('🏛️ TURISMO, CULTURA E LAZER EM JAÚ', 32, startY + 40);

    const spots = [
      { icon: '🌳', title: 'Parque Municipal do Rio Jaú', desc: 'Caminhada, lago, quadras e lazer • 06h às 21h' },
      { icon: '⛪', title: 'Igreja Matriz N. Sra. do Patrocínio', desc: 'Patrimônio histórico neogótico na Praça da República' },
      { icon: '🎭', title: 'Teatro Municipal Elza Munerato', desc: 'Espetáculos, cultura e eventos gratuitos' }
    ];

    spots.forEach((sp, i) => {
      const sy = startY + 85 + i * 200;
      ctx.fillStyle = hc ? '#000000' : '#ffffff';
      ctx.fillRect(32, sy, w - 64, 175);
      ctx.strokeStyle = hc ? '#ffff00' : '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.strokeRect(32, sy, w - 64, 175);

      ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
      ctx.font = '800 26px sans-serif';
      ctx.fillText(`${sp.icon} ${sp.title}`, 56, sy + 60);

      ctx.fillStyle = hc ? '#ffff00' : '#475569';
      ctx.font = '21px sans-serif';
      ctx.fillText(sp.desc, 56, sy + 106);

      ctx.fillStyle = hc ? '#ffff00' : '#168821';
      ctx.font = 'bold 19px sans-serif';
      ctx.fillText('📲 Escaneie o QR Code para abrir no Google Maps', 56, sy + 148);
    });
  }

  drawServicesScreen(ctx, w, startY, hc) {
    ctx.textAlign = 'left';
    ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
    ctx.font = '800 32px sans-serif';
    ctx.fillText('📋 SERVIÇOS PÚBLICOS & EMERGÊNCIA', 32, startY + 40);

    const phones = [
      { num: '192', label: 'SAMU 24h' },
      { num: '193', label: 'BOMBEIROS' },
      { num: '153', label: 'GUARDA MUNICIPAL' },
      { num: '190', label: 'POLÍCIA MILITAR' },
      { num: '199', label: 'DEFESA CIVIL' },
      { num: '180', label: 'APOIO À MULHER' }
    ];

    phones.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const px = 32 + col * 336;
      const py = startY + 80 + row * 145;

      ctx.fillStyle = hc ? '#000000' : '#ffffff';
      ctx.fillRect(px, py, 320, 125);
      ctx.strokeStyle = hc ? '#ffff00' : '#dc2626';
      ctx.lineWidth = 3;
      ctx.strokeRect(px, py, 320, 125);

      ctx.textAlign = 'center';
      ctx.fillStyle = hc ? '#ffff00' : '#dc2626';
      ctx.font = '800 42px sans-serif';
      ctx.fillText(p.num, px + 160, py + 62);

      ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(p.label, px + 160, py + 102);
    });
  }

  // =========================================================================
  // LINHAS DE COTAS E MEDIDAS TÉCNICAS 3D (2,20m x 0,70m x 0,35m)
  // =========================================================================
  createDimensionLines() {
    this.dimensionGroup = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });

    const addLine = (p1, p2) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...p1),
        new THREE.Vector3(...p2)
      ]);
      this.dimensionGroup.add(new THREE.Line(geo, lineMat));
    };

    const makeLabelSprite = (text, subtext, color = '#38bdf8') => {
      const c = document.createElement('canvas');
      c.width = 280;
      c.height = 96;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fillRect(4, 4, 272, 88);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, 272, 88);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, 140, 48);

      ctx.fillStyle = color;
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(subtext, 140, 76);

      const tex = new THREE.CanvasTexture(c);
      const spriteMat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.52, 0.18, 1);
      return sprite;
    };

    // 1. Cota de Altura: 2,20 m (na lateral esquerda)
    addLine([-0.62, 0.0, 0.0], [-0.62, 2.20, 0.0]);
    addLine([-0.68, 0.0, 0.0], [-0.55, 0.0, 0.0]);
    addLine([-0.68, 2.20, 0.0], [-0.55, 2.20, 0.0]);
    const hSprite = makeLabelSprite('2,20 m', 'ALTURA TOTAL', '#38bdf8');
    hSprite.position.set(-0.88, 1.15, 0.0);
    this.dimensionGroup.add(hSprite);

    // 2. Cota de Largura: 0,70 m (na frente inferior)
    addLine([-0.35, 0.03, 0.34], [0.35, 0.03, 0.34]);
    addLine([-0.35, 0.03, 0.28], [-0.35, 0.03, 0.40]);
    addLine([0.35, 0.03, 0.28], [0.35, 0.03, 0.40]);
    const wSprite = makeLabelSprite('0,70 m', 'LARGURA FRONTAL', '#fbbf24');
    wSprite.position.set(0, 0.14, 0.42);
    this.dimensionGroup.add(wSprite);

    // 3. Cota de Profundidade: 0,35 m (na lateral direita)
    addLine([0.52, 0.03, -0.175], [0.52, 0.03, 0.175]);
    addLine([0.46, 0.03, -0.175], [0.58, 0.03, -0.175]);
    addLine([0.46, 0.03, 0.175], [0.58, 0.03, 0.175]);
    const dSprite = makeLabelSprite('0,35 m', 'PROFUNDIDADE', '#10b981');
    dSprite.position.set(0.76, 0.16, 0.0);
    this.dimensionGroup.add(dSprite);

    this.scene.add(this.dimensionGroup);
  }

  // =========================================================================
  // HOTSPOTS INTERATIVOS (PONTOS TÉCNICOS DO DOSSIÊ)
  // =========================================================================
  setupHotspots() {
    this.hotspotsData = [
      {
        id: 'solar',
        num: '1',
        title: 'Placa Solar 35Wp Embutida (Invisível de Frente)',
        desc: 'Painel monocristalino de 64×21 cm (35 Wp) embutido na parte plana traseira do topo (atrás da quina frontal arredondada). Alimenta LEDs, sensores PIR, modem 5G e mantém a bateria LiFePO4 de backup 24h (SOS), operando em sistema híbrido com a rede elétrica da praça para a tela 43".',
        pos: new THREE.Vector3(0.0, 2.21, -0.04),
        cam: { theta: 0.18, phi: 0.42, radius: 1.95, targetY: 1.95 }
      },
      {
        id: 'brand',
        num: '2',
        title: 'Painel Superior de Marca: Jaú, SP',
        desc: 'Placa superior de identificação em chapa metálica escovada com acabamento natural e espaço para a marca/frase identificadora do município.',
        pos: new THREE.Vector3(0.0, 1.88, 0.19),
        cam: { theta: 0.15, phi: 1.35, radius: 2.05, targetY: 1.88 }
      },
      {
        id: 'screen',
        num: '3',
        title: 'Tela Touchscreen 43" Full HD (IP65)',
        desc: 'Monitor multi-touch de alto brilho (1500 nits) protegido por vidro temperado antivandalismo de 8mm e interface acessível (Libras, Voz e Modo Cadeirante).',
        pos: new THREE.Vector3(0.28, 1.25, 0.19),
        cam: { theta: 0.0, phi: 1.48, radius: 2.20, targetY: 1.18 }
      },
      {
        id: 'structure',
        num: '4',
        title: 'Chassi Monobloco em Metal Cru (Aço Escovado)',
        desc: 'Corpo monolítico maciço (0,70m × 2,20m × 0,35m) em chapa de ferro/metal cru industrial sem pintura, quina arredondada e base limpa sem adereços.',
        pos: new THREE.Vector3(-0.36, 1.15, 0.05),
        cam: { theta: -1.52, phi: 1.38, radius: 2.85, targetY: 1.12 }
      },
      {
        id: 'rear',
        num: '5',
        title: 'Porta Traseira & Exaustão Térmica',
        desc: 'Costas retas com porta técnica de manutenção, fechadura dupla antivandalismo, venezianas de ventilação natural e plaqueta técnica IP65.',
        pos: new THREE.Vector3(0.0, 1.25, -0.19),
        cam: { theta: Math.PI, phi: 1.40, radius: 2.65, targetY: 1.15 }
      },
      {
        id: 'base',
        num: '6',
        title: 'Base Chumbada & Piso Tátil NBR 9050',
        desc: 'Base metálica retangular chumbada em fundação de concreto na calçada de pedra portuguesa, cercada por piso tátil direcional e de alerta.',
        pos: new THREE.Vector3(-0.28, 0.08, 0.42),
        cam: { theta: -0.45, phi: 1.18, radius: 2.45, targetY: 0.25 }
      }
    ];

    const overlayContainer = this.container.querySelector('#totem-3d-hotspots');
    if (!overlayContainer) return;
    overlayContainer.innerHTML = '';
    this.hotspotElements = [];

    this.hotspotsData.forEach(h => {
      const btn = document.createElement('button');
      btn.className = 'hotspot-pin';
      btn.setAttribute('data-hotspot', h.id);
      btn.innerHTML = `<span class="pin-num">${h.num}</span><span class="pin-label">${h.title}</span>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.focusHotspot(h);
      });
      overlayContainer.appendChild(btn);
      this.hotspotElements.push({ data: h, el: btn });
    });
  }

  focusHotspot(h) {
    this.autoRotate = false;
    const btnAuto = document.getElementById('btn-3d-autorotate');
    if (btnAuto) btnAuto.classList.remove('active');

    this.camState.targetTheta = h.cam.theta;
    this.camState.targetPhi = h.cam.phi;
    this.camState.targetRadius = h.cam.radius;
    this.camState.targetLookY = h.cam.targetY;

    this.activeHotspotId = h.id;
    this.hotspotElements.forEach(item => {
      item.el.classList.toggle('active', item.data.id === h.id);
    });

    const card = document.getElementById('totem-3d-info-card');
    const titleEl = document.getElementById('totem-3d-info-title');
    const descEl = document.getElementById('totem-3d-info-desc');
    if (card && titleEl && descEl) {
      titleEl.textContent = `${h.num}. ${h.title}`;
      descEl.textContent = h.desc;
      card.classList.remove('hidden');
    }
  }

  updateHotspotPositions() {
    if (!this.camera || !this.renderer) return;
    const width = this.renderer.domElement.clientWidth;
    const height = this.renderer.domElement.clientHeight;

    // Posição da câmera para calcular visibilidade frontal/traseira do pino
    const camPos = new THREE.Vector3();
    this.camera.getWorldPosition(camPos);

    this.hotspotElements.forEach(({ data, el }) => {
      if (!this.showHotspots) {
        el.style.display = 'none';
        return;
      }

      const projected = data.pos.clone().project(this.camera);
      if (projected.z > 1) {
        el.style.display = 'none';
        return;
      }

      const x = (projected.x * 0.5 + 0.5) * width;
      const y = (-(projected.y * 0.5) + 0.5) * height;

      el.style.display = 'flex';
      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    });
  }

  // =========================================================================
  // CONTROLES DE ARRASTAR 360° (MOUSE + TOUCH + ZOOM)
  // =========================================================================
  setupInteractionEvents(domElement) {
    domElement.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.isDragging = true;
        this.autoRotate = false;
        const btnAuto = document.getElementById('btn-3d-autorotate');
        if (btnAuto) btnAuto.classList.remove('active');
      } else if (e.button === 2) {
        this.isPanning = true;
      }
      this.prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging && !this.isPanning) return;
      const dx = e.clientX - this.prevMouse.x;
      const dy = e.clientY - this.prevMouse.y;
      this.prevMouse = { x: e.clientX, y: e.clientY };

      if (this.isDragging) {
        this.camState.targetTheta -= dx * 0.0085;
        this.camState.targetPhi = Math.max(0.18, Math.min(1.62, this.camState.targetPhi - dy * 0.0065));
      } else if (this.isPanning) {
        this.camState.targetLookY = Math.max(0.2, Math.min(2.0, this.camState.targetLookY + dy * 0.004));
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.isPanning = false;
    });

    domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    // Zoom suave no scroll do mouse
    domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.camState.targetRadius = Math.max(1.35, Math.min(6.0, this.camState.targetRadius + e.deltaY * 0.0022));
    }, { passive: false });

    // Suporte Touch (Celular / Tablet / Tela Touch)
    domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.autoRotate = false;
        this.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.pinchStartDist = Math.hypot(dx, dy);
      }
    }, { passive: true });

    domElement.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        const dx = e.touches[0].clientX - this.prevMouse.x;
        const dy = e.touches[0].clientY - this.prevMouse.y;
        this.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.camState.targetTheta -= dx * 0.009;
        this.camState.targetPhi = Math.max(0.18, Math.min(1.62, this.camState.targetPhi - dy * 0.007));
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const delta = this.pinchStartDist - dist;
        this.pinchStartDist = dist;
        this.camState.targetRadius = Math.max(1.35, Math.min(6.0, this.camState.targetRadius + delta * 0.008));
      }
    }, { passive: true });

    domElement.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  // =========================================================================
  // BOTÕES DA INTERFACE DO ESTÚDIO 3D (CÂMERAS, GIRO 360°, TEMA, DIA/NOITE)
  // =========================================================================
  setupUIControls() {
    // 1. Ângulos Rápidos de Câmera (Enquadramento máximo sem cortar nem distorcer)
    const presets = {
      'front': { theta: 0.0, phi: 1.52, radius: 2.65, targetY: 1.10 },
      'perspective': { theta: 0.52, phi: 1.32, radius: 2.75, targetY: 1.10 },
      'side': { theta: 1.57, phi: 1.48, radius: 2.60, targetY: 1.10 },
      'back': { theta: Math.PI, phi: 1.45, radius: 2.65, targetY: 1.10 },
      'solar': { theta: 0.0, phi: 0.28, radius: 1.60, targetY: 1.95 }
    };

    document.querySelectorAll('[data-cam-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-cam-preset');
        const p = presets[key];
        if (!p) return;

        this.autoRotate = false;
        const btnAuto = document.getElementById('btn-3d-autorotate');
        if (btnAuto) btnAuto.classList.remove('active');

        this.camState.targetTheta = p.theta;
        this.camState.targetPhi = p.phi;
        this.camState.targetRadius = p.radius;
        this.camState.targetLookY = p.targetY;

        document.querySelectorAll('[data-cam-preset]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // 2. Giro Automático 360°
    const btnAuto = document.getElementById('btn-3d-autorotate');
    if (btnAuto) {
      btnAuto.addEventListener('click', () => {
        this.autoRotate = !this.autoRotate;
        btnAuto.classList.toggle('active', this.autoRotate);
      });
    }

    // 3. Mostrar/Ocultar Cotas (Medidas 2,20m x 0,70m x 0,35m)
    const btnDims = document.getElementById('btn-3d-dimensions');
    if (btnDims) {
      btnDims.addEventListener('click', () => {
        this.showDimensions = !this.showDimensions;
        if (this.dimensionGroup) this.dimensionGroup.visible = this.showDimensions;
        btnDims.classList.toggle('active', this.showDimensions);
      });
    }

    // 4. Mostrar/Ocultar Hotspots Técnicos
    const btnHotspots = document.getElementById('btn-3d-hotspots');
    if (btnHotspots) {
      btnHotspots.addEventListener('click', () => {
        this.showHotspots = !this.showHotspots;
        btnHotspots.classList.toggle('active', this.showHotspots);
        if (!this.showHotspots) {
          const card = document.getElementById('totem-3d-info-card');
          if (card) card.classList.add('hidden');
        }
      });
    }

    // 5. Giro Interativo por Ângulo (↺ -45° e ↻ +45°)
    const btnSpinLeft = document.getElementById('btn-spin-left');
    const btnSpinRight = document.getElementById('btn-spin-right');
    if (btnSpinLeft) {
      btnSpinLeft.addEventListener('click', () => {
        this.autoRotate = false;
        const btnAuto = document.getElementById('btn-3d-autorotate');
        if (btnAuto) btnAuto.classList.remove('active');
        this.camState.targetTheta -= Math.PI / 4; // -45 graus
      });
    }
    if (btnSpinRight) {
      btnSpinRight.addEventListener('click', () => {
        this.autoRotate = false;
        const btnAuto = document.getElementById('btn-3d-autorotate');
        if (btnAuto) btnAuto.classList.remove('active');
        this.camState.targetTheta += Math.PI / 4; // +45 graus
      });
    }

    // 6. Tabela Completa de Cores (Espectro de Matiz + Degradê Branco ao Preto + 30 Cores Principais)
    this.initColorTablePicker();

    // 7. Alternar Iluminação Dia / Noite
    const btnNight = document.getElementById('btn-3d-daynight');
    if (btnNight) {
      btnNight.addEventListener('click', () => {
        this.isNightMode = !this.isNightMode;
        this.applyDayNightMode();
        btnNight.classList.toggle('active', this.isNightMode);
        btnNight.textContent = this.isNightMode ? '🌙 Ambiente: Noite (LEDs)' : '☀️ Ambiente: Dia (Praça)';
      });
    }

    // 8. Fechar card de especificações do hotspot
    const btnCloseInfo = document.getElementById('btn-close-3d-info');
    if (btnCloseInfo) {
      btnCloseInfo.addEventListener('click', () => {
        const card = document.getElementById('totem-3d-info-card');
        if (card) card.classList.add('hidden');
        this.hotspotElements.forEach(item => item.el.classList.remove('active'));
      });
    }
  }

  // =========================================================================
  // TABELA COMPLETA DE CORES 2D (DO BRANCO AO PRETO + TODAS AS CORES DO ESPECTRO)
  // =========================================================================
  hsvToRgb(h, s, v) {
    const c = v * s;
    const hh = ((h % 360) + 360) % 360 / 60;
    const x = c * (1 - Math.abs((hh % 2) - 1));
    let r1 = 0, g1 = 0, b1 = 0;
    if (hh >= 0 && hh < 1) { r1 = c; g1 = x; b1 = 0; }
    else if (hh >= 1 && hh < 2) { r1 = x; g1 = c; b1 = 0; }
    else if (hh >= 2 && hh < 3) { r1 = 0; g1 = c; b1 = x; }
    else if (hh >= 3 && hh < 4) { r1 = 0; g1 = x; b1 = c; }
    else if (hh >= 4 && hh < 5) { r1 = x; g1 = 0; b1 = c; }
    else { r1 = c; g1 = 0; b1 = x; }
    const m = v - c;
    return {
      r: Math.round((r1 + m) * 255),
      g: Math.round((g1 + m) * 255),
      b: Math.round((b1 + m) * 255)
    };
  }

  rgbToHsv(r, g, b) {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    if (max !== min) {
      switch (max) {
        case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
        case gn: h = (bn - rn) / d + 2; break;
        case bn: h = (rn - gn) / d + 4; break;
      }
      h *= 60;
    }
    return { h, s, v };
  }

  initColorTablePicker() {
    const btnOpenColorPicker = document.getElementById('btn-open-color-picker');
    const btnCloseColorPicker = document.getElementById('btn-close-color-picker');
    const colorPickerModal = document.getElementById('totem-color-picker-modal');

    const svCanvas = document.getElementById('color-sv-canvas');
    const svWrap = document.getElementById('color-sv-wrap');
    const svCursor = document.getElementById('color-sv-cursor');

    const hueCanvas = document.getElementById('color-hue-canvas');
    const hueWrap = document.getElementById('color-hue-wrap');
    const hueCursor = document.getElementById('color-hue-cursor');

    const btnResetNeutral = document.getElementById('btn-reset-neutral-color');

    if (btnOpenColorPicker && colorPickerModal) {
      btnOpenColorPicker.addEventListener('click', () => {
        colorPickerModal.classList.toggle('hidden');
      });
    }

    if (btnCloseColorPicker && colorPickerModal) {
      btnCloseColorPicker.addEventListener('click', () => {
        colorPickerModal.classList.add('hidden');
      });
    }

    // Estado interno do seletor 2D (Começa em Azul Gov 215° e posição do Aço Natural #8e96a0)
    // A barra de matiz começa em Azul (210°) e percorre Ciano -> Verde -> Amarelo -> Laranja -> Vermelho -> Roxo -> Azul
    this.pickerState = {
      hueOffset: 210, // Começa no Azul como primeira cor da barra!
      hue: 213,
      s: 0.11,
      v: 0.63
    };

    const drawHueSpectrum = () => {
      if (!hueCanvas) return;
      const ctx = hueCanvas.getContext('2d');
      const w = hueCanvas.width;
      const h = hueCanvas.height;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      const steps = 12;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const deg = (this.pickerState.hueOffset + t * 360) % 360;
        const { r, g, b } = this.hsvToRgb(deg, 1, 1);
        grad.addColorStop(t, this.rgbToHexStr(r, g, b));
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    };

    const drawSVBox = (hueDeg) => {
      if (!svCanvas) return;
      const ctx = svCanvas.getContext('2d');
      const w = svCanvas.width;
      const h = svCanvas.height;

      // 1. Cor pura selecionada no fundo
      const pure = this.hsvToRgb(hueDeg, 1, 1);
      ctx.fillStyle = this.rgbToHexStr(pure.r, pure.g, pure.b);
      ctx.fillRect(0, 0, w, h);

      // 2. Degradê horizontal: Branco (#ffffff) na esquerda -> Transparente na direita
      const whiteGrad = ctx.createLinearGradient(0, 0, w, 0);
      whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
      whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = whiteGrad;
      ctx.fillRect(0, 0, w, h);

      // 3. Degradê vertical: Transparente no topo -> Preto (#000000) embaixo
      const blackGrad = ctx.createLinearGradient(0, 0, 0, h);
      blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
      blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = blackGrad;
      ctx.fillRect(0, 0, w, h);
    };

    const updateCursorsUI = () => {
      if (svCursor) {
        svCursor.style.left = `${(this.pickerState.s * 100).toFixed(1)}%`;
        svCursor.style.top = `${((1 - this.pickerState.v) * 100).toFixed(1)}%`;
      }
      if (hueCursor) {
        const relHue = ((this.pickerState.hue - this.pickerState.hueOffset) % 360 + 360) % 360;
        hueCursor.style.left = `${((relHue / 360) * 100).toFixed(1)}%`;
      }
    };

    const applyFromPickerState = (customLabel = null) => {
      const { r, g, b } = this.hsvToRgb(this.pickerState.hue, this.pickerState.s, this.pickerState.v);
      const hex = this.rgbToHexStr(r, g, b);
      this.setCustomHexColor(hex, customLabel);
      updateCursorsUI();
    };

    drawHueSpectrum();
    drawSVBox(this.pickerState.hue);
    updateCursorsUI();

    // Arrastar no quadro 2D (Branco -> Cor -> Preto)
    if (svWrap && svCanvas) {
      let draggingSV = false;
      const handleSVPointer = (clientX, clientY) => {
        const rect = svWrap.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
        this.pickerState.s = x / (rect.width || 1);
        this.pickerState.v = 1 - (y / (rect.height || 1));
        document.querySelectorAll('.swatch-cell').forEach(b => b.classList.remove('active'));
        applyFromPickerState();
      };

      svWrap.addEventListener('mousedown', (e) => {
        draggingSV = true;
        handleSVPointer(e.clientX, e.clientY);
      });
      window.addEventListener('mousemove', (e) => {
        if (draggingSV) handleSVPointer(e.clientX, e.clientY);
      });
      window.addEventListener('mouseup', () => { draggingSV = false; });

      svWrap.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          draggingSV = true;
          handleSVPointer(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });
      svWrap.addEventListener('touchmove', (e) => {
        if (draggingSV && e.touches.length === 1) {
          handleSVPointer(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });
      svWrap.addEventListener('touchend', () => { draggingSV = false; });
    }

    // Arrastar na barra de Matiz (do Azul até a última cor do espectro)
    if (hueWrap && hueCanvas) {
      let draggingHue = false;
      const handleHuePointer = (clientX) => {
        const rect = hueWrap.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const ratio = x / (rect.width || 1);
        this.pickerState.hue = (this.pickerState.hueOffset + ratio * 360) % 360;
        // Se a saturação estava muito baixa (ex: branco/cinza), eleva suavemente para mostrar a cor escolhida
        if (this.pickerState.s < 0.18) this.pickerState.s = 0.72;
        if (this.pickerState.v < 0.25) this.pickerState.v = 0.78;
        drawSVBox(this.pickerState.hue);
        document.querySelectorAll('.swatch-cell').forEach(b => b.classList.remove('active'));
        applyFromPickerState();
      };

      hueWrap.addEventListener('mousedown', (e) => {
        draggingHue = true;
        handleHuePointer(e.clientX);
      });
      window.addEventListener('mousemove', (e) => {
        if (draggingHue) handleHuePointer(e.clientX);
      });
      window.addEventListener('mouseup', () => { draggingHue = false; });

      hueWrap.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          draggingHue = true;
          handleHuePointer(e.touches[0].clientX);
        }
      }, { passive: true });
      hueWrap.addEventListener('touchmove', (e) => {
        if (draggingHue && e.touches.length === 1) {
          handleHuePointer(e.touches[0].clientX);
        }
      }, { passive: true });
      hueWrap.addEventListener('touchend', () => { draggingHue = false; });
    }

    // Clique nas 30 células da Tabela de Cores Principais
    document.querySelectorAll('.swatch-cell[data-hex]').forEach(btn => {
      btn.addEventListener('click', () => {
        const hex = btn.getAttribute('data-hex');
        const title = btn.getAttribute('title') || hex;
        document.querySelectorAll('.swatch-cell').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const { r, g, b } = this.hexToRgbObj(hex);
        const hsv = this.rgbToHsv(r, g, b);
        if (hsv.s > 0.02) this.pickerState.hue = hsv.h;
        this.pickerState.s = hsv.s;
        this.pickerState.v = hsv.v;
        drawSVBox(this.pickerState.hue);
        updateCursorsUI();
        this.setCustomHexColor(hex, `${title} (${hex.toUpperCase()})`);
      });
    });

    // Botão de Resetar para Aço Natural Neutro (#8e96a0)
    if (btnResetNeutral) {
      btnResetNeutral.addEventListener('click', () => {
        const neutralHex = '#8e96a0';
        const { r, g, b } = this.hexToRgbObj(neutralHex);
        const hsv = this.rgbToHsv(r, g, b);
        this.pickerState.hue = hsv.h;
        this.pickerState.s = hsv.s;
        this.pickerState.v = hsv.v;
        drawSVBox(this.pickerState.hue);
        updateCursorsUI();
        document.querySelectorAll('.swatch-cell').forEach(sw => {
          sw.classList.toggle('active', sw.getAttribute('data-hex') === neutralHex);
        });
        this.setCustomHexColor(neutralHex, 'Aço Natural (#8E96A0)');
      });
    }
  }

  // Aplica qualquer cor Hexadecimal (do Branco ao Preto, passando por todas as cores)
  // de forma natural tanto no Totem quanto na Placa de Jaú e na Parte de Ferro das Costas
  setCustomHexColor(hex, labelText = null) {
    if (!this.dynamicMaterials.body) return;
    const cleanHex = (hex || '#8e96a0').trim();
    const { r, g, b } = this.hexToRgbObj(cleanHex);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Atualiza o material principal do corpo de ferro do Totem 3D
    this.dynamicMaterials.body.color.set(cleanHex);
    // Ajusta metalness/roughness para que tanto cores claras quanto escuras pareçam metal/ferro natural sem filtro negativo
    this.dynamicMaterials.body.metalness = lum > 0.82 ? 0.18 : 0.30;
    this.dynamicMaterials.body.roughness = lum < 0.18 ? 0.36 : 0.42;

    // Atualiza chanfros estruturais, frisos laterais e flange da base em tom harmônico
    const seamHex = this.shiftColorBrightness(cleanHex, -0.22);
    const stripHex = this.shiftColorBrightness(cleanHex, -0.10);
    if (this.dynamicMaterials.accentTrim) this.dynamicMaterials.accentTrim.color.set(seamHex);
    if (this.dynamicMaterials.ledStrip) this.dynamicMaterials.ledStrip.color.set(stripHex);
    if (this.dynamicMaterials.flange) this.dynamicMaterials.flange.color.set(seamHex);

    // Atualiza a Placa Superior de Jaú, a Placa Inferior de Jaú e a Parte de Ferro das Costas
    this.updateMetalPlatesTextures(cleanHex);

    // Atualiza preview e rótulo na Tabela de Cores
    const previewEl = document.getElementById('color-live-preview');
    const labelEl = document.getElementById('color-hex-label');
    if (previewEl) previewEl.style.background = cleanHex;
    if (labelEl) labelEl.textContent = labelText || `Cor Selecionada (${cleanHex.toUpperCase()})`;

    // Sincroniza também a moldura do Totem 2D
    const chassis2D = document.getElementById('totem-chassis');
    if (chassis2D) {
      chassis2D.style.background = cleanHex;
    }
  }

  // Compatibilidade com presets nomeados
  setMetalColor(colorKey) {
    const presetHexMap = {
      'raw': '#8e96a0',
      'black': '#1e293b',
      'govblue': '#1351b4',
      'white': '#f8fafc',
      'gold': '#d97706',
      'corten': '#9a3412'
    };
    this.setCustomHexColor(presetHexMap[colorKey] || '#8e96a0');
  }

  applyDayNightMode() {
    if (this.isNightMode) {
      this.scene.background.setHex(0x0f172a);
      this.scene.fog.color.setHex(0x0f172a);
      this.dynamicLights.ambient.intensity = 0.40;
      this.dynamicLights.sun.intensity = 0.42;
      this.dynamicLights.screenGlow.intensity = 0.90;
      this.dynamicMaterials.screenDisplay.emissiveIntensity = 0.55;
    } else {
      this.scene.background.setHex(0xdbe2ea);
      this.scene.fog.color.setHex(0xdbe2ea);
      this.dynamicLights.ambient.intensity = 0.62;
      this.dynamicLights.sun.intensity = 1.05;
      this.dynamicLights.screenGlow.intensity = 0.25;
      this.dynamicMaterials.screenDisplay.emissiveIntensity = 0.16;
    }
  }

  // Sincroniza estado com o app 2D (telas, modo vitrine, standby, cadeirante, alto contraste)
  syncFromApp(stateObj) {
    if (!stateObj) return;
    if (stateObj.screenState !== undefined) this.screenState = stateObj.screenState;
    if (stateObj.isWheelchair !== undefined) this.isWheelchair = stateObj.isWheelchair;
    if (stateObj.isHighContrast !== undefined) this.isHighContrast = stateObj.isHighContrast;
    this.updateScreenTexture();
  }

  handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const mount = this.container.querySelector('#totem-3d-canvas-mount') || this.container;
    const width = mount.clientWidth || this.container.clientWidth || window.innerWidth;
    const height = mount.clientHeight || this.container.clientHeight || window.innerHeight;
    
    if (width <= 0 || height <= 0) return;

    const aspect = width / height;
    this.camera.aspect = aspect;

    // Correção anti-distorção para tablets e telas em pé (portrait) com VISIBILIDADE 100% TOTAL:
    // O Totem tem 2,20m de altura com base chumbada. Alinhamos a altura do foco e o raio orbital
    // para que a base inferior e o topo solar fiquem perfeitamente visíveis sem ser cortados
    if (aspect < 0.65) {
      // Telas compridas em pé (celulares)
      this.camera.fov = 48;
      this.camState.targetRadius = 3.35;
      this.camState.targetLookY = 1.05;
    } else if (aspect < 0.85) {
      // Tablets verticais (iPads Portrait, tablets Android 3:4 ou 9:16)
      this.camera.fov = 44;
      this.camState.targetRadius = 3.05;
      this.camState.targetLookY = 1.05;
    } else if (aspect < 1.15) {
      // Tablets quase quadrados ou rotação intermediária
      this.camera.fov = 40;
      this.camState.targetRadius = 2.85;
      this.camState.targetLookY = 1.05;
    } else {
      // Desktop / Telas widescreen
      this.camera.fov = 37;
      this.camState.targetRadius = 2.78;
      this.camState.targetLookY = 1.05;
    }

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, true);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  // =========================================================================
  // LOOP DE ANIMAÇÃO 3D (60 FPS)
  // =========================================================================
  animate() {
    this.animFrameId = requestAnimationFrame(() => this.animate());

    if (this.autoRotate && !this.isDragging) {
      this.camState.targetTheta += this.autoRotateSpeed;
    }

    // Interpolação suave (damping) para rotação 360° e zoom
    const damp = 0.12;
    this.camState.theta += (this.camState.targetTheta - this.camState.theta) * damp;
    this.camState.phi += (this.camState.targetPhi - this.camState.phi) * damp;
    this.camState.radius += (this.camState.targetRadius - this.camState.radius) * damp;
    this.camState.targetY += (this.camState.targetLookY - this.camState.targetY) * damp;

    // Converte coordenadas esféricas para X, Y, Z ao redor do Totem
    const r = this.camState.radius;
    const phi = this.camState.phi;
    const theta = this.camState.theta;

    this.camera.position.x = r * Math.sin(phi) * Math.sin(theta);
    this.camera.position.y = this.camState.targetY + r * Math.cos(phi);
    this.camera.position.z = r * Math.sin(phi) * Math.cos(theta);

    this.camera.lookAt(0, this.camState.targetY, 0);

    // Atualiza indicador de ângulo em graus (0° a 360°) na UI
    const degEl = document.getElementById('totem-3d-angle-deg');
    if (degEl) {
      const normalizedDeg = Math.round((((theta * 180 / Math.PI) % 360) + 360) % 360);
      degEl.textContent = `${normalizedDeg}°`;
    }

    this.renderer.render(this.scene, this.camera);
    this.updateHotspotPositions();
  }
}

window.Totem3DViewer = Totem3DViewer;

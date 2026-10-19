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
      phi: 1.38,          // Ângulo vertical (radianos)
      radius: 3.50,       // Distância calibrada para exibir 100% do totem (da base ao topo solar)
      targetY: 1.06,      // Altura do foco no centro exato do totem
      targetTheta: 0.48,
      targetPhi: 1.38,
      targetRadius: 3.50,
      targetLookY: 1.06
    };

    this.isDragging = false;
    this.isPanning = false;
    this.prevMouse = { x: 0, y: 0 };
    this.pinchStartDist = 0;

    // Configurações interativas da cena (iniciam desativadas por padrão no F5)
    this.autoRotate = false;
    this.autoRotateSpeed = 0.005;
    this.isNightMode = false;
    this.showDimensions = false; // Cotas métricas iniciam ocultas
    this.showHotspots = false;   // Pontos 1 a 6 iniciam ocultos
    this.designTheme = 'dossie';
    this.screenState = 'home';
    this.currentCity = 'jau'; // 'jau' ou 'itapui'
    this.isWheelchair = false;
    this.isHighContrast = false;
    this.showVLibrasBox = false; // VLibras inicia oculto por padrão (só aparece quando solicitado)

    // Configurações do Modo Hardware & Raio-X Interno (2ª Bolinha)
    this.isHardwareMode = false;
    this.hardwareViewMode = 'xray'; // 'xray', 'door', 'exploded'
    this.glowPowerWiring = false;
    this.glowDataWiring = false;
    this.currentDoorAngle = 0;
    this.targetDoorAngle = 0;
    this.currentExplodeOffset = 0;
    this.targetExplodeOffset = 0;
    this.internalHardwareGroup = null;
    this.rearDoorHingeGroup = null;
    this.mainCabinetMesh = null;
    this.pistonRod = null;
    this.hardwareWiringMaterials = {};
    this.hardwareHotspotsData = [];

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
    this.lowerConsoleCanvas.height = 512;
    this.lowerConsoleCtx = this.lowerConsoleCanvas.getContext('2d');
    this.lowerTexture = null;

    this.lowerBumpCanvas = document.createElement('canvas');
    this.lowerBumpCanvas.width = 512;
    this.lowerBumpCanvas.height = 512;
    this.lowerBumpCtx = this.lowerBumpCanvas.getContext('2d');
    this.lowerBumpTexture = null;
    this.crestDepthCache = {};

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

    const width = this.container.clientWidth || window.innerWidth || 800;
    const height = this.container.clientHeight || window.innerHeight || 600;

    // 1. Cena (Fundo Neutro Natural de Estúdio Arquitetônico)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdbe2ea);
    this.scene.fog = new THREE.FogExp2(0xdbe2ea, 0.035);

    // 2. Câmera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

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
    this.handleResize();
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

    // Traçado 2D Completo das Colunas Laterais (X_shape = Z_world, Y_shape = Y_world)
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

    const sidePillarExtrudeSettings = {
      depth: 0.048,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.004,
      bevelThickness: 0.004,
      curveSegments: 32
    };

    // Perfil Superior (y = 1.71 a 2.20) inteiriço em toda a largura (0,70m) com a curva redonda do topo
    const upperFrontShape = new THREE.Shape();
    upperFrontShape.moveTo(zBack, 1.71);
    upperFrontShape.lineTo(zFront, 1.71);
    upperFrontShape.lineTo(zFront, yTop - curveDropY);
    upperFrontShape.quadraticCurveTo(zFront, yTop, zCurveStart, yTop);
    upperFrontShape.lineTo(zBack, yTop);
    upperFrontShape.lineTo(zBack, 1.71);

    // Perfil Inferior (y = 0.12 a 0.65) inteiriço em toda a largura (0,70m) abaixo da tela
    const lowerFrontShape = new THREE.Shape();
    lowerFrontShape.moveTo(zBack, yBottom);
    lowerFrontShape.lineTo(zFront, yBottom);
    lowerFrontShape.lineTo(zFront, 0.65);
    lowerFrontShape.lineTo(zBack, 0.65);
    lowerFrontShape.lineTo(zBack, yBottom);

    const pillarSideGeo = new THREE.ExtrudeGeometry(sideProfile, sidePillarExtrudeSettings);
    const upperCabinetGeo = new THREE.ExtrudeGeometry(upperFrontShape, extrudeSettings);
    const lowerCabinetGeo = new THREE.ExtrudeGeometry(lowerFrontShape, extrudeSettings);

    // Grupo do Gabinete Fechado com Rebaixo Frontal de 3 cm (Nicho Embutido da Tela 43")
    const mainCabinet = new THREE.Group();
    mainCabinet.position.set(0.346, 0, 0);

    const upperSolidMesh = new THREE.Mesh(upperCabinetGeo, bodyMat);
    upperSolidMesh.rotation.y = -Math.PI / 2;
    upperSolidMesh.castShadow = true;
    upperSolidMesh.receiveShadow = true;
    mainCabinet.add(upperSolidMesh);

    const lowerSolidMesh = new THREE.Mesh(lowerCabinetGeo, bodyMat);
    lowerSolidMesh.rotation.y = -Math.PI / 2;
    lowerSolidMesh.castShadow = true;
    lowerSolidMesh.receiveShadow = true;
    mainCabinet.add(lowerSolidMesh);

    const rightSolidPillar = new THREE.Mesh(pillarSideGeo, bodyMat);
    rightSolidPillar.rotation.y = -Math.PI / 2;
    rightSolidPillar.position.set(0, 0, 0);
    rightSolidPillar.castShadow = true;
    rightSolidPillar.receiveShadow = true;
    mainCabinet.add(rightSolidPillar);

    const leftSolidPillar = new THREE.Mesh(pillarSideGeo, bodyMat);
    leftSolidPillar.rotation.y = -Math.PI / 2;
    leftSolidPillar.position.set(-0.644, 0, 0);
    leftSolidPillar.castShadow = true;
    leftSolidPillar.receiveShadow = true;
    mainCabinet.add(leftSolidPillar);

    // Miolo Central Rebaixado 3 cm para dentro na região da Tela 43" (z frontal recuado de 0.179 para 0.149)
    const middleRecessedCore = new THREE.Mesh(
      new THREE.BoxGeometry(0.608, 1.07, 0.328),
      bodyMat
    );
    middleRecessedCore.position.set(-0.346, 1.18, -0.015);
    middleRecessedCore.castShadow = true;
    middleRecessedCore.receiveShadow = true;
    mainCabinet.add(middleRecessedCore);

    this.mainCabinetMesh = mainCabinet;
    this.totemGroup.add(mainCabinet);

    // -----------------------------------------------------------------------
    // 2B. CARCAÇA METÁLICA OCA REAL (PAREDES LATERAIS, TETO REDONDO, BASE E NICHO REBAIXADO)
    //     Usa EXATAMENTE a mesma curva superior arredondada e o mesmo rebaixo frontal de 3cm
    // -----------------------------------------------------------------------
    this.hollowCabinetGroup = new THREE.Group();
    this.hollowCabinetGroup.visible = false;

    const sideWallGeo = pillarSideGeo;

    // Parede Lateral Direita da Carcaça (com a mesma curva redonda no topo e borda de 5cm do nicho)
    const rightWallMesh = new THREE.Mesh(sideWallGeo, bodyMat);
    rightWallMesh.rotation.y = -Math.PI / 2;
    rightWallMesh.position.set(0.346, 0, 0);
    rightWallMesh.castShadow = true;
    rightWallMesh.receiveShadow = true;
    this.hollowCabinetGroup.add(rightWallMesh);

    // Parede Lateral Esquerda da Carcaça (com a mesma curva redonda no topo e borda de 5cm do nicho)
    const leftWallMesh = new THREE.Mesh(sideWallGeo, bodyMat);
    leftWallMesh.rotation.y = -Math.PI / 2;
    leftWallMesh.position.set(-0.298, 0, 0);
    leftWallMesh.castShadow = true;
    leftWallMesh.receiveShadow = true;
    this.hollowCabinetGroup.add(leftWallMesh);

    // Fechamento Superior Curvo Oco por Dentro (mesma curva redonda por fora, com teto interno oco em y = 2.184 sob a Placa Solar)
    const topHoodShape = new THREE.Shape();
    topHoodShape.moveTo(zBack, 2.01);
    topHoodShape.lineTo(zBack + 0.016, 2.01);
    topHoodShape.lineTo(zBack + 0.016, yTop - 0.016);
    topHoodShape.lineTo(zCurveStart, yTop - 0.016);
    topHoodShape.quadraticCurveTo(zFront - 0.016, yTop - 0.016, zFront - 0.016, yTop - curveDropY);
    topHoodShape.lineTo(zFront - 0.016, 2.01);
    topHoodShape.lineTo(zFront, 2.01);
    topHoodShape.lineTo(zFront, yTop - curveDropY);
    topHoodShape.quadraticCurveTo(zFront, yTop, zCurveStart, yTop);
    topHoodShape.lineTo(zBack, yTop);
    topHoodShape.lineTo(zBack, 2.01);

    const topHoodGeo = new THREE.ExtrudeGeometry(topHoodShape, extrudeSettings);
    const topHoodMesh = new THREE.Mesh(topHoodGeo, bodyMat);
    topHoodMesh.rotation.y = -Math.PI / 2;
    topHoodMesh.position.set(0.346, 0, 0);
    topHoodMesh.castShadow = true;
    topHoodMesh.receiveShadow = true;
    this.hollowCabinetGroup.add(topHoodMesh);

    // Fechamento Inferior (Zócalo / Pedestal da Carcaça alinhado com o perfil externo)
    const bottomPedestalBox = new THREE.Mesh(new THREE.BoxGeometry(0.700, 0.074, 0.358), bodyMat);
    bottomPedestalBox.position.set(0, 0.153, 0);
    this.hollowCabinetGroup.add(bottomPedestalBox);

    // Chapa Frontal Superior (atrás da Placa de Jaú, y = 1.71 a 2.02) e Inferior (atrás do Brasão, y = 0.18 a 0.65)
    const frontUpperWall = new THREE.Mesh(new THREE.BoxGeometry(0.608, 0.31, 0.014), bodyMat);
    frontUpperWall.position.set(0, 1.865, 0.172);
    this.hollowCabinetGroup.add(frontUpperWall);

    const frontLowerWall = new THREE.Mesh(new THREE.BoxGeometry(0.608, 0.47, 0.014), bodyMat);
    frontLowerWall.position.set(0, 0.415, 0.172);
    this.hollowCabinetGroup.add(frontLowerWall);

    // Batente Metálico Traseiro + Borracha de Vedação EPDM Preta (Grau IP66) onde a Porta Traseira fecha
    const epdmGasketMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85, metalness: 0.1 });
    // Trilhos verticais e horizontais da borracha de vedação do vão traseiro (0,62m x 1,82m)
    const gasketLeft = new THREE.Mesh(new THREE.BoxGeometry(0.018, 1.84, 0.014), epdmGasketMat);
    gasketLeft.position.set(-0.302, 1.10, -0.174);
    this.hollowCabinetGroup.add(gasketLeft);

    const gasketRight = new THREE.Mesh(new THREE.BoxGeometry(0.018, 1.84, 0.014), epdmGasketMat);
    gasketRight.position.set(0.302, 1.10, -0.174);
    this.hollowCabinetGroup.add(gasketRight);

    const gasketTop = new THREE.Mesh(new THREE.BoxGeometry(0.622, 0.018, 0.014), epdmGasketMat);
    gasketTop.position.set(0, 2.012, -0.174);
    this.hollowCabinetGroup.add(gasketTop);

    const gasketBottom = new THREE.Mesh(new THREE.BoxGeometry(0.622, 0.018, 0.014), epdmGasketMat);
    gasketBottom.position.set(0, 0.188, -0.174);
    this.hollowCabinetGroup.add(gasketBottom);

    this.totemGroup.add(this.hollowCabinetGroup);

    // Chanfro sutil na junção superior em metal cru (sempre acima de y = 2.204)
    const dividerBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.696, 0.004, 0.008),
      rawSeamMat
    );
    dividerBar.position.set(0, 2.205, zCurveStart);
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

    // Placa Solar de 64cm x 21cm (35Wp) assentada no topo plano (y = 2.206m, sem nunca afundar na malha)
    const solarPanelMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.64, 0.008, 0.21),
      solarPanelMat
    );
    solarPanelMesh.position.set(0, 2.206, -0.055);
    this.totemGroup.add(solarPanelMesh);

    // -----------------------------------------------------------------------
    // 4. FACE FRONTAL: PLACA SUPERIOR DE IDENTIFICAÇÃO DA MARCA (JAÚ, SP) EM CHAPA 3D SÓLIDA
    // -----------------------------------------------------------------------
    this.headerTexture = new THREE.CanvasTexture(this.headerCanvas);
    const headerSignMat = new THREE.MeshStandardMaterial({
      map: this.headerTexture,
      roughness: 0.36,
      metalness: 0.26
    });
    this.dynamicMaterials.headerSign = headerSignMat;

    const headerEdgeMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.45,
      roughness: 0.35
    });
    const headerPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.22, 0.006),
      [
        headerEdgeMat, // dir
        headerEdgeMat, // esq
        headerEdgeMat, // topo
        headerEdgeMat, // base
        headerSignMat, // frente (+Z) com brasão e título de Jaú
        headerEdgeMat  // verso (-Z) sólido
      ]
    );
    headerPanel.position.set(0, 1.88, 0.181);
    headerPanel.castShadow = true;
    this.totemGroup.add(headerPanel);

    // -----------------------------------------------------------------------
    // 5. TELA-COMPUTADOR TOUCHSCREEN 43" ALL-IN-ONE REBAIXADA ~2,5 CM PARA DENTRO
    //    Nicho protetor embutido de 3,0 cm de profundidade contra sol direto e chuva
    // -----------------------------------------------------------------------
    const recessTrimMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.65,
      roughness: 0.32
    });

    // Abas internas de 3 cm de profundidade do nicho frontal (pingadeira superior, peitoril inferior e laterais)
    const recessTopLip = new THREE.Mesh(new THREE.BoxGeometry(0.598, 0.008, 0.030), recessTrimMat);
    recessTopLip.position.set(0, 1.706, 0.164);
    this.totemGroup.add(recessTopLip);

    const recessBottomSill = new THREE.Mesh(new THREE.BoxGeometry(0.598, 0.008, 0.030), recessTrimMat);
    recessBottomSill.position.set(0, 0.654, 0.164);
    this.totemGroup.add(recessBottomSill);

    const recessLeftJamb = new THREE.Mesh(new THREE.BoxGeometry(0.008, 1.06, 0.030), recessTrimMat);
    recessLeftJamb.position.set(-0.295, 1.18, 0.164);
    this.totemGroup.add(recessLeftJamb);

    const recessRightJamb = new THREE.Mesh(new THREE.BoxGeometry(0.008, 1.06, 0.030), recessTrimMat);
    recessRightJamb.position.set(0.295, 1.18, 0.164);
    this.totemGroup.add(recessRightJamb);

    // Moldura fina da Tela-Computador 43" All-in-One assentada no fundo do rebaixo (z = 0.150, ~2,5 cm para dentro!)
    const screenBezel = new THREE.Mesh(
      new THREE.BoxGeometry(0.588, 1.048, 0.010),
      darkPanelMat
    );
    screenBezel.position.set(0, 1.18, 0.150);
    this.totemGroup.add(screenBezel);

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

    // Vidro Temperado 8mm da Tela 43" em z = 0.156 (~2,3 cm rebaixado para dentro da face frontal z = 0.179)
    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 1.00),
      screenDisplayMat
    );
    screenMesh.position.set(0, 1.18, 0.156);
    this.totemGroup.add(screenMesh);

    // -----------------------------------------------------------------------
    // 6. BRASÃO DA PREFEITURA EM BAIXO-RELEVO NA CHAPA INFERIOR FRONTAL (JAÚ / ITAPUÍ)
    //    Localizado exatamente na região quadrada inferior abaixo da tela 43" (y ≈ 0.40m)
    // -----------------------------------------------------------------------
    this.lowerTexture = new THREE.CanvasTexture(this.lowerConsoleCanvas);
    this.lowerTexture.minFilter = THREE.LinearFilter;
    this.lowerBumpTexture = new THREE.CanvasTexture(this.lowerBumpCanvas);
    this.lowerBumpTexture.minFilter = THREE.LinearFilter;

    const lowerCrestMat = new THREE.MeshStandardMaterial({
      map: this.lowerTexture,
      bumpMap: this.lowerBumpTexture,
      bumpScale: 0.015,
      transparent: true,
      alphaTest: 0.01,
      roughness: 0.36,
      metalness: 0.36,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });
    this.dynamicMaterials.lowerCrest = lowerCrestMat;

    const lowerCrestMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.43, 0.43),
      lowerCrestMat
    );
    lowerCrestMesh.position.set(0, 0.402, 0.1802);
    lowerCrestMesh.receiveShadow = true;
    this.lowerCrestMesh = lowerCrestMesh;
    this.totemGroup.add(lowerCrestMesh);

    // -----------------------------------------------------------------------
    // 7. PORTA TRASEIRA DE ACESSO TÉCNICO ARTICULADA EM AÇO (ABRE PARA FORA C/ 2 CLIQUES)
    // -----------------------------------------------------------------------
    // Fresta / Moldura perimetral externa da Porta Traseira (visível mesmo fechada)
    const rearSeamFrame = new THREE.Group();
    const seamTop = new THREE.Mesh(new THREE.BoxGeometry(0.636, 0.010, 0.006), epdmGasketMat);
    seamTop.position.set(0, 2.015, -0.179);
    rearSeamFrame.add(seamTop);
    const seamBot = new THREE.Mesh(new THREE.BoxGeometry(0.636, 0.010, 0.006), epdmGasketMat);
    seamBot.position.set(0, 0.185, -0.179);
    rearSeamFrame.add(seamBot);
    const seamLeft = new THREE.Mesh(new THREE.BoxGeometry(0.010, 1.84, 0.006), epdmGasketMat);
    seamLeft.position.set(-0.315, 1.10, -0.179);
    rearSeamFrame.add(seamLeft);
    const seamRight = new THREE.Mesh(new THREE.BoxGeometry(0.010, 1.84, 0.006), epdmGasketMat);
    seamRight.position.set(0.315, 1.10, -0.179);
    rearSeamFrame.add(seamRight);
    this.totemGroup.add(rearSeamFrame);

    // Grupo Articulado da Porta Traseira (pivô em dobradiça interna oculta na esquerda, protegida contra chuva e vandalismo)
    this.rearDoorHingeGroup = new THREE.Group();
    this.rearDoorHingeGroup.position.set(-0.31, 1.10, -0.179);

    this.rearTexture = new THREE.CanvasTexture(this.rearCanvas);
    const rearDoorMat = new THREE.MeshStandardMaterial({
      map: this.rearTexture,
      roughness: 0.40,
      metalness: 0.28,
      side: THREE.DoubleSide
    });
    this.dynamicMaterials.rearDoor = rearDoorMat;

    // Chapa 3D de espessura real da Porta Traseira (16mm de aba dobrada c/ vedação EPDM)
    const doorInnerMetalMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.45,
      roughness: 0.35
    });
    const rearDoorBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 1.82, 0.016),
      [
        doorInnerMetalMat, // borda dir
        doorInnerMetalMat, // borda esq
        doorInnerMetalMat, // borda sup
        doorInnerMetalMat, // borda inf
        doorInnerMetalMat, // face interna (+Z, voltada para dentro da máquina)
        rearDoorMat        // face externa (-Z, voltada para trás, 100% limpa e cega)
      ]
    );
    rearDoorBox.position.set(0.31, 0, -0.004);
    rearDoorBox.castShadow = true;
    this.rearDoorHingeGroup.add(rearDoorBox);

    // 2 Travessas Internas de Reforço Estrutural na parte de dentro da Porta
    [-0.52, 0.52].forEach(ry => {
      const rib = new THREE.Mesh(
        new THREE.BoxGeometry(0.54, 0.032, 0.014),
        doorInnerMetalMat
      );
      rib.position.set(0.31, ry, 0.006);
      this.rearDoorHingeGroup.add(rib);
    });

    // FECHADURA BLINDADA ESCAMOTEÁVEL EM AÇO INOX 316 (FLUSH-MOUNT ANTI-ALAVANCA / SEM ALÇA SALIENTE)
    const inox316Mat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.94, roughness: 0.16 });
    const inoxDarkCavityMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.80, roughness: 0.32 });
    const inoxHardenedMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.98, roughness: 0.10 });

    const armoredLockGroup = new THREE.Group();
    armoredLockGroup.position.set(0.545, 0.0, -0.011);

    const lockBezel = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.19, 0.005), inox316Mat);
    lockBezel.position.set(0, 0, -0.001);
    armoredLockGroup.add(lockBezel);

    const lockPocket = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.15, 0.006), inoxDarkCavityMat);
    lockPocket.position.set(0, 0, -0.002);
    armoredLockGroup.add(lockPocket);

    const flushSwingInsert = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.095, 0.005), inox316Mat);
    flushSwingInsert.position.set(0, -0.018, -0.003);
    armoredLockGroup.add(flushSwingInsert);

    const antiDrillShroud = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.019, 0.008, 24),
      inoxHardenedMat
    );
    antiDrillShroud.rotation.x = Math.PI / 2;
    antiDrillShroud.position.set(0, 0.052, -0.004);
    armoredLockGroup.add(antiDrillShroud);

    const keywayRecess = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.009, 20),
      inoxDarkCavityMat
    );
    keywayRecess.rotation.x = Math.PI / 2;
    keywayRecess.position.set(0, 0.052, -0.005);
    armoredLockGroup.add(keywayRecess);

    const centerGuidePin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.003, 0.010, 14),
      inoxHardenedMat
    );
    centerGuidePin.rotation.x = Math.PI / 2;
    centerGuidePin.position.set(0, 0.052, -0.0055);
    armoredLockGroup.add(centerGuidePin);

    const dustCapHinge = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.008, 0.006), inox316Mat);
    dustCapHinge.position.set(0, 0.072, -0.004);
    armoredLockGroup.add(dustCapHinge);

    this.rearDoorHingeGroup.add(armoredLockGroup);

    // Lingueta interna compacta da fechadura
    const centerLatchCam = new THREE.Mesh(
      new THREE.BoxGeometry(0.048, 0.022, 0.008),
      inoxHardenedMat
    );
    centerLatchCam.position.set(0.575, 0.0, 0.012);
    this.rearDoorHingeGroup.add(centerLatchCam);

    this.totemGroup.add(this.rearDoorHingeGroup);

    // -----------------------------------------------------------------------
    // 8. ARQUITETURA INTERNA ENXUTA E SELADA (100% PASSIVA IP66 PARA FICAR NO TEMPO)
    // -----------------------------------------------------------------------
    this.createInternalHardware();

    this.scene.add(this.totemGroup);
  }

  // =========================================================================
  // ARQUITETURA INTERNA ULTRA-ENXUTA: A PRÓPRIA TELA 43" JÁ É O COMPUTADOR (ALL-IN-ONE)
  // Sem computador externo, sem gaveta OPS saliente, sem coolers e apenas 1 Trilho DIN inferior
  // =========================================================================
  createInternalHardware() {
    this.internalHardwareGroup = new THREE.Group();
    this.internalHardwareGroup.visible = false; // Inicia oculto, visível no Raio-X / Porta Aberta

    // Materiais dos Componentes de Hardware
    const aluRailMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.22 });
    const dinRailMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.90, roughness: 0.18 });
    const smpsMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.80, roughness: 0.28 });
    const dinWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.50, metalness: 0.10 });
    const dinOrangeMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.45, metalness: 0.10 });
    const batteryMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.40, metalness: 0.30 });
    const copperGroundMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.90, roughness: 0.25 });

    // Materiais dos Chicotes de Cabos Essenciais
    this.hardwareWiringMaterials = {
      acLive: new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.4 }),
      acNeutral: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 }),
      groundPE: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 }),
      dc12vPos: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35 }),
      solarPos: new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.35 }),
      batteryLead: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
    };

    // 1. TELA-COMPUTADOR TOUCH 43" ALL-IN-ONE (REBAIXADA 2,5 CM • DORSO LISO E SLIM, SEM CAIXA PC EXTERNA)
    this.allInOnePcGroup = new THREE.Group();

    // Dorso metálico fino e selado da Tela-Computador 43" (acompanha o rebaixo frontal de ~2,5 cm em z = 0.136)
    const screenBackMetal = new THREE.Mesh(new THREE.BoxGeometry(0.56, 1.02, 0.016), aluRailMat);
    screenBackMetal.position.set(0, 1.18, 0.136);
    this.internalHardwareGroup.add(screenBackMetal);

    // 2 Travessas Horizontais VESA que prendem a Tela-Computador All-in-One direto nas laterais
    [0.95, 1.45].forEach(ty => {
      const vesaBar = new THREE.Mesh(new THREE.BoxGeometry(0.59, 0.028, 0.020), aluRailMat);
      vesaBar.position.set(0, ty, 0.118);
      this.internalHardwareGroup.add(vesaBar);
    });

    // Plaqueta Técnica Laser no dorso liso da Tela-Computador (mostrando que o sistema já é integrado na própria tela)
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 512;
    badgeCanvas.height = 256;
    const bctx = badgeCanvas.getContext('2d');
    bctx.fillStyle = '#0f172a';
    bctx.fillRect(0, 0, 512, 256);
    bctx.strokeStyle = '#38bdf8';
    bctx.lineWidth = 6;
    bctx.strokeRect(6, 6, 500, 244);

    bctx.fillStyle = '#38bdf8';
    bctx.font = '900 22px sans-serif';
    bctx.textAlign = 'center';
    bctx.fillText('TELA-COMPUTADOR 43" ALL-IN-ONE', 256, 54);

    bctx.fillStyle = '#f8fafc';
    bctx.font = 'bold 18px sans-serif';
    bctx.fillText('CPU + RAM + SSD + TOUCH NA PRÓPRIA TELA', 256, 98);

    bctx.fillStyle = '#4ade80';
    bctx.font = 'bold 17px sans-serif';
    bctx.fillText('✓ SEM COMPUTADOR EXTERNO • REBAIXO 2,5 CM', 256, 142);

    bctx.fillStyle = '#94a3b8';
    bctx.font = 'bold 15px sans-serif';
    bctx.fillText('DISSIPAÇÃO 100% PASSIVA • CONECTOR ÚNICO 12V DC', 256, 186);
    bctx.fillText('GRAU INDUSTRIAL IP65/IP66 • ESTÂNCIA DE JAÚ', 256, 218);

    const badgeTex = new THREE.CanvasTexture(badgeCanvas);
    const badgeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.32, 0.16),
      new THREE.MeshBasicMaterial({ map: badgeTex })
    );
    badgeMesh.rotation.y = Math.PI;
    badgeMesh.position.set(0, 1.20, 0.127);
    this.allInOnePcGroup.add(badgeMesh);

    // Conector único selado de energia 12V DC na borda inferior da própria Tela-Computador
    const powerPlug = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.028, 0.016),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
    );
    powerPlug.position.set(-0.12, 0.72, 0.122);
    this.allInOnePcGroup.add(powerPlug);

    const statusLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.005, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.95 })
    );
    statusLed.position.set(-0.08, 0.72, 0.118);
    this.allInOnePcGroup.add(statusLed);

    this.internalHardwareGroup.add(this.allInOnePcGroup);

    // 2. TRILHO DIN ÚNICO INFERIOR (y = 0.74): PROTEÇÃO ELÉTRICA + FONTE 12V + CONTROLADOR SOLAR
    const singleDinRail = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.035, 0.008), dinRailMat);
    singleDinRail.position.set(0, 0.74, 0.02);
    this.internalHardwareGroup.add(singleDinRail);

    // Disjuntor 16A + DPS Anti-Raio 40kA + DR 30mA (à esquerda do Trilho DIN único)
    const disjuntor = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.075, 0.055), dinWhiteMat);
    disjuntor.position.set(-0.21, 0.74, 0.00);
    this.internalHardwareGroup.add(disjuntor);

    const djLever = new THREE.Mesh(
      new THREE.BoxGeometry(0.024, 0.016, 0.014),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
    );
    djLever.position.set(-0.21, 0.75, -0.030);
    this.internalHardwareGroup.add(djLever);

    const dpsBox = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.075, 0.055), dinOrangeMat);
    dpsBox.position.set(-0.165, 0.74, 0.00);
    this.internalHardwareGroup.add(dpsBox);

    const dpsStatus = new THREE.Mesh(
      new THREE.BoxGeometry(0.014, 0.010, 0.004),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.6 })
    );
    dpsStatus.position.set(-0.165, 0.76, -0.029);
    this.internalHardwareGroup.add(dpsStatus);

    const drBox = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.075, 0.055), dinWhiteMat);
    drBox.position.set(-0.12, 0.74, 0.00);
    this.internalHardwareGroup.add(drBox);

    const drTestBtn = new THREE.Mesh(
      new THREE.BoxGeometry(0.010, 0.010, 0.008),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 })
    );
    drTestBtn.position.set(-0.12, 0.765, -0.030);
    this.internalHardwareGroup.add(drTestBtn);

    // 3. FONTE CHAVEADA INDUSTRIAL 12V (no centro do Trilho DIN único, y = 0.74)
    const smpsBox = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.10, 0.050), smpsMat);
    smpsBox.position.set(-0.01, 0.74, 0.00);
    this.internalHardwareGroup.add(smpsBox);

    const ledSmps = new THREE.Mesh(
      new THREE.SphereGeometry(0.004, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.8 })
    );
    ledSmps.position.set(0.035, 0.77, -0.026);
    this.internalHardwareGroup.add(ledSmps);

    // 4. CONTROLADOR SOLAR MPPT 20A — CAIXINHA AZUL (à direita do Trilho DIN único, y = 0.74)
    const mpptBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.10, 0.048),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.5, roughness: 0.35 })
    );
    mpptBox.position.set(0.15, 0.74, 0.00);
    this.internalHardwareGroup.add(mpptBox);

    const mpptLcd = new THREE.Mesh(
      new THREE.PlaneGeometry(0.054, 0.028),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    );
    mpptLcd.position.set(0.15, 0.76, -0.025);
    mpptLcd.rotation.y = Math.PI;
    this.internalHardwareGroup.add(mpptLcd);

    // Conector / Borne de Entrada Solar (MC4 Laranja) no topo da Caixinha Azul (MPPT)
    const mpptSolarInputPlug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.018, 14),
      this.hardwareWiringMaterials.solarPos
    );
    mpptSolarInputPlug.position.set(0.18, 0.796, -0.008);
    this.internalHardwareGroup.add(mpptSolarInputPlug);

    // Base Interna da Placa Solar no Teto + Caixa de Junção / Prensa-Cabo IP68 sob a Placa Solar
    const solarUnderBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.010, 0.19),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.3 })
    );
    solarUnderBase.position.set(0, 2.183, -0.055);
    this.internalHardwareGroup.add(solarUnderBase);

    const solarJunctionBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.065, 0.026, 0.050),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.5, roughness: 0.35 })
    );
    solarJunctionBox.position.set(0.18, 2.172, -0.030);
    this.internalHardwareGroup.add(solarJunctionBox);

    const solarGlandNut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.022, 14),
      this.hardwareWiringMaterials.solarPos
    );
    solarGlandNut.position.set(0.18, 2.155, -0.020);
    this.internalHardwareGroup.add(solarGlandNut);

    // 5. BATERIA COMPACTA LiFePO4 12,8V DA PLACA SOLAR (NA BASE FRIA, y = 0.27)
    const batBox = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.15, 0.15), batteryMat);
    batBox.position.set(0.06, 0.27, 0.0);
    this.internalHardwareGroup.add(batBox);

    const batHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.012, 0.018),
      new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 })
    );
    batHandle.position.set(0.06, 0.35, 0.0);
    this.internalHardwareGroup.add(batHandle);

    const batTermPos = new THREE.Mesh(
      new THREE.CylinderGeometry(0.010, 0.010, 0.016, 16),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.7, roughness: 0.3 })
    );
    batTermPos.position.set(-0.02, 0.35, 0.04);
    this.internalHardwareGroup.add(batTermPos);

    const batTermNeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.010, 0.010, 0.016, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 })
    );
    batTermNeg.position.set(0.14, 0.35, 0.04);
    this.internalHardwareGroup.add(batTermNeg);

    // 6. BARRAMENTO PE DE ATERRAMENTO EM COBRE MACIÇO (y = 0.48)
    const groundBar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.016, 0.006), copperGroundMat);
    groundBar.position.set(-0.14, 0.48, 0.0);
    this.internalHardwareGroup.add(groundBar);

    for (let p = -0.08; p <= 0.08; p += 0.032) {
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.008, 12), dinRailMat);
      screw.rotation.x = Math.PI / 2;
      screw.position.set(-0.14 + p, 0.48, -0.004);
      this.internalHardwareGroup.add(screw);
    }

    // 7. FIAÇÃO MÍNIMA ESSENCIAL (1 ÚNICO CABO DE ENERGIA P/ A TELA ALL-IN-ONE)
    const createWire = (pts, mat, r = 0.004, targetGroup = this.internalHardwareGroup, segments = 48) => {
      const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
      const geo = new THREE.TubeGeometry(curve, segments, r, 8, false);
      const mesh = new THREE.Mesh(geo, mat);
      targetGroup.add(mesh);
      return mesh;
    };

    // AC 220V Subterrâneo -> Disjuntor DIN
    createWire([
      [-0.21, 0.14, 0.0],
      [-0.21, 0.45, 0.0],
      [-0.21, 0.70, 0.0]
    ], this.hardwareWiringMaterials.acLive, 0.0055);

    // Cabo único 12V DC da Fonte/MPPT direto para o conector da Tela-Computador 43" All-in-One
    createWire([
      [-0.01, 0.78, 0.01],
      [-0.12, 0.80, 0.06],
      [-0.12, 0.72, 0.12]
    ], this.hardwareWiringMaterials.dc12vPos, 0.005, this.allInOnePcGroup);

    // Cabo Solar (Laranja Contínuo) ligando diretamente a Placa Solar no Teto -> Caixinha Azul (Controlador MPPT)
    // Pontos intermediários alinhados em x = 0.225 (longe da parede lateral em x = 0.298) para nunca entrar na parede!
    createWire([
      [0.18, 2.202, -0.035],
      [0.18, 2.155, -0.020],
      [0.20, 2.02, -0.012],
      [0.225, 1.88, -0.008],
      [0.225, 1.62, -0.008],
      [0.225, 1.35, -0.008],
      [0.225, 1.08, -0.008],
      [0.220, 0.88, -0.008],
      [0.195, 0.82, -0.008],
      [0.180, 0.796, -0.008],
      [0.175, 0.76, -0.005]
    ], this.hardwareWiringMaterials.solarPos, 0.006, this.internalHardwareGroup, 64);

    // Cabo da Bateria Solar LiFePO4 -> Controlador MPPT
    createWire([
      [0.15, 0.69, 0.01],
      [0.15, 0.50, 0.02],
      [-0.02, 0.39, 0.04],
      [-0.02, 0.35, 0.04]
    ], this.hardwareWiringMaterials.batteryLead, 0.0055);

    // Aterramento PE Equipotencial (Verde) -> Barramento
    createWire([
      [-0.14, 0.14, 0.0],
      [-0.14, 0.48, 0.0],
      [-0.14, 0.70, 0.0]
    ], this.hardwareWiringMaterials.groundPE, 0.0045);

    this.pcArchitecture = 'allinone';
    this.allInOnePcGroup.visible = true;

    this.totemGroup.add(this.internalHardwareGroup);
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
      const headerCityLabel = this.currentCity === 'itapui' ? 'ITAPUÍ' : (this.currentCity === 'bauru' ? 'BAURU' : 'JAÚ');
      ctx.fillText(headerCityLabel, w / 2, 104);
      ctx.fillStyle = subTitleColor;
      ctx.font = 'bold 23px sans-serif';
      ctx.fillText('SP • CONECTADA COM VOCÊ', w / 2, 152);

      if (this.headerTexture) this.headerTexture.needsUpdate = true;
    }

    // -----------------------------------------------------------------------
    // 2. BRASÃO DA PREFEITURA EM BAIXO-RELEVO NA CHAPA INFERIOR FRONTAL (JAÚ / ITAPUÍ / BAURU)
    // -----------------------------------------------------------------------
    {
      this.renderDebossedCrestFromDepth(this.currentCity || 'jau', metalBase);
    }

    // -----------------------------------------------------------------------
    // 3. PARTE DE FERRO DAS COSTAS (PORTA TRASEIRA 100% LIMPA SEM ESCRITURAS/PLAQUINHAS)
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

      // Fresta/contorno de vedação de borracha EPDM da Porta Traseira (100% limpa)
      rctx.strokeStyle = '#0f172a';
      rctx.lineWidth = 10;
      rctx.strokeRect(22, 24, 468, 1352);
      rctx.strokeStyle = 'rgba(255,255,255,0.28)';
      rctx.lineWidth = 2.5;
      rctx.strokeRect(32, 34, 448, 1332);

      if (this.rearTexture) this.rearTexture.needsUpdate = true;
    }
  }

  // =========================================================================
  // MOTOR DE BAIXO-RELEVO METÁLICO (HEIGHTMAP + BEVEL NORMAL + BUMP MAP 3D)
  // Gera os Brasões Oficiais de Jaú (Lei nº 77/1949), Itapuí e Bauru (Lei nº 3.393/1991)
  // estampados em baixo-relevo diretamente na chapa frontal inferior do Totem
  // =========================================================================
  buildCityCrestDepthMap(cityKey = 'jau') {
    const key = cityKey === 'itapui' ? 'itapui' : (cityKey === 'bauru' ? 'bauru' : 'jau');
    if (this.crestDepthCache && this.crestDepthCache[key]) {
      return this.crestDepthCache[key];
    }

    const W = 512;
    const H = 512;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');

    // Profundidade 0 = chapa metálica lisa original; 1.0 = entalhe profundo do baixo-relevo
    const gray = (d) => {
      const v = Math.round(Math.max(0, Math.min(1, d)) * 255);
      return `rgb(${v},${v},${v})`;
    };

    ctx.fillStyle = gray(0);
    ctx.fillRect(0, 0, W, H);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // -----------------------------------------------------------------------
    // 1. SUPORTES LATERAIS (RAMOS DE CAFEEIRO / CANA-DE-AÇÚCAR E LAVOURA)
    // -----------------------------------------------------------------------
    const drawBranch = (side, mode) => {
      ctx.save();
      if (side === 'right') {
        ctx.translate(W, 0);
        ctx.scale(-1, 1);
      }

      // Haste principal curvada abraçando o escudo português
      ctx.strokeStyle = gray(0.84);
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(256, 408);
      ctx.bezierCurveTo(150, 404, 72, 326, 68, 224);
      ctx.bezierCurveTo(66, 174, 84, 132, 114, 102);
      ctx.stroke();

      // Relevo interno da haste
      ctx.strokeStyle = gray(0.45);
      ctx.lineWidth = 4;
      ctx.stroke();

      const nodes = [
        { x: 170, y: 392, ang: -2.45, scale: 0.92 },
        { x: 122, y: 362, ang: -2.15, scale: 1.00 },
        { x: 90,  y: 318, ang: -1.85, scale: 1.06 },
        { x: 73,  y: 266, ang: -1.55, scale: 1.08 },
        { x: 69,  y: 212, ang: -1.28, scale: 1.04 },
        { x: 78,  y: 162, ang: -1.02, scale: 0.96 },
        { x: 98,  y: 120, ang: -0.78, scale: 0.86 }
      ];

      if (mode === 'cana') {
        // Gomos de cana-de-açúcar e folhas agrícolas alongadas (Itapuí lado direito)
        nodes.forEach((n, idx) => {
          ctx.save();
          ctx.translate(n.x, n.y);
          ctx.rotate(n.ang);
          // Gomo entalhado na haste
          ctx.fillStyle = gray(0.92);
          ctx.fillRect(-7, -3, 14, 6);

          // Folha longa lanceolada externa e interna
          [-0.65, 0.58].forEach((dir) => {
            ctx.save();
            ctx.rotate(dir);
            ctx.fillStyle = gray(0.66);
            ctx.strokeStyle = gray(0.94);
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-18 * n.scale, -24 * n.scale, -5 * n.scale, -52 * n.scale);
            ctx.quadraticCurveTo(14 * n.scale, -24 * n.scale, 0, 0);
            ctx.fill();
            ctx.stroke();
            // Nervura central
            ctx.beginPath();
            ctx.moveTo(0, -3);
            ctx.lineTo(-3 * n.scale, -44 * n.scale);
            ctx.stroke();
            ctx.restore();
          });
          ctx.restore();
        });
      } else {
        // Ramo de Cafeeiro Frutificado (Folhas ovais nervuradas + cachos de grãos de café)
        nodes.forEach((n) => {
          ctx.save();
          ctx.translate(n.x, n.y);
          ctx.rotate(n.ang);

          [-0.78, 0.72].forEach((leafAng) => {
            ctx.save();
            ctx.rotate(leafAng);
            ctx.fillStyle = gray(0.64);
            ctx.strokeStyle = gray(0.94);
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-18 * n.scale, -12 * n.scale, -18 * n.scale, -34 * n.scale, 0, -44 * n.scale);
            ctx.bezierCurveTo(18 * n.scale, -34 * n.scale, 18 * n.scale, -12 * n.scale, 0, 0);
            ctx.fill();
            ctx.stroke();

            // Nervura central e nervuras secundárias da folha de café
            ctx.strokeStyle = gray(0.95);
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(0, -3);
            ctx.lineTo(0, -38 * n.scale);
            ctx.moveTo(0, -15 * n.scale);
            ctx.lineTo(-8 * n.scale, -22 * n.scale);
            ctx.moveTo(0, -15 * n.scale);
            ctx.lineTo(8 * n.scale, -22 * n.scale);
            ctx.moveTo(0, -26 * n.scale);
            ctx.lineTo(-7 * n.scale, -32 * n.scale);
            ctx.moveTo(0, -26 * n.scale);
            ctx.lineTo(7 * n.scale, -32 * n.scale);
            ctx.stroke();
            ctx.restore();
          });

          // Cachos de frutos/grãos de café junto ao nó
          [[-9, -4], [9, -4], [0, -10]].forEach(([bx, by]) => {
            ctx.fillStyle = gray(0.92);
            ctx.beginPath();
            ctx.arc(bx, by, 5.5 * n.scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = gray(0.32);
            ctx.beginPath();
            ctx.arc(bx, by, 2.6 * n.scale, 0, Math.PI * 2);
            ctx.fill();
          });

          ctx.restore();
        });
      }
      ctx.restore();
    };

    drawBranch('left', 'cafe');
    drawBranch('right', key === 'itapui' ? 'cana' : 'cafe');

    // Laço de cruzamento dos ramos sob a ponta do escudo
    ctx.fillStyle = gray(0.88);
    ctx.strokeStyle = gray(0.96);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(236, 394, 40, 18, 6);
    ctx.fill();
    ctx.stroke();

    // -----------------------------------------------------------------------
    // 2. COROA MURAL MUNICIPAL FORTIFICADA (5 TORRES VISÍVEIS EM PERSPECTIVA)
    // -----------------------------------------------------------------------
    const towers = [
      { x: 132, w: 38, y: 44, h: 64, gate: true },
      { x: 174, w: 46, y: 34, h: 74, gate: true },
      { x: 224, w: 64, y: 24, h: 84, gate: true, main: true },
      { x: 292, w: 46, y: 34, h: 74, gate: true },
      { x: 342, w: 38, y: 44, h: 64, gate: true }
    ];

    // Base mural unindo as 5 torres
    ctx.fillStyle = gray(0.60);
    ctx.strokeStyle = gray(0.95);
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(128, 56, 256, 56, 6);
    ctx.fill();
    ctx.stroke();

    towers.forEach((t) => {
      // Corpo da torre
      ctx.fillStyle = gray(t.main ? 0.44 : 0.54);
      ctx.strokeStyle = gray(0.95);
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.rect(t.x, t.y + 12, t.w, t.h - 12);
      ctx.fill();
      ctx.stroke();

      // 3 Ameias (merlões) no topo de cada torre
      const mW = (t.w - 8) / 3;
      for (let m = 0; m < 3; m++) {
        const mx = t.x + m * (mW + 4);
        ctx.fillStyle = gray(0.46);
        ctx.fillRect(mx, t.y, mW, 14);
        ctx.strokeRect(mx, t.y, mW, 14);
      }

      // Linhas de cantaria (pedras da muralha)
      ctx.strokeStyle = gray(0.88);
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(t.x + 3, t.y + 28);
      ctx.lineTo(t.x + t.w - 3, t.y + 28);
      ctx.moveTo(t.x + 3, t.y + 44);
      ctx.lineTo(t.x + t.w - 3, t.y + 44);
      ctx.stroke();

      // Portão arqueado profundo (em Jaú destaca o Portal da Padroeira N. Sra. do Patrocínio; em Itapuí os 5 portões)
      const gw = t.main ? 22 : 14;
      const gh = t.main ? 32 : 24;
      const gx = t.x + t.w / 2;
      const gy = t.y + t.h - 4;
      ctx.fillStyle = gray(0.98);
      ctx.beginPath();
      ctx.moveTo(gx - gw / 2, gy);
      ctx.lineTo(gx - gw / 2, gy - gh + gw / 2);
      ctx.arc(gx, gy - gh + gw / 2, gw / 2, Math.PI, 0, false);
      ctx.lineTo(gx + gw / 2, gy);
      ctx.closePath();
      ctx.fill();
    });

    // Cinturão de base da Coroa Mural
    ctx.fillStyle = gray(0.88);
    ctx.fillRect(126, 104, 260, 10);

    // -----------------------------------------------------------------------
    // 3. ESCUDO PORTUGUÊS CLÁSSICO (CONTORNO CHANFRADO EM BAIXO-RELEVO)
    // -----------------------------------------------------------------------
    const shieldPath = () => {
      ctx.beginPath();
      ctx.moveTo(132, 118);
      ctx.lineTo(380, 118);
      ctx.lineTo(380, 264);
      ctx.arc(256, 264, 124, 0, Math.PI, false);
      ctx.closePath();
    };

    // Cavidade principal do escudo
    ctx.save();
    shieldPath();
    ctx.fillStyle = gray(0.54);
    ctx.fill();
    ctx.lineWidth = 16;
    ctx.strokeStyle = gray(0.95);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.strokeStyle = gray(0.24);
    ctx.stroke();
    ctx.clip();

    if (key === 'jau') {
      // =====================================================================
      // HERÁLDICA OFICIAL DE JAÚ (LEI MUNICIPAL Nº 77/1949 - ROBERTO THUT)
      // 1) Chefe: Águia + Hélice do Hidroavião "Jahu" (João Ribeiro de Barros)
      // 2) Centro: Perobeira (Mata Original) + Sol e Riqueza da Terra Roxa
      // 3) Base: Ondas do Rio Jaú + Grande Peixe Jaú (Figura Parlante)
      // =====================================================================

      // Divisas horizontais do escudo
      ctx.fillStyle = gray(0.92);
      ctx.fillRect(130, 194, 252, 7);
      ctx.fillRect(130, 278, 252, 7);

      // --- CAMPO 1 (TOPO): ÁGUIA DE ASAS ABERTAS + HÉLICE DO "JAHU" ---
      // Asas abertas da Águia em relevo dentro da cavidade
      [-1, 1].forEach((dir) => {
        for (let p = 0; p < 5; p++) {
          const len = 88 - p * 13;
          const py = 136 + p * 9;
          ctx.fillStyle = gray(0.22);
          ctx.strokeStyle = gray(0.92);
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(256 + dir * 12, py);
          ctx.quadraticCurveTo(256 + dir * (len * 0.65), py - 8, 256 + dir * len, py + 2);
          ctx.quadraticCurveTo(256 + dir * (len * 0.65), py + 8, 256 + dir * 12, py + 6);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      });

      // Corpo central da Águia + Hélice Bipá de Avião cruzada
      ctx.fillStyle = gray(0.18);
      ctx.strokeStyle = gray(0.94);
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(256, 158, 66, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(256, 158, 10, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cubo central da hélice
      ctx.fillStyle = gray(0.95);
      ctx.beginPath();
      ctx.arc(256, 158, 7, 0, Math.PI * 2);
      ctx.fill();

      // --- CAMPO 2 (CENTRO): A PEROBEIRA (ESQUERDA) & SOL DA TERRA ROXA (DIREITA) ---
      ctx.fillStyle = gray(0.90);
      ctx.fillRect(253, 198, 6, 82);

      // Esquerda: A Grande Perobeira (Árvore símbolo da mata original de Jaú)
      ctx.fillStyle = gray(0.22);
      ctx.strokeStyle = gray(0.94);
      ctx.lineWidth = 3.5;
      // Tronco e raízes
      ctx.beginPath();
      ctx.moveTo(182, 276);
      ctx.lineTo(190, 244);
      ctx.lineTo(202, 244);
      ctx.lineTo(210, 276);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Copa frondosa da Perobeira em 5 lóbulos esculturais
      [
        [196, 224, 24],
        [174, 232, 18],
        [218, 232, 18],
        [184, 214, 18],
        [208, 214, 18]
      ].forEach(([cx, cy, r]) => {
        ctx.fillStyle = gray(0.24);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = gray(0.90);
        ctx.lineWidth = 2.8;
        ctx.stroke();
      });

      // Direita: Sol Radiante e Lavoura da Terra Roxa
      const sunX = 314;
      const sunY = 236;
      ctx.strokeStyle = gray(0.92);
      ctx.lineWidth = 3.5;
      for (let a = 0; a < 12; a++) {
        const rad = (a * Math.PI) / 6;
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(rad) * 16, sunY + Math.sin(rad) * 16);
        ctx.lineTo(sunX + Math.cos(rad) * 32, sunY + Math.sin(rad) * 32);
        ctx.stroke();
      }
      ctx.fillStyle = gray(0.20);
      ctx.strokeStyle = gray(0.94);
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // --- CAMPO 3 (INFERIOR): O RIO JAÚ E O GRANDE PEIXE JAÚ (PAULICEA LUETKENI) ---
      // Faixas onduladas profundas do Rio Jaú ao fundo
      [296, 326, 356, 378].forEach((wy) => {
        ctx.strokeStyle = gray(0.90);
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(130, wy);
        for (let wx = 130; wx <= 382; wx += 42) {
          ctx.quadraticCurveTo(wx + 10.5, wy - 8, wx + 21, wy);
          ctx.quadraticCurveTo(wx + 31.5, wy + 8, wx + 42, wy);
        }
        ctx.stroke();
      });

      // O GRANDE PEIXE JAÚ esculpido em relevo no centro do rio
      ctx.save();
      // Nadadeira dorsal e adiposa
      ctx.fillStyle = gray(0.26);
      ctx.strokeStyle = gray(0.96);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(226, 312);
      ctx.quadraticCurveTo(246, 286, 272, 310);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Nadadeira ventral/peitoral
      ctx.beginPath();
      ctx.moveTo(212, 336);
      ctx.quadraticCurveTo(228, 362, 250, 342);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Corpo hidrodinâmico robusto + Cauda bifurcada do Peixe Jaú
      ctx.fillStyle = gray(0.16);
      ctx.strokeStyle = gray(0.96);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(164, 326); // Focinho largo à esquerda
      ctx.bezierCurveTo(182, 298, 258, 298, 314, 320); // Dorso
      ctx.lineTo(346, 298); // Lobo superior da cauda
      ctx.lineTo(332, 326); // Centro da cauda bifurcada
      ctx.lineTo(346, 354); // Lobo inferior da cauda
      ctx.lineTo(314, 332); // Pedúnculo caudal
      ctx.bezierCurveTo(258, 352, 182, 350, 164, 326); // Ventre
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Olho, Opérculo (guelra), Linha Lateral e Barbilhões (bigodes típicos do Peixe Jaú)
      ctx.fillStyle = gray(0.96);
      ctx.beginPath();
      ctx.arc(184, 321, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = gray(0.92);
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      // Guelra curva
      ctx.arc(198, 326, 14, -0.7, 0.7);
      // Linha lateral até a cauda
      ctx.moveTo(212, 326);
      ctx.lineTo(316, 326);
      ctx.stroke();

      // Barbilhões característicos do Jaú
      ctx.strokeStyle = gray(0.95);
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(167, 324);
      ctx.quadraticCurveTo(148, 312, 142, 300);
      ctx.moveTo(168, 330);
      ctx.quadraticCurveTo(150, 344, 144, 356);
      ctx.stroke();
      ctx.restore();
    } else if (key === 'itapui') {
      // =====================================================================
      // HERÁLDICA OFICIAL DE ITAPUÍ (ANTIGA "BICA DE PEDRA" - 11/09/1913)
      // 1) Chefe: Sol Radiante do Progresso ladeado por 2 Estrelas
      // 2) Centro: A "Bica de Pedra" (Rocha jorrando fonte de água em cascata)
      // 3) Base: Águas Onduladas do Rio Tietê (Prainha & Hidrovia)
      // =====================================================================

      // Divisas horizontais do escudo
      ctx.fillStyle = gray(0.92);
      ctx.fillRect(130, 198, 252, 7);
      ctx.fillRect(130, 298, 252, 7);

      // --- CAMPO 1 (TOPO): SOL NASCENTE RADIANTE + 2 ESTRELAS DE 5 PONTAS ---
      ctx.strokeStyle = gray(0.92);
      ctx.lineWidth = 3.8;
      for (let a = 0; a < 12; a++) {
        const rad = (a * Math.PI) / 6;
        ctx.beginPath();
        ctx.moveTo(256 + Math.cos(rad) * 18, 158 + Math.sin(rad) * 18);
        ctx.lineTo(256 + Math.cos(rad) * 34, 158 + Math.sin(rad) * 34);
        ctx.stroke();
      }
      ctx.fillStyle = gray(0.18);
      ctx.strokeStyle = gray(0.95);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(256, 158, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 2 Estrelas heráldicas laterais (178, 158) e (334, 158)
      const drawStar = (sx, sy, rOut, rIn) => {
        ctx.fillStyle = gray(0.18);
        ctx.strokeStyle = gray(0.95);
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? rOut : rIn;
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          const px = sx + Math.cos(a) * r;
          const py = sy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };
      drawStar(178, 158, 18, 8);
      drawStar(334, 158, 18, 8);

      // --- CAMPO 2 (CENTRO): A "BICA DE PEDRA" JORRANDO ÁGUA EM CASCATA (TOPÔNIMO ITAPUÍ) ---
      // Rochas escalonadas à esquerda/centro (Itá = Pedra)
      const rocks = [
        [142, 258, 62, 40],
        [152, 228, 54, 34],
        [188, 244, 52, 52],
        [168, 210, 48, 28]
      ];
      rocks.forEach(([rx, ry, rw, rh]) => {
        ctx.fillStyle = gray(0.24);
        ctx.strokeStyle = gray(0.94);
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(rx, ry, rw, rh, 8);
        ctx.fill();
        ctx.stroke();
      });

      // Calha da Bica de Pedra projetada da rocha
      ctx.fillStyle = gray(0.16);
      ctx.strokeStyle = gray(0.96);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(216, 232, 42, 14, 4);
      ctx.fill();
      ctx.stroke();

      // Jato d'Água jorrando da Bica de Pedra em cascata até o Rio Tietê
      [0, 1, 2].forEach((s) => {
        ctx.strokeStyle = s === 1 ? gray(0.18) : gray(0.94);
        ctx.lineWidth = s === 1 ? 8 : 4;
        ctx.beginPath();
        ctx.moveTo(254, 239 + s * 2);
        ctx.quadraticCurveTo(296 + s * 6, 242, 304 + s * 5, 296);
        ctx.stroke();
      });

      // Espuma / bacia da fonte na base da cascata
      [288, 304, 320].forEach((bx, bi) => {
        ctx.fillStyle = gray(0.22);
        ctx.strokeStyle = gray(0.92);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(bx, 292 - (bi % 2) * 5, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Colina / Palmeira da Prainha à direita
      ctx.strokeStyle = gray(0.92);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(346, 296);
      ctx.quadraticCurveTo(342, 260, 348, 234);
      ctx.stroke();
      [-22, -10, 12, 24].forEach((dx) => {
        ctx.beginPath();
        ctx.moveTo(348, 234);
        ctx.quadraticCurveTo(348 + dx * 0.6, 222, 348 + dx, 242);
        ctx.stroke();
      });

      // --- CAMPO 3 (INFERIOR): AS ONDAS DO RIO TIETÊ ---
      [318, 342, 366].forEach((wy) => {
        ctx.strokeStyle = gray(0.94);
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(130, wy);
        for (let wx = 130; wx <= 382; wx += 42) {
          ctx.quadraticCurveTo(wx + 10.5, wy - 9, wx + 21, wy);
          ctx.quadraticCurveTo(wx + 31.5, wy + 9, wx + 42, wy);
        }
        ctx.stroke();

        ctx.strokeStyle = gray(0.20);
        ctx.lineWidth = 4;
        ctx.stroke();
      });
    } else if (key === 'bauru') {
      // =====================================================================
      // BRASÃO OFICIAL DO MUNICÍPIO DE BAURU (1929 / Lei Municipal nº 3.393/1991)
      // - Chefe Superior: As 3 Estrelas de 5 Pontas (Entroncamento das 3 Ferrovias:
      //   Noroeste do Brasil, Companhia Paulista e Sorocabana)
      // - Campo Central: A Onça Suçuarana (Puma concolor) Passante sobre colina
      //   ("Sentinela do Sertão Paulista" — Custos Vigilat)
      // - Campanha Inferior: Trilhos Ferroviários & Ondas do Rio Bauru / Batalha
      // =====================================================================

      // Divisórias horizontais em baixo-relevo (Chefe y=184 e Campanha y=312)
      ctx.strokeStyle = gray(0.92);
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.moveTo(126, 184);
      ctx.lineTo(386, 184);
      ctx.moveTo(130, 312);
      ctx.lineTo(382, 312);
      ctx.stroke();

      // --- CHEFE SUPERIOR: AS 3 ESTRELAS DAS FERROVIAS HISTÓRICAS ---
      const drawFivePointStar = (cx, cy, outerR, innerR) => {
        ctx.fillStyle = gray(0.20);
        ctx.strokeStyle = gray(0.96);
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const ang = -Math.PI / 2 + (i * Math.PI) / 5;
          const sx = cx + Math.cos(ang) * r;
          const sy = cy + Math.sin(ang) * r;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Faceta central piramidal da estrela em baixo-relevo
        ctx.fillStyle = gray(0.88);
        ctx.beginPath();
        ctx.arc(cx, cy, 4.2, 0, Math.PI * 2);
        ctx.fill();
      };

      // Linhas de entroncamento ligando as 3 estrelas (Noroeste • Paulista • Sorocabana)
      ctx.strokeStyle = gray(0.78);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(156, 148);
      ctx.lineTo(356, 148);
      ctx.stroke();

      drawFivePointStar(184, 148, 22, 9.5);
      drawFivePointStar(256, 145, 25, 10.8);
      drawFivePointStar(328, 148, 22, 9.5);

      // --- CAMPO CENTRAL: A SUÇUARANA / ONÇA-PARDA PASSANTE (SENTINELA DO SERTÃO) ---
      // Terrado / colina sertaneja na base do campo central
      ctx.fillStyle = gray(0.56);
      ctx.strokeStyle = gray(0.92);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(132, 310);
      ctx.quadraticCurveTo(256, 286, 380, 310);
      ctx.lineTo(380, 312);
      ctx.lineTo(132, 312);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Silhueta heráldica muscular da Onça Suçuarana Passante (voltada à destra heráldica / esquerda)
      ctx.fillStyle = gray(0.22);
      ctx.strokeStyle = gray(0.96);
      ctx.lineWidth = 5;

      // Cauda longa curvada em S (típica da Suçuarana)
      ctx.beginPath();
      ctx.moveTo(314, 240);
      ctx.bezierCurveTo(348, 232, 364, 202, 348, 196);
      ctx.bezierCurveTo(338, 194, 344, 220, 314, 248);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pata dianteira esquerda levantada em marcha (passante) e pata traseira direita
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      // Pata dianteira erguida (vigilante)
      ctx.moveTo(208, 254);
      ctx.lineTo(176, 266);
      ctx.lineTo(168, 278);
      // Pata dianteira de apoio no solo
      ctx.moveTo(222, 258);
      ctx.lineTo(214, 298);
      // Pata traseira avançada
      ctx.moveTo(294, 256);
      ctx.lineTo(278, 298);
      // Pata traseira recuada
      ctx.moveTo(308, 252);
      ctx.lineTo(322, 298);
      ctx.stroke();

      // Corpo felino esguio e musculoso (tronco + peito + pescoço + cabeça da Suçuarana)
      ctx.lineWidth = 5;
      ctx.beginPath();
      // Topo da cabeça e orelha arredondada
      ctx.moveTo(178, 212);
      ctx.quadraticCurveTo(188, 200, 198, 206);
      ctx.quadraticCurveTo(206, 198, 212, 210);
      // Nuca, cernelha e dorso arqueado até a garupa
      ctx.bezierCurveTo(224, 220, 244, 228, 276, 226);
      ctx.bezierCurveTo(302, 224, 320, 232, 318, 250);
      // Ventre esguio e tórax forte
      ctx.bezierCurveTo(294, 264, 252, 260, 218, 264);
      ctx.bezierCurveTo(200, 264, 192, 246, 192, 234);
      // Mandíbula e focinho felino alerta
      ctx.lineTo(174, 232);
      ctx.quadraticCurveTo(166, 224, 178, 212);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Detalhes anatômicos internos (olho vigilante e relevo muscular)
      ctx.fillStyle = gray(0.96);
      ctx.beginPath();
      ctx.arc(186, 218, 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = gray(0.84);
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(218, 244, 12, -0.6, 1.4);
      ctx.moveTo(256, 236);
      ctx.quadraticCurveTo(268, 246, 292, 242);
      ctx.stroke();

      // --- CAMPANHA INFERIOR: DORMENTES FERROVIÁRIOS & ONDAS DO RIO BAURU ---
      // Linha férrea simbólica (entroncamento ferroviário) no topo da campanha
      ctx.strokeStyle = gray(0.92);
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(138, 326);
      ctx.lineTo(374, 326);
      for (let tx = 152; tx <= 360; tx += 26) {
        ctx.moveTo(tx, 320);
        ctx.lineTo(tx, 332);
      }
      ctx.stroke();

      // Duas faixas de ondas do Rio Bauru / Rio Batalha na ponta do escudo
      [348, 370].forEach((wy) => {
        ctx.strokeStyle = gray(0.94);
        ctx.lineWidth = 8.5;
        ctx.beginPath();
        ctx.moveTo(140, wy);
        for (let wx = 140; wx <= 372; wx += 42) {
          ctx.quadraticCurveTo(wx + 10.5, wy - 8, wx + 21, wy);
          ctx.quadraticCurveTo(wx + 31.5, wy + 8, wx + 42, wy);
        }
        ctx.stroke();

        ctx.strokeStyle = gray(0.20);
        ctx.lineWidth = 3.8;
        ctx.stroke();
      });
    }

    ctx.restore();

    // Re-traça a borda do escudo por cima para acabamento chanfrado impecável
    shieldPath();
    ctx.lineWidth = 14;
    ctx.strokeStyle = gray(0.94);
    ctx.stroke();
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = gray(0.22);
    ctx.stroke();

    // -----------------------------------------------------------------------
    // 4. LISTEL / FAIXA HERÁLDICA INFERIOR COM INSCRIÇÃO EM BAIXO-RELEVO
    // -----------------------------------------------------------------------
    // Pontas dobradas do listel (esquerda e direita)
    const drawRibbonEnd = (isRight) => {
      ctx.save();
      if (isRight) {
        ctx.translate(W, 0);
        ctx.scale(-1, 1);
      }
      ctx.fillStyle = gray(0.68);
      ctx.strokeStyle = gray(0.95);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(112, 428);
      ctx.lineTo(58, 438);
      ctx.lineTo(74, 458);
      ctx.lineTo(58, 478);
      ctx.lineTo(118, 470);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };
    drawRibbonEnd(false);
    drawRibbonEnd(true);

    // Corpo central do listel curvado
    ctx.fillStyle = gray(0.46);
    ctx.strokeStyle = gray(0.95);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(98, 420);
    ctx.quadraticCurveTo(256, 438, 414, 420);
    ctx.lineTo(406, 472);
    ctx.quadraticCurveTo(256, 490, 106, 472);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Filete interno do listel
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = gray(0.22);
    ctx.stroke();

    // Texto oficial gravado em baixo-relevo profundo no listel
    ctx.fillStyle = gray(0.98);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = key === 'bauru' ? '900 22px Georgia, serif' : '900 28px Georgia, serif';
    const listelText = key === 'itapui'
      ? '1913 • ITAPUÍ • SP'
      : (key === 'bauru' ? 'CUSTOS VIGILAT • BAURU' : '1853 • JAHU • SP');
    ctx.fillText(listelText, 256, 456);

    // -----------------------------------------------------------------------
    // 5. CONVERSÃO PARA MAPA DE PROFUNDIDADE SUAVIZADO (CHANFRO 45° REALISTA)
    // -----------------------------------------------------------------------
    const imgData = ctx.getImageData(0, 0, W, H).data;
    let rawDepth = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) {
      rawDepth[i] = imgData[i * 4] / 255.0;
    }

    // 2 passadas de suavização 3x3 para criar paredes chanfradas de estampagem metálica
    const smoothPass = (src) => {
      const dst = new Float32Array(W * H);
      for (let y = 1; y < H - 1; y++) {
        const row = y * W;
        for (let x = 1; x < W - 1; x++) {
          const idx = row + x;
          dst[idx] = (
            src[idx] * 4 +
            (src[idx - 1] + src[idx + 1] + src[idx - W] + src[idx + W]) * 2 +
            (src[idx - W - 1] + src[idx - W + 1] + src[idx + W - 1] + src[idx + W + 1])
          ) / 16.0;
        }
      }
      return dst;
    };

    const smoothed = smoothPass(smoothPass(rawDepth));
    if (this.crestDepthCache) {
      this.crestDepthCache[key] = smoothed;
    }
    return smoothed;
  }

  renderDebossedCrestFromDepth(cityKey = 'jau', metalBaseHex = '#8e96a0') {
    if (!this.lowerConsoleCtx || !this.lowerConsoleCanvas) return;
    const W = this.lowerConsoleCanvas.width;
    const H = this.lowerConsoleCanvas.height;
    const depth = this.buildCityCrestDepthMap(cityKey);

    const { r: baseR, g: baseG, b: baseB } = this.hexToRgbObj(metalBaseHex);
    const lctx = this.lowerConsoleCtx;
    const outImg = lctx.createImageData(W, H);
    const out = outImg.data;

    const bctx = this.lowerBumpCtx;
    const bumpImg = bctx ? bctx.createImageData(W, H) : null;
    const bumpOut = bumpImg ? bumpImg.data : null;

    // Direção da luz principal de estúdio (topo-esquerda) para sombreamento de baixo-relevo (deboss)
    const lx = -0.66;
    const ly = -0.75;

    for (let y = 3; y < H - 2; y++) {
      const row = y * W;
      // Micro-textura horizontal de aço escovado dentro da cavidade
      const grain = Math.sin(y * 1.85) * 6.5 + Math.cos(y * 0.7) * 3.0;

      for (let x = 3; x < W - 2; x++) {
        const idx = row + x;
        const d = depth[idx];

        // Gradiente local (inclinação das paredes do baixo-relevo)
        const gx = (depth[idx + 2] - depth[idx - 2]) * 0.5;
        const gy = (depth[idx + W * 2] - depth[idx - W * 2]) * 0.5;
        const gradMag = Math.hypot(gx, gy);

        const p = idx * 4;

        // Mapa de Relevo 3D (BumpMap: 255 = superfície plana, 0 = fundo entalhado)
        if (bumpOut) {
          const bVal = Math.max(0, Math.min(255, Math.round((1.0 - d) * 255)));
          bumpOut[p] = bVal;
          bumpOut[p + 1] = bVal;
          bumpOut[p + 2] = bVal;
          bumpOut[p + 3] = 255;
        }

        if (d < 0.012 && gradMag < 0.012) {
          // Fora do brasão: 100% transparente para fundir sem costura na chapa frontal do totem
          out[p + 3] = 0;
          continue;
        }

        // Sombra projetada interna da borda superior-esquerda para dentro da cavidade (efeito baixo-relevo real)
        const dUpLeft = depth[(y - 3) * W + (x - 2)];
        const cavityDropShadow = Math.max(0, d - dUpLeft) * 115;

        // Iluminação nas paredes chanfradas:
        // Quando gx>0 ou gy>0 (descendo na cavidade pelo topo/esquerda) => parede em sombra escura
        // Quando gx<0 ou gy<0 (subindo da cavidade pelo fundo/direita) => quina inferior brilha (specular bevel)
        const bevelTerm = (gx * lx + gy * ly) * 255 * 2.35;

        // Escurecimento natural do fundo rebaixado da chapa estampada
        const recessDarken = d * 64;

        const delta = bevelTerm - recessDarken - cavityDropShadow + grain;

        // Se for brilho especular na quina inferior-direita, puxa suavemente para reflexo metálico claro
        const specBoost = bevelTerm > 18 ? (bevelTerm - 18) * 0.45 : 0;

        const r = Math.max(10, Math.min(255, Math.round(baseR + delta + specBoost)));
        const g = Math.max(12, Math.min(255, Math.round(baseG + delta + specBoost)));
        const b = Math.max(16, Math.min(255, Math.round(baseB + delta + specBoost)));

        // Alpha suave nas bordas externas e 100% sólido dentro do baixo-relevo
        const alpha = Math.max(0, Math.min(255, Math.round(Math.max(d * 2.4, gradMag * 5.2) * 255)));

        out[p] = r;
        out[p + 1] = g;
        out[p + 2] = b;
        out[p + 3] = alpha;
      }
    }

    lctx.clearRect(0, 0, W, H);
    lctx.putImageData(outImg, 0, 0);
    if (this.lowerTexture) this.lowerTexture.needsUpdate = true;

    if (bctx && bumpImg) {
      bctx.putImageData(bumpImg, 0, 0);
      if (this.lowerBumpTexture) this.lowerBumpTexture.needsUpdate = true;
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

      const isItapui = this.currentCity === 'itapui';
      const isBauru = this.currentCity === 'bauru';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(140, 180, 440, 54);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(
        isItapui
          ? 'ITAPUÍ CONECTADA • CIDADE INTELIGENTE'
          : (isBauru ? 'BAURU CONECTADA • CIDADE INTELIGENTE' : 'JAÚ CONECTADA • CIDADE INTELIGENTE'),
        w / 2,
        216
      );

      ctx.font = '800 56px sans-serif';
      ctx.fillText('BEM-VINDO A', w / 2, 370);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '800 84px sans-serif';
      ctx.fillText(isItapui ? 'ITAPUÍ / SP' : (isBauru ? 'BAURU / SP' : 'JAÚ / SP'), w / 2, 465);

      ctx.fillStyle = '#e0f2fe';
      ctx.font = '28px sans-serif';
      ctx.fillText(
        isItapui
          ? 'Prainha do Rio Tietê • Festas Tradicionais'
          : (isBauru ? 'Capital Regional • Cidade Sem Limites' : 'Capital Nacional do Calçado Feminino'),
        w / 2,
        540
      );
      ctx.fillText(
        isItapui
          ? 'Festa do Peão • Quermesse • Carnaval • Mapa Local'
          : (isBauru ? 'Mapa Local • Calçadão • Zoo & Botânico • Poupatempo' : 'Mapa Local • Turismo • Comércio • Serviços'),
        w / 2,
        585
      );

      ctx.font = '96px sans-serif';
      ctx.fillText('👆', w / 2, 820);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('TOQUE PARA COMEÇAR', w / 2, 910);

      if (this.screenTexture) this.screenTexture.needsUpdate = true;
      return;
    }

    // 3. Interface Interativa Principal em Fundo Claro (Padrão Gov.br / Suporta Alto Contraste e Modo Baixar Tela)
    const hc = this.isHighContrast;

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

    ctx.save();

    // Se "Baixar Tela" estiver ativo: 1/3 superior fica 100% livre (sem informação) e os 2/3 inferiores recebem toda a tela enxugada/achatada
    if (this.isWheelchair) {
      const topThird = Math.round(h / 3);
      ctx.fillStyle = hc ? '#000000' : '#f8f9fa';
      ctx.fillRect(0, 0, w, topThird);
      ctx.strokeStyle = hc ? '#ffff00' : '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, topThird);
      ctx.lineTo(w, topThird);
      ctx.stroke();

      ctx.translate(0, topThird);
      ctx.scale(1, 2 / 3);
    }

    const wcOffset = 0;

    // 1. Header da Tela Touch (Fundo Claro Institucional - 115px de altura)
    ctx.fillStyle = hc ? '#000000' : '#ffffff';
    ctx.fillRect(0, wcOffset, w, 115);
    ctx.strokeStyle = hc ? '#ffff00' : '#168821';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, wcOffset + 115);
    ctx.lineTo(w, wcOffset + 115);
    ctx.stroke();

    const isItapui = this.currentCity === 'itapui';
    const isBauru = this.currentCity === 'bauru';
    ctx.textAlign = 'left';
    ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
    ctx.font = '800 28px sans-serif';
    ctx.fillText(
      isItapui ? 'PREFEITURA DE ITAPUÍ' : (isBauru ? 'PREFEITURA DE BAURU' : 'PREFEITURA DE JAÚ'),
      28,
      wcOffset + 48
    );
    ctx.fillStyle = hc ? '#ffff00' : '#1351b4';
    ctx.font = 'bold 19px sans-serif';
    ctx.fillText(
      isItapui
        ? 'Praça da Matriz • Terminal de Utilidade Pública'
        : (isBauru ? 'Praça Rui Barbosa • Terminal de Utilidade Pública' : 'Praça da República • Terminal de Utilidade Pública'),
      28,
      wcOffset + 80
    );

    // Relógio Interno RTC e Status Offline no canto direito (sem previsão do tempo ao vivo)
    ctx.textAlign = 'right';
    ctx.fillStyle = hc ? '#ffff00' : '#1351b4';
    ctx.font = '800 34px sans-serif';
    ctx.fillText(timeStr, w - 28, wcOffset + 50);
    ctx.fillStyle = hc ? '#ffff00' : '#168821';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('100% OFFLINE', w - 28, wcOffset + 82);

    const footY = h - 130;
    const bodyY = wcOffset + 128;

    // 2. MENU LATERAL DE ACESSIBILIDADE: 3 BOTÕES NO CANTO SUPERIOR (1º Libras, 2º Contraste, 3º Baixar Tela)
    const sbW = 152;
    const sbH = footY - (wcOffset + 115);
    ctx.fillStyle = hc ? '#000000' : '#0c326f';
    ctx.fillRect(0, wcOffset + 115, sbW, sbH);
    ctx.strokeStyle = hc ? '#ffff00' : '#ffcd07';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sbW, wcOffset + 115);
    ctx.lineTo(sbW, footY);
    ctx.stroke();

    // Tag Superior do Menu Lateral
    ctx.fillStyle = hc ? '#000000' : '#ffcd07';
    ctx.fillRect(10, wcOffset + 124, sbW - 20, 24);
    ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
    ctx.font = '900 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ACESSO', sbW / 2, wcOffset + 140);

    // 3 Botões Principais no canto superior na ordem exata: 1. Libras, 2. Contraste, 3. Baixar Tela (dobro da altura = 220px)
    const mainSideBtns = [
      { id: 'libras', label: 'Libras', active: this.showVLibrasBox },
      { id: 'contrast', label: 'Contraste', active: hc },
      { id: 'wheelchair', label: 'Baixar Tela', active: this.isWheelchair }
    ];

    const squareBtnH = 220;
    const squareBtnGap = 16;

    mainSideBtns.forEach((b, idx) => {
      const by = wcOffset + 160 + idx * (squareBtnH + squareBtnGap);
      const bw = sbW - 20;
      const bh = squareBtnH;
      const bx = 10;

      ctx.fillStyle = b.active ? (hc ? '#ffff00' : '#ffcd07') : (hc ? '#111827' : 'rgba(255,255,255,0.13)');
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = b.active ? (hc ? '#ffff00' : '#d9a400') : 'rgba(255,255,255,0.32)';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);

      const fgColor = b.active ? '#0c326f' : (hc ? '#ffff00' : '#ffffff');
      const iconCX = bx + bw / 2;
      const iconCY = by + bh * 0.43;

      // Desenha ícone vetorial 1:1 sem distorção (compensa a escala vertical quando Baixar Tela está ativo)
      ctx.save();
      ctx.translate(iconCX, iconCY);
      if (this.isWheelchair) {
        ctx.scale(1.25, 1.25 * 1.5);
      } else {
        ctx.scale(1.25, 1.25);
      }
      ctx.strokeStyle = fgColor;
      ctx.fillStyle = fgColor;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (b.id === 'libras') {
        // Mão aberta sinalizando + ondas de Libras (100% proporcional)
        ctx.beginPath();
        ctx.roundRect(-8, -4, 16, 15, 5);
        ctx.stroke();
        [-6, -2, 2, 6].forEach((fx, fi) => {
          const fh = fi === 1 || fi === 2 ? 12 : 9;
          ctx.beginPath();
          ctx.moveTo(fx, -4);
          ctx.lineTo(fx, -4 - fh);
          ctx.stroke();
        });
        ctx.beginPath();
        ctx.moveTo(8, 2);
        ctx.lineTo(13, -3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-9, -8, 6, Math.PI * 1.1, Math.PI * 1.65);
        ctx.stroke();
      } else if (b.id === 'contrast') {
        // Círculo de Alto Contraste meio preenchido (100% circular)
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 13, -Math.PI / 2, Math.PI / 2);
        ctx.closePath();
        ctx.fill();
      } else if (b.id === 'wheelchair') {
        // Cadeirante + Seta de Baixar Tela (100% proporcional)
        ctx.beginPath();
        ctx.arc(-3, -11, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-3, -6);
        ctx.lineTo(-3, 2);
        ctx.lineTo(5, 2);
        ctx.lineTo(8, 9);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-5, 5, 6.5, 0.4, Math.PI * 1.55);
        ctx.stroke();
        // Seta para baixo à direita
        ctx.beginPath();
        ctx.moveTo(12, -10);
        ctx.lineTo(12, 0);
        ctx.moveTo(9, -3);
        ctx.lineTo(12, 0);
        ctx.lineTo(15, -3);
        ctx.stroke();
      }
      ctx.restore();

      ctx.fillStyle = fgColor;
      ctx.font = '800 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, bx + bw / 2, by + bh * 0.68);
    });

    // 2 Botões de Fonte (A+ Maior e A- Normal) fixados no CANTO INFERIOR da barra azul
    const fontH = 34;
    const fontY = footY - fontH - 12;
    const fontW = (sbW - 26) / 2;

    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, fontY - 6);
    ctx.lineTo(sbW - 10, fontY - 6);
    ctx.stroke();

    ctx.fillStyle = hc ? '#111827' : 'rgba(255,255,255,0.13)';
    ctx.fillRect(10, fontY, fontW, fontH);
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(10, fontY, fontW, fontH);
    ctx.fillStyle = hc ? '#ffff00' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '900 11.5px sans-serif';
    ctx.fillText('A+ Maior', 10 + fontW / 2, fontY + 21);

    ctx.fillStyle = hc ? '#111827' : 'rgba(255,255,255,0.13)';
    ctx.fillRect(10 + fontW + 6, fontY, fontW, fontH);
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(10 + fontW + 6, fontY, fontW, fontH);
    ctx.fillStyle = hc ? '#ffff00' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '900 11.5px sans-serif';
    ctx.fillText('A- Normal', 10 + fontW + 6 + fontW / 2, fontY + 21);

    // 3. Conteúdo Central de acordo com a aba selecionada
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

    // 4. INTÉRPRETE DE LIBRAS EM CHROMA KEY (SEM QUADRADO BRANCO / DIRETO SOBRE A TELA)
    if (this.showVLibrasBox) {
      const avX = w - 102;
      const avY = footY - 118;
      const pose = this.librasPose || 0;
      const offsetL = this.isInterpretingLibras ? (pose % 2 === 0 ? -12 : 6) : 0;
      const offsetR = this.isInterpretingLibras ? (pose % 2 === 0 ? 6 : -12) : 0;

      ctx.save();
      ctx.shadowColor = 'rgba(8, 22, 54, 0.45)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;

      // Tronco e Ombros (Camisa Polo Azul Marinho 3D)
      ctx.beginPath();
      ctx.moveTo(avX - 62, footY - 2);
      ctx.quadraticCurveTo(avX - 58, avY + 18, avX - 36, avY + 10);
      ctx.lineTo(avX + 36, avY + 10);
      ctx.quadraticCurveTo(avX + 58, avY + 18, avX + 62, footY - 2);
      ctx.closePath();
      ctx.fillStyle = '#0f3478';
      ctx.fill();

      // Pescoço e Gola
      ctx.fillStyle = '#e7ad89';
      ctx.fillRect(avX - 11, avY - 12, 22, 24);
      ctx.fillStyle = '#133d8a';
      ctx.beginPath();
      ctx.moveTo(avX - 18, avY + 8);
      ctx.lineTo(avX, avY + 26);
      ctx.lineTo(avX + 18, avY + 8);
      ctx.fill();

      // Cabeça Anatômica e Cabelo
      ctx.beginPath();
      ctx.ellipse(avX, avY - 34, 23, 28, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f3be9c';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(avX, avY - 43, 23, Math.PI * 0.92, Math.PI * 2.08);
      ctx.fillStyle = '#2c190e';
      ctx.fill();

      // Olhos, Sobrancelhas e Boca
      ctx.fillStyle = '#1e110a';
      ctx.beginPath();
      ctx.arc(avX - 8, avY - 36, 2.4, 0, Math.PI * 2);
      ctx.arc(avX + 8, avY - 36, 2.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#8c3f38';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (this.isInterpretingLibras) {
        ctx.ellipse(avX, avY - 20, 4.5, 3, 0, 0, Math.PI * 2);
      } else {
        ctx.arc(avX, avY - 22, 5.5, 0.15 * Math.PI, 0.85 * Math.PI);
      }
      ctx.stroke();

      // Braços e Mãos Articuladas (Esquerda e Direita)
      const handLX = avX - 36;
      const handLY = avY + 4 + offsetL;
      ctx.strokeStyle = '#e7ad89';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(avX - 38, avY + 42);
      ctx.lineTo(handLX, handLY);
      ctx.stroke();
      ctx.fillStyle = '#ffe0c8';
      ctx.beginPath();
      ctx.arc(handLX, handLY, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c9845e';
      ctx.lineWidth = 2;
      for (let f = -5; f <= 5; f += 2.5) {
        ctx.beginPath();
        ctx.moveTo(handLX + f, handLY - 5);
        ctx.lineTo(handLX + f, handLY - 15);
        ctx.stroke();
      }

      const handRX = avX + 36;
      const handRY = avY + 4 + offsetR;
      ctx.strokeStyle = '#e7ad89';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(avX + 38, avY + 42);
      ctx.lineTo(handRX, handRY);
      ctx.stroke();
      ctx.fillStyle = '#ffe0c8';
      ctx.beginPath();
      ctx.arc(handRX, handRY, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c9845e';
      ctx.lineWidth = 2;
      for (let f = -5; f <= 5; f += 2.5) {
        ctx.beginPath();
        ctx.moveTo(handRX + f, handRY - 5);
        ctx.lineTo(handRX + f, handRY - 15);
        ctx.stroke();
      }

      // Pílula Flutuante Discreta de Legenda na Base do Intérprete
      const pillW = 168;
      const pillH = 34;
      const pillX = avX - pillW / 2;
      const pillY = footY - pillH - 6;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(pillX, pillY, pillW, pillH);
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(pillX, pillY, pillW, pillH);

      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(pillX + 12, pillY + 11, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#7dd3fc';
      ctx.font = 'bold 8.5px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(this.isInterpretingLibras ? 'SINALIZANDO LIBRAS' : 'LIBRAS AO VIVO', pillX + 20, pillY + 14);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      const sub = this.vlibrasSub || 'Toque em qualquer texto';
      const displaySub = sub.length > 22 ? sub.substring(0, 20) + '...' : sub;
      ctx.fillText(displaySub, avX, pillY + 28);
      ctx.restore();
    }

    ctx.restore();

    if (this.screenTexture) this.screenTexture.needsUpdate = true;
  }

  drawHomeScreen(ctx, w, startY, hc) {
    const offX = 166;
    const contentW = w - offX - 16;

    // Banner Fixo de Localização Offline (sem avisos de internet)
    ctx.fillStyle = hc ? '#000000' : '#fff8e6';
    ctx.fillRect(offX, startY, contentW, 58);
    ctx.strokeStyle = hc ? '#ffff00' : '#d9a400';
    ctx.lineWidth = 2;
    ctx.strokeRect(offX, startY, contentW, 58);
    ctx.textAlign = 'left';
    const isItapui = this.currentCity === 'itapui';
    const isBauru = this.currentCity === 'bauru';
    ctx.fillStyle = hc ? '#ffff00' : '#925400';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(
      isItapui
        ? 'GUIA LOCAL FIXO • PRAÇA DA MATRIZ (CENTRO)'
        : (isBauru ? 'GUIA LOCAL FIXO • PRAÇA RUI BARBOSA (CENTRO)' : 'GUIA LOCAL FIXO • PRAÇA DA REPÚBLICA (CENTRO)'),
      offX + 16,
      startY + 24
    );
    ctx.fillStyle = hc ? '#ffff00' : '#593900';
    ctx.font = '600 14.5px sans-serif';
    ctx.fillText(
      isItapui
        ? 'Informações Fixas Locais • Sistema 100% Offline (Sem Internet)'
        : (isBauru ? 'Informações Fixas Locais • Sistema 100% Offline (Sem Internet)' : 'Informações Fixas Locais • Sistema 100% Offline (Sem Internet)'),
      offX + 16,
      startY + 46
    );

    // Chamada Direta
    ctx.textAlign = 'left';
    ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
    ctx.font = '800 26px sans-serif';
    ctx.fillText('O que você procura agora?', offX + 4, startY + 102);

    // Grade dos 4 Módulos Fixos Locais (Sem horários de ônibus ao vivo)
    const cards = isItapui ? [
      {
        icon: 'MAPA',
        tag: 'DISTÂNCIAS A PÉ',
        title: 'PONTOS DE REFERÊNCIA',
        sub: 'Praça da Matriz, Hospital, Prainha e Balsa',
        action: 'VER 4 PONTOS',
        color: '#1351b4',
        accentBg: '#e8f0fe',
        tagColor: '#0c326f',
        borderColor: '#93c5fd'
      },
      {
        icon: 'LOJAS',
        tag: 'A 2 MIN A PÉ',
        title: 'COMÉRCIO & PRAÇA',
        sub: 'Lojas na Matriz, Prainha e Confecções',
        action: 'VER COMÉRCIO',
        color: '#ea580c',
        accentBg: '#fff7ed',
        tagColor: '#9a3412',
        borderColor: '#fed7aa'
      },
      {
        icon: 'FESTAS',
        tag: 'TRADIÇÕES',
        title: 'TURISMO & FESTAS',
        sub: 'Prainha, Festa do Peão, Quermesse e Carnaval',
        action: 'VER EVENTOS',
        color: '#168821',
        accentBg: '#f0fdf4',
        tagColor: '#14532d',
        borderColor: '#bbf7d0'
      },
      {
        icon: '156',
        tag: 'NO CELULAR',
        title: 'OUVIDORIA & SAÚDE',
        sub: 'Paço Municipal e Hospital São José',
        action: 'ABRIR SERVIÇOS',
        color: '#d97706',
        accentBg: '#fffbeb',
        tagColor: '#78350f',
        borderColor: '#fde68a'
      }
    ] : (isBauru ? [
      {
        icon: 'MAPA',
        tag: 'DISTÂNCIAS A PÉ',
        title: 'PONTOS DE REFERÊNCIA',
        sub: 'Calçadão, Poupatempo, Saúde e Rodoviária',
        action: 'VER 4 PONTOS',
        color: '#1351b4',
        accentBg: '#e8f0fe',
        tagColor: '#0c326f',
        borderColor: '#93c5fd'
      },
      {
        icon: 'LOJAS',
        tag: 'AO LADO',
        title: 'CALÇADÃO & COMÉRCIO',
        sub: 'Batista de Carvalho, Shoppings e Sanduíche Bauru',
        action: 'VER POLOS',
        color: '#ea580c',
        accentBg: '#fff7ed',
        tagColor: '#9a3412',
        borderColor: '#fed7aa'
      },
      {
        icon: 'LAZER',
        tag: 'ZOO & PARQUES',
        title: 'TURISMO E CULTURA',
        sub: 'Zoo de Bauru, Jardim Botânico e Vitória Régia',
        action: 'VER ATRAÇÕES',
        color: '#168821',
        accentBg: '#f0fdf4',
        tagColor: '#14532d',
        borderColor: '#bbf7d0'
      },
      {
        icon: '156',
        tag: 'POUPATEMPO',
        title: 'SERVIÇOS & SAÚDE 24H',
        sub: 'Palácio das Cerejeiras, DAE, Poupatempo e UPAs',
        action: 'ABRIR SERVIÇOS',
        color: '#d97706',
        accentBg: '#fffbeb',
        tagColor: '#78350f',
        borderColor: '#fde68a'
      }
    ] : [
      {
        icon: 'MAPA',
        tag: 'DISTÂNCIAS A PÉ',
        title: 'PONTOS DE REFERÊNCIA',
        sub: 'Rodoviária, Centro, Praças e Saúde 24h',
        action: 'VER 4 PONTOS',
        color: '#1351b4',
        accentBg: '#e8f0fe',
        tagColor: '#0c326f',
        borderColor: '#93c5fd'
      },
      {
        icon: 'LOJAS',
        tag: 'A 3 MIN A PÉ',
        title: 'POLO DO CALÇADO',
        sub: 'Rua Major Prado, Shopping e fábricas',
        action: 'COMO CHEGAR',
        color: '#ea580c',
        accentBg: '#fff7ed',
        tagColor: '#9a3412',
        borderColor: '#fed7aa'
      },
      {
        icon: 'LAZER',
        tag: 'LAZER GRÁTIS',
        title: 'TURISMO E PARQUES',
        sub: 'Matriz a 150m, Parque do Rio Jaú e Teatro',
        action: 'VER LOCAIS',
        color: '#168821',
        accentBg: '#f0fdf4',
        tagColor: '#14532d',
        borderColor: '#bbf7d0'
      },
      {
        icon: '156',
        tag: 'NO CELULAR',
        title: 'OUVIDORIA E SERVIÇOS',
        sub: 'Ouvidoria 156, Farmácia 24h e Emergência',
        action: 'ABRIR SERVIÇOS',
        color: '#d97706',
        accentBg: '#fffbeb',
        tagColor: '#78350f',
        borderColor: '#fde68a'
      }
    ]);

    const cw = Math.floor((contentW - 14) / 2);
    cards.forEach((c, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cx = offX + col * (cw + 14);
      const cy = startY + 124 + row * 256;
      const ch = 240;

      // Card Background
      ctx.fillStyle = hc ? '#000000' : '#ffffff';
      ctx.fillRect(cx, cy, cw, ch);

      ctx.strokeStyle = hc ? '#ffff00' : c.borderColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(cx, cy, cw, ch);

      // Barra lateral esquerda
      ctx.fillStyle = hc ? '#ffff00' : c.color;
      ctx.fillRect(cx, cy, 8, ch);

      // Box do ícone
      ctx.fillStyle = hc ? '#000000' : c.accentBg;
      ctx.fillRect(cx + 16, cy + 16, 56, 46);
      ctx.strokeStyle = hc ? '#ffff00' : c.borderColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx + 16, cy + 16, 56, 46);
      ctx.textAlign = 'center';
      ctx.fillStyle = hc ? '#ffff00' : c.color;
      ctx.font = '900 12px sans-serif';
      ctx.fillText(c.icon, cx + 44, cy + 44);

      // Tag Fixa
      ctx.fillStyle = hc ? '#000000' : c.accentBg;
      ctx.fillRect(cx + cw - 142, cy + 18, 128, 26);
      ctx.strokeStyle = hc ? '#ffff00' : c.borderColor;
      ctx.strokeRect(cx + cw - 142, cy + 18, 128, 26);
      ctx.fillStyle = hc ? '#ffff00' : c.tagColor;
      ctx.font = '800 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.tag, cx + cw - 78, cy + 36);

      // Título do Card
      ctx.textAlign = 'left';
      ctx.fillStyle = hc ? '#ffff00' : c.tagColor;
      ctx.font = '800 19px sans-serif';
      ctx.fillText(c.title, cx + 16, cy + 98);

      // Subtítulo curto
      ctx.fillStyle = hc ? '#ffff00' : '#475569';
      ctx.font = '600 14px sans-serif';
      ctx.fillText(c.sub, cx + 16, cy + 126, cw - 32);

      // Linha divisória
      ctx.strokeStyle = hc ? '#ffff00' : 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx + 16, cy + 180);
      ctx.lineTo(cx + cw - 16, cy + 180);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ação inferior
      ctx.fillStyle = hc ? '#ffff00' : c.color;
      ctx.font = '800 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(c.action, cx + 16, cy + 210);

      // Círculo com seta
      ctx.beginPath();
      ctx.arc(cx + cw - 30, cy + 206, 14, 0, Math.PI * 2);
      ctx.fillStyle = hc ? '#ffff00' : c.color;
      ctx.fill();
      ctx.fillStyle = hc ? '#000000' : '#ffffff';
      ctx.font = '800 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('➔', cx + cw - 30, cy + 211);
    });

    // Faixa de Acesso Rápido de 1 Toque
    const qY = startY + 650;
    ctx.fillStyle = hc ? '#000000' : '#ffffff';
    ctx.fillRect(offX, qY, contentW, 48);
    ctx.strokeStyle = hc ? '#ffff00' : '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(offX, qY, contentW, 48);
    ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAMU 192   •   Guarda 153   •   Ouvidoria 156   •   Farmácia 24h', offX + contentW / 2, qY + 30);
  }

  drawBusScreen(ctx, w, startY, hc) {
    const offX = 166;
    const cw = w - offX - 16;
    const isItapui = this.currentCity === 'itapui';
    const isBauru = this.currentCity === 'bauru';
    ctx.textAlign = 'left';
    ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
    ctx.font = '800 25px sans-serif';
    ctx.fillText(
      isItapui
        ? 'MAPA LOCAL & PONTOS DE REFERÊNCIA (ITAPUÍ)'
        : (isBauru ? 'MAPA LOCAL & PONTOS DE REFERÊNCIA (BAURU)' : 'MAPA LOCAL & PONTOS DE REFERÊNCIA (JAÚ)'),
      offX,
      startY + 40
    );

    const lines = isItapui ? [
      { badge: '0m • AQUI', name: 'Praça da Matriz (Jardim das Topiarias)', stop: '📍 Você está aqui • Centro Histórico', dist: 'Neste Ponto', color: '#168821' },
      { badge: '300m • 4m', name: 'Hospital São José & Paço Municipal', stop: '📍 Rua Santo Antônio, 285 — Centro', dist: '4 min a pé', color: '#168821' },
      { badge: '2,5 km', name: 'Prainha Municipal do Rio Tietê', stop: '📍 Orla do Rio Tietê — Av. Beira-Rio', dist: '5 min carro', color: '#168821' },
      { badge: '3,0 km', name: 'Porto da Balsa & Rodoviária Municipal', stop: '📍 Acesso Rodovia SP-225 e Rio Tietê', dist: '6 min carro', color: '#d97706' }
    ] : (isBauru ? [
      { badge: '0m • AQUI', name: 'Praça Rui Barbosa & Calçadão Central', stop: '📍 Você está aqui • Centro de Bauru', dist: 'Neste Ponto', color: '#168821' },
      { badge: '450m • 6m', name: 'Pronto-Socorro Central & Poupatempo', stop: '📍 Rua Rubens Arruda / Av. Nações Unidas', dist: '6 min a pé', color: '#168821' },
      { badge: '1,5 km', name: 'Terminal Rodoviário Municipal de Bauru', stop: '📍 Praça João Paulo II, 30 — Centro', dist: '18 min a pé', color: '#d97706' },
      { badge: '2,4 km', name: 'Parque Vitória Régia & Prefeitura', stop: '📍 Av. Nações Unidas, Quadra 25', dist: '6 min carro', color: '#168821' }
    ] : [
      { badge: '0m • AQUI', name: 'Praça da República (Jardim de Baixo)', stop: '📍 Você está aqui • Centro Histórico', dist: 'Neste Ponto', color: '#168821' },
      { badge: '150m • 2m', name: 'Praça da Matriz (N. Sra. do Patrocínio)', stop: '📍 Subindo a Rua Edgard Ferraz (Centro)', dist: '2 min a pé', color: '#168821' },
      { badge: '650m • 8m', name: 'Santa Casa & Farmácia Municipal 24h', stop: '📍 Rua Riachuelo, 480 — Centro', dist: '8 min a pé', color: '#168821' },
      { badge: '1,2 km', name: 'Terminal Rodoviário Municipal de Jaú', stop: '📍 Rua Quintino Bocaiúva, s/n — Centro', dist: '15 min a pé', color: '#d97706' }
    ]);

    lines.forEach((l, i) => {
      const ly = startY + 70 + i * 155;
      ctx.fillStyle = hc ? '#000000' : '#ffffff';
      ctx.fillRect(offX, ly, cw, 138);
      ctx.strokeStyle = hc ? '#ffff00' : '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(offX, ly, cw, 138);

      ctx.fillStyle = hc ? '#000000' : '#0c326f';
      ctx.fillRect(offX + 14, ly + 26, 112, 86);
      ctx.fillStyle = hc ? '#ffff00' : '#ffffff';
      ctx.font = '800 17px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(l.badge, offX + 70, ly + 75);

      ctx.textAlign = 'left';
      ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
      ctx.font = 'bold 21px sans-serif';
      ctx.fillText(l.name, offX + 142, ly + 44);

      ctx.fillStyle = hc ? '#ffff00' : '#334155';
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText(l.stop, offX + 142, ly + 74);

      ctx.fillStyle = hc ? '#ffff00' : l.color;
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`● Distância: ${l.dist}  •  Escaneie o QR do Mapa ➔`, offX + 142, ly + 106);

      // Mini QR Code visual no lado direito do card indicando onde é o ponto
      const qrSize = 86;
      const qrX = offX + cw - qrSize - 16;
      const qrY = ly + 26;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX, qrY, qrSize, qrSize);
      ctx.strokeStyle = '#0c326f';
      ctx.lineWidth = 2;
      ctx.strokeRect(qrX, qrY, qrSize, qrSize);

      // Cantos de posicionamento do QR Code
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(qrX + 8, qrY + 8, 20, 20);
      ctx.fillRect(qrX + qrSize - 28, qrY + 8, 20, 20);
      ctx.fillRect(qrX + 8, qrY + qrSize - 28, 20, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX + 12, qrY + 12, 12, 12);
      ctx.fillRect(qrX + qrSize - 24, qrY + 12, 12, 12);
      ctx.fillRect(qrX + 12, qrY + qrSize - 24, 12, 12);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(qrX + 15, qrY + 15, 6, 6);
      ctx.fillRect(qrX + qrSize - 21, qrY + 15, 6, 6);
      ctx.fillRect(qrX + 15, qrY + qrSize - 21, 6, 6);
      // Módulos internos do QR Code
      ctx.fillRect(qrX + 34, qrY + 12, 8, 8);
      ctx.fillRect(qrX + 46, qrY + 20, 8, 12);
      ctx.fillRect(qrX + 34, qrY + 36, 16, 8);
      ctx.fillRect(qrX + 14, qrY + 36, 12, 8);
      ctx.fillRect(qrX + 56, qrY + 40, 18, 8);
      ctx.fillRect(qrX + 36, qrY + 52, 10, 16);
      ctx.fillRect(qrX + 54, qrY + 58, 16, 14);
    });
  }

  drawShoesScreen(ctx, w, startY, hc) {
    const offX = 166;
    const cw = w - offX - 16;
    const isItapui = this.currentCity === 'itapui';
    const isBauru = this.currentCity === 'bauru';
    ctx.textAlign = 'left';
    ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
    ctx.font = '800 28px sans-serif';
    ctx.fillText(
      isItapui
        ? 'COMÉRCIO, GASTRONOMIA E INDÚSTRIA'
        : (isBauru ? 'COMÉRCIO, SHOPPINGS E GASTRONOMIA DE BAURU' : 'CIRCUITO DO CALÇADO FEMININO'),
      offX,
      startY + 40
    );

    const stores = isItapui ? [
      { title: 'Comércio da Praça da Matriz', addr: 'Lojas, bancos e vestuário em torno da praça (1 min a pé)' },
      { title: 'Polo Gastronômico da Prainha', addr: 'Quiosques, peixarias e lazer na beira do Tietê' },
      { title: 'Polo de Confecções & Agroindústria', addr: 'Fábricas de confecção e indústrias locais (SP-225)' }
    ] : (isBauru ? [
      { title: 'Calçadão da Rua Batista de Carvalho', addr: 'Quadras 1 a 7 (ao lado da Praça Rui Barbosa) • +300 lojas' },
      { title: 'Bauru Shopping & Boulevard Shopping', addr: 'Polos regionais de compras, cinema e gastronomia' },
      { title: 'Rota do Sanduíche Bauru Original', addr: 'Patrimônio Imaterial • Rosbife, queijo derretido no banho-maria' }
    ] : [
      { title: 'Shopping Território do Calçado', addr: 'Av. Hermínio Pires de Oliveira Netto, 400 (+150 lojas)' },
      { title: 'Polo Comercial Rua Major Prado', addr: 'Centro Histórico de Jaú • Lojas e Calçados' },
      { title: 'Espaço Noivas & Calçados de Festa', addr: 'Rua Amaral Gurgel, 210 • Sob Medida' }
    ]);

    stores.forEach((s, i) => {
      const sy = startY + 75 + i * 195;
      ctx.fillStyle = hc ? '#000000' : '#ffffff';
      ctx.fillRect(offX, sy, cw, 175);
      ctx.strokeStyle = hc ? '#ffff00' : '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.strokeRect(offX, sy, cw, 175);

      ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
      ctx.font = '800 24px sans-serif';
      ctx.fillText(s.title, offX + 20, sy + 55);

      ctx.fillStyle = hc ? '#ffff00' : '#475569';
      ctx.font = '19px sans-serif';
      ctx.fillText(s.addr, offX + 20, sy + 98);

      ctx.fillStyle = hc ? '#ffff00' : '#1351b4';
      ctx.fillRect(offX + 20, sy + 118, 260, 38);
      ctx.fillStyle = hc ? '#000000' : '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('ROTA VIA QR CODE', offX + 45, sy + 144);
    });
  }

  drawTourismScreen(ctx, w, startY, hc) {
    const offX = 166;
    const cw = w - offX - 16;
    const isItapui = this.currentCity === 'itapui';
    const isBauru = this.currentCity === 'bauru';
    ctx.textAlign = 'left';
    ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
    ctx.font = '800 28px sans-serif';
    ctx.fillText(
      isItapui
        ? 'TURISMO, LAZER E FESTAS TRADICIONAIS'
        : (isBauru ? 'TURISMO, CULTURA E PARQUES EM BAURU' : 'TURISMO, CULTURA E LAZER EM JAÚ'),
      offX,
      startY + 40
    );

    const spots = isItapui ? [
      { title: 'Prainha Municipal de Itapuí (Rio Tietê)', desc: 'Banhos, quiosques, pesca e esportes náuticos' },
      { title: 'Praça da Matriz ("Jardim das Topiarias")', desc: 'Árvores esculpidas, coreto e Paróquia Santo Antônio' },
      { title: 'Festa do Peão de Itapuí (Evento Tradicional)', desc: 'Tradicional rodeio com montarias em touros e grandes shows' },
      { title: 'Quermesse da Paróquia Santo Antônio', desc: 'Festa tradicional do padroeiro em junho com comidas típicas' },
      { title: 'Carnaval de Rua de Itapuí (Tradição Popular)', desc: 'Famoso carnaval popular com blocos e matinês familiares' }
    ] : (isBauru ? [
      { title: 'Parque Zoológico Municipal de Bauru', desc: 'Referência nacional em conservação e lazer • Rod. SP-300' },
      { title: 'Jardim Botânico Municipal de Bauru', desc: 'Trilhas ecológicas, orquidário e mata nativa do Cerrado' },
      { title: 'Parque Vitória Régia & Museu Ferroviário', desc: 'Cartão-postal na Av. Nações Unidas e história das 3 Ferrovias' }
    ] : [
      { title: 'Parque Municipal do Rio Jaú', desc: 'Caminhada, lago, quadras e lazer • 06h às 21h' },
      { title: 'Igreja Matriz N. Sra. do Patrocínio', desc: 'Patrimônio histórico neogótico na Praça da República' },
      { title: 'Teatro Municipal Elza Munerato', desc: 'Espetáculos, cultura e eventos gratuitos' }
    ]);

    spots.forEach((sp, i) => {
      const sy = startY + 75 + i * 195;
      ctx.fillStyle = hc ? '#000000' : '#ffffff';
      ctx.fillRect(offX, sy, cw, 175);
      ctx.strokeStyle = hc ? '#ffff00' : '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.strokeRect(offX, sy, cw, 175);

      ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
      ctx.font = '800 24px sans-serif';
      ctx.fillText(sp.title, offX + 20, sy + 55);

      ctx.fillStyle = hc ? '#ffff00' : '#475569';
      ctx.font = '19px sans-serif';
      ctx.fillText(sp.desc, offX + 20, sy + 100);

      ctx.fillStyle = hc ? '#ffff00' : '#168821';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Escaneie o QR Code para abrir no Google Maps', offX + 20, sy + 146);
    });
  }

  drawServicesScreen(ctx, w, startY, hc) {
    const offX = 166;
    const cw = w - offX - 16;
    const isItapui = this.currentCity === 'itapui';
    const isBauru = this.currentCity === 'bauru';
    ctx.textAlign = 'left';
    ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
    ctx.font = '800 28px sans-serif';
    ctx.fillText('SERVIÇOS PÚBLICOS & EMERGÊNCIA', offX, startY + 40);

    const phones = isItapui ? [
      { num: '192', label: 'SAMU 24h' },
      { num: '193', label: 'BOMBEIROS' },
      { num: '190', label: 'POLÍCIA MILITAR' },
      { num: '3664-8040', label: 'PREFEITURA ITAPUÍ' },
      { num: '3664-1222', label: 'HOSPITAL SÃO JOSÉ' },
      { num: '180', label: 'APOIO À MULHER' }
    ] : (isBauru ? [
      { num: '192', label: 'SAMU REGIONAL 24h' },
      { num: '193', label: 'CORPO DE BOMBEIROS' },
      { num: '156', label: 'OUVIDORIA / PREFEITURA' },
      { num: '0800-7710195', label: 'DAE BAURU (ÁGUA 24H)' },
      { num: '3235-1000', label: 'PALÁCIO CEREJEIRAS' },
      { num: '199', label: 'DEFESA CIVIL BAURU' }
    ] : [
      { num: '192', label: 'SAMU 24h' },
      { num: '193', label: 'BOMBEIROS' },
      { num: '153', label: 'GUARDA MUNICIPAL' },
      { num: '190', label: 'POLÍCIA MILITAR' },
      { num: '199', label: 'DEFESA CIVIL' },
      { num: '180', label: 'APOIO À MULHER' }
    ]);

    const cardW = (cw - 20) / 2;
    phones.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const px = offX + col * (cardW + 20);
      const py = startY + 75 + row * 145;

      ctx.fillStyle = hc ? '#000000' : '#ffffff';
      ctx.fillRect(px, py, cardW, 125);
      ctx.strokeStyle = hc ? '#ffff00' : '#dc2626';
      ctx.lineWidth = 3;
      ctx.strokeRect(px, py, cardW, 125);

      ctx.textAlign = 'center';
      ctx.fillStyle = hc ? '#ffff00' : '#dc2626';
      ctx.font = '800 38px sans-serif';
      ctx.fillText(p.num, px + cardW / 2, py + 58);

      ctx.fillStyle = hc ? '#ffff00' : '#0c326f';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(p.label, px + cardW / 2, py + 98);
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

    this.dimensionGroup.visible = this.showDimensions;
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
        desc: 'Painel monocristalino de 64×21 cm (35 Wp) embutido na parte plana traseira do topo (atrás da quina frontal arredondada). Mantém a bateria LiFePO4 de backup 24h carregada, operando em sistema híbrido com a rede elétrica 220V municipal para a tela 43".',
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
        title: 'Tela-Computador 43" All-in-One Rebaixada ~2,5 cm (IP65)',
        desc: 'A própria tela de 43" (1500 nits) JÁ É O COMPUTADOR (placa-mãe SoC, memória e touch embutidos dentro da espessura fina do próprio visor, sem computador externo). Montada com rebaixo frontal de ~2,5 cm para dentro do chassi para proteger contra sol direto e chuva.',
        pos: new THREE.Vector3(0.28, 1.25, 0.165),
        cam: { theta: 0.0, phi: 1.48, radius: 2.20, targetY: 1.18 }
      },
      {
        id: 'structure',
        num: '4',
        title: 'Chassi Monobloco Selado (Dissipação Passiva IP66)',
        desc: 'Corpo monolítico estanque (0,70m × 2,20m × 0,35m) com nicho frontal rebaixado em 3 cm, sem furos de som e sem aberturas de ar para suportar chuva, sol e poeira no tempo.',
        pos: new THREE.Vector3(-0.36, 1.15, 0.05),
        cam: { theta: -1.52, phi: 1.38, radius: 2.85, targetY: 1.12 }
      },
      {
        id: 'rear',
        num: '5',
        title: 'Porta Traseira Cega & Fechadura Embutida Inox 316',
        desc: 'Porta traseira totalmente lisa e selada com borracha EPDM (dobradiças internas ocultas, sem frestas de ventilação e sem alça saliente), travada por Fechadura Embutida em Aço Inox 316.',
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

    // PONTOS TÉCNICOS ESPECÍFICOS DO HARDWARE INTERNO ULTRA-ENXUTO (1 A 6)
    this.hardwareHotspotsData = [
      {
        id: 'hw-ipc',
        num: '1',
        tag: 'A PRÓPRIA TELA JÁ É O COMPUTADOR • REBAIXO 2,5 CM',
        title: 'Tela-Computador 43" All-in-One (Zero PC Externo)',
        desc: 'Smart Display Industrial 43" (1500 nits) rebaixado 2,5 cm para dentro da face frontal: o processador, memória, armazenamento e controlador touch já vêm integrados dentro da própria placa fina da tela. Elimina 100% o computador externo, a caixa OPS saliente e os cabos HDMI/USB.',
        wires: 'Apenas 1 único cabo de alimentação 12V DC ligado na borda inferior da própria tela.',
        pos: new THREE.Vector3(0.0, 1.20, 0.125),
        cam: { theta: Math.PI + 0.15, phi: 1.38, radius: 1.75, targetY: 1.20 }
      },
      {
        id: 'hw-din',
        num: '2',
        tag: 'PROTEÇÃO ELÉTRICA (TRILHO DIN ÚNICO)',
        title: 'Disjuntor 16A, DPS Anti-Raio 40kA e DR 30mA',
        desc: 'Proteção elétrica obrigatória montada no trilho DIN único inferior: Disjuntor Bipolar 16A, Protetor de Surtos DPS 40kA (contra descargas atmosféricas na praça) e DR 30mA (contra choque elétrico NR-10 / NBR 5410).',
        wires: 'Entrada: Cabos AC 220V subterrâneos. Saída protegida para a Fonte 12V ao lado.',
        pos: new THREE.Vector3(-0.165, 0.74, -0.01),
        cam: { theta: Math.PI - 0.18, phi: 1.42, radius: 1.55, targetY: 0.74 }
      },
      {
        id: 'hw-smps',
        num: '3',
        tag: 'FONTE + GESTÃO SOLAR INTEGRADOS',
        title: 'Fonte Industrial 12V + Controlador Solar MPPT 20A',
        desc: 'Montados lado a lado no mesmo trilho DIN inferior: a Fonte MeanWell converte o 220V da praça em 12V DC seguro para a Tela-Computador, enquanto o Controlador MPPT gerencia a energia limpa que desce da Placa Solar do teto.',
        wires: 'Entrada: 220V AC (Fonte) e Cabo Solar 4mm² do teto (MPPT). Saída: 12V DC único para a Tela 43".',
        pos: new THREE.Vector3(0.08, 0.74, -0.01),
        cam: { theta: Math.PI + 0.18, phi: 1.42, radius: 1.55, targetY: 0.74 }
      },
      {
        id: 'hw-battery',
        num: '4',
        tag: 'EXCLUSIVA P/ A PLACA SOLAR',
        title: 'Bateria Compacta LiFePO4 12,8V (Armazenamento Solar)',
        desc: 'Exatamente como planejado: esta bateria compacta na base fria existe apenas por causa da Placa Solar de 35Wp do topo (para armazenar a carga gerada pelo sol e estabilizar variações de nuvens). Se o totem fosse ligado apenas no 220V sem placa solar, nem esta bateria nem o MPPT seriam necessários.',
        wires: 'Cabos 10mm² ligados diretamente ao Controlador Solar MPPT logo acima.',
        pos: new THREE.Vector3(0.06, 0.27, 0.0),
        cam: { theta: Math.PI, phi: 1.35, radius: 1.65, targetY: 0.30 }
      },
      {
        id: 'hw-grounding',
        num: '5',
        tag: 'SEGURANÇA NR-10',
        title: 'Barramento PE de Aterramento em Cobre',
        desc: 'Aterra a estrutura metálica, a porta traseira e o trilho DIN na haste de cobre da fundação, garantindo segurança absoluta contra choques na praça pública.',
        wires: 'Cabo verde-amarelo 4mm² conectado à haste de aterramento na base.',
        pos: new THREE.Vector3(-0.14, 0.48, 0.0),
        cam: { theta: Math.PI - 0.30, phi: 1.42, radius: 1.65, targetY: 0.48 }
      },
      {
        id: 'hw-cabinet-door',
        num: '6',
        tag: 'VEDAÇÃO AO TEMPO (IP66)',
        title: 'Porta Traseira Selada + Fechadura Inox 316',
        desc: 'Porta traseira 100% cega (sem frestas de ar, sem coolers e sem dobradiças externas expostas), vedada com borracha EPDM e fechadura embutida Inox 316.',
        wires: 'Gabinete 100% fechado com dissipação térmica passiva pelo próprio corpo metálico.',
        pos: new THREE.Vector3(-0.38, 1.15, -0.45),
        cam: { theta: Math.PI + 0.38, phi: 1.36, radius: 2.95, targetY: 1.10 }
      }
    ];

    this.renderHotspotPins();
  }

  renderHotspotPins() {
    const overlayContainer = this.container.querySelector('#totem-3d-hotspots');
    if (!overlayContainer) return;
    overlayContainer.innerHTML = '';
    this.hotspotElements = [];

    const activeList = this.isHardwareMode ? this.hardwareHotspotsData : this.hotspotsData;

    activeList.forEach(h => {
      const btn = document.createElement('button');
      btn.className = 'hotspot-pin' + (this.isHardwareMode ? ' pin-hardware' : '');
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
    const tagEl = document.getElementById('totem-3d-info-tag');
    const wiresBox = document.getElementById('totem-3d-info-wires');
    const wiresText = document.getElementById('totem-3d-info-wires-text');

    if (card && titleEl && descEl) {
      if (tagEl) tagEl.textContent = h.tag || (this.isHardwareMode ? 'ESPECIFICAÇÃO DE HARDWARE' : 'ESPECIFICAÇÃO DO DOSSIÊ TÉCNICO');
      titleEl.textContent = `${h.num}. ${h.title}`;
      descEl.textContent = h.desc;

      if (wiresBox && wiresText) {
        if (h.wires) {
          wiresBox.classList.remove('hidden');
          wiresText.textContent = h.wires;
        } else {
          wiresBox.classList.add('hidden');
        }
      }

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
  // CONTROLES DE ARRASTAR 360° (MOUSE + TOUCH + ZOOM) + DOIS CLIQUES NA PORTA TRASEIRA 3D
  // =========================================================================
  isObjectVisible(obj) {
    let cur = obj;
    while (cur) {
      if (cur.visible === false) return false;
      cur = cur.parent;
    }
    return true;
  }

  isInsideRearDoor(obj) {
    let cur = obj;
    while (cur) {
      if (cur === this.rearDoorHingeGroup) return true;
      cur = cur.parent;
    }
    return false;
  }

  isPointOnRearDoor(clientX, clientY, domElement) {
    if (!this.rearDoorHingeGroup || !this.camera || !domElement) return false;
    if (!this.raycaster) this.raycaster = new THREE.Raycaster();
    if (!this.mouseNDC) this.mouseNDC = new THREE.Vector2();

    const rect = domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;

    this.mouseNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouseNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouseNDC, this.camera);

    // Verifica se o raio acerta alguma peça da porta traseira (chapa, dobradiças, fechadura inox, nervuras)
    const doorHits = this.raycaster.intersectObject(this.rearDoorHingeGroup, true);
    if (!doorHits || doorHits.length === 0) return false;

    const isDoorCurrentlyOpen = Math.abs(this.targetDoorAngle) > 0.1;
    // Se a porta já estiver aberta para fora, qualquer duplo clique direto nela é válido
    if (isDoorCurrentlyOpen) return true;

    // Se a porta estiver fechada, garante que o usuário está olhando pelas costas/lateral (z < 0.05)
    // ou que a porta é o objeto visível mais próximo do clique (não clicando através da tela frontal)
    if (this.camera.position.z < 0.05) return true;

    if (this.totemGroup) {
      const allHits = this.raycaster.intersectObjects(this.totemGroup.children, true);
      const firstVisible = allHits.find(h => this.isObjectVisible(h.object));
      if (firstVisible && this.isInsideRearDoor(firstVisible.object)) {
        return true;
      }
    }
    return false;
  }

  handleRearDoorDoubleClick() {
    const now = performance.now();
    const elapsed = now - (this._lastDoorStateChangeTime || 0);
    if (elapsed < 300) return;

    this._lastDoorStateChangeTime = now;
    const isDoorCurrentlyOpen = Math.abs(this.targetDoorAngle) > 0.1;
    if (isDoorCurrentlyOpen) {
      this.closeRearDoor();
    } else {
      this.openRearDoor(false);
    }
  }

  setupInteractionEvents(domElement) {
    this._pointerDownPos = { x: 0, y: 0 };
    this._pointerMovedDist = 0;
    this._lastDoorStateChangeTime = 0;
    this._lastTouchTapTime = 0;

    domElement.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.isDragging = true;
        this.autoRotate = false;
        const btnAuto = document.getElementById('btn-3d-autorotate');
        if (btnAuto) btnAuto.classList.remove('active');
      } else if (e.button === 2) {
        this.isPanning = true;
      }
      this._pointerDownPos = { x: e.clientX, y: e.clientY };
      this._pointerMovedDist = 0;
      this.prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging && !this.isPanning) {
        // Muda o cursor para mãozinha (pointer) ao passar o mouse sobre a porta traseira
        if (e.target === domElement) {
          const overDoor = this.isPointOnRearDoor(e.clientX, e.clientY, domElement);
          domElement.style.cursor = overDoor ? 'pointer' : 'grab';
        }
        return;
      }
      const dx = e.clientX - this.prevMouse.x;
      const dy = e.clientY - this.prevMouse.y;
      this._pointerMovedDist += Math.hypot(dx, dy);
      this.prevMouse = { x: e.clientX, y: e.clientY };

      if (this.isDragging) {
        domElement.style.cursor = 'grabbing';
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

    // SOMENTE DOIS CLIQUES (dblclick) na porta traseira -> Abre (para fora) ou Fecha a porta
    domElement.addEventListener('dblclick', (e) => {
      if (this.isPointOnRearDoor(e.clientX, e.clientY, domElement)) {
        e.preventDefault();
        this.handleRearDoorDoubleClick();
      }
    });

    domElement.style.touchAction = 'none';
    domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    // Zoom suave no scroll do mouse (sem dar zoom na página do navegador)
    domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.camState.targetRadius = Math.max(1.35, Math.min(6.0, this.camState.targetRadius + e.deltaY * 0.0022));
    }, { passive: false });

    // Suporte Touch (Tablet / Celular / Tela Touch) — trava o zoom da página e faz zoom apenas na câmera 3D
    domElement.addEventListener('touchstart', (e) => {
      if (e.cancelable) e.preventDefault();
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.autoRotate = false;
        this._pointerDownPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this._pointerMovedDist = 0;
        this.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length >= 2) {
        this.isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.pinchStartDist = Math.hypot(dx, dy);
      }
    }, { passive: false });

    domElement.addEventListener('touchmove', (e) => {
      if (e.cancelable) e.preventDefault();
      if (e.touches.length === 1 && this.isDragging) {
        const dx = e.touches[0].clientX - this.prevMouse.x;
        const dy = e.touches[0].clientY - this.prevMouse.y;
        this._pointerMovedDist += Math.hypot(dx, dy);
        this.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.camState.targetTheta -= dx * 0.009;
        this.camState.targetPhi = Math.max(0.18, Math.min(1.62, this.camState.targetPhi - dy * 0.007));
      } else if (e.touches.length >= 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const delta = this.pinchStartDist - dist;
        this.pinchStartDist = dist;
        this.camState.targetRadius = Math.max(1.35, Math.min(6.0, this.camState.targetRadius + delta * 0.008));
      }
    }, { passive: false });

    domElement.addEventListener('touchend', (e) => {
      const wasDragging = this.isDragging;
      const movedDist = this._pointerMovedDist;
      this.isDragging = false;

      // SOMENTE DOIS TOQUES RÁPIDOS (Double-Tap < 360ms) na porta traseira no tablet/celular
      if (wasDragging && movedDist < 12 && e.changedTouches && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const now = performance.now();
        if (this.isPointOnRearDoor(touch.clientX, touch.clientY, domElement)) {
          if (now - (this._lastTouchTapTime || 0) < 360) {
            this._lastTouchTapTime = 0;
            this.handleRearDoorDoubleClick();
          } else {
            this._lastTouchTapTime = now;
          }
        } else {
          this._lastTouchTapTime = 0;
        }
      }
    });
  }

  // Métodos Públicos para Controle de Câmera e Modos (usados pelo Tour Interativo da Máquina)
  setCameraPreset(key) {
    const presets = {
      'front': { theta: 0.0, phi: 1.50, radius: 3.40, targetY: 1.06 },
      'perspective': { theta: 0.48, phi: 1.38, radius: 3.50, targetY: 1.06 },
      'side': { theta: 1.57, phi: 1.46, radius: 3.35, targetY: 1.06 },
      'back': { theta: Math.PI, phi: 1.44, radius: 3.40, targetY: 1.06 },
      'solar': { theta: 0.0, phi: 0.32, radius: 2.15, targetY: 1.85 },
      'screen': { theta: 0.0, phi: 1.45, radius: 2.10, targetY: 1.18 }
    };
    const p = presets[key];
    if (!p) return;

    this.autoRotate = false;
    const btnAuto = document.getElementById('btn-3d-autorotate');
    if (btnAuto) btnAuto.classList.remove('active');

    this.camState.targetTheta = p.theta;
    this.camState.targetPhi = p.phi;
    this.camState.targetRadius = p.radius;
    this.camState.targetLookY = p.targetY;

    document.querySelectorAll('[data-cam-preset]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-cam-preset') === key);
    });
  }

  setDimensionsVisible(visible) {
    this.showDimensions = !!visible;
    if (this.dimensionGroup) this.dimensionGroup.visible = this.showDimensions;
    const btnDims = document.getElementById('btn-3d-dimensions');
    if (btnDims) btnDims.classList.toggle('active', this.showDimensions);
  }

  // =========================================================================
  // BOTÕES DA INTERFACE DO ESTÚDIO 3D (CÂMERAS, GIRO 360°, TEMA, DIA/NOITE)
  // =========================================================================
  setupUIControls() {
    // 1. Ângulos Rápidos de Câmera (Enquadramento 100% visível da base ao topo sem cortar)
    const presets = {
      'front': { theta: 0.0, phi: 1.50, radius: 3.40, targetY: 1.06 },
      'perspective': { theta: 0.48, phi: 1.38, radius: 3.50, targetY: 1.06 },
      'side': { theta: 1.57, phi: 1.46, radius: 3.35, targetY: 1.06 },
      'back': { theta: Math.PI, phi: 1.44, radius: 3.40, targetY: 1.06 },
      'solar': { theta: 0.0, phi: 0.28, radius: 1.85, targetY: 1.95 }
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
        btnNight.textContent = this.isNightMode ? '🌙 Modo Noite' : '☀️ Dia / Noite';
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

    // 9. Controles Específicos de Raio-X / Lado Interno / Tampão Traseiro
    this.setupHardwareControls();
  }

  // =========================================================================
  // CONTROLES E MODOS DO LADO INTERNO / RAIO-X (2ª BOLINHA & MENU 360°)
  // =========================================================================
  setupHardwareControls() {
    // 1. Modos de Visão Interna (Raio-X Translúcido, Porta Aberta 105°)
    document.querySelectorAll('[data-hw-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-hw-view');
        if (this.isHardwareMode && this.hardwareViewMode === mode) {
          this.setHardwareMode(false);
          const orbXray = document.getElementById('btn-orb-xray');
          if (orbXray) orbXray.classList.remove('active');
        } else {
          this.hardwareViewMode = mode;
          this.setHardwareMode(true);
          const orbXray = document.getElementById('btn-orb-xray');
          if (orbXray) orbXray.classList.add('active');
        }
      });
    });

    // 2. Botão direto de Abrir / Fechar o Tampão Traseiro (Porta de Acesso às Costas)
    const btnToggleDoor = document.getElementById('btn-toggle-rear-door');
    if (btnToggleDoor) {
      btnToggleDoor.addEventListener('click', () => {
        this.toggleRearDoor();
      });
    }

    // 3. Mostrar/Ocultar Hotspots Técnicos do Hardware (1 a 7)
    const btnHwHotspots = document.getElementById('btn-hw-hotspots');
    if (btnHwHotspots) {
      btnHwHotspots.addEventListener('click', () => {
        this.showHotspots = !this.showHotspots;
        btnHwHotspots.classList.toggle('active', this.showHotspots);
        if (!this.showHotspots) {
          const card = document.getElementById('totem-3d-info-card');
          if (card) card.classList.add('hidden');
        }
      });
    }

    // 4. Abrir/Fechar Modal da Parte Técnica (3ª Bolinha)
    const modalSchematics = document.getElementById('modal-hardware-schematics');
    const orbTech = document.getElementById('btn-orb-tech');
    const openSchematics = () => {
      if (modalSchematics) {
        modalSchematics.classList.remove('hidden');
        if (orbTech) orbTech.classList.add('active');
      }
    };
    const closeSchematics = () => {
      if (modalSchematics) {
        modalSchematics.classList.add('hidden');
        if (orbTech) orbTech.classList.remove('active');
      }
    };

    const btnOpenDiagram1 = document.getElementById('btn-open-hw-diagram');
    const btnOpenDiagram2 = document.getElementById('btn-hw-schematics-modal');
    if (btnOpenDiagram1) btnOpenDiagram1.addEventListener('click', openSchematics);
    if (btnOpenDiagram2) btnOpenDiagram2.addEventListener('click', openSchematics);

    const btnCloseDiagram1 = document.getElementById('btn-close-hw-schematics');
    const btnCloseDiagram2 = document.getElementById('btn-close-hw-schematics-foot');
    if (btnCloseDiagram1) btnCloseDiagram1.addEventListener('click', closeSchematics);
    if (btnCloseDiagram2) btnCloseDiagram2.addEventListener('click', closeSchematics);

    if (modalSchematics) {
      modalSchematics.addEventListener('click', (e) => {
        if (e.target === modalSchematics) closeSchematics();
      });
    }

    // Abas internas do Modal de Parte Técnica (Texto Técnico, Fiação, Diagrama, BOM, Montagem)
    document.querySelectorAll('[data-hw-tab]').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        const targetTab = tabBtn.getAttribute('data-hw-tab');
        document.querySelectorAll('.btn-hw-tab').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');

        document.querySelectorAll('.hw-tab-pane').forEach(pane => pane.classList.remove('active'));
        const activePane = document.getElementById(`hw-tab-content-${targetTab}`);
        if (activePane) activePane.classList.add('active');
      });
    });
  }

  openRearDoor(moveCamera = false) {
    this.autoRotate = false;
    const btnAuto = document.getElementById('btn-3d-autorotate');
    if (btnAuto) btnAuto.classList.remove('active');

    if (this.mainCabinetMesh) this.mainCabinetMesh.visible = false;
    if (this.hollowCabinetGroup) this.hollowCabinetGroup.visible = true;
    if (this.internalHardwareGroup) this.internalHardwareGroup.visible = true;

    this.targetDoorAngle = Math.PI * 0.58; // +105 graus para fora!
    if (moveCamera) {
      this.camState.targetTheta = Math.PI + 0.32;
      this.camState.targetPhi = 1.38;
      this.camState.targetRadius = 3.25;
      this.camState.targetLookY = 1.08;
    }

    const btnDoor = document.getElementById('btn-toggle-rear-door');
    if (btnDoor) {
      btnDoor.classList.add('active');
      btnDoor.textContent = '🚪 Fechar Porta';
    }
  }

  closeRearDoor() {
    this.targetDoorAngle = 0;
    const btnDoor = document.getElementById('btn-toggle-rear-door');
    if (btnDoor) {
      btnDoor.classList.remove('active');
      btnDoor.textContent = '🚪 Abrir Porta';
    }
  }

  toggleRearDoor() {
    const isDoorCurrentlyOpen = Math.abs(this.targetDoorAngle) > 0.1;
    if (isDoorCurrentlyOpen) {
      this.closeRearDoor();
    } else {
      this.openRearDoor(true);
    }
  }

  setHardwareMode(active) {
    this.isHardwareMode = active;

    if (active) {
      // Troca o bloco maciço pela Carcaça Oca real para que o vão traseiro e as paredes da carcaça apareçam
      if (this.mainCabinetMesh) this.mainCabinetMesh.visible = false;
      if (this.hollowCabinetGroup) this.hollowCabinetGroup.visible = true;
      if (this.internalHardwareGroup) this.internalHardwareGroup.visible = true;

      this.showHotspots = true;
      const btnHwHotspots = document.getElementById('btn-hw-hotspots');
      if (btnHwHotspots) btnHwHotspots.classList.add('active');

      // Aplica o modo de visão interna (padrão: 'xray' - Carcaça semi-transparente + Tampão Traseiro Aberto)
      this.setHardwareView(this.hardwareViewMode || 'xray');
    } else {
      // Fecha o tampão traseiro suavemente e restaura a opacidade original da carcaça
      this.targetDoorAngle = 0;
      this.targetExplodeOffset = 0;
      ['body', 'headerSign', 'rearDoor'].forEach(matKey => {
        const mat = this.dynamicMaterials[matKey];
        if (mat) {
          mat.transparent = false;
          mat.opacity = 1.0;
          mat.depthWrite = true;
          mat.needsUpdate = true;
        }
      });
      if (this.mainCabinetMesh) this.mainCabinetMesh.visible = true;
      if (this.hollowCabinetGroup) this.hollowCabinetGroup.visible = false;
      if (this.internalHardwareGroup) this.internalHardwareGroup.visible = false;

      this.showHotspots = false;
      const btnHwHotspots = document.getElementById('btn-hw-hotspots');
      if (btnHwHotspots) btnHwHotspots.classList.remove('active');
      const btnDoor = document.getElementById('btn-toggle-rear-door');
      if (btnDoor) {
        btnDoor.classList.remove('active');
        btnDoor.textContent = '🚪 Abrir Porta';
      }
      const card = document.getElementById('totem-3d-info-card');
      if (card) card.classList.add('hidden');

      document.querySelectorAll('[data-hw-view]').forEach(btn => btn.classList.remove('active'));

      // Restaura câmera para visão 3/4 externa centralizada
      this.camState.targetTheta = 0.48;
      this.camState.targetPhi = 1.38;
      this.camState.targetRadius = 3.50;
      this.camState.targetLookY = 1.06;
    }

    this.renderHotspotPins();
  }

  setHardwareView(mode) {
    this.hardwareViewMode = mode;
    this.autoRotate = false;

    if (this.mainCabinetMesh) this.mainCabinetMesh.visible = false;
    if (this.hollowCabinetGroup) this.hollowCabinetGroup.visible = true;

    // Reseta transparências prévias
    ['body', 'headerSign', 'rearDoor'].forEach(matKey => {
      const mat = this.dynamicMaterials[matKey];
      if (mat) {
        mat.transparent = false;
        mat.opacity = 1.0;
        mat.depthWrite = true;
        mat.needsUpdate = true;
      }
    });
    this.targetExplodeOffset = 0;

    if (mode === 'door') {
      // Carcaça 100% sólida com o Tampão Traseiro aberto PARA FORA (+105 graus) mostrando o acesso por trás
      this.targetDoorAngle = Math.PI * 0.58;
      this.camState.targetTheta = Math.PI + 0.32;
      this.camState.targetPhi = 1.38;
      this.camState.targetRadius = 3.25;
      this.camState.targetLookY = 1.08;
    } else if (mode === 'xray') {
      // Raio-X + Carcaça Visível (48% opacidade) + Tampão Traseiro Sólido ABERTO PARA FORA (+105°)!
      this.targetDoorAngle = Math.PI * 0.58;
      ['body', 'headerSign'].forEach(matKey => {
        const mat = this.dynamicMaterials[matKey];
        if (mat) {
          mat.transparent = true;
          mat.opacity = 0.46;
          mat.depthWrite = false;
          mat.needsUpdate = true;
        }
      });
      // O Tampão Traseiro (rearDoor) permanece 100% opaco e aberto para fora ao lado para evidenciar a porta de manutenção
      if (this.dynamicMaterials.rearDoor) {
        this.dynamicMaterials.rearDoor.transparent = false;
        this.dynamicMaterials.rearDoor.opacity = 1.0;
        this.dynamicMaterials.rearDoor.depthWrite = true;
        this.dynamicMaterials.rearDoor.needsUpdate = true;
      }
      this.camState.targetTheta = Math.PI + 0.48;
      this.camState.targetPhi = 1.35;
      this.camState.targetRadius = 3.35;
      this.camState.targetLookY = 1.06;
    } else if (mode === 'exploded') {
      // Vista explodida em camadas (Carcaça deslocada + Tampão aberto para fora)
      this.targetDoorAngle = Math.PI * 0.50;
      this.targetExplodeOffset = 0.36;
      this.camState.targetTheta = Math.PI + 0.65;
      this.camState.targetPhi = 1.28;
      this.camState.targetRadius = 3.65;
      this.camState.targetLookY = 1.06;
    }

    const btnDoor = document.getElementById('btn-toggle-rear-door');
    if (btnDoor) {
      const doorOpen = Math.abs(this.targetDoorAngle) > 0.1;
      btnDoor.classList.toggle('active', doorOpen);
      btnDoor.textContent = doorOpen ? '🚪 Fechar Porta' : '🚪 Abrir Porta';
    }

    document.querySelectorAll('[data-hw-view]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-hw-view') === mode);
    });
  }

  toggleGlowPower() {
    this.glowPowerWiring = !this.glowPowerWiring;
    const intensity = this.glowPowerWiring ? 0.95 : 0.0;
    if (this.hardwareWiringMaterials.acLive) {
      this.hardwareWiringMaterials.acLive.emissive = new THREE.Color(this.glowPowerWiring ? 0xd97706 : 0x000000);
      this.hardwareWiringMaterials.acLive.emissiveIntensity = intensity;
    }
    if (this.hardwareWiringMaterials.dc12vPos) {
      this.hardwareWiringMaterials.dc12vPos.emissive = new THREE.Color(this.glowPowerWiring ? 0xef4444 : 0x000000);
      this.hardwareWiringMaterials.dc12vPos.emissiveIntensity = intensity;
    }
    if (this.hardwareWiringMaterials.solarPos) {
      this.hardwareWiringMaterials.solarPos.emissive = new THREE.Color(this.glowPowerWiring ? 0xf97316 : 0x000000);
      this.hardwareWiringMaterials.solarPos.emissiveIntensity = intensity;
    }
    const btn = document.getElementById('btn-hw-glow-power');
    if (btn) btn.classList.toggle('active', this.glowPowerWiring);
  }

  toggleGlowData() {
    this.glowDataWiring = !this.glowDataWiring;
    const intensity = this.glowDataWiring ? 0.95 : 0.0;
    if (this.hardwareWiringMaterials.hdmi) {
      this.hardwareWiringMaterials.hdmi.emissive = new THREE.Color(this.glowDataWiring ? 0x2563eb : 0x000000);
      this.hardwareWiringMaterials.hdmi.emissiveIntensity = intensity;
    }
    if (this.hardwareWiringMaterials.usb) {
      this.hardwareWiringMaterials.usb.emissive = new THREE.Color(this.glowDataWiring ? 0xeab308 : 0x000000);
      this.hardwareWiringMaterials.usb.emissiveIntensity = intensity;
    }
    if (this.hardwareWiringMaterials.ethernet) {
      this.hardwareWiringMaterials.ethernet.emissive = new THREE.Color(this.glowDataWiring ? 0x22c55e : 0x000000);
      this.hardwareWiringMaterials.ethernet.emissiveIntensity = intensity;
    }
    const btn = document.getElementById('btn-hw-glow-data');
    if (btn) btn.classList.toggle('active', this.glowDataWiring);
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

    if (this.dynamicMaterials.lowerCrest) {
      this.dynamicMaterials.lowerCrest.metalness = lum > 0.82 ? 0.22 : 0.36;
      this.dynamicMaterials.lowerCrest.roughness = lum < 0.18 ? 0.32 : 0.36;
    }

    // Atualiza chanfros estruturais, frisos laterais e flange da base em tom harmônico
    const seamHex = this.shiftColorBrightness(cleanHex, -0.22);
    const stripHex = this.shiftColorBrightness(cleanHex, -0.10);
    if (this.dynamicMaterials.accentTrim) this.dynamicMaterials.accentTrim.color.set(seamHex);
    if (this.dynamicMaterials.ledStrip) this.dynamicMaterials.ledStrip.color.set(stripHex);
    if (this.dynamicMaterials.flange) this.dynamicMaterials.flange.color.set(seamHex);

    // Atualiza a Placa Superior de Jaú, o Brasão em Baixo-Relevo Inferior e a Parte de Ferro das Costas
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

  // Sincroniza estado com o app 2D (telas, modo vitrine, standby, cadeirante, alto contraste, vlibras)
  syncFromApp(stateObj) {
    if (!stateObj) return;
    if (stateObj.screenState !== undefined) this.screenState = stateObj.screenState;
    if (stateObj.isWheelchair !== undefined) this.isWheelchair = stateObj.isWheelchair;
    if (stateObj.isHighContrast !== undefined) this.isHighContrast = stateObj.isHighContrast;
    if (stateObj.isVLibrasActive !== undefined) this.showVLibrasBox = stateObj.isVLibrasActive;
    if (stateObj.vlibrasSub !== undefined) this.vlibrasSub = stateObj.vlibrasSub;
    if (stateObj.isInterpretingLibras !== undefined) this.isInterpretingLibras = stateObj.isInterpretingLibras;
    if (stateObj.currentCity !== undefined) {
      this.currentCity = stateObj.currentCity === 'itapui' ? 'itapui' : (stateObj.currentCity === 'bauru' ? 'bauru' : 'jau');
      this.updateMetalPlatesTextures(this.currentMetalHex || '#8e96a0');
    }
    this.updateScreenTexture();
  }

  setCity(cityKey) {
    this.currentCity = cityKey === 'itapui' ? 'itapui' : (cityKey === 'bauru' ? 'bauru' : 'jau');
    this.updateMetalPlatesTextures(this.currentMetalHex || '#8e96a0');
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
      this.camera.fov = 50;
      this.camState.targetRadius = 3.70;
      this.camState.targetLookY = 1.06;
    } else if (aspect < 0.85) {
      // Tablets verticais (iPads Portrait, tablets Android 3:4 ou 9:16)
      this.camera.fov = 47;
      this.camState.targetRadius = 3.55;
      this.camState.targetLookY = 1.06;
    } else if (aspect < 1.15) {
      // Tablets quase quadrados ou rotação intermediária
      this.camera.fov = 45;
      this.camState.targetRadius = 3.50;
      this.camState.targetLookY = 1.06;
    } else {
      // Desktop / Telas widescreen
      this.camera.fov = 45;
      this.camState.targetRadius = 3.50;
      this.camState.targetLookY = 1.06;
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

    // Mantém o foco da câmera ESTRITAMENTE travado no centro exato do Totem (eixo X=0, Z=0)
    this.camera.lookAt(0, this.camState.targetY, 0);

    // Atualiza mostrador numérico de ângulo 360° em tempo real
    const degEl = document.getElementById('totem-3d-angle-deg');
    if (degEl) {
      let deg = Math.round((this.camState.theta * 180 / Math.PI) % 360);
      if (deg < 0) deg += 360;
      degEl.textContent = `${deg}°`;
    }

    // Animação suave de abertura/fechamento do tampão traseiro (porta de manutenção)
    if (this.rearDoorHingeGroup) {
      this.currentDoorAngle += (this.targetDoorAngle - this.currentDoorAngle) * 0.10;
      this.rearDoorHingeGroup.rotation.y = this.currentDoorAngle;
    }

    // Se o tampão traseiro acabou de fechar completamente fora do modo Raio-X, volta para a malha externa
    if (!this.isHardwareMode && Math.abs(this.targetDoorAngle) < 0.01 && Math.abs(this.currentDoorAngle) < 0.015) {
      if (this.mainCabinetMesh && !this.mainCabinetMesh.visible) this.mainCabinetMesh.visible = true;
      if (this.hollowCabinetGroup && this.hollowCabinetGroup.visible) this.hollowCabinetGroup.visible = false;
      if (this.internalHardwareGroup && this.internalHardwareGroup.visible) this.internalHardwareGroup.visible = false;
    }

    // Animação suave de vista explodida
    this.currentExplodeOffset += (this.targetExplodeOffset - this.currentExplodeOffset) * 0.10;
    if (this.mainCabinetMesh) {
      this.mainCabinetMesh.position.x = 0.346 + this.currentExplodeOffset;
    }
    if (this.hollowCabinetGroup) {
      this.hollowCabinetGroup.position.x = this.currentExplodeOffset;
    }
    if (this.lowerCrestMesh) {
      this.lowerCrestMesh.position.x = this.currentExplodeOffset;
    }
    if (this.rearDoorHingeGroup) {
      this.rearDoorHingeGroup.position.z = -0.178 - this.currentExplodeOffset * 1.5;
    }

    this.renderer.render(this.scene, this.camera);
    this.updateHotspotPositions();
  }
}

window.Totem3DViewer = Totem3DViewer;

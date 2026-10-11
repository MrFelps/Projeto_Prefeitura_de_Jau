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

    // Canvas 2D para textura dinâmica da tela 43" e do cabeçalho
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

    // 1. Cena (Fundo Claro de Estúdio Arquitetônico)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeef2f6);
    this.scene.fog = new THREE.FogExp2(0xeef2f6, 0.045);

    // 2. Câmera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);

    // 3. Renderizador WebGL com sombras suaves e tone mapping realista
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

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

    // Atualiza tela de 43" periodicamente (relógio ao vivo)
    this.updateScreenTexture();
    this.updateHeaderTexture();
    setInterval(() => {
      if (this.initialized) this.updateScreenTexture();
    }, 5000);

    window.addEventListener('resize', () => this.handleResize());

    this.initialized = true;
    this.animate();
  }

  // =========================================================================
  // ILUMINAÇÃO (MODO DIA E NOITE)
  // =========================================================================
  setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.95);
    this.scene.add(ambient);
    this.dynamicLights.ambient = ambient;

    const hemi = new THREE.HemisphereLight(0xffffff, 0xcbd5e1, 0.85);
    hemi.position.set(0, 10, 0);
    this.scene.add(hemi);
    this.dynamicLights.hemi = hemi;

    // Luz Solar Principal
    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.45);
    dirLight.position.set(4.5, 7.5, 5.0);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 20;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);
    this.dynamicLights.sun = dirLight;

    // Luz de preenchimento traseira (para destacar a porta de manutenção no giro 360°)
    const backLight = new THREE.DirectionalLight(0xe2e8f0, 0.8);
    backLight.position.set(-4.0, 4.0, -5.0);
    this.scene.add(backLight);
    this.dynamicLights.back = backLight;

    // Brilho emitido pela tela frontal e fitas LED laterais
    const screenGlow = new THREE.PointLight(0x38bdf8, 0.45, 3.2);
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

    // Materiais principais do chassi: METAL CLARO / ALUMÍNIO & AÇO ESCOVADO CLARO
    const rawMetalTextureCanvas = document.createElement('canvas');
    rawMetalTextureCanvas.width = 512;
    rawMetalTextureCanvas.height = 512;
    const mctx = rawMetalTextureCanvas.getContext('2d');
    // Base em cinza-prata bem claro
    mctx.fillStyle = '#e5eaf0';
    mctx.fillRect(0, 0, 512, 512);
    // Riscos finos sutis de escovado claro
    mctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    mctx.lineWidth = 1;
    for (let i = 0; i < 400; i++) {
      const y = Math.random() * 512;
      mctx.beginPath();
      mctx.moveTo(0, y);
      mctx.lineTo(512, y + (Math.random() - 0.5) * 4);
      mctx.stroke();
    }
    mctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
    for (let i = 0; i < 300; i++) {
      const y = Math.random() * 512;
      mctx.beginPath();
      mctx.moveTo(0, y);
      mctx.lineTo(512, y + (Math.random() - 0.5) * 4);
      mctx.stroke();
    }
    const brushedMetalTex = new THREE.CanvasTexture(rawMetalTextureCanvas);
    brushedMetalTex.wrapS = THREE.RepeatWrapping;
    brushedMetalTex.wrapT = THREE.RepeatWrapping;
    brushedMetalTex.repeat.set(2, 4);

    // Nota: Em Three.js sem HDR externo, metalness baixo (0.18) garante que o cinza fique bem CLARO e iluminado!
    const bodyMat = new THREE.MeshStandardMaterial({
      map: brushedMetalTex,
      color: 0xf1f5f9,          // Cinza-prata bem claro
      metalness: 0.18,          // Mantém brilho metálico sem escurecer o difuso
      roughness: 0.32,
      emissive: 0x334155,
      emissiveIntensity: 0.10
    });
    this.dynamicMaterials.body = bodyMat;

    const darkPanelMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.20,
      roughness: 0.35
    });

    // Material de união / chanfro sutil em cinza claro
    const rawSeamMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.20,
      roughness: 0.30
    });
    this.dynamicMaterials.accentTrim = rawSeamMat;

    // Friso lateral em cinza claro
    const ledStripMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.20,
      roughness: 0.30
    });
    this.dynamicMaterials.ledStrip = ledStripMat;

    // -----------------------------------------------------------------------
    // 1. BASE METÁLICA CHUMBADA + PEDESTAL DE FIXAÇÃO (0,00m a 0,16m)
    // -----------------------------------------------------------------------
    const concreteBaseMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.65,
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

    // Flange metálica em chapa de aço claro
    const flangeMat = new THREE.MeshStandardMaterial({
      color: 0xdbe2ea,
      metalness: 0.22,
      roughness: 0.32
    });
    const flange = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.04, 0.40),
      flangeMat
    );
    flange.position.set(0, 0.12, 0);
    flange.castShadow = true;
    this.totemGroup.add(flange);

    // 6 Chumbadores / Parafusos sextavados de fixação estrutural
    const boltGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6);
    const boltMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.30, roughness: 0.22 });
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
    // 4. FACE FRONTAL: CABEÇALHO LUMINOSO + CÂMERA + SENSOR PIR
    //    Posicionados abaixo do início da quina arredondada (y <= 2.02m)
    // -----------------------------------------------------------------------
    this.headerTexture = new THREE.CanvasTexture(this.headerCanvas);
    const headerSignMat = new THREE.MeshStandardMaterial({
      map: this.headerTexture,
      emissiveMap: this.headerTexture,
      emissive: 0xffffff,
      emissiveIntensity: 0.55,
      roughness: 0.2
    });
    this.dynamicMaterials.headerSign = headerSignMat;

    const headerPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(0.58, 0.22),
      headerSignMat
    );
    headerPanel.position.set(0, 1.84, 0.180);
    this.totemGroup.add(headerPanel);

    // Barra de Sensores Superior (Câmera de Segurança + Sensor PIR)
    const sensorBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.042, 0.012),
      darkPanelMat
    );
    sensorBar.position.set(0, 1.985, 0.178);
    this.totemGroup.add(sensorBar);

    // Lente da Câmera de Monitoramento
    const camRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.013, 0.013, 0.018, 20),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.1 })
    );
    camRing.rotation.x = Math.PI / 2;
    camRing.position.set(0, 1.985, 0.182);
    this.totemGroup.add(camRing);

    const camLens = new THREE.Mesh(
      new THREE.SphereGeometry(0.008, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    );
    camLens.position.set(0, 1.985, 0.189);
    this.totemGroup.add(camLens);

    // Sensor PIR de Presença ao lado da câmera
    const pirSensor = new THREE.Mesh(
      new THREE.BoxGeometry(0.024, 0.016, 0.015),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
    );
    pirSensor.position.set(0.055, 1.985, 0.182);
    this.totemGroup.add(pirSensor);

    // -----------------------------------------------------------------------
    // 5. TELA TOUCHSCREEN 43" FULL HD (VIDRO TEMPERADO 8mm)
    // -----------------------------------------------------------------------
    // Moldura protetora da tela (Bezel IP65)
    const screenBezel = new THREE.Mesh(
      new THREE.BoxGeometry(0.60, 1.02, 0.014),
      darkPanelMat
    );
    screenBezel.position.set(0, 1.19, 0.176);
    this.totemGroup.add(screenBezel);

    // Display LCD ativo com Textura Canvas 2D Ao Vivo
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTexture.minFilter = THREE.LinearFilter;
    const screenDisplayMat = new THREE.MeshStandardMaterial({
      map: this.screenTexture,
      emissiveMap: this.screenTexture,
      emissive: 0xffffff,
      emissiveIntensity: 0.78,
      roughness: 0.12,
      metalness: 0.05
    });
    this.dynamicMaterials.screenDisplay = screenDisplayMat;

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.96),
      screenDisplayMat
    );
    screenMesh.position.set(0, 1.19, 0.184);
    this.totemGroup.add(screenMesh);

    // -----------------------------------------------------------------------
    // 6. PAINEL FRONTAL INFERIOR: ALTO-FALANTES + CARREGADORES USB + BOTÃO SOS + PLACA JAÚ
    // -----------------------------------------------------------------------
    const lowerConsoleCanvas = document.createElement('canvas');
    lowerConsoleCanvas.width = 512;
    lowerConsoleCanvas.height = 420;
    const lctx = lowerConsoleCanvas.getContext('2d');

    // Fundo metálico claro (aço/alumínio escovado claro)
    lctx.fillStyle = '#e2e8f0';
    lctx.fillRect(0, 0, 512, 420);

    // Faixa de ícones de conectividade (QR, Wi-Fi, Solar, Acessibilidade)
    lctx.fillStyle = '#f8fafc';
    lctx.fillRect(24, 18, 464, 74);
    lctx.strokeStyle = '#94a3b8';
    lctx.lineWidth = 2;
    lctx.strokeRect(24, 18, 464, 74);

    const badges = [
      { icon: '📲', label: 'QR CODE' },
      { icon: '📶', label: 'WI-FI 5G' },
      { icon: '♿', label: 'LIBRAS/VOZ' },
      { icon: '☀️', label: 'SOLAR ESG' }
    ];
    badges.forEach((b, i) => {
      const bx = 52 + i * 112;
      lctx.font = '24px sans-serif';
      lctx.textAlign = 'center';
      lctx.fillText(b.icon, bx + 36, 52);
      lctx.fillStyle = '#0c326f';
      lctx.font = 'bold 12px sans-serif';
      lctx.fillText(b.label, bx + 36, 76);
    });

    // Seção de Carregadores USB e Som Direcional (Caixa Esquerda Clara)
    lctx.save();
    lctx.fillStyle = '#f1f5f9';
    lctx.fillRect(24, 110, 286, 118);
    lctx.strokeStyle = '#94a3b8';
    lctx.lineWidth = 2;
    lctx.strokeRect(24, 110, 286, 118);
    lctx.beginPath();
    lctx.rect(26, 112, 282, 114);
    lctx.clip();

    lctx.fillStyle = '#0c326f';
    lctx.font = 'bold 12px sans-serif';
    lctx.textAlign = 'left';
    lctx.fillText('⚡ CARREGADORES USB & ÁUDIO 10W', 36, 133, 264);

    // Desenho da grelha de som direcional
    lctx.fillStyle = '#64748b';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 10; c++) {
        lctx.beginPath();
        lctx.arc(46 + c * 14, 156 + r * 14, 3.5, 0, Math.PI * 2);
        lctx.fill();
      }
    }

    // Desenho das 2 portas USB iluminadas
    [218, 262].forEach(ux => {
      lctx.fillStyle = '#1351b4';
      lctx.fillRect(ux, 150, 28, 44);
      lctx.fillStyle = '#ffffff';
      lctx.fillRect(ux + 6, 158, 16, 28);
      lctx.fillStyle = '#0c326f';
      lctx.font = 'bold 10px sans-serif';
      lctx.textAlign = 'center';
      lctx.fillText('USB', ux + 14, 210);
    });
    lctx.restore();

    // Caixa Direita: Moldura do Botão Físico de Acionamento de Socorro (SOS)
    lctx.save();
    lctx.fillStyle = '#fef2f2';
    lctx.fillRect(322, 110, 166, 118);
    lctx.strokeStyle = '#dc2626';
    lctx.lineWidth = 2;
    lctx.strokeRect(322, 110, 166, 118);
    lctx.beginPath();
    lctx.rect(324, 112, 162, 114);
    lctx.clip();

    lctx.fillStyle = '#b91c1c';
    lctx.font = 'bold 11px sans-serif';
    lctx.textAlign = 'center';
    lctx.fillText('🚨 BOTÃO DE SOCORRO', 405, 130, 150);
    lctx.fillStyle = '#7f1d1d';
    lctx.font = 'bold 10px sans-serif';
    lctx.fillText('SAMU 192 • GCM 153', 405, 218, 150);
    lctx.restore();

    // Placa Metálica Institucional da Prefeitura de Jaú em aço escovado claro
    const plateGrad = lctx.createLinearGradient(24, 248, 488, 395);
    plateGrad.addColorStop(0, '#ffffff');
    plateGrad.addColorStop(1, '#f1f5f9');
    lctx.fillStyle = plateGrad;
    lctx.fillRect(24, 248, 464, 145);
    lctx.strokeStyle = '#94a3b8';
    lctx.lineWidth = 2;
    lctx.strokeRect(24, 248, 464, 145);

    lctx.fillStyle = '#0c326f';
    lctx.font = 'bold 21px sans-serif';
    lctx.textAlign = 'center';
    lctx.fillText('🏛️ PREFEITURA MUNICIPAL DE JAÚ', 256, 294, 436);
    lctx.fillStyle = '#168821';
    lctx.font = 'bold 15px sans-serif';
    lctx.fillText('CIDADE INTELIGENTE • SUSTENTÁVEL • ACESSÍVEL', 256, 326, 436);
    lctx.fillStyle = '#475569';
    lctx.font = '13px sans-serif';
    lctx.fillText('Projeto Integrador Senac Jaú • Totemize Smart City', 256, 356, 436);

    const lowerTex = new THREE.CanvasTexture(lowerConsoleCanvas);
    const lowerPanelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.56, 0.46),
      new THREE.MeshStandardMaterial({
        map: lowerTex,
        roughness: 0.35,
        metalness: 0.12
      })
    );
    lowerPanelMesh.position.set(0, 0.42, 0.180);
    this.totemGroup.add(lowerPanelMesh);

    // BOTÃO FÍSICO SOS EMERGÊNCIA 3D (Em alto-relevo iluminado na frente)
    const sosBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.056, 0.018, 24),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.25, roughness: 0.3 })
    );
    sosBase.rotation.x = Math.PI / 2;
    sosBase.position.set(0.18, 0.48, 0.184);
    this.totemGroup.add(sosBase);

    const sosBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.04, 0.026, 24),
      new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xdc2626,
        emissiveIntensity: 0.65,
        roughness: 0.2
      })
    );
    sosBtn.rotation.x = Math.PI / 2;
    sosBtn.position.set(0.18, 0.48, 0.190);
    this.totemGroup.add(sosBtn);

    // -----------------------------------------------------------------------
    // 7. FACE TRASEIRA COMPLETA EM METAL CLARO (PARA VISUALIZAÇÃO 360°!)
    // Porta de Manutenção Antivandalismo, Fechaduras, Aletas de Exaustão e Plaqueta IP65
    // -----------------------------------------------------------------------
    const rearCanvas = document.createElement('canvas');
    rearCanvas.width = 512;
    rearCanvas.height = 1400;
    const rctx = rearCanvas.getContext('2d');

    rctx.fillStyle = '#e2e8f0';
    rctx.fillRect(0, 0, 512, 1400);

    // Contorno da porta técnica traseira
    rctx.strokeStyle = '#94a3b8';
    rctx.lineWidth = 5;
    rctx.strokeRect(36, 40, 440, 1320);
    rctx.strokeStyle = '#cbd5e1';
    rctx.lineWidth = 2;
    rctx.strokeRect(42, 46, 428, 1308);

    // Venezianas / Grelhas de ventilação superior (dissipação térmica)
    for (let i = 0; i < 9; i++) {
      rctx.fillStyle = '#64748b';
      rctx.fillRect(86, 85 + i * 22, 340, 10);
      rctx.fillStyle = '#f8fafc';
      rctx.fillRect(86, 82 + i * 22, 340, 3);
    }

    // Painel Institucional Traseiro Claro
    rctx.fillStyle = '#ffffff';
    rctx.fillRect(68, 340, 376, 420);
    rctx.strokeStyle = '#94a3b8';
    rctx.lineWidth = 3;
    rctx.strokeRect(68, 340, 376, 420);

    rctx.fillStyle = '#0c326f';
    rctx.font = 'bold 22px sans-serif';
    rctx.textAlign = 'center';
    rctx.fillText('PREFEITURA DE JAÚ', 256, 405);
    rctx.fillStyle = '#1e293b';
    rctx.font = 'bold 30px sans-serif';
    rctx.fillText('TOTEM INTELIGENTE', 256, 448);
    rctx.fillStyle = '#168821';
    rctx.font = 'bold 17px sans-serif';
    rctx.fillText('☀️ ENERGIA HÍBRIDA (SOLAR 35Wp + 220V)', 256, 495);

    // Especificações Técnicas na Plaqueta Traseira
    const specs = [
      '• Estrutura: Chapa de Metal Escovado Claro',
      '• Proteção: Vidro Temperado 8mm + Grau IP65',
      '• Exaustão: Venezianas com Cooler Termostático',
      '• Painel Solar Topo: 35Wp (64x21cm Embutido)',
      '• Bateria na Base: Backup LiFePO4 24h (Zona Fria)',
      '• Dimensões: 2,20m (A) x 0,70m (L) x 0,35m (P)',
      '• Peso Aproximado: 120 kg'
    ];
    rctx.fillStyle = '#334155';
    rctx.font = 'bold 14.5px sans-serif';
    rctx.textAlign = 'left';
    specs.forEach((line, idx) => {
      rctx.fillText(line, 88, 548 + idx * 28, 340);
    });

    // Aviso de Acesso Técnico Restrito
    rctx.fillStyle = '#f1f5f9';
    rctx.fillRect(106, 810, 300, 64);
    rctx.strokeStyle = '#64748b';
    rctx.lineWidth = 2;
    rctx.strokeRect(106, 810, 300, 64);
    rctx.fillStyle = '#0f172a';
    rctx.font = 'bold 15px sans-serif';
    rctx.textAlign = 'center';
    rctx.fillText('⚡ ACESSO TÉCNICO RESTRITO', 256, 838);
    rctx.fillStyle = '#475569';
    rctx.font = 'bold 11.5px sans-serif';
    rctx.fillText('SISTEMA ELÉTRICO SOLAR + REDE 220V', 256, 858);

    // Venezianas de ventilação inferior
    for (let i = 0; i < 8; i++) {
      rctx.fillStyle = '#64748b';
      rctx.fillRect(86, 1080 + i * 22, 340, 10);
      rctx.fillStyle = '#f8fafc';
      rctx.fillRect(86, 1077 + i * 22, 340, 3);
    }

    const rearTex = new THREE.CanvasTexture(rearCanvas);
    const rearDoorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 1.82),
      new THREE.MeshStandardMaterial({
        map: rearTex,
        roughness: 0.35,
        metalness: 0.15
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
  // RENDERIZAÇÃO DINÂMICA DO CABEÇALHO SUPERIOR E TELA TOUCH 43" (FUNDO CLARO)
  // =========================================================================
  updateHeaderTexture() {
    const ctx = this.headerCtx;
    const w = this.headerCanvas.width;
    const h = this.headerCanvas.height;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Moldura metálica escovada limpa
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#0c326f';
    ctx.font = '800 64px sans-serif';
    ctx.fillText('JAÚ', w / 2, 105);
    ctx.fillStyle = '#1351b4';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('SP • CONECTADA COM VOCÊ', w / 2, 152);

    if (this.headerTexture) this.headerTexture.needsUpdate = true;
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
        id: 'sensors',
        num: '2',
        title: 'Quina Arredondada + Câmera HD & PIR',
        desc: 'Borda superior frontal com curvatura ergonômica suave (11 cm de raio no topo) logo acima da câmera frontal de segurança e do sensor PIR de presença.',
        pos: new THREE.Vector3(0.0, 1.99, 0.19),
        cam: { theta: 0.65, phi: 1.25, radius: 1.85, targetY: 1.88 }
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
        id: 'usb_sos',
        num: '4',
        title: 'Som 10W + Carregadores USB + SOS',
        desc: 'Alto-falantes direcionais de 10W para leitura em voz alta, 2 portas USB para recarga gratuita de celulares e botão físico SOS ligado à Guarda Municipal.',
        pos: new THREE.Vector3(0.22, 0.48, 0.19),
        cam: { theta: 0.15, phi: 1.48, radius: 1.85, targetY: 0.52 }
      },
      {
        id: 'structure',
        num: '5',
        title: 'Chassi Monobloco em Metal Cru (Aço Escovado)',
        desc: 'Formato monolítico puro (0,70m × 2,20m × 0,35m) em chapa maciça de metal cru industrial sem pintura, quina superior arredondada e acabamento escovado antivandalismo IP65.',
        pos: new THREE.Vector3(-0.36, 1.15, 0.05),
        cam: { theta: -1.52, phi: 1.38, radius: 2.85, targetY: 1.12 }
      },
      {
        id: 'rear',
        num: '6',
        title: 'Porta Traseira & Exaustão Térmica',
        desc: 'Costas retas com porta técnica de manutenção, fechadura dupla antivandalismo, venezianas de ventilação natural e plaqueta técnica IP65.',
        pos: new THREE.Vector3(0.0, 1.25, -0.19),
        cam: { theta: Math.PI, phi: 1.40, radius: 2.65, targetY: 1.15 }
      },
      {
        id: 'base',
        num: '7',
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

    // 6. Seletor de Cor da Carcaça de Ferro/Metal
    const btnOpenColorPicker = document.getElementById('btn-open-color-picker');
    const btnCloseColorPicker = document.getElementById('btn-close-color-picker');
    const colorPickerModal = document.getElementById('totem-color-picker-modal');

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

    document.querySelectorAll('[data-metal-color]').forEach(btn => {
      btn.addEventListener('click', () => {
        const colorKey = btn.getAttribute('data-metal-color');
        this.setMetalColor(colorKey);
        document.querySelectorAll('[data-metal-color]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

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

  // Método para mudar a cor da carcaça do totem (parte do ferro)
  setMetalColor(colorKey) {
    if (!this.dynamicMaterials.body) return;

    const colorPresets = {
      'raw': {
        color: 0xd8dde3,
        metalness: 0.92,
        roughness: 0.30,
        mapEnabled: true
      },
      'black': {
        color: 0x181e28,
        metalness: 0.70,
        roughness: 0.38,
        mapEnabled: false
      },
      'govblue': {
        color: 0x1351b4,
        metalness: 0.65,
        roughness: 0.32,
        mapEnabled: false
      },
      'white': {
        color: 0xf1f5f9,
        metalness: 0.50,
        roughness: 0.28,
        mapEnabled: false
      },
      'gold': {
        color: 0xd4af37,
        metalness: 0.88,
        roughness: 0.25,
        mapEnabled: false
      },
      'corten': {
        color: 0x8b3a1a,
        metalness: 0.60,
        roughness: 0.68,
        mapEnabled: false
      }
    };

    const cfg = colorPresets[colorKey] || colorPresets['raw'];
    this.dynamicMaterials.body.color.setHex(cfg.color);
    this.dynamicMaterials.body.metalness = cfg.metalness;
    this.dynamicMaterials.body.roughness = cfg.roughness;

    // Sincroniza também a moldura do Totem 2D caso o usuário abra o menu
    const chassis2D = document.getElementById('totem-chassis');
    if (chassis2D) {
      const chassisColors = {
        'raw': 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 50%, #64748b 100%)',
        'black': '#0f172a',
        'govblue': '#0c326f',
        'white': '#f8fafc',
        'gold': 'linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #d97706 100%)',
        'corten': '#7c2d12'
      };
      chassis2D.style.background = chassisColors[colorKey] || chassisColors['raw'];
    }
  }

  applyDayNightMode() {
    if (this.isNightMode) {
      this.scene.background.setHex(0x0f172a);
      this.scene.fog.color.setHex(0x0f172a);
      this.dynamicLights.ambient.intensity = 0.45;
      this.dynamicLights.sun.intensity = 0.45;
      this.dynamicLights.screenGlow.intensity = 1.15;
      this.dynamicMaterials.screenDisplay.emissiveIntensity = 0.95;
    } else {
      this.scene.background.setHex(0xeef2f6);
      this.scene.fog.color.setHex(0xeef2f6);
      this.dynamicLights.ambient.intensity = 0.95;
      this.dynamicLights.sun.intensity = 1.45;
      this.dynamicLights.screenGlow.intensity = 0.45;
      this.dynamicMaterials.screenDisplay.emissiveIntensity = 0.78;
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

    // Correção anti-distorção para tablets e telas em pé (portrait) com ZOOM MÁXIMO:
    // O Totem tem 2,20m de altura. Ajustamos FOV e raio orbital para preencher a tela inteira verticalmente sem cortar o topo nem a base
    if (aspect < 0.65) {
      // Telas muito compridas em pé (celulares)
      this.camera.fov = 46;
      this.camState.targetRadius = 3.20;
    } else if (aspect < 0.85) {
      // Tablets verticais (iPads Portrait, tablets Android 3:4 ou 9:16)
      this.camera.fov = 42;
      this.camState.targetRadius = 2.85;
    } else if (aspect < 1.15) {
      // Tablets quase quadrados ou rotação intermediária
      this.camera.fov = 39;
      this.camState.targetRadius = 2.70;
    } else {
      // Desktop / Telas widescreen
      this.camera.fov = 36;
      this.camState.targetRadius = 2.65;
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

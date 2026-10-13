import { CityData, CityId } from '../types';

/**
 * Base de Dados Estruturada e Tipada das Cidades
 * Operação 100% Offline com Pontos Fixos de Referência
 */
export const CITIES_CONFIG: Record<CityId, CityData> = {
  jau: {
    name: 'Estância Turística de Jaú',
    badge: 'Capital do Calçado Feminino • 100% Offline',
    alertText: 'GUIA LOCAL FIXO • Praça da República (Jardim de Baixo) • Informações Fixas Locais (Sem Internet)',
    homeCards: {
      bus: {
        title: 'Mapa e Pontos de Referência',
        tag: 'DISTÂNCIAS A PÉ',
        description: 'Distâncias a pé e endereços fixos da Rodoviária, Centro, Praças e Saúde.',
        actionText: 'Ver 4 pontos fixos',
        viewId: 'view-bus',
        icon: 'map'
      },
      shoes: {
        title: 'Circuito do Calçado',
        tag: 'POLO INDUSTRIAL',
        description: 'Guia fixo com mais de 180 fábricas, lojas de fábrica e polos comerciais na cidade.',
        actionText: 'Explorar lojas e rotas',
        viewId: 'view-shoes',
        icon: 'bag'
      },
      tourism: {
        title: 'Turismo & Patrimônio',
        tag: 'ROTEIROS HISTÓRICOS',
        description: 'Pontos turísticos, Museu Municipal, Parque do Rio Jaú e arquitetura histórica.',
        actionText: 'Conhecer patrimônios',
        viewId: 'view-tourism',
        icon: 'camera'
      },
      services: {
        title: 'Serviços ao Cidadão',
        tag: 'GUIA DE ATENDIMENTO',
        description: 'Tributos, certidões, Procon, Poupatempo e agendamentos municipais sem filas.',
        actionText: 'Acessar serviços',
        viewId: 'view-services',
        icon: 'building'
      },
      health: {
        title: 'Saúde & Farmácia',
        tag: 'UNIDADES FIXAS',
        description: 'Santa Casa, UPAs, Farmácia Municipal e UBSs com endereços e telefones fixos.',
        actionText: 'Ver postos de saúde',
        viewId: 'view-health',
        icon: 'cross'
      },
      events: {
        title: 'Calendário Oficial',
        tag: 'EVENTOS MUNICIPAIS',
        description: 'Programação cultural, feiras gastronômicas e exposições na Estância de Jaú.',
        actionText: 'Ver programação',
        viewId: 'view-events',
        icon: 'calendar'
      },
      transparent: {
        title: 'Transparência & Obras',
        tag: 'GESTÃO PÚBLICA',
        description: 'Acompanhe as melhorias da cidade, licitações, despesas públicas e investimentos.',
        actionText: 'Consultar dados',
        viewId: 'view-transparent',
        icon: 'chart'
      },
      contact: {
        title: 'Contatos Úteis',
        tag: 'EMERGÊNCIA & GUIA',
        description: 'Defesa Civil, SAMU, Bombeiros, Polícia e Ouvidoria Municipal.',
        actionText: 'Lista de telefones',
        viewId: 'view-contact',
        icon: 'phone'
      },
      help: {
        title: 'Como Usar o Totem',
        tag: 'ACESSIBILIDADE',
        description: 'Modo alto contraste, navegação assistida e tradutor em Libras integrado.',
        actionText: 'Ver instruções',
        viewId: 'view-help',
        icon: 'help'
      }
    },
    ads: [
      {
        title: 'TERRITÓRIO DO CALÇADO DE JAÚ',
        tag: 'POLO COMERCIAL',
        description: 'O maior shopping de atacado e varejo de calçados do Brasil. Mais de 150 lojas.',
        phone: '(14) 3601-2000',
        address: 'Av. Dep. Zien Nassif, s/n - Rodovia Jaú-Bauru',
        badgeBg: 'rgba(234, 179, 8, 0.2)'
      },
      {
        title: 'PARQUE DO RIO JAÚ & JARDIM DE BAIXO',
        tag: 'PATRIMÔNIO NATURAL',
        description: 'Área de lazer, pista de caminhada e preservação ecológica no coração da cidade.',
        phone: '(14) 3602-1777',
        address: 'Rua General Galvão, Centro - Jaú/SP',
        badgeBg: 'rgba(34, 197, 94, 0.2)'
      }
    ],
    busTitle: 'Pontos de Referência Próximos (Distâncias a Pé)',
    referencePoints: [
      {
        id: 'ref-praca-republica',
        name: 'Praça da República (Jardim de Baixo)',
        badge: '0m • Ponto Atual',
        distance: '0m',
        walkTime: 'Você está aqui',
        category: 'ponto_atual',
        address: 'Praça da República, Centro - Jaú/SP',
        details: 'Localização deste Totem de Utilidade Pública. Centro histórico e comercial.',
        qrPayload: 'https://maps.google.com/?q=Praca+da+Republica+Jau+SP'
      },
      {
        id: 'ref-praca-matriz',
        name: 'Praça da Matriz (N. Sra. do Patrocínio)',
        badge: '150m • 2 min a pé',
        distance: '150m',
        walkTime: '2 min a pé',
        category: 'praca',
        address: 'Praça Barão do Rio Branco, Centro - Jaú/SP',
        details: 'Igreja Matriz histórica construída no início do século XX e calçadão.',
        qrPayload: 'https://maps.google.com/?q=Igreja+Matriz+Nossa+Senhora+do+Patrocinio+Jau+SP'
      },
      {
        id: 'ref-santa-casa',
        name: 'Santa Casa de Jaú & Farmácia Municipal',
        badge: '650m • 8 min a pé',
        distance: '650m',
        walkTime: '8 min a pé',
        category: 'saude',
        address: 'Rua Riachuelo, 1073 - Centro, Jaú/SP',
        details: 'Complexo hospitalar de referência regional e distribuição de medicamentos 24h.',
        qrPayload: 'https://maps.google.com/?q=Santa+Casa+de+Misericordia+de+Jau+SP'
      },
      {
        id: 'ref-terminal-rodoviario',
        name: 'Terminal Rodoviário Municipal de Jaú',
        badge: '1,2 km • 15 min a pé',
        distance: '1,2 km',
        walkTime: '15 min a pé',
        category: 'terminal',
        address: 'Rua Humaitá, 1200 - Vila Nova, Jaú/SP',
        details: 'Ponto de conexões rodoviárias intermunicipais e interestaduais.',
        qrPayload: 'https://maps.google.com/?q=Terminal+Rodoviario+de+Jau+SP'
      }
    ]
  },
  itapui: {
    name: 'Município de Itapuí',
    badge: 'Prainha & Turismo Náutico • 100% Offline',
    alertText: 'GUIA LOCAL FIXO • Praça da Matriz de Itapuí • Informações Fixas Locais (Sem Internet)',
    homeCards: {
      bus: {
        title: 'Mapa e Pontos de Referência',
        tag: 'DISTÂNCIAS A PÉ',
        description: 'Distâncias a pé e endereços fixos da Prainha, Rodoviária e Centro de Itapuí.',
        actionText: 'Ver 4 pontos fixos',
        viewId: 'view-bus',
        icon: 'map'
      },
      shoes: {
        title: 'Comércio Regional & Artesanato',
        tag: 'COMÉRCIO LOCAL',
        description: 'Lojas centrais, peixarias, artesanato local e gastronomia ribeirinha.',
        actionText: 'Ver estabelecimentos',
        viewId: 'view-shoes',
        icon: 'bag'
      },
      tourism: {
        title: 'Prainha & Turismo Náutico',
        tag: 'LAZER E ECOTURISMO',
        description: 'Orla do Rio Tietê, passeios de barco, quiosques e áreas de camping.',
        actionText: 'Ver atrações náuticas',
        viewId: 'view-tourism',
        icon: 'camera'
      },
      services: {
        title: 'Serviços Municipais de Itapuí',
        tag: 'ATENDIMENTO PÚBLICO',
        description: 'Prefeitura Municipal, tributos, certidões e balcão do cidadão.',
        actionText: 'Consultar serviços',
        viewId: 'view-services',
        icon: 'building'
      },
      health: {
        title: 'Saúde & Farmácia',
        tag: 'POSTOS LOCAIS',
        description: 'Centro de Saúde Municipal, Pronto Atendimento e Farmácia Básica.',
        actionText: 'Ver postos',
        viewId: 'view-health',
        icon: 'cross'
      },
      events: {
        title: 'Eventos na Orla',
        tag: 'CALENDÁRIO FESTIVO',
        description: 'Festas das Nações, Carnaval na Prainha e campeonatos de pesca.',
        actionText: 'Ver agenda',
        viewId: 'view-events',
        icon: 'calendar'
      },
      transparent: {
        title: 'Portal de Transparência',
        tag: 'CONTAS PÚBLICAS',
        description: 'Prestação de contas e investimentos da Prefeitura de Itapuí.',
        actionText: 'Acessar portal',
        viewId: 'view-transparent',
        icon: 'chart'
      },
      contact: {
        title: 'Telefones de Emergência',
        tag: 'SERVIÇOS DE APOIO',
        description: 'Guarda Municipal, Bombeiros, Saúde e Ouvidoria.',
        actionText: 'Ver telefones',
        viewId: 'view-contact',
        icon: 'phone'
      },
      help: {
        title: 'Ajuda & Tradutor Libras',
        tag: 'ACESSIBILIDADE',
        description: 'Guia de navegação no totem e assistente em Libras integrado.',
        actionText: 'Como navegar',
        viewId: 'view-help',
        icon: 'help'
      }
    },
    ads: [
      {
        title: 'PRAINHA MUNICIPAL DE ITAPUÍ',
        tag: 'TURISMO DE ÁGUA DOCE',
        description: 'Área com quiosques, praia fluvial, pesca esportiva e gastronomia ribeirinha.',
        phone: '(14) 3661-8000',
        address: 'Av. Beira Rio, s/n - Itapuí/SP',
        badgeBg: 'rgba(56, 189, 248, 0.2)'
      }
    ],
    busTitle: 'Pontos de Referência de Itapuí (Distâncias a Pé)',
    referencePoints: [
      {
        id: 'ref-itapui-matriz',
        name: 'Praça da Matriz de Itapuí',
        badge: '0m • Ponto Atual',
        distance: '0m',
        walkTime: 'Você está aqui',
        category: 'ponto_atual',
        address: 'Praça da Matriz, Centro - Itapuí/SP',
        details: 'Coração da cidade com coreto histórico e arborização.',
        qrPayload: 'https://maps.google.com/?q=Praca+da+Matriz+Itapui+SP'
      },
      {
        id: 'ref-itapui-prefeitura',
        name: 'Prefeitura Municipal de Itapuí',
        badge: '180m • 2 min a pé',
        distance: '180m',
        walkTime: '2 min a pé',
        category: 'servico',
        address: 'Rua São Paulo, 700 - Centro, Itapuí/SP',
        details: 'Sede administrativa e atendimento tributário ao cidadão.',
        qrPayload: 'https://maps.google.com/?q=Prefeitura+de+Itapui+SP'
      },
      {
        id: 'ref-itapui-posto-saude',
        name: 'Centro de Saúde Municipal',
        badge: '400m • 5 min a pé',
        distance: '400m',
        walkTime: '5 min a pé',
        category: 'saude',
        address: 'Rua Floriano Peixoto, 250 - Itapuí/SP',
        details: 'Atendimento ambulatorial, enfermagem e farmácia básica.',
        qrPayload: 'https://maps.google.com/?q=Posto+de+Saude+Itapui+SP'
      },
      {
        id: 'ref-itapui-prainha',
        name: 'Prainha & Orla Fluvial do Tietê',
        badge: '900m • 11 min a pé',
        distance: '900m',
        walkTime: '11 min a pé',
        category: 'turismo',
        address: 'Av. Beira Rio, s/n - Itapuí/SP',
        details: 'Área turística principal com quiosques e lazer.',
        qrPayload: 'https://maps.google.com/?q=Prainha+Municipal+Itapui+SP'
      }
    ]
  },
  bauru: {
    name: 'Polo Regional Bauru',
    badge: 'Centro Regional Centro-Oeste • 100% Offline',
    alertText: 'GUIA LOCAL FIXO • Centro de Bauru • Informações Fixas Locais (Sem Internet)',
    homeCards: {
      bus: {
        title: 'Mapa e Pontos de Referência',
        tag: 'DISTÂNCIAS A PÉ',
        description: 'Distâncias a pé e endereços fixos do Calçadão, Estação Ferroviária e Poupatempo.',
        actionText: 'Ver 4 pontos fixos',
        viewId: 'view-bus',
        icon: 'map'
      },
      shoes: {
        title: 'Comércio Central & Calçadão',
        tag: 'POLO DE COMPRAS',
        description: 'Lojas do Calçadão da Batista e shoppings da região central.',
        actionText: 'Ver comércio',
        viewId: 'view-shoes',
        icon: 'bag'
      },
      tourism: {
        title: 'Turismo Histórico & Zoológico',
        tag: 'ATRATIVOS REGIONAIS',
        description: 'Horto Florestal, Parque Zoológico e Complexo Ferroviário NOB.',
        actionText: 'Ver patrimônios',
        viewId: 'view-tourism',
        icon: 'camera'
      },
      services: {
        title: 'Poupatempo & Serviços Regionais',
        tag: 'CENTRAL DE ATENDIMENTO',
        description: 'Serviços estaduais, emissão de documentos e Detran SP.',
        actionText: 'Acessar balcão',
        viewId: 'view-services',
        icon: 'building'
      },
      health: {
        title: 'Hospital Estadual & UPAs',
        tag: 'COMPLEXO HOSPITALAR',
        description: 'Hospital Estadual de Bauru, Base Regional do SAMU e Pronto-Socorro Central.',
        actionText: 'Ver unidades',
        viewId: 'view-health',
        icon: 'cross'
      },
      events: {
        title: 'Eventos & Exposições',
        tag: 'AGENDA REGIONAL',
        description: 'Grandes eventos de negócios, Grand Expo e feiras universitárias.',
        actionText: 'Ver eventos',
        viewId: 'view-events',
        icon: 'calendar'
      },
      transparent: {
        title: 'Transparência Regional',
        tag: 'PORTAL REGIONAL',
        description: 'Dados de integração regional e polos de desenvolvimento.',
        actionText: 'Ver dados',
        viewId: 'view-transparent',
        icon: 'chart'
      },
      contact: {
        title: 'Contatos de Emergência',
        tag: 'TELEFONES ÚTEIS',
        description: 'Polícia Militar, Corpo de Bombeiros, SAMU e Defesa Civil Regional.',
        actionText: 'Ver contatos',
        viewId: 'view-contact',
        icon: 'phone'
      },
      help: {
        title: 'Acessibilidade & Libras',
        tag: 'SUPORTE AO CIDADÃO',
        description: 'Instruções de usabilidade e módulo de Libras do Totemize.',
        actionText: 'Ajuda interativa',
        viewId: 'view-help',
        icon: 'help'
      }
    },
    ads: [
      {
        title: 'CALÇADÃO DA BATISTA DE CARVALHO',
        tag: 'POLO COMERCIAL',
        description: 'O maior centro comercial a céu aberto do Centro-Oeste Paulista com centenas de lojas.',
        phone: '(14) 3232-0000',
        address: 'Rua Batista de Carvalho, Centro - Bauru/SP',
        badgeBg: 'rgba(234, 179, 8, 0.2)'
      }
    ],
    busTitle: 'Pontos de Referência de Bauru (Distâncias a Pé)',
    referencePoints: [
      {
        id: 'ref-bauru-calcadao',
        name: 'Calçadão da Rua Batista de Carvalho',
        badge: '0m • Ponto Atual',
        distance: '0m',
        walkTime: 'Você está aqui',
        category: 'ponto_atual',
        address: 'Rua Batista de Carvalho, Quadra 5 - Bauru/SP',
        details: 'Principal eixo comercial de pedestres da cidade.',
        qrPayload: 'https://maps.google.com/?q=Calcadao+Batista+de+Carvalho+Bauru+SP'
      },
      {
        id: 'ref-bauru-estacao',
        name: 'Estação Ferroviária Histórica (NOB)',
        badge: '350m • 4 min a pé',
        distance: '350m',
        walkTime: '4 min a pé',
        category: 'turismo',
        address: 'Praça Machado de Mello, Centro - Bauru/SP',
        details: 'Marco histórico da ferrovia no interior de São Paulo.',
        qrPayload: 'https://maps.google.com/?q=Praca+Machado+de+Mello+Bauru+SP'
      },
      {
        id: 'ref-bauru-poupatempo',
        name: 'Poupatempo Bauru & Procon',
        badge: '700m • 9 min a pé',
        distance: '700m',
        walkTime: '9 min a pé',
        category: 'servico',
        address: 'Rua Inconfidência, 4-50 - Bauru/SP',
        details: 'Central única de emissão de RG, CNH e atendimento ao cidadão.',
        qrPayload: 'https://maps.google.com/?q=Poupatempo+Bauru+SP'
      },
      {
        id: 'ref-bauru-rodoviaria',
        name: 'Terminal Rodoviário de Bauru',
        badge: '1,5 km • 18 min a pé',
        distance: '1,5 km',
        walkTime: '18 min a pé',
        category: 'terminal',
        address: 'Praça João Paulo II, s/n - Bauru/SP',
        details: 'Hub rodoviário interestadual com conexões diárias.',
        qrPayload: 'https://maps.google.com/?q=Terminal+Rodoviario+de+Bauru+SP'
      }
    ]
  }
};

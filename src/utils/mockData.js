// Banco de dados de notícias fictícias realistas em português para simulação
const mockNewsTemplates = {
  USD: [
    {
      title: "Dólar atinge estabilidade frente ao Real após novos dados de inflação nos EUA",
      description: "O mercado financeiro reagiu de forma contida ao relatório de inflação americano, mantendo a cotação da moeda americana em patamares estáveis.",
      source: "Valor Financeiro",
      url: "https://example.com/dolar-inflacao-eua",
      publishedAt: "2026-06-08T10:00:00Z"
    },
    {
      title: "Federal Reserve sinaliza manutenção da taxa de juros no próximo trimestre",
      description: "Em ata divulgada hoje, o comitê de política monetária do Fed indicou que a taxa básica de juros deve continuar no patamar atual para controle inflacionário.",
      source: "Globo Economia",
      url: "https://example.com/fed-taxas-juros",
      publishedAt: "2026-06-07T14:30:00Z"
    },
    {
      title: "Como a alta do Dólar afeta o turismo e as importações brasileiras",
      description: "Especialistas analisam os impactos práticos da oscilação cambial do dólar nas viagens ao exterior e no custo de insumos importados pelas indústrias.",
      source: "InfoMercado",
      url: "https://example.com/impacto-dolar-turismo",
      publishedAt: "2026-06-06T09:15:00Z"
    }
  ],
  EUR: [
    {
      title: "Banco Central Europeu (BCE) reduz taxa de juros após desaceleração da inflação",
      description: "Com a inflação da Zona do Euro se aproximando da meta de 2%, a instituição europeia efetuou o primeiro corte de juros em meses.",
      source: "Europa Notícias",
      url: "https://example.com/bce-corte-juros",
      publishedAt: "2026-06-08T08:45:00Z"
    },
    {
      title: "Euro se fortalece após dados positivos de manufatura na Alemanha e França",
      description: "A atividade industrial nas maiores economias da Zona do Euro registrou crescimento acima do esperado no mês passado, impulsionando a moeda comum.",
      source: "Mundo Econômico",
      url: "https://example.com/euro-fortalecimento-industria",
      publishedAt: "2026-06-07T11:20:00Z"
    },
    {
      title: "Perspectivas econômicas para a Zona do Euro em 2026: o que esperar do Euro",
      description: "Analistas projetam um cenário de recuperação econômica moderada com estabilidade cambial para o Euro frente às principais moedas do mundo.",
      source: "Investidor Global",
      url: "https://example.com/euro-perspectivas-2026",
      publishedAt: "2026-06-05T16:00:00Z"
    }
  ],
  BRL: [
    {
      title: "Copom mantém taxa Selic estável e alerta para riscos fiscais no Brasil",
      description: "A decisão unânime do comitê do Banco Central ressalta a importância da vigilância inflacionária e do equilíbrio das contas públicas.",
      source: "Gazeta de Negócios",
      url: "https://example.com/copom-selic-fiscal",
      publishedAt: "2026-06-08T09:30:00Z"
    },
    {
      title: "Balança comercial brasileira registra superávit recorde impulsionado pelo agronegócio",
      description: "Exportações de soja e minério de ferro continuam sustentando o saldo comercial positivo e injetando bilhões de dólares na economia nacional.",
      source: "Agro Diário",
      url: "https://example.com/balanca-comercial-superavit",
      publishedAt: "2026-06-07T13:10:00Z"
    },
    {
      title: "Investidores estrangeiros aumentam aportes na Bolsa brasileira atraídos por valuation",
      description: "Com ações cotadas a múltiplos historicamente baixos, o fluxo cambial de investidores institucionais na B3 apresenta forte recuperação.",
      source: "Bolsa Hoje",
      url: "https://example.com/fluxo-estrangeiro-b3",
      publishedAt: "2026-06-06T15:45:00Z"
    }
  ],
  GBP: [
    {
      title: "Libra esterlina oscila após declarações do Banco da Inglaterra sobre inflação de serviços",
      description: "O presidente do BoE destacou que a inflação no setor de serviços britânico continua resiliente, dificultando cortes imediatos nos juros.",
      source: "UK Financeiro",
      url: "https://example.com/libra-boe-juros",
      publishedAt: "2026-06-08T11:00:00Z"
    },
    {
      title: "PIB do Reino Unido apresenta crescimento modesto no primeiro semestre",
      description: "A economia britânica registrou uma leve expansão de 0.2%, superando as previsões de recessão técnica, mas evidenciando uma recuperação lenta.",
      source: "Londres Report",
      url: "https://example.com/pib-reino-unido",
      publishedAt: "2026-06-06T10:30:00Z"
    }
  ]
};

// Gera notícias genéricas e realistas para qualquer moeda que não tenha um conjunto específico
export const getMockNews = (currencyCode, currencyName = "") => {
  const code = currencyCode.toUpperCase();
  const name = currencyName || currencyCode;
  
  if (mockNewsTemplates[code]) {
    return mockNewsTemplates[code];
  }
  
  // Se não temos notícias específicas para esta moeda, geramos notícias dinâmicas usando o nome/código
  return [
    {
      title: `Flutuações cambiais do ${code}: Analistas debatem o futuro da moeda no mercado internacional`,
      description: `Com o cenário geopolítico e econômico em constante mutação, a cotação do ${name} (${code}) passa por testes de volatilidade nesta semana.`,
      source: "Câmbio & Finanças",
      url: `https://example.com/noticias-${code.toLowerCase()}-1`,
      publishedAt: new Date().toISOString()
    },
    {
      title: `Impacto da política monetária local sobre o rendimento do ${code}`,
      description: `O banco central responsável pela gestão do ${name} sinalizou mudanças regulatórias focadas em conter oscilações extremas na paridade cambial.`,
      source: "Diário do Investidor",
      url: `https://example.com/noticias-${code.toLowerCase()}-2`,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: `Como a inflação global e o mercado de commodities influenciam a força do ${code}`,
      description: `Um estudo setorial indica que os preços de exportação e as taxas de juros americanas continuam sendo os principais drivers para a moeda ${name}.`,
      source: "Economia Global",
      url: `https://example.com/noticias-${code.toLowerCase()}-3`,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

// Gera dados históricos de cotação simulados caso o Frankfurter falhe
// Gera uma série de datas e valores realistas baseados no valor atual
export const getMockHistory = (base, target, currentRate, days = 30) => {
  const rates = {};
  const today = new Date();
  
  // Criamos uma tendência aleatória (random walk) em torno da cotação atual
  let rate = currentRate || 1.0;
  
  // Vamos gerar os dados de trás para frente (do dia mais antigo até hoje)
  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateString = d.toISOString().split('T')[0];
    
    // Pequena variação diária entre -1.5% e +1.5%
    const change = (Math.random() - 0.5) * 0.02 * rate;
    rate = rate + change;
    
    // Evita valores negativos ou absurdamente baixos
    if (rate <= 0) rate = currentRate * 0.9;
    
    rates[dateString] = {
      [target]: parseFloat(rate.toFixed(4))
    };
  }
  
  return {
    amount: 1.0,
    base: base,
    rates: rates
  };
};

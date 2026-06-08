const FRANKFURTER_API = 'https://api.frankfurter.dev/v1';

// Formata data para o formato AAAA-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Busca a lista de moedas disponíveis
 */
export const fetchCurrencies = async () => {
  try {
    const response = await fetch(`${FRANKFURTER_API}/currencies`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar moedas: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro no fetchCurrencies:', error);
    throw error;
  }
};

/**
 * Busca a taxa de conversão atual de base para target
 */
export const fetchLatestRate = async (base, target) => {
  if (base === target) {
    return 1.0;
  }
  try {
    const response = await fetch(`${FRANKFURTER_API}/latest?base=${base}&symbols=${target}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar cotação atual: ${response.statusText}`);
    }
    const data = await response.json();
    return data.rates[target];
  } catch (error) {
    console.error('Erro no fetchLatestRate:', error);
    throw error;
  }
};

/**
 * Busca o histórico de taxas de conversão entre base e target para os últimos X dias
 */
export const fetchHistoricalRates = async (base, target, days = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);

  try {
    const response = await fetch(
      `${FRANKFURTER_API}/${startStr}..${endStr}?base=${base}&symbols=${target}`
    );
    if (!response.ok) {
      throw new Error(`Erro ao buscar histórico de moedas: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro no fetchHistoricalRates:', error);
    throw error;
  }
};

/**
 * Busca notícias relacionadas à moeda de destino
 * @param {string} currencyCode Ex: "USD"
 * @param {string} currencyName Ex: "Dólar Americano"
 * @param {string} apiKey Chave de API de notícias
 * @param {string} apiType 'gnews' ou 'newsapi'
 */
export const fetchNewsFromApi = async (currencyCode, currencyName, apiKey, apiType = 'gnews') => {
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  // Termo de busca que seja específico para economia/finanças daquela moeda
  // Ex: "Dolar Americano" ou "USD moeda"
  const searchTerm = currencyName ? `${currencyName} economia` : `${currencyCode} economia`;
  const encodedSearch = encodeURIComponent(searchTerm);

  if (apiType === 'newsapi') {
    // URL da NewsAPI
    const url = `https://newsapi.org/v2/everything?q=${encodedSearch}&language=pt&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`NewsAPI respondeu com erro: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message || 'Erro NewsAPI');
      }

      // Mapeia para um formato padronizado de notícia
      return (data.articles || []).map(article => ({
        title: article.title,
        description: article.description,
        source: article.source ? article.source.name : 'NewsAPI',
        url: article.url,
        publishedAt: article.publishedAt
      }));
    } catch (error) {
      console.error('Erro NewsAPI:', error);
      throw error;
    }
  } else {
    // Padrão: GNews API
    const url = `https://gnews.io/api/v4/search?q=${encodedSearch}&lang=pt&max=10&token=${apiKey}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`GNews respondeu com erro: ${response.status}`);
      }
      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors.join(', ') || 'Erro GNews');
      }

      // Mapeia para um formato padronizado de notícia
      return (data.articles || []).map(article => ({
        title: article.title,
        description: article.description,
        source: article.source ? article.source.name : 'GNews',
        url: article.url,
        publishedAt: article.publishedAt
      }));
    } catch (error) {
      console.error('Erro GNews:', error);
      throw error;
    }
  }
};

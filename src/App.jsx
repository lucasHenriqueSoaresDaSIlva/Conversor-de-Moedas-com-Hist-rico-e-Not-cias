import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Converter from './components/Converter';
import HistoryChart from './components/HistoryChart';
import NewsList from './components/NewsList';
import SettingsModal from './components/SettingsModal';

import {
  fetchCurrencies,
  fetchLatestRate,
  fetchHistoricalRates,
  fetchNewsFromApi
} from './utils/api';
import { getMockNews, getMockHistory } from './utils/mockData';

// Lista de moedas de contingência caso a API Frankfurter falhe ao iniciar
const FALLBACK_CURRENCIES = {
  BRL: 'Real Brasileiro',
  USD: 'Dólar Americano',
  EUR: 'Euro',
  GBP: 'Libra Esterlina',
  CAD: 'Dólar Canadense',
  AUD: 'Dólar Australiano',
  CHF: 'Franco Suíço',
  JPY: 'Iene Japonês',
  CNY: 'Yuan Chinês'
};

export default function App() {
  // Configuração e Tema
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState(() => {
    // Carrega do localStorage ou variáveis de ambiente (.env)
    const storedType = localStorage.getItem('news_api_type') || 'gnews';
    const storedKey = localStorage.getItem('news_api_key') || 
                      import.meta.env.VITE_GNEWS_KEY || 
                      import.meta.env.VITE_NEWSAPI_KEY || '';
    return { apiType: storedType, apiKey: storedKey };
  });

  // Estados dos Dados e Seleções
  const [currencies, setCurrencies] = useState(FALLBACK_CURRENCIES);
  const [base, setBase] = useState('USD');
  const [target, setTarget] = useState('BRL');
  const [amount, setAmount] = useState('1');
  const [convertedValue, setConvertedValue] = useState(null);
  const [rate, setRate] = useState(null);
  const [days, setDays] = useState(30);
  const [historicalData, setHistoricalData] = useState(null);
  const [news, setNews] = useState([]);
  const [isNewsMock, setIsNewsMock] = useState(true);

  // Estados de Carregamento (Loading)
  const [currenciesLoading, setCurrenciesLoading] = useState(true);
  const [rateLoading, setRateLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);

  // Estados de Erro
  const [currenciesError, setCurrenciesError] = useState(null);
  const [rateError, setRateError] = useState(null);
  const [historyError, setHistoryError] = useState(null);
  const [newsError, setNewsError] = useState(null);

  // Efeito para sincronizar tema no elemento body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 1. Carrega lista de moedas na montagem
  useEffect(() => {
    let active = true;
    const loadCurrencies = async () => {
      try {
        setCurrenciesLoading(true);
        const data = await fetchCurrencies();
        if (active) {
          setCurrencies(data);
          setCurrenciesError(null);
        }
      } catch (err) {
        console.warn('Usando lista de moedas fallback devido a falha na API:', err);
        if (active) {
          setCurrencies(FALLBACK_CURRENCIES);
          // Não bloqueamos a aplicação totalmente se falhar
          setCurrenciesError('Conexão instável. Usando lista básica de moedas.');
        }
      } finally {
        if (active) setCurrenciesLoading(false);
      }
    };
    loadCurrencies();
    return () => { active = false; };
  }, []);

  // 2. Efeito para converter valores em tempo real
  useEffect(() => {
    let active = true;
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setConvertedValue(null);
      setRate(null);
      return;
    }

    const performConversion = async () => {
      try {
        setRateLoading(true);
        setRateError(null);
        
        const currentRate = await fetchLatestRate(base, target);
        if (active) {
          setRate(currentRate);
          setConvertedValue(numAmount * currentRate);
        }
      } catch (err) {
        console.error('Falha ao obter taxa atual, usando simulação:', err);
        if (active) {
          // Fallback de cotação simulada caso Frankfurter esteja indisponível
          const simulatedRate = base === 'USD' && target === 'BRL' ? 5.25 
                              : base === 'EUR' && target === 'BRL' ? 5.65 
                              : base === 'BRL' && target === 'USD' ? 0.19 
                              : Math.random() * 2 + 0.5; // taxa padrão simulada
          setRate(simulatedRate);
          setConvertedValue(numAmount * simulatedRate);
          setRateError('Erro ao buscar taxa em tempo real. Usando cotação aproximada offline.');
        }
      } finally {
        if (active) setRateLoading(false);
      }
    };

    // Debounce sutil para evitar excesso de requisições enquanto o usuário digita
    const timeoutId = setTimeout(() => {
      performConversion();
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [base, target, amount]);

  // 3. Efeito para carregar histórico e gráfico
  useEffect(() => {
    let active = true;
    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError(null);
        const data = await fetchHistoricalRates(base, target, days);
        if (active) {
          setHistoricalData(data);
        }
      } catch (err) {
        console.error('Erro ao buscar histórico da API. Gerando dados simulados:', err);
        if (active) {
          // Fallback de dados históricos simulados baseados no valor atual da cotação
          const currentRate = rate || 1.0;
          const mockHistory = getMockHistory(base, target, currentRate, days);
          setHistoricalData(mockHistory);
          setHistoryError('Dados históricos aproximados.');
        }
      } finally {
        if (active) setHistoryLoading(false);
      }
    };
    loadHistory();
    return () => { active = false; };
  }, [base, target, days, rate]);

  // 4. Efeito para carregar notícias da moeda de destino
  useEffect(() => {
    let active = true;
    const loadNews = async () => {
      const targetName = currencies[target] || '';
      
      if (!apiKeys.apiKey) {
        // Sem chave: carrega notícias simuladas imediatamente
        if (active) {
          const mockNews = getMockNews(target, targetName);
          setNews(mockNews);
          setIsNewsMock(true);
          setNewsError(null);
        }
        return;
      }

      try {
        setNewsLoading(true);
        setNewsError(null);
        
        const articles = await fetchNewsFromApi(
          target,
          targetName,
          apiKeys.apiKey,
          apiKeys.apiType
        );
        
        if (active) {
          setNews(articles);
          setIsNewsMock(false);
        }
      } catch (err) {
        console.warn('Falha na API de notícias. Revertendo para simuladas:', err);
        if (active) {
          // Reverte para notícias simuladas caso a API lance erro (ex: limite de quota)
          const mockNews = getMockNews(target, targetName);
          setNews(mockNews);
          setIsNewsMock(true);
          setNewsError(`Falha ao conectar com API de notícias (${err.message}). Exibindo conteúdo simulado.`);
        }
      } finally {
        if (active) setNewsLoading(false);
      }
    };

    loadNews();
    return () => { active = false; };
  }, [target, currencies, apiKeys]);

  const handleSaveKeys = (keys) => {
    setApiKeys(keys);
  };

  return (
    <div className="app-container">
      {/* Elementos visuais abstratos de fundo */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <Header
        theme={theme}
        setTheme={setTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="main-content">
        <div className="converter-column">
          {currenciesError && (
            <div className="warning-banner fade-in" style={{ padding: '0.75rem 1rem' }}>
              <span>⚠️ {currenciesError}</span>
            </div>
          )}
          
          <Converter
            currencies={currencies}
            amount={amount}
            setAmount={setAmount}
            base={base}
            setBase={setBase}
            target={target}
            setTarget={setTarget}
            convertedValue={convertedValue}
            rate={rate}
            loading={rateLoading || currenciesLoading}
            error={rateError}
          />
        </div>

        <div className="display-column" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {historyError && (
            <div className="warning-banner fade-in" style={{ marginBottom: 0, padding: '0.75rem 1rem' }}>
              <span>ℹ️ Grafico offline: {historyError}</span>
            </div>
          )}

          <HistoryChart
            historicalData={historicalData}
            loading={historyLoading}
            error={historyError && !historicalData}
            base={base}
            target={target}
            days={days}
            setDays={setDays}
          />

          {newsError && (
            <div className="warning-banner fade-in" style={{ marginBottom: 0, padding: '0.75rem 1rem' }}>
              <span>ℹ️ Notícias: {newsError}</span>
            </div>
          )}

          <NewsList
            news={news}
            loading={newsLoading}
            error={newsError}
            target={target}
            targetName={currencies[target]}
            isMock={isNewsMock}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>
      </main>

      <Footer />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveKeys={handleSaveKeys}
      />
    </div>
  );
}

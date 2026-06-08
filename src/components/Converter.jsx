import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftRight, Search, ChevronDown, Check } from 'lucide-react';

// Custom Searchable Dropdown Component
function CurrencySelect({ label, value, onChange, currencies, excludeCurrency }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Limpa a busca ao fechar/abrir
  useEffect(() => {
    if (!isOpen) setSearch('');
  }, [isOpen]);

  const currencyOptions = Object.entries(currencies)
    .filter(([code]) => code !== excludeCurrency)
    .filter(([code, name]) => 
      code.toLowerCase().includes(search.toLowerCase()) || 
      name.toLowerCase().includes(search.toLowerCase())
    );

  const selectedName = currencies[value] || '';

  return (
    <div className="select-wrapper" ref={dropdownRef}>
      <span className="form-label">{label}</span>
      <button
        type="button"
        className={`select-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <strong style={{ fontSize: '1.1rem' }}>{value}</strong>
          <span style={{ fontSize: '0.875rem', opacity: 0.7, fontWeight: 500 }}>- {selectedName}</span>
        </span>
        <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--transition-fast)' }} />
      </button>

      {isOpen && (
        <div className="select-options-dropdown">
          <input
            type="text"
            className="select-search-input"
            placeholder="Buscar moeda (ex: USD, Real)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
            {currencyOptions.length === 0 ? (
              <div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Nenhuma moeda encontrada
              </div>
            ) : (
              currencyOptions.map(([code, name]) => (
                <div
                  key={code}
                  className={`select-option ${code === value ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(code);
                    setIsOpen(false);
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="select-option-code">{code}</span>
                    <span className="select-option-name">{name}</span>
                  </span>
                  {code === value && <Check size={16} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Converter({
  currencies,
  amount,
  setAmount,
  base,
  setBase,
  target,
  setTarget,
  convertedValue,
  rate,
  loading,
  error
}) {
  const handleAmountChange = (e) => {
    // Permite apenas números e substitui vírgula por ponto para cálculo decimal
    const val = e.target.value.replace(',', '.');
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setAmount(e.target.value);
    }
  };

  const handleSwap = () => {
    const temp = base;
    setBase(target);
    setTarget(temp);
  };

  const numAmount = parseFloat(amount) || 0;
  const showResult = convertedValue !== null && !loading && !error && numAmount > 0;

  // Formatação de moedas
  const formatCurrency = (val, currencyCode) => {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      }).format(val);
    } catch (e) {
      return `${currencyCode} ${val.toFixed(2)}`;
    }
  };

  return (
    <div className="panel converter-pane fade-in">
      <h2>Conversor de Moedas</h2>

      <div className="form-group">
        <label className="form-label" htmlFor="amount-input">Valor a Converter</label>
        <div className="input-container">
          <input
            id="amount-input"
            type="text"
            inputMode="decimal"
            className="currency-input"
            placeholder="Digite o valor (ex: 100,00)..."
            value={amount}
            onChange={handleAmountChange}
          />
        </div>
      </div>

      <CurrencySelect
        label="De (Origem)"
        value={base}
        onChange={setBase}
        currencies={currencies}
        excludeCurrency={target}
      />

      <div className="swap-btn-container">
        <button
          className="swap-btn"
          onClick={handleSwap}
          title="Inverter Moedas"
          aria-label="Inverter Moedas de Origem e Destino"
        >
          <ArrowLeftRight size={18} />
        </button>
      </div>

      <CurrencySelect
        label="Para (Destino)"
        value={target}
        onChange={setTarget}
        currencies={currencies}
        excludeCurrency={base}
      />

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <span>Convertendo taxas...</span>
        </div>
      )}

      {error && (
        <div className="error-banner" style={{ marginTop: '1.5rem' }}>
          <span>⚠️ {error}</span>
        </div>
      )}

      {showResult && (
        <div className="result-box fade-in">
          <div className="result-formula">
            {formatCurrency(numAmount, base)} =
          </div>
          <div className="result-values">
            <div className="result-value-converted">
              {formatCurrency(convertedValue, target)}
            </div>
          </div>
          <div className="result-rate-inverse">
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
              <span>Taxa atual: 1 {base} = {rate?.toFixed(4)} {target}</span>
              <span>1 {target} = {(1 / rate)?.toFixed(4)} {base}</span>
            </div>
          </div>
        </div>
      )}
      
      {!loading && !error && numAmount === 0 && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Digite um valor acima de zero para calcular.
        </div>
      )}
    </div>
  );
}

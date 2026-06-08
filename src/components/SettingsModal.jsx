import React, { useState, useEffect } from 'react';
import { X, Key, Info, Trash2, CheckCircle2 } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onSaveKeys }) {
  const [apiType, setApiType] = useState('gnews');
  const [apiKey, setApiKey] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedType = localStorage.getItem('news_api_type') || 'gnews';
      const storedKey = localStorage.getItem('news_api_key') || '';
      setApiType(storedType);
      setApiKey(storedKey);
      setStatusMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('news_api_type', apiType);
    localStorage.setItem('news_api_key', apiKey.trim());
    onSaveKeys({ apiType, apiKey: apiKey.trim() });
    
    setStatusMessage('Configurações salvas com sucesso!');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    localStorage.removeItem('news_api_type');
    localStorage.removeItem('news_api_key');
    setApiKey('');
    onSaveKeys({ apiType: 'gnews', apiKey: '' });
    setStatusMessage('Chave removida. O app usará notícias simuladas.');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Fechar modal">
          <X size={18} />
        </button>

        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          <Key size={20} className="text-primary" style={{ color: 'var(--primary)' }} />
          Chaves de API de Notícias
        </h2>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
          As notícias são carregadas via API externa. O Frankfurt (câmbio e gráfico) é gratuito e ilimitado.
          Para habilitar notícias reais, informe sua chave de acesso abaixo. Caso contrário, serão usadas **notícias fictícias realistas para demonstração**.
        </p>

        {statusMessage && (
          <div className="warning-banner" style={{ marginBlock: '1rem', backgroundColor: 'var(--success-light)', borderColor: 'var(--success)', color: 'var(--success)' }}>
            <CheckCircle2 size={16} />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <span className="form-label">Provedor de Notícias</span>
            <div style={{ display: 'flex', gap: '1.5rem', marginBlock: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
                <input
                  type="radio"
                  name="apiType"
                  value="gnews"
                  checked={apiType === 'gnews'}
                  onChange={() => setApiType('gnews')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                GNews API (Recomendado)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
                <input
                  type="radio"
                  name="apiType"
                  value="newsapi"
                  checked={apiType === 'newsapi'}
                  onChange={() => setApiType('newsapi')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                NewsAPI
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="api-key-input">Chave de API (Token)</label>
            <input
              id="api-key-input"
              type="password"
              className="currency-input"
              style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}
              placeholder={apiType === 'gnews' ? 'Insira seu token do GNews...' : 'Insira sua apiKey do NewsAPI...'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="warning-banner" style={{ marginBlock: '1.5rem', padding: '0.75rem 1rem' }}>
            <Info size={16} />
            <span style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
              {apiType === 'gnews' ? (
                <>Obtenha uma chave gratuita registrando-se em <a href="https://gnews.io/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: '700' }}>gnews.io</a> (100 requisições diárias).</>
              ) : (
                <>Obtenha uma chave gratuita registrando-se em <a href="https://newsapi.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: '700' }}>newsapi.org</a>.</>
              )}
            </span>
          </div>

          <div className="modal-actions">
            {apiKey && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', marginRight: 'auto' }}
                onClick={handleClear}
              >
                <Trash2 size={16} />
                Limpar
              </button>
            )}
            <button type="button" className="btn btn-text" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

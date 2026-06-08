import React from 'react';
import { Newspaper, ExternalLink, Key, AlertCircle, Calendar } from 'lucide-react';

export default function NewsList({
  news,
  loading,
  error,
  target,
  targetName,
  isMock,
  onOpenSettings
}) {
  // Skeleton Loader Component
  const SkeletonGrid = () => (
    <div className="news-grid">
      {[1, 2, 3].map((n) => (
        <div key={n} className="skeleton-card shimmer">
          <div>
            <div className="skeleton-text" style={{ width: '40%' }}></div>
            <div className="skeleton-title" style={{ width: '90%' }}></div>
            <div className="skeleton-text" style={{ width: '100%' }}></div>
            <div className="skeleton-text" style={{ width: '80%' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="skeleton-text" style={{ width: '25%', marginBottom: 0 }}></div>
            <div className="skeleton-text" style={{ width: '30%', marginBottom: 0 }}></div>
          </div>
        </div>
      ))}
    </div>
  );

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="news-pane fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>
          <Newspaper size={22} className="text-primary" style={{ color: 'var(--primary)' }} />
          Notícias de Mercado: {targetName || target} ({target})
        </h2>
        {isMock && (
          <span 
            className="warning-banner" 
            style={{ 
              margin: 0, 
              padding: '0.25rem 0.75rem', 
              fontSize: '0.75rem', 
              borderRadius: '20px', 
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              borderColor: 'var(--accent)',
              fontWeight: 700
            }}
          >
            Modo Demonstração (Notícias Simuladas)
          </span>
        )}
      </div>

      {isMock && (
        <div 
          className="warning-banner" 
          style={{ 
            marginTop: 0, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={16} />
            <span style={{ fontSize: '0.8125rem' }}>
              Para receber notícias financeiras em tempo real deste par, insira uma chave de API.
            </span>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={onOpenSettings} 
            style={{ 
              padding: '0.35rem 0.75rem', 
              fontSize: '0.75rem', 
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)'
            }}
          >
            Configurar API Key
          </button>
        </div>
      )}

      {loading ? (
        <SkeletonGrid />
      ) : error && !isMock ? (
        <div className="empty-state">
          <AlertCircle size={40} style={{ color: 'var(--error)' }} />
          <div className="empty-state-title">Erro ao Carregar Notícias</div>
          <p style={{ fontSize: '0.875rem', maxWidth: '350px', marginInline: 'auto' }}>
            Ocorreu uma falha ao contatar a API de notícias: {error}. Tente recarregar a página.
          </p>
        </div>
      ) : news.length === 0 ? (
        <div className="empty-state">
          <Newspaper size={40} />
          <div className="empty-state-title">Nenhuma Notícia Encontrada</div>
          <p style={{ fontSize: '0.875rem' }}>
            Não encontramos artigos recentes relacionados a {targetName || target} no momento.
          </p>
        </div>
      ) : (
        <div className="news-grid">
          {news.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-card fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="news-card-source">{item.source}</span>
                  <ExternalLink size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
                </div>
                <h3 className="news-card-title">{item.title}</h3>
                {item.description && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {item.description}
                  </p>
                )}
              </div>
              <div className="news-card-footer">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={12} />
                  {formatDate(item.publishedAt)}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

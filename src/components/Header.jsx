import React from 'react';
import { Sun, Moon, Settings, Coins } from 'lucide-react';

export default function Header({ theme, setTheme, onOpenSettings }) {
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <header className="app-header">
      <a href="/" className="logo-section">
        <div className="logo-icon">
          <Coins size={22} />
        </div>
        <h1 className="logo-text">MoedaFlow</h1>
      </a>

      <div className="header-actions">
        <button
          className="icon-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          title={theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <button
          className="icon-btn"
          onClick={onOpenSettings}
          aria-label="Abrir configurações de API"
          title="Configurações de API"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}

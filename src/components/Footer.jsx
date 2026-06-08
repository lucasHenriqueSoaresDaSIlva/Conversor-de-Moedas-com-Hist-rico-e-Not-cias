import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <p>© {currentYear} MoedaFlow. Desenvolvido para conversão de moedas, série histórica e notícias financeiras em tempo real.</p>
    </footer>
  );
}

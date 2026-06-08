import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function HistoryChart({
  historicalData,
  loading,
  error,
  base,
  target,
  days,
  setDays
}) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Processa dados históricos
  const ratesObject = historicalData?.rates || {};
  const chartData = Object.entries(ratesObject)
    .map(([date, symbols]) => ({
      date,
      value: symbols[target]
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Dimensões do SVG interno (ViewBox)
  const viewBoxWidth = 500;
  const viewBoxHeight = 220;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  
  const chartWidth = viewBoxWidth - paddingLeft - paddingRight;
  const chartHeight = viewBoxHeight - paddingTop - paddingBottom;

  if (loading) {
    return (
      <div className="panel" style={{ minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="loading-overlay">
          <div className="spinner"></div>
          <span>Buscando histórico de cotações...</span>
        </div>
      </div>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <div className="panel" style={{ minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <AlertCircle size={40} style={{ color: 'var(--error)', marginBottom: '1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>Erro no Gráfico</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', maxWidth: '300px' }}>
          Não foi possível carregar o histórico de cotações de {base} para {target} nos últimos {days} dias.
        </p>
      </div>
    );
  }

  // Extrai valores máximo e mínimo para escalar o eixo Y
  const values = chartData.map((d) => d.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  
  // Margem de respiro vertical de 8%
  const valRange = rawMax - rawMin || 1;
  const yMin = Math.max(0, rawMin - valRange * 0.08);
  const yMax = rawMax + valRange * 0.08;

  // Mapeamento de coordenadas X e Y
  const getX = (index) => {
    if (chartData.length <= 1) return paddingLeft;
    return paddingLeft + (index / (chartData.length - 1)) * chartWidth;
  };

  const getY = (value) => {
    const scale = (value - yMin) / (yMax - yMin);
    return paddingTop + chartHeight - scale * chartHeight;
  };

  // Monta a string do path da linha
  let linePath = '';
  let areaPath = '';

  if (chartData.length > 0) {
    const points = chartData.map((d, i) => `${getX(i)},${getY(d.value)}`);
    linePath = `M ${points.join(' L ')}`;
    
    // Path da área sombreada
    const startY = paddingTop + chartHeight;
    areaPath = `${linePath} L ${getX(chartData.length - 1)},${startY} L ${getX(0)},${startY} Z`;
  }

  // Estatísticas do período
  const averageRate = values.reduce((a, b) => a + b, 0) / values.length;
  const maxRate = rawMax;
  const minRate = rawMin;

  const handleMouseMove = (e) => {
    if (!containerRef.current || chartData.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Obtém o X do mouse em escala relativa ao viewBox (0 a 500)
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * viewBoxWidth;

    // Calcula qual ponto está mais próximo do mouse
    let closestIndex = 0;
    let minDiff = Infinity;
    
    for (let i = 0; i < chartData.length; i++) {
      const diff = Math.abs(getX(i) - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    setHoverIndex(closestIndex);

    // Ajusta a posição do tooltip baseada no ponto real no gráfico
    const pointX = getX(closestIndex);
    const pointY = getY(chartData[closestIndex].value);
    
    // Calcula posição absoluta para renderizar a caixa HTML por cima do contêiner
    const pctX = pointX / viewBoxWidth;
    const pctY = pointY / viewBoxHeight;
    
    setTooltipPos({
      x: pctX * rect.width,
      y: pctY * rect.height
    });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Formata datas de exibição nos eixos (ex: "08 Jun")
  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  // Rótulos do Eixo X (Início, Meio, Fim)
  const xLabelsIndices = [];
  if (chartData.length > 1) {
    xLabelsIndices.push(0); // Primeiro dia
    xLabelsIndices.push(Math.floor(chartData.length / 2)); // Meio
    xLabelsIndices.push(chartData.length - 1); // Último dia
  }

  // Rótulos do Eixo Y (Máximo, Médio, Mínimo)
  const yLabels = [
    { value: yMax, label: yMax.toFixed(4) },
    { value: (yMax + yMin) / 2, label: ((yMax + yMin) / 2).toFixed(4) },
    { value: yMin, label: yMin.toFixed(4) }
  ];

  return (
    <div className="panel fade-in" ref={containerRef}>
      <div className="chart-header">
        <h2 className="chart-title">
          <TrendingUp size={22} className="text-primary" style={{ color: 'var(--primary)' }} />
          Histórico ({base}/{target})
        </h2>
        
        <div className="chart-controls">
          <button
            className={`chart-tab ${days === 7 ? 'active' : ''}`}
            onClick={() => setDays(7)}
          >
            7 Dias
          </button>
          <button
            className={`chart-tab ${days === 30 ? 'active' : ''}`}
            onClick={() => setDays(30)}
          >
            30 Dias
          </button>
        </div>
      </div>

      <div 
        className="chart-svg-wrapper"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'crosshair' }}
      >
        <svg 
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} 
          className="chart-svg"
        >
          {/* Definições de Gradientes de Área */}
          <defs>
            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            
            {/* Sombra sutil sob a linha */}
            <filter id="shadow-filter" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="var(--primary)" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Gridlines Horizontais */}
          {yLabels.map((item, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={getY(item.value)}
                x2={viewBoxWidth - paddingRight}
                y2={getY(item.value)}
                className="chart-grid-line"
              />
              <text
                x={paddingLeft - 10}
                y={getY(item.value) + 3}
                textAnchor="end"
                className="chart-axis-text"
              >
                {item.label}
              </text>
            </g>
          ))}

          {/* Área sombreada */}
          {areaPath && (
            <path d={areaPath} className="chart-area-path" />
          )}

          {/* Linha da Cotação */}
          {linePath && (
            <path
              d={linePath}
              className="chart-line-path"
              filter="url(#shadow-filter)"
              style={{ stroke: 'var(--primary)' }}
            />
          )}

          {/* Rótulos do Eixo X */}
          {xLabelsIndices.map((idx) => (
            <text
              key={idx}
              x={getX(idx)}
              y={viewBoxHeight - 12}
              textAnchor={idx === 0 ? 'start' : idx === chartData.length - 1 ? 'end' : 'middle'}
              className="chart-axis-text"
            >
              {formatDateLabel(chartData[idx].date)}
            </text>
          ))}

          {/* Marcador interativo (Hover Tracker) */}
          {hoverIndex !== null && (
            <g>
              {/* Linha guia vertical */}
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={paddingTop + chartHeight}
                stroke="var(--primary)"
                strokeWidth={1}
                strokeDasharray="3,3"
                opacity={0.7}
              />
              {/* Ponto realce */}
              <circle
                cx={getX(hoverIndex)}
                cy={getY(chartData[hoverIndex].value)}
                r={6}
                fill="var(--primary)"
                stroke="var(--surface)"
                strokeWidth={2}
              />
            </g>
          )}
        </svg>

        {/* Tooltip HTML Dinâmico sobreposto */}
        {hoverIndex !== null && chartData[hoverIndex] && (
          <div
            className="chart-tooltip fade-in"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`
            }}
          >
            <span className="chart-tooltip-date">
              {new Date(chartData[hoverIndex].date + 'T00:00:00').toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
            <span className="chart-tooltip-value">
              {chartData[hoverIndex].value.toFixed(4)} {target}
            </span>
          </div>
        )}
      </div>

      {/* Estatísticas Legenda */}
      <div className="chart-legend">
        <span className="chart-legend-val">
          Min: <strong className="chart-legend-low">{minRate.toFixed(4)}</strong>
        </span>
        <span className="chart-legend-val">
          Média: <strong>{averageRate.toFixed(4)}</strong>
        </span>
        <span className="chart-legend-val">
          Max: <strong className="chart-legend-high">{maxRate.toFixed(4)}</strong>
        </span>
      </div>
    </div>
  );
}

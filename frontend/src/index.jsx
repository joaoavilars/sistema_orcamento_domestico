import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importa nosso CSS (com Tailwind e temas)
import App from './App';

// Aplica o tema dark por padrão na inicialização
const applyTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  // Dark como padrão se não houver preferência salva
  const theme = savedTheme || 'dark';
  
  const root = window.document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Salva o tema padrão se não existir
  if (!savedTheme) {
    localStorage.setItem('theme', 'dark');
  }
};

// Aplica o tema antes de renderizar
applyTheme();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
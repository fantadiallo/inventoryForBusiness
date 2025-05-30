import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.scss'; // Your custom global SCSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

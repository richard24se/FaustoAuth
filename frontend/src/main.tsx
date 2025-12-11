import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider as Provider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './i18n';
import theme from './theme';
import './index.css';
import { Toaster } from './components/ui/toaster';
import { ColorModeProvider } from './components/ui/color-mode';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider value={theme}>
      <ColorModeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <Toaster />
      </ColorModeProvider>
    </Provider>
  </React.StrictMode>,
);

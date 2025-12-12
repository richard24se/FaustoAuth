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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider value={theme}>
      <ColorModeProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
          <Toaster />
        </QueryClientProvider>
      </ColorModeProvider>
    </Provider>
  </React.StrictMode>,
);

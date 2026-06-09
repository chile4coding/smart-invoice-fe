import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from "@tanstack/react-query";
import './index.css'
import DisableDevtool from 'disable-devtool';


import App from './App.jsx'
import { queryClient } from "./lib/queryClient";
import { triggerOverlay } from './lib/utils.js';

DisableDevtool({
  url: '/not-found',
  timeoutMs: 2000,
  disableMenu: true,
  clearLog: true,
  ondevtoolopen: (type) => {
    triggerOverlay(type); // your overlay function
  },
});
createRoot(document.getElementById('root')).render(
  <StrictMode>
    
    <QueryClientProvider client={queryClient}>

      <App />
    </QueryClientProvider>
  </StrictMode>,
)
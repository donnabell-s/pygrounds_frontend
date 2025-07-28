import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from "./context/AuthContext";
import { GameProvider } from "./context/GameContext";
import { AdaptiveProvider } from "./context/AdaptiveContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdaptiveProvider>
      <AuthProvider>
        <GameProvider>
            <App />
        </GameProvider>
      </AuthProvider>
    </AdaptiveProvider>
  </StrictMode>,
)

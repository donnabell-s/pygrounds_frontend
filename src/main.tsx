import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from "./context/AuthContext";
import { GameProvider } from "./context/GameContext";
import { AdaptiveProvider } from "./context/AdaptiveContext";
import { UserProvider } from "./context/UserContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdaptiveProvider>
      <AuthProvider>
        <UserProvider>
          <GameProvider>
              <App />
          </GameProvider>
        </UserProvider>
      </AuthProvider>
    </AdaptiveProvider>
  </StrictMode>,
)

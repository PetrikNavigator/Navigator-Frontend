import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { BuildingsProvider } from './contexts/navigator/BuildingContext.tsx'
import { ClassroomProvider } from './contexts/navigator/ClassroomContext.tsx'
import { ClassroomTypeProvider } from './contexts/navigator/ClassroomTypesContext.tsx'
import { CorridorProvider } from './contexts/navigator/CorridorContext.tsx'
import { LiftsProvider } from './contexts/navigator/LiftsContext.tsx'
import { StairsProvider } from './contexts/navigator/StairsContext.tsx'
import { AuthProvider } from './contexts/other/AuthContext.tsx'
import { ThemeProvider } from './contexts/other/ThemeContext.tsx'
import { GraphProvider } from './contexts/other/GraphContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GraphProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <BuildingsProvider>
              <ClassroomProvider>
                <CorridorProvider>
                  <LiftsProvider>
                    <StairsProvider>
                      <ClassroomTypeProvider>
                        <App />
                      </ClassroomTypeProvider>
                    </StairsProvider>
                  </LiftsProvider>
                </CorridorProvider>
              </ClassroomProvider>
            </BuildingsProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </GraphProvider>
  </StrictMode >
)

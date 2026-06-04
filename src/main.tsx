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
import { AdminProvider } from './contexts/other/AdminContext.tsx'
import { AuthProvider } from './contexts/other/AuthContext.tsx'
import { LastEditedProvider } from './contexts/other/LastEditedContext.tsx'
import { PremiseProvider } from './contexts/other/PremiseContext.tsx'
import { ThemeProvider } from './contexts/other/ThemeContext.tsx'
import { GraphProvider } from './contexts/other/GraphContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GraphProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <BuildingsProvider>
              <AdminProvider>
                <ClassroomProvider>
                  <CorridorProvider>
                    <LiftsProvider>
                      <StairsProvider>
                        <ClassroomTypeProvider>
                          <LastEditedProvider>
                            <PremiseProvider>
                              <App />
                            </PremiseProvider>
                          </LastEditedProvider>
                        </ClassroomTypeProvider>
                      </StairsProvider>
                    </LiftsProvider>
                  </CorridorProvider>
                </ClassroomProvider>
              </AdminProvider>
            </BuildingsProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </GraphProvider>
  </StrictMode >
)

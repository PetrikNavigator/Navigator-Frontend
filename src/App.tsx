import { Route, Routes } from "react-router";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Kiosk from "./components/Kiosk";
import { useAuth } from "./contexts/other/AuthContext";
import { useLayoutEffect, useState } from "react";

export default function App() {
  const { getMe } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  const handleAuth = async () => {
    await getMe()
    setIsLoading(false)
  }

  useLayoutEffect(() => {
    handleAuth()
  }, [])

  if (isLoading)
    return null

  return (
    <Routes>

      <Route path="/*" element={<Dashboard />} />
      <Route path="/bejelentkezes" element={<Login />} />
      <Route path="/kiosk" element={<div className="h-screen w-screen p-4"><Kiosk /></div>} />
      <Route path="/beallitasok" element={<p>Beállítások</p>} />

    </Routes>
  )
}
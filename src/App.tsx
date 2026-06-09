import { Route, Routes } from "react-router";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { useAuth } from "./contexts/other/AuthContext";
import { useLayoutEffect, useState } from "react";
import Settings from "./pages/Settings";

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
      <Route path="/beallitasok" element={<Settings />} />

    </Routes>
  )
}
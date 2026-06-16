import { useAuth } from "../contexts/other/AuthContext";
import Kiosk from "./Kiosk";
import ManagerDashboard from "./ManagerDashboard";

export default function Dashboard() {
    const { user } = useAuth();

    if (user)
        return <ManagerDashboard />

    return <Kiosk />
}
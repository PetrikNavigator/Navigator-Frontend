import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../contexts/other/AuthContext";

export default function SidebarProfileButtons() {
    const { user, logout, isLoading } = useAuth();
    const navigate = useNavigate()

    const onLogout = async () => {
        await logout();
        navigate("/", { replace: true })
    }

    return (
        <div className="mt-auto">
            {
                user ?
                    <>
                        <li className="menu-title">Fiók</li>
                        <li>
                            <NavLink to={`/profil`}>
                                Profil
                            </NavLink>
                        </li>
                        <li>
                            <button onClick={onLogout} className="btn btn-error mt-2 btn-sm" disabled={isLoading}>
                                Kijelentkezés
                            </button>
                        </li>
                    </>
                    :
                    <li>
                        <NavLink to={"/login"} className="btn btn-primary btn-sm">
                            Belépés
                        </NavLink>
                    </li>
            }

        </div>
    )
}
import ThemeSwitcher from "../ThemeSwitcher";

export default function KioskNavbar() {
    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start"></div>
            <div className="navbar-center">
                <h2 className="text-xl">Petrik Navigátor</h2>
            </div>
            <div className="navbar-end">
                <ThemeSwitcher />
            </div>
        </div>
    )
}
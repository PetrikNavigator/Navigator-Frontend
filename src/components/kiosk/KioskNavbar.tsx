import { useTranslation } from "react-i18next";
import ThemeSwitcher from "../ThemeSwitcher";
import LanguageSwitcher from "../LanguageSwitcher";

export default function KioskNavbar() {
    const { t } = useTranslation()

    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start"></div>
            <div className="navbar-center">
                <h2 className="text-xl">{t("ui.kiosk.navbar_title")}</h2>
            </div>
            <div className="navbar-end gap-2">
                <LanguageSwitcher />
                <ThemeSwitcher />
            </div>
        </div>
    )
}

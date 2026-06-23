import { useLanguage } from "../contexts/other/LanguageContext"
import { SUPPORTED_LANGUAGES, type AppLanguage } from "../i18n/i18n"

const LABELS: Record<AppLanguage, string> = {
    hu: "HU",
    en: "EN",
}

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage()

    return (
        <div className="join">
            {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                    key={lang}
                    type="button"
                    className={`btn btn-sm join-item ${language === lang ? "btn-primary" : "btn-ghost"}`}
                    aria-pressed={language === lang}
                    onClick={() => setLanguage(lang)}
                >
                    {LABELS[lang]}
                </button>
            ))}
        </div>
    )
}

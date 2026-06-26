import { useLanguage } from "../contexts/other/LanguageContext"
import { useTranslations } from "../contexts/other/TranslationsContext"
import { useLayoutEffect } from "react"

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage()
    const { available, getAvailableLanguages } = useTranslations()

    useLayoutEffect(() => {
        getAvailableLanguages();
    }, [])

    return (
        <div className="join">
            {available.map((lang) => (
                <button
                    key={lang}
                    type="button"
                    className={`btn btn-sm join-item ${language === lang ? "btn-primary" : "btn-ghost"}`}
                    aria-pressed={language === lang}
                    onClick={() => setLanguage(lang)}
                >
                    {lang.toUpperCase()}
                </button>
            ))}
        </div>
    )
}

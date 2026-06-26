import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Translation bundles are loaded at runtime from the backend (see
// LanguageContext), so we initialise i18next with empty resources. Codenames
// such as "ui.login.submit" or "building.a_epulet.name" are used as flat keys,
// so the nested key/namespace separators are disabled.
void i18n.use(initReactI18next).init({
    lng: "hu",
    fallbackLng: "hu",
    resources: {},
    keySeparator: false,
    nsSeparator: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    returnEmptyString: false,
})

export default i18n

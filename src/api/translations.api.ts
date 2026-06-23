import { get_request } from "./requests"

export type TranslationBundle = Record<string, string>

/**
 * Public endpoint: returns every translation for the given language as a flat
 * { codename: text } map. No authentication required.
 */
export async function getLang(lang: string): Promise<TranslationBundle> {
    return await get_request<TranslationBundle>(
        `/api/translations/lang?lang=${encodeURIComponent(lang)}`
    )
}

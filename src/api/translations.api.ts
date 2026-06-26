import type { Translation, AddTranslation, UpdateTranslation } from "../types/Translation"
import { get_request, post_put_request, delete_request } from "./requests"

const PATH: string = "/api/translations"

export type TranslationBundle = Record<string, string>

export async function getAvailableLanguages(): Promise<string[]> {
    return await get_request<string[]>(
        `${PATH}/available`
    )
}

/**
 * Public endpoint: returns every translation for the given language as a flat
 * { codename: text } map. No authentication required.
 */
export async function getLang(lang: string): Promise<TranslationBundle> {
    return await get_request<TranslationBundle>(
        `${PATH}/lang?lang=${encodeURIComponent(lang)}`
    )
}

/** Authenticated: every translation row (all languages). */
export async function getTranslations(): Promise<Translation[]> {
    return await get_request<Translation[]>(PATH)
}

/** Authenticated: create one (lang_key, text_key) row. */
export async function addTranslation(body: AddTranslation): Promise<Translation> {
    return await post_put_request<AddTranslation, Translation>("POST", PATH, body)
}

/** Authenticated: update the text of an existing (lang, key) row. */
export async function modifyTranslation(
    lang: string,
    key: string,
    body: UpdateTranslation
): Promise<Translation> {
    const path = `${PATH}/${encodeURIComponent(lang)}/${encodeURIComponent(key)}`
    return await post_put_request<UpdateTranslation, Translation>("PUT", path, body)
}

/** Authenticated: delete a single (lang, key) row. */
export async function deleteTranslation(lang: string, key: string): Promise<Translation> {
    const path = `${PATH}/${encodeURIComponent(lang)}/${encodeURIComponent(key)}`
    return await delete_request<Translation>(path)
}

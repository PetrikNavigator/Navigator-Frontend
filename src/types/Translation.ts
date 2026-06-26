export type Translation = {
    lang_key: string
    text_key: string
    text: string
}

/** Body for creating a single (lang_key, text_key) row. */
export type AddTranslation = Translation

/** Body for updating an existing row — only the text can change. */
export type UpdateTranslation = {
    text: string
}

/** A codename and its text per language (lang_key -> text). */
export type TranslationGroup = {
    text_key: string
    values: Record<string, string>
}

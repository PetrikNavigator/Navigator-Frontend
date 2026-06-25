/** Supported on-screen keyboard layouts. */
export type KeyboardLang = "hu" | "en"

/** A keyboard layout is just rows of character keys. Control keys (shift,
 *  space, backspace, language, close) are rendered by the component itself,
 *  so layouts only describe the printable characters. */
export type KeyboardLayout = {
    lang: KeyboardLang
    label: string
    /** Rows of single-character keys, top to bottom. */
    rows: string[][]
}

const NUMBER_ROW = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]

/** Hungarian QWERTZ with the common accented vowels on their own row. */
export const HU_LAYOUT: KeyboardLayout = {
    lang: "hu",
    label: "HU",
    rows: [
        NUMBER_ROW,
        ["q", "w", "e", "r", "t", "z", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
        ["y", "x", "c", "v", "b", "n", "m"],
        ["á", "é", "í", "ó", "ö", "ő", "ú", "ü", "ű"],
    ],
}

/** English QWERTY. */
export const EN_LAYOUT: KeyboardLayout = {
    lang: "en",
    label: "EN",
    rows: [
        NUMBER_ROW,
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
        ["z", "x", "c", "v", "b", "n", "m"],
    ],
}

export const LAYOUTS: Record<KeyboardLang, KeyboardLayout> = {
    hu: HU_LAYOUT,
    en: EN_LAYOUT,
}
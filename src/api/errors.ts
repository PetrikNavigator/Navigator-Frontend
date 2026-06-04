import { isAxiosError } from "axios"

const FALLBACK = "Ismeretlen hiba történt. Próbáld újra!"

// Coerces anything thrown — strings, Error objects, undefined, axios errors,
// nested API payloads — into a stable user-facing string. The contexts store
// these in React state and render them as `{error}` in JSX, so an Error
// object or undefined would either crash ("Objects are not valid as a React
// child") or silently render nothing.
export function normalizeError(err: unknown): string {
    if (err === null || err === undefined) return FALLBACK
    if (typeof err === "string") return err.trim() || FALLBACK
    if (typeof err === "number" || typeof err === "boolean") return String(err)

    if (isAxiosError(err)) {
        if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
            return "A szerver nem elérhető. Ellenőrizd a kapcsolatot!"
        }
        if (err.code === "ECONNABORTED") {
            return "Időtúllépés a szerver válaszára várva."
        }
        const status = err.response?.status
        const data: any = err.response?.data
        const fromData =
            (typeof data === "string" ? data : null) ??
            data?.message ??
            data?.error ??
            data?.detail
        if (typeof fromData === "string" && fromData.trim()) return fromData
        if (status === 401) return "Be kell jelentkezned a művelethez."
        if (status === 403) return "Nincs jogosultságod a művelethez."
        if (status === 404) return "A keresett erőforrás nem található."
        if (status === 409) return "Ütközés: az adat időközben módosulhatott."
        if (status === 422) return "Hibás adat — ellenőrizd a kitöltést."
        if (status && status >= 500) return "Szerverhiba. Próbáld újra később!"
        if (err.message) return err.message
        return FALLBACK
    }

    if (err instanceof Error) return err.message?.trim() || FALLBACK

    if (typeof err === "object") {
        const obj = err as Record<string, unknown>
        if (typeof obj.message === "string" && obj.message.trim())
            return obj.message
        if (typeof obj.error === "string" && obj.error.trim())
            return obj.error
        try {
            // BigInt-safe replacer — kept as defensive code even though
            // IDs are now plain strings: third-party libs may still put
            // a BigInt somewhere in an error tree, and the default
            // JSON.stringify would throw on it.
            const json = JSON.stringify(err, (_, v) =>
                typeof v === "bigint" ? v.toString() : v
            )
            if (json && json !== "{}") return json
        } catch {
            // circular / unserialisable — fall through
        }
    }

    return FALLBACK
}

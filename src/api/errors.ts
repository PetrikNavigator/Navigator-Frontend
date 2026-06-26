import { isAxiosError } from "axios"
import i18n from "../i18n/i18n"

// Coerces anything thrown — strings, Error objects, undefined, axios errors,
// nested API payloads — into a stable user-facing string. The contexts store
// these in React state and render them as `{error}` in JSX, so an Error
// object or undefined would either crash ("Objects are not valid as a React
// child") or silently render nothing. Messages are resolved through i18next so
// they follow the active language.
export function normalizeError(err: unknown): string {
    const fallback = () => i18n.t("ui.error.fallback")

    if (err === null || err === undefined) return fallback()
    if (typeof err === "string") return err.trim() || fallback()
    if (typeof err === "number" || typeof err === "boolean") return String(err)

    if (isAxiosError(err)) {
        if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
            return i18n.t("ui.error.network")
        }
        if (err.code === "ECONNABORTED") {
            return i18n.t("ui.error.timeout")
        }
        const status = err.response?.status
        const data: any = err.response?.data
        const fromData =
            (typeof data === "string" ? data : null) ??
            data?.message ??
            data?.error ??
            data?.detail
        if (typeof fromData === "string" && fromData.trim()) return fromData
        if (status === 401) return i18n.t("ui.error.unauthorized")
        if (status === 403) return i18n.t("ui.error.forbidden")
        if (status === 404) return i18n.t("ui.error.not_found")
        if (status === 409) return i18n.t("ui.error.conflict")
        if (status === 422) return i18n.t("ui.error.unprocessable")
        if (status && status >= 500) return i18n.t("ui.error.server")
        if (err.message) return err.message
        return fallback()
    }

    if (err instanceof Error) return err.message?.trim() || fallback()

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

    return fallback()
}

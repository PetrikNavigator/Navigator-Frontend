import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Modal from "../../Modal"
import { useTranslations } from "../../../contexts/other/TranslationsContext"
import type { TranslationGroup } from "../../../types/Translation"

type Props = {
    group: TranslationGroup | null
    open: boolean
    setOpen: (value: boolean) => void
}

type Row = { lang: string; text: string }

const DEFAULT_LANGS = ["hu", "en"]

export default function TranslationEditorModal({ group, open, setOpen }: Props) {
    const { t } = useTranslation()
    const { createGroup, updateGroup, isError, error, isLoading, languages } = useTranslations()

    const [textKey, setTextKey] = useState("")
    const [rows, setRows] = useState<Row[]>([])
    const [err, setErr] = useState("")

    const editing = group !== null

    useEffect(() => {
        if (group) {
            setTextKey(group.text_key)
            setRows(
                Object.entries(group.values)
                    .map(([lang, text]) => ({ lang, text }))
                    .sort((a, b) => a.lang.localeCompare(b.lang))
            )
        } else {
            setTextKey("")
            const langs = languages.length > 0 ? languages : DEFAULT_LANGS
            setRows(langs.map((lang) => ({ lang, text: "" })))
        }
        setErr("")
    }, [group, open])

    const onClose = () => {
        setOpen(false)
    }

    const setRow = (index: number, patch: Partial<Row>) => {
        setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
    }

    const addRow = () => {
        setRows((prev) => [...prev, { lang: "", text: "" }])
    }

    const removeRow = (index: number) => {
        setRows((prev) => prev.filter((_, i) => i !== index))
    }

    const onSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setErr("")

        if (!textKey.trim()) {
            setErr(t("ui.translation.err_codename"))
            return
        }

        const used = rows.filter((r) => r.lang.trim() !== "")
        if (used.length === 0) {
            setErr(t("ui.translation.err_no_language"))
            return
        }
        if (used.some((r) => r.text.trim() === "")) {
            setErr(t("ui.translation.err_text"))
            return
        }
        const langs = used.map((r) => r.lang.trim())
        if (new Set(langs).size !== langs.length) {
            setErr(t("ui.translation.err_duplicate_lang"))
            return
        }

        const values: Record<string, string> = {}
        for (const r of used) values[r.lang.trim()] = r.text

        try {
            if (editing) {
                await updateGroup(textKey.trim(), values)
            } else {
                await createGroup(textKey.trim(), values)
            }
            setOpen(false)
        } catch {
            // error is surfaced via context isError/error
        }
    }

    return (
        <Modal
            showClose={false}
            title={editing ? t("ui.translation.edit_title") : t("ui.translation.new_title")}
            open={open}
            onClose={onClose}
            footer={
                <>
                    <button className="btn btn-ghost" onClick={onClose}>
                        {t("ui.common.cancel")}
                    </button>
                    <button className="btn btn-primary" form="translation-form" disabled={isLoading}>
                        {editing ? t("ui.common.save") : t("ui.common.create")}
                    </button>
                </>
            }
        >
            <form id="translation-form" onSubmit={onSubmit} className="space-y-4 min-w-[min(90vw,32rem)]">
                {/* CODENAME */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">{t("ui.translation.codename")}</span>
                    </label>
                    <input
                        className="input input-bordered w-full font-mono"
                        value={textKey}
                        placeholder={t("ui.translation.codename_placeholder")}
                        onChange={(e) => setTextKey(e.target.value)}
                        disabled={editing}
                        required
                    />
                </div>

                {/* LANGUAGE ROWS */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="label-text font-semibold">{t("ui.translation.text")}</span>
                        <button type="button" className="btn btn-ghost btn-xs" onClick={addRow}>
                            + {t("ui.translation.add_language")}
                        </button>
                    </div>

                    {rows.map((row, index) => (
                        <div key={index} className="flex gap-2 items-start">
                            <input
                                className="input input-bordered w-24 shrink-0"
                                value={row.lang}
                                placeholder={t("ui.translation.lang_placeholder")}
                                onChange={(e) => setRow(index, { lang: e.target.value })}
                            />
                            <input
                                className="input input-bordered w-full"
                                value={row.text}
                                placeholder={t("ui.translation.text_placeholder")}
                                onChange={(e) => setRow(index, { text: e.target.value })}
                            />
                            <button
                                type="button"
                                className="btn btn-ghost btn-square"
                                title={t("ui.translation.remove_language")}
                                onClick={() => removeRow(index)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                {/* ERRORS */}
                {(isError || err) && (
                    <div className="alert alert-error">
                        {isError && <span>{error}</span>}
                        {err && <span>{err}</span>}
                    </div>
                )}
            </form>
        </Modal>
    )
}

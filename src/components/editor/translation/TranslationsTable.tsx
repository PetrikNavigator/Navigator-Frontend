import { useLayoutEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import TranslationEditorModal from "./TranslationEditorModal";
import { useTranslations } from "../../../contexts/other/TranslationsContext";
import type { TranslationGroup } from "../../../types/Translation";

export default function TranslationsTable() {
    const { t } = useTranslation()
    const { groups, languages, getTranslations, deleteGroup } = useTranslations()

    const [editing, setEditing] = useState<TranslationGroup | null>(null)
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")

    useLayoutEffect(() => {
        getTranslations()
    }, [])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return groups

        return groups.filter((g) =>
            g.text_key.toLowerCase().includes(q) ||
            Object.values(g.values).some((v) => v.toLowerCase().includes(q))
        )
    }, [groups, query])

    const onCreate = () => {
        setEditing(null)
        setOpen(true)
    }

    const onEdit = (group: TranslationGroup) => {
        setEditing(group)
        setOpen(true)
    }

    const onRemove = async (group: TranslationGroup) => {
        const res = confirm(t("ui.confirm.delete", { name: group.text_key }))
        if (res)
            await deleteGroup(group.text_key)
    }

    return (
        <>
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-0">
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <button className="btn btn-primary w-max" onClick={onCreate}>
                            {t("ui.translation.add")}
                        </button>
                        <input
                            type="text"
                            className="input input-bordered w-full sm:max-w-xs"
                            placeholder={t("ui.translation.search_placeholder")}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="overflow-x-auto max-h-[80vh]">
                        <table className="table table-pin-rows">
                            <thead>
                                <tr>
                                    <th>{t("ui.translation.codename")}</th>
                                    {languages.map((lang) => (
                                        <th key={lang}>{lang}</th>
                                    ))}
                                    <th className="w-32"></th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtered.map((g) => (
                                    <tr key={g.text_key}>
                                        <td className="font-mono text-xs">{g.text_key}</td>

                                        {languages.map((lang) => (
                                            <td key={lang}>{g.values[lang] ?? "—"}</td>
                                        ))}

                                        <td>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => onEdit(g)}
                                                >
                                                    {t("ui.common.edit")}
                                                </button>

                                                <button
                                                    className="btn btn-error btn-sm"
                                                    onClick={() => onRemove(g)}
                                                >
                                                    {t("ui.common.delete")}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filtered.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={languages.length + 2}
                                            className="text-center text-base-content/60 py-8"
                                        >
                                            {t("ui.translation.empty")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <TranslationEditorModal
                open={open}
                group={editing}
                setOpen={setOpen}
            />
        </>
    )
}

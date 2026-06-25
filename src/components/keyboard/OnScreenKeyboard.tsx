import { useTranslation } from "react-i18next"
import type { KeyboardLayout } from "./layouts"

type Props = {
    layout: KeyboardLayout
    /** Whether the next letter is shifted (one-shot). */
    shift: boolean
    onChar: (char: string) => void
    onBackspace: () => void
    onSpace: () => void
    onEnter: () => void
    onShift: () => void
    onClose: () => void
}

/**
 * Presentational on-screen keyboard: a fixed bar docked to the bottom of the
 * viewport. It is purely controlled — every key calls back to the provider,
 * which owns the focused input.
 *
 * The whole panel suppresses the default mousedown so tapping a key never
 * steals focus from (and thus never blurs) the active input.
 */
export default function OnScreenKeyboard({
    layout, shift, onChar, onBackspace, onSpace, onEnter, onShift, onClose,
}: Props) {
    const { t } = useTranslation()
    const cap = (ch: string) => (shift ? ch.toLocaleUpperCase("hu") : ch)

    return (
        <div
            // Keep the active input focused: prevent the keys from grabbing focus.
            onMouseDown={(e) => e.preventDefault()}
            className="fixed inset-x-0 bottom-0 z-[1000] bg-base-200 border-t border-base-300 shadow-2xl p-2 select-none"
            role="group"
            aria-label={t("ui.keyboard.aria")}
        >
            <div className="mx-auto max-w-3xl flex flex-col gap-1.5">
                <div className="flex items-center justify-end">
                    <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={onClose}
                        title={t("ui.keyboard.close")}
                        aria-label={t("ui.keyboard.close_aria")}
                    >
                        ✕
                    </button>
                </div>

                {/* Character rows. */}
                {layout.rows.map((row, i) => (
                    <div key={i} className="flex justify-center gap-1 sm:gap-1.5">
                        {row.map((ch) => (
                            <button
                                key={ch}
                                type="button"
                                className="btn btn-sm sm:btn-md flex-1 max-w-14 px-0 text-base sm:text-lg"
                                onClick={() => onChar(cap(ch))}
                            >
                                {cap(ch)}
                            </button>
                        ))}
                    </div>
                ))}

                {/* Control row. */}
                <div className="flex justify-center gap-1 sm:gap-1.5">
                    <button
                        type="button"
                        className={`btn btn-sm sm:btn-md ${shift ? "btn-primary" : "btn-neutral"}`}
                        onClick={onShift}
                        aria-pressed={shift}
                        title="Shift"
                    >
                        ⇧ Shift
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm sm:btn-md flex-1"
                        onClick={onSpace}
                    >
                        {t("ui.keyboard.space")}
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm sm:btn-md btn-neutral"
                        onClick={onBackspace}
                        title={t("ui.common.delete")}
                    >
                        ⌫
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm sm:btn-md btn-primary"
                        onClick={onEnter}
                    >
                        ⏎
                    </button>
                </div>
            </div>
        </div>
    )
}

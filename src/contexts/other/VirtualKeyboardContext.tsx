import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react"
import OnScreenKeyboard from "../../components/keyboard/OnScreenKeyboard"
import {
    LAYOUTS,
    type KeyboardLang,
} from "../../components/keyboard/layouts"
import i18next from "i18next"

type Editable = HTMLInputElement | HTMLTextAreaElement

type VirtualKeyboardContextValue = {
    /** Whether the keyboard is currently shown. */
    open: boolean
    /** Force the keyboard closed (also blurs the active field). */
    close: () => void
}

const VirtualKeyboardContext = createContext<VirtualKeyboardContextValue | undefined>(undefined)

/** Input types the keyboard handles. Others (number, date, checkbox…) are
 *  left alone — they don't support text-caret editing the same way. */
const TEXT_TYPES = new Set(["text", "search", "email", "url", "tel", "password", ""])

function isEditable(el: EventTarget | null): el is Editable {
    if (el instanceof HTMLTextAreaElement) return true
    if (el instanceof HTMLInputElement) return TEXT_TYPES.has(el.type)
    return false
}

/** Set an input/textarea value through the native setter so React's change
 *  tracking fires `onChange` for controlled components. */
function setNativeValue(el: Editable, value: string): void {
    const proto =
        el instanceof HTMLTextAreaElement
            ? HTMLTextAreaElement.prototype
            : HTMLInputElement.prototype
    const desc = Object.getOwnPropertyDescriptor(proto, "value")
    desc?.set?.call(el, value)
    el.dispatchEvent(new Event("input", { bubbles: true }))
}

/**
 * Wrap a subtree in this provider; any text input/textarea focused inside it
 * pops up an on-screen keyboard, which disappears when focus leaves. Mark an
 * input (or any ancestor) with `data-no-keyboard` to opt it out.
 */
export function VirtualKeyboardProvider({ children }: { children: ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const activeRef = useRef<Editable | null>(null)
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const [open, setOpen] = useState(false)
    const [shift, setShift] = useState(false)

    const close = useCallback(() => {
        activeRef.current?.blur()
        activeRef.current = null
        setOpen(false)
    }, [])

    // Auto-attach: watch focus moving in/out of editable fields. focusin/
    // focusout bubble, so a single listener on the wrapper covers the subtree.
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const onFocusIn = (e: FocusEvent) => {
            const t = e.target
            if (!isEditable(t)) return
            if (t.closest("[data-no-keyboard]")) return
            if (hideTimer.current) clearTimeout(hideTimer.current)
            activeRef.current = t
            setShift(false)
            setOpen(true)
        }

        // Defer hiding so moving focus directly to another field doesn't flash
        // the keyboard closed (the next focusin cancels this).
        const onFocusOut = () => {
            if (hideTimer.current) clearTimeout(hideTimer.current)
            hideTimer.current = setTimeout(() => {
                activeRef.current = null
                setOpen(false)
            }, 150)
        }

        container.addEventListener("focusin", onFocusIn)
        container.addEventListener("focusout", onFocusOut)
        return () => {
            container.removeEventListener("focusin", onFocusIn)
            container.removeEventListener("focusout", onFocusOut)
            if (hideTimer.current) clearTimeout(hideTimer.current)
        }
    }, [])

    // Restore the caret after React re-renders the controlled value.
    const restoreCaret = useCallback((el: Editable, caret: number) => {
        requestAnimationFrame(() => {
            try {
                el.focus()
                el.setSelectionRange(caret, caret)
            } catch {
                /* selection unsupported on this input type */
            }
        })
    }, [])

    const insert = useCallback((text: string) => {
        const el = activeRef.current
        if (!el) return
        const start = el.selectionStart ?? el.value.length
        const end = el.selectionEnd ?? el.value.length
        const next = el.value.slice(0, start) + text + el.value.slice(end)
        setNativeValue(el, next)
        restoreCaret(el, start + text.length)
    }, [restoreCaret])

    const onChar = useCallback((ch: string) => {
        insert(ch)
        setShift(false) // one-shot shift
    }, [insert])

    const onBackspace = useCallback(() => {
        const el = activeRef.current
        if (!el) return
        let start = el.selectionStart ?? el.value.length
        const end = el.selectionEnd ?? el.value.length
        if (start === end) {
            if (start === 0) return
            start -= 1
        }
        const next = el.value.slice(0, start) + el.value.slice(end)
        setNativeValue(el, next)
        restoreCaret(el, start)
    }, [restoreCaret])

    return (
        <VirtualKeyboardContext.Provider value={{ open, close }}>
            {/* display:contents → no layout box, but focus events still bubble here. */}
            <div ref={containerRef} style={{ display: "contents" }}>
                {children}
            </div>

            {open && (
                <OnScreenKeyboard
                    layout={LAYOUTS[i18next.language as KeyboardLang]}
                    shift={shift}
                    onChar={onChar}
                    onBackspace={onBackspace}
                    onSpace={() => insert(" ")}
                    onEnter={close}
                    onShift={() => setShift((s) => !s)}
                    onClose={close}
                />
            )}
        </VirtualKeyboardContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useVirtualKeyboard(): VirtualKeyboardContextValue {
    const ctx = useContext(VirtualKeyboardContext)
    if (!ctx) throw new Error("useVirtualKeyboard must be used within a VirtualKeyboardProvider")
    return ctx
}

import { useEffect } from "react"

/** User-activity events that count as "the kiosk is in use". */
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
    "pointerdown",
    "pointermove",
    "keydown",
    "wheel",
    "touchstart",
    "touchmove",
]

/**
 * Fires `onIdle` after `timeoutMs` of no user activity. Any tracked input
 * event restarts the countdown. Pass a stable `onIdle` (e.g. a useCallback)
 * so the listeners aren't torn down and rebuilt on every render.
 *
 * `pointermove`/`touchmove` are throttled so dragging the 3D view doesn't
 * reset the timer on every frame.
 */
export function useIdleTimer(onIdle: () => void, timeoutMs = 60_000): void {
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>
        let lastMove = 0

        const reset = () => {
            clearTimeout(timer)
            timer = setTimeout(onIdle, timeoutMs)
        }

        // Coalesce high-frequency move events to at most one reset per 250ms.
        const onActivity = (e: Event) => {
            if (e.type === "pointermove" || e.type === "touchmove") {
                const now = Date.now()
                if (now - lastMove < 250) return
                lastMove = now
            }
            reset()
        }

        for (const ev of ACTIVITY_EVENTS)
            window.addEventListener(ev, onActivity, { passive: true })
        reset()

        return () => {
            clearTimeout(timer)
            for (const ev of ACTIVITY_EVENTS)
                window.removeEventListener(ev, onActivity)
        }
    }, [onIdle, timeoutMs])
}

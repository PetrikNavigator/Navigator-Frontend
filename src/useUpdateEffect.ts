import { useEffect, useRef } from "react";

export default function useUpdateEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
    const mounted = useRef(0);
    const depCount = deps?.length || 0

    useEffect(() => {
        if (mounted.current <= depCount) {
            mounted.current++
            return;
        }

        return effect();
    }, deps);
}
import { useEffect, useMemo, useState } from "react";
import EditorView3D from "../three/EditorView3D";
import { useGraph } from "../contexts/other/GraphContext";
import {
    loadMyLocation,
    saveMyLocation,
    type MyLocation,
} from "../types/navigator/MyLocation";
import { getStoreyRange } from "../three/entities/buildingHelpers";

const DEFAULT_LOCATION: MyLocation = { x: 0, y: 0, storey: 0 };

export default function Settings() {
    const { graph, getFullGraph } = useGraph()
    const [location, setLocation] = useState<MyLocation>(DEFAULT_LOCATION);

    const [saved, setSaved] = useState(false);

    useEffect(() => {
        getFullGraph()
        const stored = loadMyLocation();
        if (stored) setLocation(stored);
    }, []);

    const storeyRange = useMemo(
        () => (graph ? getStoreyRange(graph) : { min: 0, max: 0 }),
        [graph],
    );

    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

    const setStorey = (storey: number) =>
        setLocation((prev) => ({
            ...prev,
            storey: clamp(Math.round(storey), storeyRange.min, storeyRange.max),
        }));

    const saveLocation = () => {
        saveMyLocation(location);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const clearLocation = () => {
        saveMyLocation(null);
        setLocation(DEFAULT_LOCATION);
    };

    return (
        <div className="p-6">
            <div className="xl:flex xl:space-x-6">
                <div>
                    <h1 className="card-title text-2xl">Beállítások</h1>
                    <p className="text-sm opacity-70 mt-1 max-w-xs">
                        Húzd a piros jelölőt a 3D nézetben a saját pozíciód
                        beállításához, vagy add meg a koordinátákat kézzel.
                    </p>

                    <fieldset className="fieldset">
                        <legend className="label">X</legend>
                        <input
                            type="number"
                            className="input input-bordered"
                            value={location.x}
                            onChange={(e) =>
                                setLocation((prev) => ({
                                    ...prev,
                                    x: Number(e.target.value),
                                }))
                            }
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="label">Y</legend>
                        <input
                            type="number"
                            className="input input-bordered"
                            value={location.y}
                            onChange={(e) =>
                                setLocation((prev) => ({
                                    ...prev,
                                    y: Number(e.target.value),
                                }))
                            }
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="label">
                            Emelet ({storeyRange.min}–{storeyRange.max})
                        </legend>
                        <input
                            type="number"
                            className="input input-bordered"
                            min={storeyRange.min}
                            max={storeyRange.max}
                            value={location.storey}
                            onChange={(e) => setStorey(Number(e.target.value))}
                        />
                    </fieldset>

                    <div className="mt-6 flex gap-2">
                        <button className="btn btn-primary" onClick={saveLocation}>
                            Mentés
                        </button>
                        <button className="btn btn-outline" onClick={clearLocation}>
                            Törlés
                        </button>
                    </div>

                    {saved && (
                        <div className="alert alert-success mt-4">
                            <span>Sikeres mentés.</span>
                        </div>
                    )}
                </div>

                <div className="hidden xl:flex rounded-xl w-full border border-slate-700 overflow-hidden h-[80vh]">
                    <EditorView3D
                        className="w-full h-full"
                        initialDistance={120}
                        showAxes
                        graph={graph}
                        myLocation={location}
                        onTransform={(patch) =>
                            setLocation((prev) => ({
                                ...prev,
                                ...(patch.x !== undefined ? { x: Math.round(patch.x) } : {}),
                                ...(patch.y !== undefined ? { y: Math.round(patch.y) } : {}),
                            }))
                        }
                    />
                </div>
            </div>
        </div>
    );
}

import { useEffect, useMemo, useState } from "react";
import EditorView3D from "../../three/EditorView3D";
import { useGraph } from "../../contexts/other/GraphContext";
import EditorViewControls from "./EditorViewControls";
import type { EditorAppearance, EditorFilter } from "../../three/editor/types";

export default function Preview() {
    const { graph, getFullGraph } = useGraph()

    const [filter, setFilter] = useState<EditorFilter>({})
    const [dimOthers, setDimOthers] = useState(false)

    useEffect(() => {
        getFullGraph()
    }, []);

    const appearance = useMemo<EditorAppearance>(
        () => ({ filter, emphasis: { dimOthers } }),
        [filter, dimOthers],
    )

    return (
        <div className="w-full flex flex-col xl:flex-row gap-4 justify-center items-start">
            <div className="xl:w-72 w-full xl:flex-shrink-0">
                <EditorViewControls
                    graph={graph}
                    onChange={(f, d) => { setFilter(f); setDimOthers(d) }}
                />
            </div>

            <div
                className="
                rounded-xl border border-slate-700
                w-full
                max-w-[85vw]
                aspect-video
                max-h-[85vh]
                overflow-hidden
            "
            >
                <EditorView3D
                    className="w-full h-full"
                    initialDistance={120}
                    showAxes
                    graph={graph}
                    appearance={appearance}
                />
            </div>
        </div>
    )
}

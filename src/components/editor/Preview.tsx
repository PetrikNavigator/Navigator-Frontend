import { useEffect } from "react";
import EditorView3D from "../../three/EditorView3D";
import { useGraph } from "../../contexts/other/GraphContext";
import { CANVAS_BG_DARK, CANVAS_BG_LIGHT } from "../../types/three/material-types";
import { useTheme } from "../../contexts/other/ThemeContext";

export default function Preview() {
    const { graph, getFullGraph } = useGraph()
    const { theme } = useTheme()

    useEffect(() => {
        getFullGraph()
    }, []);

    const background = theme ? CANVAS_BG_DARK : CANVAS_BG_LIGHT

    return (
        <div className="w-full flex flex-col xl:flex-row gap-4 justify-center items-start">
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
                    background={background}
                    showAxes
                    graph={graph}
                />
            </div>
        </div>
    )
}

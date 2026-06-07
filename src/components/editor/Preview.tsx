import { useEffect } from "react";
import EditorView3D from "../../three/EditorView3D";
import { useGraph } from "../../contexts/other/GraphContext";

export default function Preview() {
    const { graph, getFullGraph } = useGraph()

    useEffect(() => {
        getFullGraph()
    }, []);

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
                    showAxes
                    graph={graph}
                />
            </div>
        </div>
    )
}

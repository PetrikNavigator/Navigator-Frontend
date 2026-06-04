import { useEffect } from "react";
import SchoolPreview3D from "../../three/SchoolPreview3D";
import { useGraph } from "../../contexts/other/GraphContext";

export default function Preview() {
    const { graph, getFullGraph } = useGraph()

    useEffect(() => {
        getFullGraph()
    }, []);

    return (
        <div className="w-full flex justify-center items-center">
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
                <SchoolPreview3D
                    className="w-full h-full"
                    initialDistance={120}
                    showAxes
                    graph={graph}
                />
            </div>
        </div>
    )
}
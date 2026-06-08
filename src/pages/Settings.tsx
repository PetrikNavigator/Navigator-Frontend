import { useEffect, useState } from "react";
import EditorView3D from "../three/EditorView3D";
import { useGraph } from "../contexts/other/GraphContext";

type Coordinates = {
    x: number;
    y: number;
};

export default function Settings() {
    const {graph, getFullGraph} = useGraph()
    const [coordinates, setCoordinates] = useState<Coordinates>({ x: 0, y: 0 });

    const [saved, setSaved] = useState(false);

    useEffect(() => {
        getFullGraph()
        const stored = localStorage.getItem("coordinates");

        if (stored) {
            try {
                setCoordinates(JSON.parse(stored));
            } catch (err) {
                console.error("Failed to parse coordinates", err);
            }
        }
    }, []);

    const saveCoordinates = () => {
        localStorage.setItem("coordinates", JSON.stringify(coordinates));

        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 2000);
    };

    return (
        <div className="p-6">
            <div className="xl:flex xl:space-x-6">
                <div>
                    <h1 className="card-title text-2xl">Beállítások</h1>

                    <fieldset className="fieldset">
                        <legend className="label">X</legend>
                        <input
                            type="number"
                            className="input input-bordered"
                            value={coordinates.x}
                            onChange={(e) =>
                                setCoordinates((prev) => ({
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
                            value={coordinates.y}
                            onChange={(e) =>
                                setCoordinates((prev) => ({
                                    ...prev,
                                    y: Number(e.target.value),
                                }))
                            }
                        />
                    </fieldset>

                    <div className="mt-6">
                        <button
                            className="btn btn-primary"
                            onClick={saveCoordinates}
                        >
                            Mentés
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
                        // edit={edit}
                        // appearance={appearance}
                        // onTransform={(patch) =>
                        //     setForm((f) => ({
                        //         ...f,
                        //         ...(patch.size_x !== undefined
                        //             ? {
                        //                 size_x: Math.round(
                        //                     patch.size_x
                        //                 ),
                        //             }
                        //             : {}),
                        //         ...(patch.size_y !== undefined
                        //             ? {
                        //                 size_y: Math.round(
                        //                     patch.size_y
                        //                 ),
                        //             }
                        //             : {}),
                        //         ...(patch.size_z !== undefined
                        //             ? {
                        //                 size_z: Math.round(
                        //                     patch.size_z
                        //                 ),
                        //             }
                        //             : {}),
                        //         ...(patch.x !== undefined
                        //             ? {
                        //                 x: Math.round(patch.x),
                        //             }
                        //             : {}),
                        //         ...(patch.y !== undefined
                        //             ? {
                        //                 y: Math.round(patch.y),
                        //             }
                        //             : {}),
                        //         ...(patch.rotation !== undefined
                        //             ? {
                        //                 rotation:
                        //                     normalizeDoorRotation(
                        //                         patch.rotation
                        //                     ),
                        //             }
                        //             : {}),
                        //     }))
                        // }
                    />
                </div>
            </div>


        </div>
    );
}
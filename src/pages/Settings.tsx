import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import EditorView3D from "../three/EditorView3D";
import { useGraph } from "../contexts/other/GraphContext";
import {
    loadMyLocation,
    saveMyLocation,
} from "../types/navigator/MyLocation";
import { getStoreyRange } from "../three/entities/buildingHelpers";

export default function Settings() {
    const { t } = useTranslation()
    const { graph, getFullGraph } = useGraph()
    const [storey, setStorey] = useState(0)
    const [buildingId, setBuildingId] = useState("")
    const [xCoord, setXCoord] = useState(0)
    const [yCoord, setYCoord] = useState(0)

    const [saved, setSaved] = useState(false);

    useEffect(() => {
        getFullGraph()

        const stored = loadMyLocation();
        if (!stored)
            return

        setStorey(stored.storey)
        setBuildingId(stored.buildingId)
        setXCoord(stored.x)
        setYCoord(stored.y)
    }, []);

    const storeyRange = useMemo(() =>
        (graph ? getStoreyRange(graph) : { min: 0, max: 0 }),
        [graph]
    );

    const saveLocation = () => {
        if(buildingId === "") {
            alert(t("ui.settings.no_building"))
            return
        }

        saveMyLocation({ x: xCoord, y: yCoord, storey, buildingId });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const clearLocation = () => {
        saveMyLocation(null);
        setStorey(0)
        setBuildingId("")
        setXCoord(0)
        setYCoord(0)
    };

    return (
        <div className="p-6">
            <div className="xl:flex xl:space-x-6">
                <div>
                    <h1 className="card-title text-2xl">{t("ui.settings.title")}</h1>

                    <fieldset className="fieldset">
                        <legend className="label">{t("ui.common.x")}</legend>
                        <input
                            type="number"
                            className="input input-bordered"
                            value={xCoord}
                            onChange={(e) => setXCoord(Number(e.target.value))}
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="label">{t("ui.common.y")}</legend>
                        <input
                            type="number"
                            className="input input-bordered"
                            value={yCoord}
                            onChange={(e) => setYCoord(Number(e.target.value))}
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="label">
                            {t("ui.settings.storey", { min: storeyRange.min, max: storeyRange.max })}
                        </legend>
                        <input
                            type="number"
                            className="input input-bordered"
                            min={storeyRange.min}
                            max={storeyRange.max}
                            value={storey}
                            onChange={(e) => setStorey(Number(e.target.value))}
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="label">{t("ui.common.building")}</legend>
                        <select
                            className="select select-bordered"
                            value={buildingId}
                            onChange={(e) => setBuildingId(e.target.value)}
                        >
                            <option value="" disabled>{t("ui.common.choose")}</option>
                            {graph?.buildings.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {t(b.name)}
                                </option>
                            ))}
                        </select>
                    </fieldset>

                    <div className="mt-6 flex gap-2">
                        <button className="btn btn-primary" onClick={saveLocation}>
                            {t("ui.common.save")}
                        </button>
                        <button className="btn btn-outline" onClick={clearLocation}>
                            {t("ui.common.delete")}
                        </button>
                    </div>

                    {saved && (
                        <div className="alert alert-success mt-4">
                            <span>{t("ui.settings.saved")}</span>
                        </div>
                    )}
                </div>

                <div className="hidden xl:flex rounded-xl w-full border border-slate-700 overflow-hidden h-[80vh]">
                    <EditorView3D
                        className="w-full h-full"
                        initialDistance={120}
                        showAxes
                        graph={graph}
                        myLocation={{ x: xCoord, y: yCoord, storey, buildingId }}
                        onTransform={(patch) => {
                            setXCoord(
                                (Math.round((patch.x ?? 0) * 10) / 10)
                            )
                            setYCoord(
                                (Math.round((patch.y ?? 0) * 10) / 10)
                            )
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

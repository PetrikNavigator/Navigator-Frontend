import { useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useBuildings } from "../../../contexts/navigator/BuildingContext"
import type { AddCorridor } from "../../../types/navigator/Corridor"

type Props = {
    formData: AddCorridor
    isError: boolean
    error: string | null
    onSubmit: (e: React.SubmitEvent) => void
    onFormChange: (form: AddCorridor) => void
}

export default function CorridorForm({ onSubmit, onFormChange: setForm, isError, error, formData: form }: Props) {
    const { t } = useTranslation()
    const { buildings } = useBuildings()
    const errorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if ((error || isError) && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
        }
    }, [error, isError])

    return (
        <form
            id="corridor-form"
            onSubmit={onSubmit}
            className="space-y-10"
        >
            {/* BASIC DATA */}
            <section className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">{t("ui.common.name")}</legend>

                        <input
                            type="text"
                            className="input input-bordered w-full"
                            placeholder={t("ui.corridor.name_placeholder")}
                            value={form.name}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            {t("ui.common.building")}
                        </legend>

                        <select
                            className="select select-bordered w-full"
                            value={form.building_id}
                            onChange={(e) =>
                                setForm({ ...form, building_id: e.target.value })
                            }
                            required
                        >
                            {buildings.map((b) => (
                                <option
                                    key={b.id}
                                    value={b.id}
                                >
                                    {t(b.name)}
                                </option>
                            ))}
                        </select>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            {t("ui.common.floor")}
                        </legend>

                        <input
                            type="number"
                            className="input input-bordered w-full"
                            value={form.storey}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    storey: Number(e.target.value),
                                })
                            }
                        />

                        <p className="label text-xs opacity-60">
                            {t("ui.common.negative_allowed")}
                        </p>
                    </fieldset>
                </div>
            </section>

            {/* START POINT */}
            <section className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            {t("ui.corridor.start_x")}
                        </legend>

                        <input
                            type="number"
                            className="input input-bordered w-full"
                            value={form.x1}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    x1: Number(e.target.value),
                                })
                            }
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            {t("ui.corridor.start_y")}
                        </legend>

                        <input
                            type="number"
                            className="input input-bordered w-full"
                            value={form.y1}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    y1: Number(e.target.value),
                                })
                            }
                        />
                    </fieldset>
                </div>
            </section>

            {/* END POINT */}
            <section className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            {t("ui.corridor.end_x")}
                        </legend>

                        <input
                            type="number"
                            className="input input-bordered w-full"
                            value={form.x2}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    x2: Number(e.target.value),
                                })
                            }
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            {t("ui.corridor.end_y")}
                        </legend>

                        <input
                            type="number"
                            className="input input-bordered w-full"
                            value={form.y2}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    y2: Number(e.target.value),
                                })
                            }
                        />
                    </fieldset>
                </div>
            </section>

            {/* SIZE + FLAGS */}
            <section className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            {t("ui.corridor.width")}
                        </legend>

                        <input
                            type="number"
                            step="0.1"
                            min={0.1}
                            max={20}
                            className="input input-bordered w-full"
                            value={Math.round(form.width * 10) / 10}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    width: Number(e.target.value),
                                })
                            }
                        />

                        <p className="label text-xs opacity-60">
                            {t("ui.common.meters")}
                        </p>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            {t("ui.corridor.barrier_free")}
                        </legend>

                        <label className="label cursor-pointer justify-start gap-3">
                            <input
                                type="checkbox"
                                className="checkbox"
                                checked={form.barrier_free}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        barrier_free: e.target.checked,
                                    })
                                }
                            />
                            <span className="label-text">{t("ui.common.yes")}</span>
                        </label>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            {t("ui.corridor.outdoor")}
                        </legend>

                        <label className="label cursor-pointer justify-start gap-3">
                            <input
                                type="checkbox"
                                className="checkbox"
                                checked={form.is_outdoor}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        is_outdoor: e.target.checked,
                                    })
                                }
                            />
                            <span className="label-text">{t("ui.common.yes")}</span>
                        </label>
                    </fieldset>
                </div>
            </section>

            {/* ERRORS */}
            <div className="space-y-3" ref={errorRef}>
                {isError && (
                    <div className="alert alert-error">
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </form>
    )
}

import { useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useBuildings } from "../../../contexts/navigator/BuildingContext"
import type { AddStair } from "../../../types/navigator/Stair"

type Props = {
    formData: AddStair
    isError: boolean
    error: string | null
    onSubmit: (e: React.SubmitEvent) => void
    onFormChange: (form: AddStair) => void
}

const normalizeDeg0To359 = (deg: number) => ((deg % 360) + 360) % 360
const normalizeRotation = (deg: number) => normalizeDeg0To359(Math.round(deg))

export default function StairForm({ onSubmit, onFormChange: setForm, isError, error, formData: form }: Props) {
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
            id="stair-form"
            onSubmit={onSubmit}
            className="space-y-10"
        >
            {/* BASIC DATA */}
            <section className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">{t("ui.common.name")}</legend>

                        <input
                            type="text"
                            className="input input-bordered w-full"
                            placeholder={t("ui.stair.name_placeholder")}
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
                </div>
            </section>

            {/* POSITION + ROTATION */}
            <section className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            {t("ui.common.pos_x")}
                        </legend>

                        <input
                            type="number"
                            className="input input-bordered w-full"
                            value={form.x}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    x: Number(e.target.value),
                                })
                            }
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            {t("ui.common.pos_y")}
                        </legend>

                        <input
                            type="number"
                            className="input input-bordered w-full"
                            value={form.y}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    y: Number(e.target.value),
                                })
                            }
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            {t("ui.common.rotation")}
                        </legend>

                        <div className="join w-full">
                            <input
                                type="number"
                                className="input input-bordered join-item w-full"
                                value={form.rotation}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        rotation:
                                            normalizeRotation(
                                                Number(e.target.value)
                                            ),
                                    })
                                }
                            />

                            <span className="btn btn-disabled join-item">
                                °
                            </span>
                        </div>
                    </fieldset>
                </div>
            </section>

            {/* STOREY RANGE */}
            <section className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            {t("ui.common.min_storey")}
                        </legend>

                        <input
                            type="number"
                            className="input input-bordered w-full"
                            value={form.min_storey}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    min_storey: Number(e.target.value),
                                })
                            }
                        />

                        <p className="label text-xs opacity-60">
                            {t("ui.common.negative_allowed")}
                        </p>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            {t("ui.common.max_storey")}
                        </legend>

                        <input
                            type="number"
                            className="input input-bordered w-full"
                            value={form.max_storey}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    max_storey: Number(e.target.value),
                                })
                            }
                        />

                        <p className="label text-xs opacity-60">
                            {t("ui.stair.max_hint")}
                        </p>
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

import { useRef, useEffect } from "react"
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
                        <legend className="fieldset-legend">Név</legend>

                        <input
                            type="text"
                            className="input input-bordered w-full"
                            placeholder="Pl. Főlépcső"
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
                            Épület
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
                                    {b.name}
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
                            Pozíció X
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
                            Pozíció Y
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
                            Forgatás
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
                            Minimum emelet
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
                            Negatív érték is megadható
                        </p>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Maximum emelet
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
                            A lépcső legfelső szintje
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

import { useRef, useEffect } from "react"
import { useBuildings } from "../../../contexts/navigator/BuildingContext"
import { useClassroomType } from "../../../contexts/navigator/ClassroomTypesContext"
import type { AddClassroom } from "../../../types/navigator/Classroom"
import { FLOOR_HEIGHT } from "../../../types/three/material-types"

type Props = {
    formData: AddClassroom
    isError: boolean
    error: string | null
    onSubmit: (e: React.SubmitEvent) => void
    onFormChange: (form: AddClassroom) => void
}

const normalizeDeg0To359 = (deg: number) => ((deg % 360) + 360) % 360
const normalizeDoorRotation = (deg: number) => normalizeDeg0To359(Math.round(deg))

export default function ClassroomForm({ onSubmit, onFormChange: setForm, isError, error, formData: form }: Props) {
    const { buildings } = useBuildings()
    const { classroom_types } = useClassroomType()
    const errorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if ((error || isError) && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
        }
    }, [error, isError])


    return (
        <form
            id="classroom-form"
            onSubmit={onSubmit}
            className="space-y-10"
        >
            {/* BASIC DATA */}
            <section className="space-y-5">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Név</legend>

                        <input
                            type="text"
                            className="input input-bordered w-full"
                            placeholder="Pl. A205"
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

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Terem típusa
                        </legend>

                        <select
                            className="select select-bordered w-full"
                            value={form.type_id}
                            onChange={(e) =>
                                setForm({ ...form, type_id: e.target.value })
                            }
                            required
                        >
                            {classroom_types.map((ct) => (
                                <option
                                    key={ct.id.toString()}
                                    value={ct.id.toString()}
                                >
                                    {ct.name}
                                </option>
                            ))}
                        </select>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Emelet
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
                            Negatív érték is megadható
                        </p>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Befogadóképesség
                        </legend>

                        <input
                            type="number"
                            min={1}
                            className="input input-bordered w-full"
                            value={form.capacity}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    capacity: Number(e.target.value),
                                })
                            }
                        />
                    </fieldset>
                </div>
            </section>

            {/* POSITION */}
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
                                    x: Math.round(Number(e.target.value)),
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
                                    y: Math.round(Number(e.target.value)),
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
                                step="1"
                                className="input input-bordered join-item w-full"
                                value={form.rotation}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        rotation:
                                            normalizeDoorRotation(
                                                Math.round(Number(e.target.value))
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

            {/* SIZE */}
            <section className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Szélesség (X)
                        </legend>

                        <input
                            type="number"
                            min={1}
                            className="input input-bordered w-full"
                            value={form.size_x}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    size_x: Math.round(Number(e.target.value)),
                                })
                            }
                        />

                        <p className="label text-xs opacity-60">
                            Méterben megadva
                        </p>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Mélység (Y)
                        </legend>

                        <input
                            type="number"
                            min={1}
                            className="input input-bordered w-full"
                            value={form.size_y}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    size_y: Math.round(Number(e.target.value)),
                                })
                            }
                        />

                        <p className="label text-xs opacity-60">
                            Méterben megadva
                        </p>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Belmagasság (Z)
                        </legend>

                        <input
                            type="number"
                            min={1}
                            max={FLOOR_HEIGHT}
                            className="input input-bordered w-full"
                            value={form.size_z}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    size_z: Math.min(
                                        FLOOR_HEIGHT,
                                        Math.round(Number(e.target.value))
                                    ),
                                })
                            }
                        />

                        <p className="label text-xs opacity-60">
                            {`Maximum ${FLOOR_HEIGHT} méter`}
                        </p>
                    </fieldset>
                </div>
            </section>

            {/* DESCRIPTION */}
            <section className="space-y-5">
                <fieldset className="fieldset">
                    <textarea
                        className="textarea textarea-bordered min-h-[120px] w-full"
                        placeholder="Rövid leírás a teremről..."
                        value={form.description}
                        maxLength={16000}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                description: e.target.value,
                            })
                        }
                        required
                    />
                </fieldset>
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
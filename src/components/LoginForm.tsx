import { useState } from "react"
import { useAuth } from "../contexts/other/AuthContext"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"

export default function LoginForm() {
    const { t } = useTranslation()
    const { login } = useAuth()
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const navigate = useNavigate()

    const submit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        await login({ email, password })
        navigate("/", { replace: true })
    }

    return (
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="text-center lg:text-left">
                    <h1 className="text-5xl font-bold">{t("ui.login.title")}</h1>
                </div>
                <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
                    <div className="card-body">
                        <form onSubmit={submit} className="fieldset">
                            <label className="label">{t("ui.login.email")}</label>
                            <input type="email" className="input" value={email} onChange={x => setEmail(x.target.value)} placeholder={t("ui.login.email")} required />
                            <label className="label">{t("ui.login.password")}</label>
                            <input type="password" className="input" placeholder={t("ui.login.password")} value={password} onChange={x => setPassword(x.target.value)} required />
                            <button className="btn btn-neutral mt-4">{t("ui.login.submit")}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

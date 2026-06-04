import { useNavigate } from "react-router";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../contexts/other/AuthContext";
import { useLayoutEffect } from "react";
import type { User } from "../types/User";

export default function Login() {
    const navigate = useNavigate()
    const { getMe } = useAuth()

    const checkLogin = async () => {
        let res: User | null = null

        try {
            res = await getMe();
        } catch {

        }

        if (res !== null) {
            navigate("/", { replace: true })
        }
    }

    useLayoutEffect(() => {
        checkLogin()
    }, [])

    return <LoginForm />
}
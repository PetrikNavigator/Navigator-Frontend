import { NavLink } from "react-router"

type Props = {
    url: string
    text: string
    className?: string
    disabled?: boolean
    end?: boolean
}

export default function SidebarLink({ url, text, className, disabled, end }: Props) {

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        isActive ? "menu-active" : "";

    return (
        <li className={`${className} ${disabled && "menu-disabled"}`}>
            <NavLink to={`/${url}`} className={linkClass} end={end}>
                {text}
            </NavLink>
        </li>
    )
}
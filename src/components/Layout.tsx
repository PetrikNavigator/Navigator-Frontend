import type { ReactNode } from "react";

type Props = {
    children?: ReactNode | ReactNode[]
    sidebarItems?: ReactNode | ReactNode[]
    navbarStart?: ReactNode | ReactNode[]
    navbarCenter?: ReactNode | ReactNode[]
    navbarEnd?: ReactNode | ReactNode[]
}

export default function Layout({ children, sidebarItems, navbarStart, navbarCenter, navbarEnd }: Props) {
    return (
        <div className="drawer lg:drawer-open">
            {/* toggle state */}
            <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />

            {/* MAIN CONTENT */}
            <div className="drawer-content flex flex-col min-h-screen">
                {/* NAVBAR */}
                <div className="navbar bg-base-100 shadow-sm">
                    <div className="navbar-start">
                        <label htmlFor="sidebar-drawer" className="btn btn-square btn-ghost lg:hidden">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </label>
                        {navbarStart}
                    </div>
                    <div className="navbar-center">
                        {navbarCenter}
                    </div>
                    <div className="navbar-end">
                        {navbarEnd}
                    </div>
                </div>

                {/* PAGE CONTENT */}
                <main className="p-6">
                    {children}
                </main>
            </div>

            {/* SIDEBAR */}
            <div className="drawer-side overflow-visible">
                {sidebarItems}
            </div>
        </div>
    );
}
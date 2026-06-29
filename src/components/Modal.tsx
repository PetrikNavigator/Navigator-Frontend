import type { ReactNode } from "react";

type Props = {
    title: string;
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
    showClose: boolean;
};

export default function Modal({
    title,
    open,
    onClose,
    children,
    footer,
    showClose
}: Props) {
    return (
        <div className={`modal ${open ? "modal-open" : ""}`}>
            <div className={`modal-box w-auto max-w-6xl overflow-visible`}>
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold">{title}</h3>

                    {
                        showClose &&
                        <button
                            className="btn btn-sm btn-circle btn-ghost"
                            onClick={onClose}
                        >
                            ✕
                        </button>
                    }
                </div>

                {/* BODY */}
                <div>{children}</div>

                {/* FOOTER */}
                {footer && <div className="modal-action">{footer}</div>}
            </div>

            {/* BACKDROP */}
            <div className="modal-backdrop" onClick={onClose} />
        </div>
    );
}
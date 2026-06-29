import { useTranslation } from "react-i18next"
import Modal from "../Modal"

type Props = {
    isActive: boolean
    setIsActive: (val: boolean) => void
}

export default function StartPopup({ isActive, setIsActive }: Props) {
    const { t } = useTranslation()

    return (
        <Modal
            open={isActive}
            onClose={() => setIsActive(false)}
            title={t("ui.kiosk.welcome_title")}
            showClose={false}
            children={
                <div className="max-w-72 space-y-4">
                    <p>{t("ui.kiosk.welcome_text")}</p>

                    <p className="text-center text-sm">
                        <strong>{t("ui.madeby")}</strong>
                        <p className="opacity-80 text-xs">Kobela András, Sohonyai Tibor</p>
                    </p>

                    <div className="flex justify-center">
                        <button
                            onClick={() => setIsActive(false)}
                            className="btn btn-primary"
                        >
                            {t("ui.kiosk.welcome_close")}
                        </button>
                    </div>
                </div>
            }
        />
    )
}
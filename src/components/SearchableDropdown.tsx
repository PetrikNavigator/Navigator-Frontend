import { useRef } from "react";
import { useTranslation } from "react-i18next";

type SearchableListProps<T> = {
    items: T[];
    isLoading?: boolean;

    selectedKey?: string | number;
    unselectable?: boolean

    getKey: (item: T) => string | number;
    getLabel: (item: T) => string;

    onSelect: (item?: T) => void;

    query?: string;
    setQuery?: (value: string) => void;

    placeholder?: string;
    titleButton: React.ReactNode;
};

export function SearchableDropdown<T>({
    items,
    isLoading = false,
    selectedKey,
    getKey,
    getLabel,
    onSelect,
    query,
    setQuery,
    placeholder,
    titleButton,
    unselectable = false
}: SearchableListProps<T>) {
    const { t } = useTranslation();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSelect = (item: T) => {
        if (unselectable && selectedKey === getKey(item))
            onSelect(undefined)
        else
            onSelect(item);

        dropdownRef.current?.blur();
    };

    return (
        <>
            <div className="dropdown dropdown-bottom">
                {titleButton}

                {/* dropdown */}
                <div
                    tabIndex={0}
                    ref={dropdownRef}
                    className="dropdown-content z-50 mt-2 w-max rounded-box border border-base-300 bg-base-100 shadow-xl"
                >
                    {
                        setQuery !== undefined && query !== undefined &&
                        <div className="p-2">
                            <input
                                autoFocus
                                type="text"
                                placeholder={placeholder ?? t("ui.common.search_placeholder")}
                                className="input input-bordered w-full"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                    }


                    <ul className="menu w-full max-h-64 overflow-y-auto overflow-x-hidden flex-nowrap">
                        {isLoading && items.length === 0 ? (
                            <li>
                                <span className="opacity-60">{t("ui.common.loading")}</span>
                            </li>
                        ) : items.length === 0 ? (
                            <li>
                                <span className="opacity-60">
                                    {t("ui.common.no_results")}
                                </span>
                            </li>
                        ) : (
                            items.map((item) => {
                                const key = getKey(item);

                                return (
                                    <li key={key} className="w-full">
                                        <div
                                            role="button"
                                            className={`w-full text-left ${selectedKey === key
                                                ? (unselectable ? "bg-base-300" : "menu-active")
                                                : ""
                                                }`}
                                            onClick={() => handleSelect(item)}
                                        >
                                            {getLabel(item)}
                                        </div>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div >
            </div>
        </>
    );
}

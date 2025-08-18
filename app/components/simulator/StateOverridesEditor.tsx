import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export default function StateOverrides({
    overrides,
    setOverrides,
    stateOverrideUnsupported,
}: {
    overrides: any[];
    setOverrides: React.Dispatch<React.SetStateAction<any[]>>;
    stateOverrideUnsupported?: boolean;
}) {
    const [showOverrides, setShowOverrides] = useState(false);

    if (!showOverrides) {
        return (
            <div className="mt-6 flex justify-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOverrides(true)}
                >
                    + Enable State Overrides
                </Button>
            </div>
        );
    }

    return (
        <div className="mt-6 p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">
                    State Overrides (experimental)
                </label>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOverrides(false)}
                >
                    ✕ Close
                </Button>
            </div>

            <div className="mt-2 space-y-2">
                {overrides.map((o, idx) => (
                    <div
                        key={idx}
                        className="p-3 rounded-xl border grid grid-cols-1 md:grid-cols-4 gap-2"
                    >
                        {/* Address */}
                        <input
                            className="p-2 border rounded-lg md:col-span-2"
                            placeholder="Address 0x..."
                            value={o.address}
                            onChange={(e) =>
                                setOverrides((arr) =>
                                    arr.map((x, i) =>
                                        i === idx ? { ...x, address: e.target.value } : x
                                    )
                                )
                            }
                        />

                        {/* Balance */}
                        <input
                            className="p-2 border rounded-lg"
                            placeholder="Balance (ETH or 0x..)"
                            value={o.balance ?? ""}
                            onChange={(e) =>
                                setOverrides((arr) =>
                                    arr.map((x, i) =>
                                        i === idx ? { ...x, balance: e.target.value } : x
                                    )
                                )
                            }
                        />

                        {/* Delete */}
                        <div className="flex items-center justify-end">
                            <button
                                className="p-2 rounded-lg border"
                                onClick={() =>
                                    setOverrides((arr) =>
                                        arr.filter((_, i) => i !== idx)
                                    )
                                }
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Code Bytecode */}
                        <textarea
                            className="p-2 border rounded-lg md:col-span-4"
                            placeholder="Code bytecode 0x... (optional)"
                            value={o.code ?? ""}
                            onChange={(e) =>
                                setOverrides((arr) =>
                                    arr.map((x, i) =>
                                        i === idx ? { ...x, code: e.target.value } : x
                                    )
                                )
                            }
                        />

                        {/* Storage Slots */}
                        <div className="md:col-span-4">
                            <div className="text-xs text-gray-500 mb-1">Storage Slots</div>
                            {(o.storage ?? []).map((s: any, j:any) => (
                                <div key={j} className="grid grid-cols-2 gap-2 mb-2">
                                    <input
                                        className="p-2 border rounded-lg"
                                        placeholder="key (0x..)"
                                        value={s.key}
                                        onChange={(e) =>
                                            setOverrides((arr) =>
                                                arr.map((x, i) =>
                                                    i === idx
                                                        ? {
                                                            ...x,
                                                            storage: (x.storage ?? []).map(
                                                                (y: any, k: any) =>
                                                                    k === j
                                                                        ? { ...y, key: e.target.value }
                                                                        : y
                                                            ),
                                                        }
                                                        : x
                                                )
                                            )
                                        }
                                    />
                                    <input
                                        className="p-2 border rounded-lg"
                                        placeholder="value (0x..)"
                                        value={s.value}
                                        onChange={(e) =>
                                            setOverrides((arr) =>
                                                arr.map((x, i) =>
                                                    i === idx
                                                        ? {
                                                            ...x,
                                                            storage: (x.storage ?? []).map(
                                                                (y: any, k: any) =>
                                                                    k === j
                                                                        ? { ...y, value: e.target.value }
                                                                        : y
                                                            ),
                                                        }
                                                        : x
                                                )
                                            )
                                        }
                                    />
                                </div>
                            ))}

                            <button
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                                onClick={() =>
                                    setOverrides((arr) =>
                                        arr.map((x, i) =>
                                            i === idx
                                                ? {
                                                    ...x,
                                                    storage: [
                                                        ...(x.storage ?? []),
                                                        { key: "0x", value: "0x" },
                                                    ],
                                                }
                                                : x
                                        )
                                    )
                                }
                            >
                                <Plus size={14} /> Add Slot
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add new override */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setOverrides((arr) => [
                            ...arr,
                            { address: "0x", storage: [] },
                        ])
                    }
                >
                    <Plus size={10} /> Add Account Override
                </Button>

                {stateOverrideUnsupported && (
                    <p className="text-xs text-amber-700">
                        State overrides not supported by node.
                    </p>
                )}
            </div>
        </div>
    );
}

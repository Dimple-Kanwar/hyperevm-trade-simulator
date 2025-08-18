import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export default function BundleTransactions({
    bundle,
    setBundle,
    addToBundle,
    runBundle,
}: {
    bundle: any[];
    setBundle: React.Dispatch<React.SetStateAction<any[]>>;
    addToBundle: () => void;
    runBundle: () => void;
}) {
    const [showBundle, setShowBundle] = useState(false);

    if (!showBundle) {
        return (
            <div className="mt-6 flex justify-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBundle(true)}
                >
                    + Enable Bundle Simulation
                </Button>
            </div>
        );
    }

    return (
        <div className="mt-6 p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">
                    Bundle Transactions (experimental, stateless)
                </label>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBundle(false)}
                >
                    ✕ Close
                </Button>
            </div>

            <div className="space-y-2">
                <div className="text-xs text-gray-600">
                    Adds current call to a bundle (runs sequential <code>eth_call</code> at
                    the same block tag). Does not persist state between calls.
                </div>
                <Button
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border"
                    variant="outline"
                    size="sm"
                    onClick={addToBundle}
                >
                    <Plus size={10} /> Add Current To Bundle
                </Button>

                {!!bundle.length && (
                    <div className="space-y-2">
                        {bundle.map((b, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-2 rounded-lg border text-xs"
                            >
                                <div className="truncate">
                                    #{i + 1} – {b.label} → {b.to}
                                </div>
                                <button
                                    className="p-1"
                                    onClick={() =>
                                        setBundle((arr) => arr.filter((_, idx) => idx !== i))
                                    }
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm"
                            onClick={runBundle}
                        >
                            Run Bundle
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useState, useMemo } from "react";

interface SingleResult {
    status: "success" | "error";
    gasUsed: string;
    blockNumber: string;
    error?: string;
    logs?: any[];
    trace?: any[];
}

interface SimulationResultProps {
    result?: SingleResult;           // single transaction
    bundleResults?: SingleResult[];  // bundle transactions
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const STATUS_COLORS = { success: "#00C49F", error: "#FF4D4F" };

const mockGasData = [
    { name: "Execution", value: 120000 },
    { name: "Memory Ops", value: 80000 },
    { name: "Storage Ops", value: 50000 },
    { name: "Other", value: 30000 },
];

const mockCallGraph = [
    {
        fn: "MainContract.swapExactTokensForETH",
        gas: 120000,
        children: [
            { fn: "ERC20.transferFrom", gas: 40000 },
            { fn: "UniswapV2Router.addLiquidity", gas: 80000 },
        ],
    },
];

function CallGraph({ graph }: { graph: typeof mockCallGraph }) {
    return (
        <ul className="ml-5 list-disc text-sm">
            {graph.map((node, i) => (
                <li key={i}>
                    <span className="font-medium">{node.fn}</span> — Gas: {node.gas}
                    {node.children && node.children.length > 0 && (
                        <CallGraph graph={node.children as any} />
                    )}
                </li>
            ))}
        </ul>
    );
}

function SingleSimulation({ result }: { result: SingleResult }) {
    const [showTrace, setShowTrace] = useState(false);

    return (
        <div className="space-y-4">
            <p><strong>Block:</strong> {result.blockNumber}</p>
            <p><strong>Gas Used:</strong> {result.gasUsed}</p>

            {result.error && (
                <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
            )}

            {/* Mock Gas Usage Pie Chart */}
            <div>
                <p className="font-semibold mb-2">Gas Usage Breakdown</p>
                <PieChart width={400} height={250}>
                    <Pie
                        data={mockGasData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                    >
                        {mockGasData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </div>

            {/* Mock Call Graph Tree */}
            <div>
                <p className="font-semibold mb-2">Call Graph</p>
                <CallGraph graph={mockCallGraph} />
            </div>

            {/* Execution Trace toggle */}
            {result.trace && (
                <div>
                    <button
                        onClick={() => setShowTrace(!showTrace)}
                        className="text-blue-600 hover:underline text-sm"
                    >
                        {showTrace ? "Hide Trace" : "Show Execution Trace"}
                    </button>
                    {showTrace && (
                        <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto text-xs">
                            {JSON.stringify(result.trace, null, 2)}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
}

export default function SimulationResults({ result, bundleResults }: SimulationResultProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!result && (!bundleResults || bundleResults.length === 0)) {
        return null;
    }

    // 📊 Bundle summary stats
    const bundleSummary = useMemo(() => {
        if (!bundleResults || bundleResults.length === 0) return null;
        const total = bundleResults.length;
        const successCount = bundleResults.filter(r => r.status === "success").length;
        const failCount = total - successCount;
        const totalGas = bundleResults.reduce((sum, r) => sum + Number(r.gasUsed || 0), 0);

        // ✅ Gas per transaction dataset
        const gasData = bundleResults.map((r, i) => ({
            tx: `Tx ${i + 1}`,
            gas: Number(r.gasUsed || 0),
            status: r.status,
        }));

        return { total, successCount, failCount, totalGas, gasData };
    }, [bundleResults]);

    return (
        <Card className="mt-6">
            <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <CardTitle className="flex justify-between items-center">
                    Simulation Result
                    {(result || (bundleResults && bundleResults.length > 0)) && (
                        <Badge variant="outline">
                            {isOpen ? "Hide" : "View"}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            {isOpen && (
                <CardContent>
                    {/* Single Simulation */}
                    {result && <SingleSimulation result={result} />}

                    {/* Bundle Simulation */}
                    {bundleResults && bundleResults.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-md font-semibold mt-4">Bundle Simulation Results</h2>

                            {/* ✅ Bundle Summary */}
                            {bundleSummary && (
                                <div className="p-4 bg-gray-100 rounded-lg border text-sm space-y-6">
                                    <div className="flex flex-wrap gap-6">
                                        <div><strong>Total Tx:</strong> {bundleSummary.total}</div>
                                        <div className="text-green-700"><strong>Success:</strong> {bundleSummary.successCount}</div>
                                        <div className="text-red-600"><strong>Failed:</strong> {bundleSummary.failCount}</div>
                                        <div><strong>Total Gas Used:</strong> {bundleSummary.totalGas}</div>
                                    </div>

                                    {/* 📊 Success vs Failed Pie Chart */}
                                    <PieChart width={300} height={220}>
                                        <Pie
                                            data={[
                                                { name: "Success", value: bundleSummary.successCount },
                                                { name: "Failed", value: bundleSummary.failCount },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                            dataKey="value"
                                        >
                                            <Cell fill={STATUS_COLORS.success} />
                                            <Cell fill={STATUS_COLORS.error} />
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>

                                    {/* 📊 Gas Usage per Tx Bar Chart */}
                                    <div>
                                        <p className="font-semibold mb-2">Gas Usage per Transaction</p>
                                        <BarChart width={500} height={300} data={bundleSummary.gasData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="tx" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar
                                                dataKey="gas"
                                                name="Gas Used"
                                                label={{ position: "top" }}
                                            >
                                                {bundleSummary.gasData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.status === "success" ? "#00C49F" : "#FF4D4F"}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>

                                    </div>
                                </div>
                            )}

                            {/* Individual Tx Results */}
                            {bundleResults.map((br, i) => (
                                <Card key={i} className="p-3 border rounded-lg bg-gray-50">
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-center text-sm">
                                            Tx #{i + 1}
                                            <Badge variant={br.status === "success" ? "secondary" : "destructive"}>
                                                {br.status.toUpperCase()}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <SingleSimulation result={br} />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

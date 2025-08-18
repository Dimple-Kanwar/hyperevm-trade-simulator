"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useState } from "react";

interface SimulationResultProps {
    result: {
        status: "success" | "error";
        gasUsed: string;
        blockNumber: string;
        error?: string;
        logs?: any[];
        trace?: any[];
    };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

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

export default function SimulationResults({ result }: SimulationResultProps) {
    const [showTrace, setShowTrace] = useState(false);

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    Simulation Result
                    <Badge variant={result.status === "success" ? "secondary" : "destructive"}>
                        {result.status.toUpperCase()}
                    </Badge>
                </CardTitle>
            </CardHeader>

            <CardContent>
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
            </CardContent>
        </Card>
    );
}

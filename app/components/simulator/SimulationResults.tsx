"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/app/components/ui/button";

export interface SingleResult {
    status: "success" | "error";
    type: string;
    chainId: string;
    nonce: string;
    gas: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    to: string;
    value: string;
    accessList: any[];
    input: string;
    v: string;
    hash: string;
    blockHash: string;
    blockNumber: string;
    transactionIndex: string;
    logs?: any[];
    state?: any[];
    from: string;
    gasPrice: string;
    gasUsed: string;
    error?: string;
    trace?: any[];
}

interface SimulationResultProps {
    result?: SingleResult;           // single transaction
    bundleResults?: SingleResult[];  // bundle transactions
}

/* ---------- Constants ---------- */
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const STATUS_COLORS = { success: "#00C49F", error: "#FF4D4F" };

const mockGasData = [
    { name: "Execution", value: 120000 },
    { name: "Memory Ops", value: 80000 },
    { name: "Storage Ops", value: 50000 },
    { name: "Other", value: 30000 },
];

/* ---------- Subcomponents ---------- */
function TxSummary({ result }: { result: SingleResult }) {
    return (
        <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
                <p><strong>Block:</strong> {result.blockNumber}</p>
                <p><strong>Gas Used:</strong> {result.gasUsed}</p>
                {result.error && <p className="text-red-600"><strong>Error:</strong> {result.error}</p>}
            </div>
            <Badge variant={result.status === "success" ? "secondary" : "destructive"}>
                {result.status.toUpperCase()}
            </Badge>
        </div>
    );
}

function GasAnalysis({ bundleResults }: { bundleResults?: SingleResult[] }) {
    if (!bundleResults || bundleResults.length === 0) return null;

    const summary = useMemo(() => {
        const total = bundleResults.length;
        const successCount = bundleResults.filter(r => r.status === "success").length;
        const failCount = total - successCount;
        const totalGas = bundleResults.reduce((sum, r) => sum + Number(r.gasUsed || 0), 0);

        const gasData = bundleResults.map((r, i) => ({
            tx: `Tx ${i + 1}`,
            gas: Number(r.gasUsed || 0),
            status: r.status,
        }));

        return { total, successCount, failCount, totalGas, gasData };
    }, [bundleResults]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-6 text-sm">
                <div><strong>Total Tx:</strong> {summary.total}</div>
                <div className="text-green-700"><strong>Success:</strong> {summary.successCount}</div>
                <div className="text-red-600"><strong>Failed:</strong> {summary.failCount}</div>
                <div><strong>Total Gas Used:</strong> {summary.totalGas}</div>
            </div>

            {/* Success vs Failed Pie */}
            <PieChart width={300} height={220}>
                <Pie
                    data={[
                        { name: "Success", value: summary.successCount },
                        { name: "Failed", value: summary.failCount },
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

            {/* Gas Usage per Tx */}
            <div>
                <p className="font-semibold mb-2">Gas Usage per Transaction</p>
                <BarChart width={500} height={300} data={summary.gasData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tx" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="gas" name="Gas Used" label={{ position: "top" }}>
                        {summary.gasData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.status === "success" ? "#00C49F" : "#FF4D4F"} />
                        ))}
                    </Bar>
                </BarChart>
            </div>
        </div>
    );
}

function GasBreakdownChart() {
    return (
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
    );
}

function LogsAndEvents({ logs }: { logs?: any[] }) {
    if (!logs || logs.length === 0) return null;
    return (
        <div>
            <p className="font-semibold mb-2">Event Logs</p>
            <div className="space-y-2 text-sm">
                {logs.map((log, i) => (
                    <div key={i} className="p-2 border rounded bg-gray-50">
                        <strong>{log.event}</strong>: {JSON.stringify(log)}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ExecutionTrace({ trace }: { trace?: any[] }) {
    const [open, setOpen] = useState(false);
    if (!trace) return null;
    return (
        <div>
            <Button variant="link" size="sm" onClick={() => setOpen(!open)}>
                {open ? "Hide Execution Trace" : "Show Execution Trace"}
            </Button>
            {open && (
                <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto text-xs">
                    {JSON.stringify(trace, null, 2)}
                </pre>
            )}
        </div>
    );
}

/* ---------- Main Component ---------- */
export default function SimulationResults({ result, bundleResults }: SimulationResultProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!result && (!bundleResults || bundleResults.length === 0)) return null;

    return (
        <Card className="mt-6">
            <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <CardTitle className="flex justify-between items-center">
                    Simulation Result
                    <Badge variant="outline">{isOpen ? "Hide" : "View"}</Badge>
                </CardTitle>
            </CardHeader>

            {isOpen && (
                <CardContent className="space-y-6">
                    {/* 🔹 Single Transaction */}
                    {result && (
                        <>
                            <TxSummary result={result} />
                            <GasBreakdownChart />
                            <LogsAndEvents logs={result.logs} />
                            <ExecutionTrace trace={result.trace} />
                        </>
                    )}

                    {/* 🔹 Bundle Transactions */}
                    {bundleResults && bundleResults.length > 0 && (
                        <>
                            <h2 className="text-md font-semibold mt-4">Bundle Simulation</h2>
                            <GasAnalysis bundleResults={bundleResults} />
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
                                        <TxSummary result={br} />
                                        <LogsAndEvents logs={br.logs} />
                                        <ExecutionTrace trace={br.trace} />
                                    </CardContent>
                                </Card>
                            ))}
                        </>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

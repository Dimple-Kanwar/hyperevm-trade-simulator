'use client';

import { useState, useEffect, SetStateAction } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { useSmartAccountClient } from '@account-kit/react';
import { encodeFunctionData, parseEther, formatEther, AccessList, Hex, numberToHex, BlockTag, BlockIdentifier, BlockNumber, parseGwei, keccak256, toHex } from 'viem';
import { Input } from '@/app/components/ui/Input';
import { Textarea } from '@/app/components/ui/Textarea';
import { TxSimulationParams } from '@/app/types/TxSimulation';
import Header from '@/app/components/header/Header';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

// Type for parsed function
type ParsedFunction = {
    name: string;
    signature: string;
    inputs: any[];
};

export default function CustomSimulationPage() {
    const { client } = useSmartAccountClient({});
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Form state
    const [contractAddress, setContractAddress] = useState('');
    const [abi, setAbi] = useState('');
    const [functions, setFunctions] = useState<ParsedFunction[]>([]);
    const [selectedFunction, setSelectedFunction] = useState<string>('');
    const [args, setArgs] = useState<Record<string, string>>({});
    const [from, setFrom] = useState('');
    const [value, setValue] = useState('');
    const [gasLimit, setGasLimit] = useState('3000000');
    const [gasPrice, setGasPrice] = useState('10');
    const [maxFeePerGas, setMaxFeePerGas] = useState<string>("");
    const [usePendingBlock, setUsePendingBlock] = useState(true);
    const [blockNumber, setBlockNumber] = useState('');

    // Prevent hydration mismatch: only render results on client
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Parse ABI and extract functions whenever ABI changes
    useEffect(() => {
        if (!abi) {
            setFunctions([]);
            setSelectedFunction('');
            setArgs({});
            return;
        }

        try {
            const parsedAbi = JSON.parse(abi);
            const fnList = parsedAbi
                .filter((item: any) => item.type === 'function')
                .map((fn: any) => {
                    console.log({ fn });
                    const inputTypes = fn.inputs.map((i: any) => i.type).join(', ');
                    const signature = `${fn.name}(${inputTypes})`;
                    return {
                        name: fn.name,
                        signature,
                        inputs: fn.inputs,
                    };
                });

            setFunctions(fnList);
            if (fnList.length > 0) {
                setSelectedFunction(fnList[0].name);
            } else {
                setSelectedFunction('');
            }
        } catch (err) {
            setFunctions([]);
            setSelectedFunction('');
        }
    }, [abi]);

    // Get current function
    const currentFunction = functions.find((fn) => fn.name === selectedFunction);

    // Handle file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            setError('Please upload a valid JSON file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const parsed = JSON.parse(content); // Validate JSON
                setAbi(JSON.stringify(parsed, null, 2)); // Pretty-print
                setError(null);
            } catch (err) {
                setError('Invalid JSON file: Unable to parse ABI');
            }
        };
        reader.onerror = () => {
            setError('Failed to read file');
        };
        reader.readAsText(file);
    };

    // Handle paste or manual input
    const handleAbiChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const parsed = JSON.parse(value); // Validate JSON
        setAbi(JSON.stringify(parsed, null, 2)); // Pretty-print
        // setAbi(value);

        // Optional: Validate JSON on change
        if (value) {
            try {
                JSON.parse(value);
                setError(null);
            } catch {
                setError('Invalid JSON: Please check your ABI');
            }
        }
    };

    const handleCopy = () => {


    };
    // Copy function selector to clipboard
    const handleCopySelector = () => {
        if (!currentFunction) return;

        const inputTypes = currentFunction.inputs.map((i) => i.type).join(',');
        const signature = `${currentFunction.name}(${inputTypes})`;
        const hash = keccak256(toHex(signature)) as `0x${string}`;
        const selector = hash.slice(0, 10); // First 4 bytes
        navigator.clipboard.writeText(selector);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // Reset ABI and form
    const handleResetAbi = () => {
        setAbi('');
        setFunctions([]);
        setSelectedFunction('');
        setArgs({});
        setError(null);
    };

    const handleSimulate = async () => {
        setIsSimulating(true);
        setError(null);
        setResults(null);

        try {
            if (!client) throw new Error('Wallet not connected');
            if (!abi) throw new Error('ABI is required');
            if (!selectedFunction) throw new Error('Function is required');
            if (!contractAddress) throw new Error('Contract address is required');

            const parsedAbi = JSON.parse(abi);
            const fn = parsedAbi.find((item: any) => item.type === 'function' && item.name === selectedFunction);
            if (!fn) throw new Error('Selected function not found in ABI');

            // Build args array in order
            const orderedArgs = fn.inputs.map((input: any) => args[input.name] || args[input.type] || '');

            const account = client.account?.address;
            const fromAddress = (from || account) as `0x${string}`;
            if (!fromAddress) throw new Error('From address is required');

            const tx: TxSimulationParams = {
                from: fromAddress,
                to: contractAddress as `0x${string}`,
                data: encodeFunctionData({
                    abi: parsedAbi,
                    functionName: selectedFunction,
                    args: orderedArgs,
                }),
                value: value ? numberToHex(parseEther(value)) : undefined,
                gas: gasLimit ? numberToHex(BigInt(gasLimit)) : undefined,
            };

            const block: BlockTag | `0x${string}` = usePendingBlock ? 'pending' : blockNumber ? numberToHex(BigInt(blockNumber)) : 'latest';

            // 🔧 Real Simulation: debug_traceCall
            let trace;
            let res;
            try {

                res = await fetch(`${process.env.NEXT_HYPEREVM_RPC_URL}`, {
                    method: "POST",
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        id: 1,
                        method: "debug_traceCall",
                        params: [tx, block, { tracer: "callTracer", timeout: '10s' }],
                    }),
                    headers: { "Content-Type": "application/json" },
                });
                trace = await res.json();
            } catch (err: any) {
                // Fallback: some providers block debug_traceCall
                console.warn('debug_traceCall failed:', err.message);
                throw new Error('Simulation failed: debug_traceCall not supported or permission denied. Try using a local fork or Alchemy.');
            }

            const gasUsed = trace?.gas ? Number(trace.gas).toLocaleString() : 'Unknown';

            // 📦 Access List
            let accessList: AccessList[] = [];
            try {
                const accessListResult = await client.request({
                    method: 'eth_createAccessList',
                    params: [tx, block],
                })
                if (typeof accessListResult === 'object' && 'accessList' in accessListResult!) {
                    const { accessList, gasUsed } = accessListResult as {
                        accessList: AccessList;
                        gasUsed: Hex;
                    };
                    console.log({ accessList, gasUsed });
                }
            } catch (err) {
                console.warn('eth_createAccessList failed:', (err as Error).message);
                // Continue without access list
            }

            setResults({
                gasUsed,
                status: 'success',
                trace,
                accessList,
                block: block === 'pending' ? 'pending' : typeof block === 'number' ? block : 'latest',
            });
        } catch (err: any) {
            setError(err.message || 'Simulation failed');
        } finally {
            setIsSimulating(false);
        }
    };

    // Hydration-safe rendering
    if (!isClient) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-semibold mb-6">New Custom Simulation</h1>
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            <Header />
            <div className="bg-bg-main bg-cover bg-center bg-no-repeat h-[calc(100vh-4rem)]">
                <main className="container mx-auto px-4 py-8 h-full">
                    <h1 className="text-2xl font-semibold mb-6">New Custom Simulation</h1>

                    {/* Contract Configuration */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Contract</CardTitle>
                            <CardDescription>Simulate and Test Smart Contract transactions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Enter Contract Address</label>
                                <Input
                                    placeholder="0x..."
                                    value={contractAddress}
                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setContractAddress(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">ABI (JSON)</label>
                                {abi && (
                                    <Button variant="ghost" size="sm" onClick={handleResetAbi}>
                                        Reset ABI
                                    </Button>
                                )}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const input = document.getElementById('abi-upload') as HTMLInputElement;
                                        input?.click();
                                    }}
                                >
                                    Upload ABI JSON
                                </Button>
                                <input
                                    id="abi-upload"
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <span className="text-xs text-muted-foreground">
                                    {abi ? 'File loaded' : 'No file selected'}
                                </span>
                            </div>
                            <Textarea
                                placeholder='Paste ABI JSON here, e.g., [{"name": "transfer", "type": "function", ...}]'
                                value={abi}
                                onChange={handleAbiChange}
                                rows={6}
                                className="mt-2 font-mono text-xs"
                            />
                            {/* Function Dropdown */}
                            <div>
                                <label className="text-sm font-medium">Select Function</label>
                                {functions.length === 0 ? (
                                    <Input
                                        placeholder="Enter ABI to load functions"
                                        disabled
                                        className="mt-2"
                                    />
                                ) : (
                                    <div className="flex gap-2">
                                        <select
                                            value={selectedFunction}
                                            onChange={(e) => setSelectedFunction(e.target.value)}
                                            className="flex-1 p-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {functions.map((fn) => (
                                                <option key={fn.name} value={fn.name}>
                                                    {fn.signature}
                                                </option>
                                            ))}
                                        </select>
                                        {currentFunction && (
                                            <TooltipProvider>
                                                <Tooltip open={isCopied}>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={handleCopySelector}
                                                            title="Copy function selector (e.g. 0xa9059cbb)"
                                                        >
                                                            Copy Selector
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Copied!</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* Dynamic Arguments */}
                            {currentFunction && (
                                <div>
                                    <label className="text-sm font-medium">Arguments</label>
                                    <div className="space-y-2 mt-2">
                                        {currentFunction.inputs.map((input, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    placeholder={input.name || `arg ${index} (${input.type})`}
                                                    value={args[input.name] || ''}
                                                    onChange={(e) =>
                                                        setArgs((prev) => ({
                                                            ...prev,
                                                            [input.name || input.type]: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Transaction Parameters */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Transaction Parameters</CardTitle>
                            <CardDescription>Configure execution context</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="use-pending"
                                    checked={usePendingBlock}
                                    onCheckedChange={(checked: any) => setUsePendingBlock(!!checked)}
                                />
                                <label htmlFor="use-pending" className="text-sm">
                                    Use Pending Block
                                </label>
                            </div>

                            {!usePendingBlock && (
                                <div>
                                    <label className="text-sm font-medium">Block Number</label>
                                    <Input
                                        type="number"
                                        placeholder="123456"
                                        value={blockNumber}
                                        onChange={(e: { target: { value: SetStateAction<string>; }; }) => setBlockNumber(e.target.value)}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium">From Address</label>
                                <Input
                                    placeholder="0x..."
                                    value={from}
                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setFrom(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Value (ETH)</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={value}
                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setValue(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Gas Limit</label>
                                <Input
                                    type="number"
                                    value={gasLimit}
                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setGasLimit(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Gas Price (gwei)</label>
                                <Input
                                    type="number"
                                    value={gasPrice}
                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setGasPrice(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Simulate Button */}
                    <div className="flex justify-end mb-6">
                        <Button size="lg" onClick={handleSimulate} disabled={isSimulating}>
                            {isSimulating ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Simulating...
                                </>
                            ) : (
                                'Simulate Transaction'
                            )}
                        </Button>
                    </div>

                    {/* Results */}
                    {error && (
                        <Card className="border-destructive/50 bg-destructive/10 mb-6">
                            <CardContent className="p-4">
                                <p className="text-sm text-destructive">
                                    <strong>Error:</strong> {error}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {results && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Simulation Results</CardTitle>
                                <CardDescription>Execution trace and gas usage</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <strong>Gas Used:</strong> {results.gasUsed}
                                </div>
                                <div>
                                    <strong>Status:</strong>{' '}
                                    <span className="text-green-600 font-medium">Success</span>
                                </div>
                                <div>
                                    <strong>Block:</strong> {results.block}
                                </div>

                                {/* Access List */}
                                {results.accessList.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-1">Access List</h4>
                                        <pre className="p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                                            {JSON.stringify(results.accessList, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {/* Trace */}
                                <div>
                                    <h4 className="font-medium mb-1">Call Trace</h4>
                                    <pre className="p-3 bg-muted rounded text-xs overflow-auto max-h-60">
                                        {JSON.stringify(results.trace, null, 2)}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        </div >
    );
}
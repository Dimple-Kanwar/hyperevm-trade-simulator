'use client';

import { useState, useEffect, SetStateAction } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { useUser } from '@account-kit/react';
import { encodeFunctionData, parseEther, formatEther, AccessList, Hex, numberToHex, BlockTag, keccak256, toHex } from 'viem';
import { Input } from '@/app/components/ui/Input';
import { Textarea } from '@/app/components/ui/Textarea';
import { TxSimulationParams } from '@/app/types/TxSimulation';
import Header from '@/app/components/header/Header';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { config } from '@/config';
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';

// Type for parsed function
type ParsedFunction = {
    name: string;
    signature: string;
    inputs: any[];
};

// Simulation Types
type SimulationType = 'contract' | 'basic';

export default function CustomSimulationPage() {
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const user = useUser();

    // Simulation type
    const [simulationType, setSimulationType] = useState<SimulationType>('contract');

    // Contract state
    const [contractAddress, setContractAddress] = useState('');
    const [abi, setAbi] = useState('');
    const [functions, setFunctions] = useState<ParsedFunction[]>([]);
    const [selectedFunction, setSelectedFunction] = useState<string>('');
    const [args, setArgs] = useState<Record<string, string>>({});


    // Transaction parameters
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [value, setValue] = useState('');
    const [gasLimit, setGasLimit] = useState('');
    const [gasPrice, setGasPrice] = useState('');
    const [usePendingBlock, setUsePendingBlock] = useState(true);
    const [blockNumber, setBlockNumber] = useState<string>('');
    const [currentBlock, setCurrentBlock] = useState<number | null>(null);
    const [accessList, setAccessList] = useState<AccessList>([]);
    const [gasUsed, setGasUsed] = useState("");

    // Create public client for network calls
    const client = config._internal.wagmiConfig.getClient();

    // estimate gas limit  for the transaction
    const estimateGas = async (tx: any) => {
        // Estimate gas for a simple transfer (fallback)
        if (!gasLimit) {
            try {
                const estimate = await client.request({
                    "id": 1,
                    "jsonrpc": "2.0",
                    "method": "eth_estimateGas",
                    "params": tx // should be an array
                });
                console.log({ estimate });
                console.log({ gasLimit: (Number(estimate) * 1.2).toFixed(0) });
                setGasLimit((Number(estimate) * 1.2).toFixed(0)); // Add 20% buffer
            } catch (err) {
                console.log("Error while estimating gas for the transaction.Error: ", err);
                console.log({ gasLimit: 21000 });
                setGasLimit('21000'); // Fallback
            }
        }
    }

    // Fetch current block number
    useEffect(() => {
        if (!client) return;

        const fetchBlock = async () => {
            try {
                const block = await client.request({
                    "id": 1,
                    "jsonrpc": "2.0",
                    "method": "eth_blockNumber"
                });
                const number = Number(block);
                setCurrentBlock(number);

                // Auto-fill block number if not using pending
                if (!usePendingBlock && !blockNumber) {
                    setBlockNumber(number.toString());
                }
            } catch (err) {
                console.error('Failed to fetch block number:', err);
            }
        };

        fetchBlock();
        const interval = setInterval(fetchBlock, 15_000); // Update every 15s
        return () => clearInterval(interval);
    }, [client, usePendingBlock, blockNumber]);


    // Fetch gas price
    useEffect(() => {
        if (!client || !client?.account?.address) return;

        const fetchGasPrice = async () => {
            try {
                // Fetch gas price
                const feeData = await client.request({
                    "id": 1,
                    "jsonrpc": "2.0",
                    "method": "eth_gasPrice"
                });
                console.log({ feeData });
                const gwei = formatEther(BigInt(feeData), 'gwei');
                console.log({ gwei });
                if (!gasPrice) setGasPrice(gwei);
            } catch (err: any) {
                console.log("Error while fetching gas price.Error: ", err);
            }
        }

        fetchGasPrice();
    }, [client, client?.account?.address, gasPrice]);


    // Set default from address
    useEffect(() => {
        console.log("connected account: ", user?.address);
        console.log("from account: ", from);
        if (user?.address && !from) {
            setFrom(user?.address);
        }
    }, [user?.address, from]);


    // When "Use Pending Block" is toggled
    const handleUsePendingBlockChange = (checked: boolean) => {
        console.log({ checked, currentBlock, blockNumber: !blockNumber });
        setUsePendingBlock(checked);
        if (!checked && currentBlock && !blockNumber) {
            console.log("set");
            setBlockNumber(currentBlock.toString());
        }
    };

    // Reset block number if user unchecks and no value
    useEffect(() => {
        if (!usePendingBlock && currentBlock && !blockNumber) {
            setBlockNumber(currentBlock.toString());
        }
    }, [usePendingBlock, currentBlock, blockNumber]);

    // Prevent hydration mismatch: only render results on client
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        if (client) setIsClient(true);
    }, []);

    // Parse ABI and extract functions whenever ABI changes
    useEffect(() => {
        if (!abi || simulationType !== 'contract') {
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
    }, [abi, simulationType]);

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

        let parsedAbi, orderedArgs;
        let toAddress: `0x${string}` | undefined;
        try {
            if (!client) throw new Error('Wallet not connected');

            // Build calldata and to only if simulating contract
            if (simulationType === 'contract') {
                if (!abi) throw new Error('ABI is required');
                if (!selectedFunction) throw new Error('Function is required');
                if (!contractAddress) throw new Error('Contract address is required');

                parsedAbi = JSON.parse(abi);
                const fn = parsedAbi.find((item: any) => item.type === 'function' && item.name === selectedFunction);
                if (!fn) throw new Error('Selected function not found in ABI');

                // Build args array in order
                orderedArgs = fn.inputs.map((input: any) => args[input.name] || args[input.type] || '');
                toAddress = contractAddress as `0x${string}`;

            }

            const account = client.account?.address;
            const fromAddress = (from || account) as `0x${string}`;
            console.log({ fromAddress });
            if (!fromAddress) throw new Error('From address is required');
            console.log({ to });
            console.log({ contractAddress });
            toAddress = to as `0x${string}`;
            console.log({ toAddress });
            if (!toAddress) throw new Error("To address is required");

            const tx: TxSimulationParams = {
                from: fromAddress,
                to: toAddress,
                data: contractAddress ? encodeFunctionData({
                    abi: parsedAbi,
                    functionName: selectedFunction,
                    args: orderedArgs,
                }) : '0x',
                value: value ? numberToHex(parseEther(value)) : undefined,
                gas: gasLimit ? numberToHex(BigInt(gasLimit)) : undefined,
            };

            console.log({ tx });
            const block: BlockTag | `0x${string}` = usePendingBlock ? 'pending' : blockNumber ? numberToHex(BigInt(blockNumber)) : 'latest';
            console.log({ block });

            // 🔧 Real Simulation: debug_traceCall
            let res: { jsonrpc: string, id: string, result: string };
            const result = await client.request({
                jsonrpc: "2.0",
                id: 1,
                method: "eth_call", //replace with debug_traceCall
                params: [tx, block],
            }
            );
            console.log({ result });

            const accessListResult = await client.request({
                method: 'eth_createAccessList',
                params: [tx, block],
            })
            if (typeof accessListResult === 'object' && 'accessList' in accessListResult!) {
                setAccessList(accessListResult.accessList);
                setGasUsed(accessListResult.gasUsed);
                console.log({ accessList, gasUsed });
            }


            setResults({
                gasUsed,
                status: 'success',
                result,
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

                    {/* Simulation Type Toggle */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Simulation Type</CardTitle>
                            <CardDescription>Choose what you'd like to simulate</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={simulationType}
                                onValueChange={(value) => setSimulationType(value as SimulationType)}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="contract" id="contract" label='Smart Contract Interaction' />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="basic" id="basic" label='Basic Transaction' />
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Contract Configuration (Only if contract simulation) */}
                    {simulationType === 'contract' && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Contract</CardTitle>
                                <CardDescription>Simulate Smart Contract Interactions</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Contract Address</label>
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
                    )}

                    {/* Transaction Parameters (Always visible) */}
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
                                    onCheckedChange={handleUsePendingBlockChange}
                                />
                                <label htmlFor="use-pending" className="text-sm">
                                    Use Pending Block
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Block Number</label>
                                {currentBlock && (
                                    <span className="text-xs text-muted-foreground">
                                        Current Block: {currentBlock}
                                    </span>
                                )}
                            </div>

                            <Input
                                type="number"
                                placeholder="123456"
                                value={blockNumber}
                                disabled={usePendingBlock}
                                onChange={(e) => setBlockNumber(e.target.value)}
                            />

                            <div>
                                <label className="text-sm font-medium">From Address</label>
                                <Input
                                    placeholder="0x..."
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">To Address</label>
                                <Input
                                    placeholder="0x..."
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Gas</label>
                                <Input
                                    type="number"
                                    value={gasLimit}
                                    onChange={(e) => setGasLimit(e.target.value)}
                                    placeholder="e.g. 3000000"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Gas Price (Gwei)</label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={gasPrice}
                                    onChange={(e) => setGasPrice(e.target.value)}
                                    placeholder="e.g. 10"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Value (ETH)</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
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
                        <Card className="bg-red-50 border-red-200 mb-6">
                            <CardContent className="p-4">
                                <p className="text-red-700"><strong>Error:</strong> {error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {results && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Simulation Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                                    {JSON.stringify(results, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        </div >
    );
}
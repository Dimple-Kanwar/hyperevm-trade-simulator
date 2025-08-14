'use client';

import { useState, useEffect, SetStateAction } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { useSmartAccountClient } from '@account-kit/react';
import { encodeFunctionData, parseEther, formatEther, AccessList, Hex, numberToHex, BlockTag, BlockIdentifier, BlockNumber, parseGwei } from 'viem';
import { Input } from '@/app/components/ui/Input';
import { Textarea } from '@/app/components/ui/Textarea';
import { TxSimulationParams } from '@/app/types/TxSimulation';

export default function CustomSimulationPage() {
    const { client } = useSmartAccountClient({});
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    // Form state
    const [contractAddress, setContractAddress] = useState('');
    const [abi, setAbi] = useState('');
    const [functionName, setFunctionName] = useState('');
    const [args, setArgs] = useState('');
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

    const handleSimulate = async () => {
        setIsSimulating(true);
        setError(null);
        setResults(null);

        try {
            if (!client) throw new Error('Wallet not connected');
            if (!abi) throw new Error('ABI is required');
            if (!functionName) throw new Error('Function name is required');
            if (!contractAddress) throw new Error('Contract address is required');

            let parsedAbi;
            let parsedArgs = [];

            // Validate ABI
            try {
                parsedAbi = JSON.parse(abi);
            } catch (e) {
                throw new Error('Invalid ABI: must be valid JSON');
            }

            // Validate args
            if (args) {
                try {
                    parsedArgs = Object.values(JSON.parse(args));
                } catch (e) {
                    throw new Error('Invalid arguments: must be valid JSON object');
                }
            }

            const account = client.account?.address;
            const fromAddress = (from || account) as `0x${string}`;

            if (!fromAddress) throw new Error('From address is required');

            const tx: TxSimulationParams = {
                from: (fromAddress || account)! as `0x${string}`,
                to: contractAddress as `0x${string}`,
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
                        params: [tx, block, { tracer: "callTracer" }],
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
                <h1 className="text-2xl font-semibold mb-6">Custom Contract Simulation</h1>
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-6">Custom Contract Simulation</h1>

            {/* Contract Configuration */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Contract</CardTitle>
                    <CardDescription>Enter contract address and ABI</CardDescription>
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
                        <label className="text-sm font-medium">Enter ABI (JSON)</label>
                        <Textarea
                            placeholder='[{"name": "transfer", "type": "function", ...}]'
                            value={abi}
                            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setAbi(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Select Function</label>
                        <Input
                            placeholder="transfer"
                            value={functionName}
                            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setFunctionName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Arguments (JSON)</label>
                        <Textarea
                            placeholder='{"to": "0x...", "amount": "100"}'
                            value={args}
                            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setArgs(e.target.value)}
                            rows={2}
                        />
                    </div>
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
        </div>
    );
}
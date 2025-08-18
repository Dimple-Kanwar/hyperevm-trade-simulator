'use client';

import { useState, useEffect, SetStateAction, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { useUser } from '@account-kit/react';
import { encodeFunctionData, parseEther, formatEther, AccessList, Hex, numberToHex, BlockTag, keccak256, toHex } from 'viem';
import { Input } from '@/app/components/ui/Input';
import { Textarea } from '@/app/components/ui/Textarea';
import { AccessListItem, AccountOverride, BundleResults, ParsedFunction, SimulationResult, SimulationType, SimulatorProps, TxSimulationParams } from '@/app/types/TxSimulation';
import Header from '@/app/components/header/Header';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { config } from '@/config';
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';
import { useNetwork } from '../context/Network-Context';
import { toHexQty, toHexWei, tryDecodeRevert } from '@/lib/utils';
import { ethers } from 'ethers';
import { Plus, Rocket, Section, Settings, Trash2, Wrench } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { CHAINS } from '@/lib/constants';
import SimulationResults from '@/app/components/simulator/SimulationResults';
import ContractEditor from '../components/simulator/ContractEditor';
import BundleTransactions from '../components/simulator/BundleSimulator';
import StateOverrides from '../components/simulator/StateOverridesEditor';
import AccessListEditor from '../components/simulator/AccessListEditor';
import { mockContractBundleSimulationResult, mockERC20SimulationResult, mockSimulationResult, mockTransactionBundle } from '../mocks/simulationMockResults';

export default function CustomSimulationPage() {
    const { network } = useNetwork();
    const chain = CHAINS[network];
    const rpcUrl = chain.rpcUrl
    console.log({ rpcUrl });
    console.log({ network });
    const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);

    useEffect(() => {
        setProvider(new ethers.JsonRpcProvider(rpcUrl));
    }, [network]);

    const searchParams = useSearchParams();
    const from = searchParams.get("from") || "";
    // console.log({ from });

    // results
    const [callResult, setCallResult] = useState<string | null>(null);
    const [results, setResults] = useState<SimulationResult | null>(null);
    const [decodedResult, setDecodedResult] = useState<any>(null);
    const [gasEstimate, setGasEstimate] = useState<string | null>(null);
    const [traceUnsupported, setTraceUnsupported] = useState<boolean>(false);

    const [revertInfo, setRevertInfo] = useState<any>(null);
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
    const [fromAddr, setFromAddr] = useState(from);
    const [to, setTo] = useState('');
    const [value, setValue] = useState("0");
    const [gasLimit, setGasLimit] = useState('21000');
    const [gasPrice, setGasPrice] = useState('');
    const [maxFeePerGas, setMaxFeePerGas] = useState<string>("");
    const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState<string>("");
    const [nonce, setNonce] = useState<number>();
    const [usePendingBlock, setUsePendingBlock] = useState(true);
    const [blockNumber, setBlockNumber] = useState<string>('');
    const [currentBlock, setCurrentBlock] = useState<number | null>(null);
    const [gasUsed, setGasUsed] = useState("");

    // Advanced features
    const [accessList, setAccessList] = useState<AccessListItem[]>([]);
    const [accessListUnsupported, setAccessListUnsupported] = useState<boolean>(false);


    // state overrides
    const [overrides, setOverrides] = useState<AccountOverride[]>([]);
    const [stateOverrideUnsupported, setStateOverrideUnsupported] = useState<boolean>(false);

    // bundle
    type BuiltTx = { label: string; to: string; data?: string; value?: string };
    const [bundle, setBundle] = useState<BuiltTx[]>([]);
    const [bundleResults, setBundleResults] = useState<any[]>([]);


    // Create public client for network calls
    const client = config._internal.wagmiConfig.getClient();
    console.log({ client });
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
        if (!client || !client?.account?.address || fromAddr) return;

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
        console.log("from account: ", fromAddr);
        if (user?.address && !fromAddr) {
            setFromAddr(user?.address);
        }
    }, [user?.address, fromAddr]);


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

    const iface = useMemo(() => {
        if (abi == "") return {};
        return JSON.parse(abi)
    }, [abi]);

    // Serialize overrides for eth_call (Geth-style), if present
    const buildStateOverrides = () => {
        if (!overrides.length) return undefined;
        try {
            const obj: any = {};
            for (const acc of overrides) {
                const entry: any = {};
                if (acc.balance) entry.balance = toHexWei(acc.balance);
                if (acc.code) entry.code = acc.code;
                if (acc.storage?.length) {
                    entry.state = {} as Record<string, string>;
                    for (const s of acc.storage) {
                        entry.state[s.key] = s.value;
                    }
                }
                obj[acc.address] = entry;
            }
            return obj;
        } catch {
            return undefined;
        }
    };

    // Build data from ABI + args
    const buildCalldata = (): string | undefined => {
        let parsedAbi, orderedArgs;
        // Build calldata and to only if simulating contract
        if (simulationType === 'contract') {
            // if (!abi) throw new Error('ABI is required');
            // if (!selectedFunction) throw new Error('Function is required');
            // if (!contractAddress) throw new Error('Contract address is required');

            try {
                if (abi == "") return "0x";
                parsedAbi = JSON.parse(abi);
                const fn = parsedAbi.find((item: any) => item.type === 'function' && item.name === selectedFunction);
                if (!fn) throw new Error('Selected function not found in ABI');

                // Build args array in order
                orderedArgs = fn.inputs.map((input: any) => args[input.name] || args[input.type] || '');
                const toAddress = contractAddress as `0x${string}`;
                setTo(toAddress);
                return encodeFunctionData({
                    abi: parsedAbi,
                    functionName: selectedFunction,
                    args: orderedArgs,
                })
            } catch (e) {
                setError("Failed to encode arguments. Ensure JSON array matches function inputs.");
                return undefined;
            }

        } else return "0x";
    };

    const currentTx = useMemo(() => {
        const data = buildCalldata();
        return {
            from: fromAddr,
            to,
            data,
            value: toHexWei(value),
            gas: toHexQty(gasLimit),
            gasPrice: toHexQty(gasPrice),
            maxFeePerGas: toHexQty(maxFeePerGas),
            maxPriorityFeePerGas: toHexQty(maxPriorityFeePerGas),
            nonce: nonce,
            accessList: accessList ?? undefined,
        } as any;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromAddr, to, abi, selectedFunction, args, value, gasLimit, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, accessList]);

    const blockTag: BlockTag | `0x${string}` = usePendingBlock ? 'pending' : blockNumber ? numberToHex(BigInt(blockNumber)) : 'latest';
    // console.log({ blockTag });

    // Action: Create Access List
    const createAccessList = async () => {
        setError(null);
        setDecodedResult(null);
        setRevertInfo(null);
        if (!provider) return;
        try {
            const params: any[] = [
                { ...currentTx },
                blockTag || "latest",
            ];
            // Some nodes accept 3rd param for state overrides; we try to include it only if defined
            const so = buildStateOverrides();
            if (so) params.push(so);

            const res = await (provider as any).send("eth_createAccessList", params);
            setAccessList(res?.accessList || res);
            setAccessListUnsupported(false);
        } catch (e: any) {
            setAccessListUnsupported(true);
            setError(e?.message || String(e));
        }
    };


    // Action: Trace (best effort)
    const traceCall = async () => {
        setTraceUnsupported(false);
        if (!provider) return;
        try {
            const params: any[] = [{ ...currentTx }, blockTag || "latest", {}];
            const so = buildStateOverrides();
            if (so) params.push(so); // some nodes may treat overrides separately
            const trace = await (provider as any).send("debug_traceCall", params);
            // For demo, just dump to console; you can render a nice tree view here
            console.log("TRACE", trace);
            alert("debug_traceCall succeeded – check console for raw trace. Implement your visualizer as needed.");
        } catch (e) {
            setTraceUnsupported(true);
        }
    };
    // Bundle: add current built tx
    const addToBundle = () => {
        const data = buildCalldata();
        const label = selectedFunction || "custom";
        if (!to) return alert("Missing `to` address");
        setBundle(b => [...b, { label, to, data, value: toHexWei(value) }]);
    };


    const runBundle = async () => {
        if (!provider) return;
        const so = buildStateOverrides();
        const results: Array<BundleResults> = [];
        for (let i = 0; i < bundle.length; i++) {
            const tx = bundle[i];
            try {
                const params: any[] = [{ from, to: tx.to, data: tx.data, value: tx.value }, blockTag || "latest"];
                if (so) params.push(so);
                const res: string = await (provider as any).send("eth_call", params);
                results.push({ index: i, ok: true, result: res });
            } catch (e: any) {
                results.push({ index: i, ok: false, error: e?.message || String(e) });
            }
        }
        setBundleResults(results);
        console.log("Bundle results", results);
    };


    // Reset block number if user unchecks and no value
    // useEffect(() => {
    //     if (provider) {
    //         console.log("y")
    //         const baseFee = provider.getBlock("latest").then(block => block?.baseFeePerGas);
    //         const maxPriorityFee = ethers.parseUnits("2", "gwei");
    //         setMaxPriorityFeePerGas(maxPriorityFee.toString());
    //         const maxFee = parseInt(String(baseFee!)) * (2) + Number(maxPriorityFee); // typical safety margin
    //         setMaxFeePerGas(maxFee.toString());
    //     }
    //     console.log("n")
    // }, [maxPriorityFeePerGas, maxFeePerGas]);

    // console.log({ maxPriorityFeePerGas, maxFeePerGas })
    // Simulate Transaction
    const handleSimulate = async () => {
        setIsSimulating(true);
        setResults(null);
        setError(null);
        setDecodedResult(null);
        setRevertInfo(null);
        setCallResult(null);
        setGasEstimate(null);
        if (!provider) return;

        const so = buildStateOverrides();
        console.log({ so });
        try {

            // Build state overrides if needed
            const stateOverrides = buildStateOverrides();

            // Prepare transaction object
            const tx: any = {
                ...currentTx,
                accessList: currentTx.accessList || [],
                stateOverrides
            };

            // 🔹 Auto-set realistic fees
            const latestBlock = await provider.getBlock("latest");
            const baseFee = latestBlock!.baseFeePerGas || ethers.parseUnits("1", "gwei");
            const priorityFee = ethers.parseUnits("2", "gwei"); // 2 Gwei tip

            tx.maxPriorityFeePerGas = priorityFee;
            tx.maxFeePerGas = baseFee * BigInt(2) + (priorityFee); // 2x base fee + tip

            console.log("Simulating transaction with fees:", {
                maxFeePerGas: tx.maxFeePerGas.toString(),
                maxPriorityFeePerGas: tx.maxPriorityFeePerGas.toString(),
            });
            // 🔧 Use debug_traceCall for full simulation
            const traceParams: any[] = [
                tx,
                blockTag || "latest",
                { tracer: "callTracer", stateOverride: stateOverrides },
            ];

            const traceResult: any = await provider.send("debug_traceCall", traceParams);
            console.log("Trace Result:", traceResult);

            // Extract gasUsed
            const gasUsed = traceResult?.gas || "0";


            // try decode
            if (iface && selectedFunction) {
                try {
                    const decoded = iface.decodeFunctionResult(selectedFunction, results);
                    setDecodedResult(Array.from(decoded).map((v: any) => (typeof v === "bigint" ? v.toString() : v)));
                } catch { }
            }

            // estimateGas
            try {
                const gasParams: any = { ...currentTx };
                const gas = await provider.estimateGas(gasParams);
                setGasEstimate(gas.toString());
            } catch (eg: any) {
                // estimateGas can throw on reverts; show message
                setGasEstimate(null);
            }


        } catch (err: any) {
            const msg = err?.error?.data || err?.data || err?.message || String(err);
            setError(typeof msg === "string" ? msg : JSON.stringify(msg));
            // attempt revert decoding if hex data present
            const hex = typeof err?.data === "string" ? err.data : (typeof err?.error?.data === "string" ? err.error.data : "");
            if (hex?.startsWith("0x")) {
                const r = tryDecodeRevert(hex);
                if (r) setRevertInfo(r);
            }
            // setError(err.message || 'Simulation failed');
            // setResults({
            //     success: false,
            //     gasUsed: "0",
            //     logs: [],
            //     error: err.message,
            // });
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
            <Header from={from!} />
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
                                <CardTitle title='Contract' >Contract</CardTitle>
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
                                    value={fromAddr}
                                    onChange={(e) => setFromAddr(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Nonce</label>
                                <Input
                                    type="number"
                                    value={nonce}
                                    onChange={(e) => setNonce(Number(e.target.value))}
                                    placeholder="e.g. 10"
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
                                    placeholder="e.g. 21000"
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
                                <label className="text-sm font-medium">Max Priority Fee</label>
                                <Input
                                    value={maxPriorityFeePerGas}
                                    onChange={e => setMaxPriorityFeePerGas(e.target.value)}
                                    placeholder="wei or 0x.."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Max Fee Per Gas</label>
                                <Input
                                    placeholder="wei or 0x.."
                                    value={maxFeePerGas}
                                    onChange={e => setMaxFeePerGas(e.target.value)}
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


                            {/* State Overrides */}
                            <StateOverrides overrides={overrides} setOverrides={setOverrides} />
                            {/* <div>
                                <label className="text-sm font-medium">State Overrides (experimental)</label>
                                <div className="mt-2 space-y-2">
                                    {overrides.map((o, idx) => (
                                        <div key={idx} className="p-3 rounded-xl border grid grid-cols-1 md:grid-cols-4 gap-2">
                                            <input className="p-2 border rounded-lg md:col-span-2" placeholder="Address 0x..." value={o.address} onChange={e => setOverrides(arr => arr.map((x, i) => i === idx ? { ...x, address: e.target.value } : x))} />
                                            <input className="p-2 border rounded-lg" placeholder="Balance (ETH or 0x..)" value={o.balance ?? ""} onChange={e => setOverrides(arr => arr.map((x, i) => i === idx ? { ...x, balance: e.target.value } : x))} />
                                            <div className="flex items-center justify-end">
                                                <button className="p-2 rounded-lg border" onClick={() => setOverrides(arr => arr.filter((_, i) => i !== idx))}><Trash2 size={16} /></button>
                                            </div>
                                            <textarea className="p-2 border rounded-lg md:col-span-4" placeholder="Code bytecode 0x... (optional)" value={o.code ?? ""} onChange={e => setOverrides(arr => arr.map((x, i) => i === idx ? { ...x, code: e.target.value } : x))} />
                                            <div className="md:col-span-4">
                                                <div className="text-xs text-gray-500 mb-1">Storage Slots</div>
                                                {(o.storage ?? []).map((s, j) => (
                                                    <div key={j} className="grid grid-cols-2 gap-2 mb-2">
                                                        <input className="p-2 border rounded-lg" placeholder="key (0x..)" value={s.key} onChange={e => setOverrides(arr => arr.map((x, i) => i === idx ? { ...x, storage: (x.storage ?? []).map((y, k) => k === j ? { ...y, key: e.target.value } : y) } : x))} />
                                                        <input className="p-2 border rounded-lg" placeholder="value (0x..)" value={s.value} onChange={e => setOverrides(arr => arr.map((x, i) => i === idx ? { ...x, storage: (x.storage ?? []).map((y, k) => k === j ? { ...y, value: e.target.value } : y) } : x))} />
                                                    </div>
                                                ))}
                                                <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border" onClick={() => setOverrides(arr => arr.map((x, i) => i === idx ? { ...x, storage: [...(x.storage ?? []), { key: "0x", value: "0x" }] } : x))}><Plus size={14} /> Add Slot</button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setOverrides(arr => [...arr, { address: "0x", storage: [] }])}
                                    >
                                        <Plus size={10} /> Add Account Override
                                    </Button>
                                    {/* <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border" ><Plus size={10} /> Add Account Override</button> */}
                            {/* {stateOverrideUnsupported && <p className="text-xs text-amber-700">State overrides not supported by node.</p>}
                                </div> */}
                            {/* </div> */}

                            {/* Access List */}
                            <AccessListEditor accessList={accessList} setAccessList={setAccessList} />
                            {/* <div>
                                <label className="text-sm font-medium">Optional Access Lists</label>
                                <div className="mt-2 space-y-2">
                                    {accessList.map((item, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                placeholder="Contract address"
                                                value={item.address}
                                                onChange={(e) => {
                                                    const newAccessList = [...accessList];
                                                    newAccessList[index].address = e.target.value;
                                                    setAccessList(newAccessList);
                                                }}
                                            />
                                            <Input
                                                placeholder="Storage key"
                                                value={item.storageKeys.join(',')}
                                                onChange={(e) => {
                                                    const keys = e.target.value.split(',').map(k => k.trim());
                                                    const newAccessList = [...accessList];
                                                    newAccessList[index].storageKeys = keys;
                                                    setAccessList(newAccessList);
                                                }}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const newAccessList = accessList.filter((_, i) => i !== index);
                                                    setAccessList(newAccessList);
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setAccessList([...accessList, { address: '', storageKeys: [] }])}
                                    >
                                        <Plus size={10} /> Add Address to Access List
                                    </Button>
                                </div>
                            </div> */}
                            <BundleTransactions
                                bundle={bundle}
                                setBundle={setBundle}
                                addToBundle={addToBundle}
                                runBundle={runBundle}
                            />

                            {/* Bundle Transactions
                            <div>
                                <label className="text-sm font-medium">Bundle (experimental, stateless)</label>
                                <div className="space-y-2">
                                    <div className="text-xs text-gray-600">Adds current call to a bundle (runs sequential eth_call at the same block tag). Does not persist state between calls.</div>
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
                                                <div key={i} className="flex items-center justify-between p-2 rounded-lg border text-xs">
                                                    <div className="truncate">#{i + 1} – {b.label} → {b.to}</div>
                                                    <button className="p-1" onClick={() => setBundle(arr => arr.filter((_, idx) => idx !== i))}><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                            <button className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm" onClick={runBundle}>Run Bundle</button>
                                        </div>
                                    )}
                                </div>
                            </div> */}
                            {/* Contract Editor toggle (hidden by default) */}
                            <ContractEditor />
                        </CardContent>
                    </Card>

                    {/* Simulate Button */}
                    <div className="flex justify-end mb-6 gap-2">
                        <button onClick={createAccessList} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-white text-sm"><Settings size={16} /> Create Access List</button>
                        <button onClick={traceCall} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 text-white text-sm"><Wrench size={16} /> Trace (best-effort)</button>
                        <Button size="lg" onClick={handleSimulate} disabled={isSimulating}>
                            <Rocket size={16} />
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
                    {accessListUnsupported && <p className="text-xs text-amber-700 mt-2">Node does not support <code>eth_createAccessList</code>.</p>}
                    {traceUnsupported && <p className="text-xs text-amber-700 mt-2">Node likely does not support <code>debug_traceCall</code>. Execution trace unavailable.</p>}


                    {/* Results */}
                    {results && (
                        <div className="xl:col-span-2 space-y-6">
                            <Card title="Results & Insights">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                        <div className="text-xs text-gray-500">Raw Return (hex)</div>
                                        <pre className="p-3 bg-gray-50 rounded-lg overflow-x-auto min-h-[72px]">{callResult ?? "—"}</pre>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs text-gray-500">Decoded Return (if ABI provided)</div>
                                        <pre className="p-3 bg-gray-50 rounded-lg overflow-x-auto min-h-[72px]">{decodedResult ? JSON.stringify(decodedResult, null, 2) : "—"}</pre>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs text-gray-500">Estimated Gas</div>
                                        <div className="p-3 bg-gray-50 rounded-lg">{gasEstimate ?? "—"}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs text-gray-500">Revert / Error</div>
                                        <pre className="p-3 bg-gray-50 rounded-lg overflow-x-auto min-h-[72px]">{error ? String(error) : "—"}</pre>
                                        {revertInfo && (
                                            <div className="text-xs text-rose-700">{revertInfo.type}: {revertInfo.reason ?? revertInfo.code}</div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                            <Card title="Advanced Diagnostics">
                                <ul className="list-disc pl-6 text-sm space-y-1 text-gray-700">
                                    <li>
                                        <b>Real-time state:</b> your simulations use the selected provider at <code>{chain.rpcUrl}</code> and block tag <code>{blockTag}</code>.
                                    </li>
                                    <li>
                                        <b>Historical simulation:</b> set <i>Block Tag</i> to a past block number or hash.
                                    </li>
                                    <li>
                                        <b>Gas profiling:</b> uses <code>eth_estimateGas</code>. Opcode-level breakdown requires <code>debug_traceCall</code>.
                                    </li>
                                    <li>
                                        <b>Event decoding:</b> not available from <code>eth_call</code> alone; requires tracing APIs.
                                    </li>
                                    <li>
                                        <b>State overrides:</b> best-effort via non-standard <i>stateOverrides</i>. If RPC rejects, this feature will be limited.
                                    </li>
                                </ul>
                            </Card>
                        </div>
                    )}

                    <div className="container mx-auto px-4 py-6">
                        <h1 className="text-2xl font-bold mb-6">Transaction Simulation</h1>
                        {/* Simulation results */}
                        {simulationType == "contract" ? (
                            <SimulationResults
                                result={mockERC20SimulationResult}
                                // bundleResults={mockContractBundleSimulationResult}
                            />
                        ) : (
                            <SimulationResults
                                result={mockSimulationResult}
                                // bundleResults={mockTransactionBundle}
                            />
                        )}


                    </div>

                </main>
            </div>
        </div >
    );
}
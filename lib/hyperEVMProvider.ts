// hyperEVMProvider.ts
import { ethers } from "ethers";
import { CHAINS } from "./constants";

// Environment variables (set in .env.local)
const ALCHEMY_API_KEY =
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "lHhE2H6kpxL02FuG859Vyh-f-WwKYdHT";
if (!ALCHEMY_API_KEY) {
  throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not set");
}

// Chain IDs
export const CHAIN_IDS = {
  mainnet: 999,
  testnet: 998,
};

interface SimulationResponse {
  callResult: string;
  gasEstimate: bigint;
}
// Initialize Provider
export class HyperEVMProvider {
  provider: ethers.JsonRpcProvider;
  isMainnet: boolean;

  constructor(network: "mainnet" | "testnet" = "mainnet") {
    const url = CHAINS[network].rpcUrl;
    this.provider = new ethers.JsonRpcProvider(url);
    this.isMainnet = network === "mainnet";
  }

  /**
   * Get latest block number
   */
  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  /**
   * Get account balance in HYPE
   */
  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  /**
   * Get current gas price (legacy)
   */
  async getGasPrice(): Promise<bigint | null> {
    return (await this.provider.getFeeData()).gasPrice;
  }

  /**
   * Get EIP-1559 fee data
   */
  async getFeeData() {
    return await this.provider.getFeeData();
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(transaction: ethers.TransactionRequest): Promise<bigint> {
    return await this.provider.estimateGas(transaction);
  }

  /**
   * Simulate a transaction (eth_call)
   * Returns the return value or throws on revert
   */
  async simulateTransaction(
    transaction: ethers.TransactionRequest
  ): Promise<SimulationResponse> {
    try {
      const callResult = await this.provider.call(transaction);
      console.log("Raw call result (hex):", callResult);
      const gasEstimate = await this.provider.estimateGas(transaction);
      console.log("Estimated gas:", gasEstimate.toString());
      return { callResult, gasEstimate };
    } catch (err: any) {
      // Extract revert reason if possible
      console.log(err);
      if (err.data) {
        try {
          const error = ethers.AbiCoder.defaultAbiCoder().decode(
            ["string"],
            `0x${err.data.slice(10)}`
          );
          throw new Error(`Reverted: ${error[0]}`);
        } catch (e) {
          throw new Error(`Reverted with custom error: ${err.data}`);
        }
      }
      throw new Error(
        err.reason || err.message || "Transaction simulation reverted"
      );
    }
  }

  /**
   * Create Access List (EIP-2930)
   * Note: May not be supported on all endpoints
   */
  async createAccessList(
    transaction: ethers.TransactionRequest
  ): Promise<ethers.AccessList> {
    try {
      return await this.provider.send("eth_createAccessList", [
        transaction,
        "latest",
      ]);
    } catch (err: any) {
      console.warn("eth_createAccessList not supported:", err.message);
      throw new Error("Access list generation not supported on this network");
    }
  }

  /**
   * Debug trace call (if supported)
   * Requires a node with debug methods enabled
   */
  async debugTraceCall(
    transaction: ethers.TransactionRequest,
    block = "latest"
  ): Promise<any> {
    try {
      return await this.provider.send("debug_traceCall", [
        {
          from: transaction.from,
          to: transaction.to,
          data: transaction.data,
          value: transaction.value,
          gas: transaction.gasLimit?.toString(),
        },
        block,
        { tracer: "callTracer" },
      ]);
    } catch (err: any) {
      console.warn("debug_traceCall failed:", err.message);
      throw new Error("Execution tracing not supported on this node");
    }
  }

  /**
   * Get chain ID
   */
  async getNetwork() {
    return await this.provider.getNetwork();
  }
}

const test = new HyperEVMProvider("testnet");
console.log({ blockNum: await test.getBlockNumber() });
const baseFee = await test.provider.getBlock("latest").then(block => block?.baseFeePerGas);
const maxPriorityFee = ethers.parseUnits("2", "gwei");
const maxFee = parseInt(String(baseFee!)) * (2) + Number(maxPriorityFee); // typical safety margin


const fee = await test.getFeeData();
console.log({fee});
const tx = {
  from: "0xc82306Ca37bbCb0C560608bD76F1fbeB360C411B",
  to: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
  data: "0x",
  value: "0xde0b6b3a7640000",
  gas: "0x5208",
  maxFeePerGas: maxPriorityFee.toString(),
  maxPriorityFeePerGas: maxPriorityFee.toString(),
  nonce: 1,
  accessList: [
    {
      address: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
      storageKeys: [],
    },
  ],
};

const res = await test.simulateTransaction(tx);
console.log({res});

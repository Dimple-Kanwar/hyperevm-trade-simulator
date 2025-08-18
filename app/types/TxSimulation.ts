import { AccessList, Address, BlockTag, Hash, Quantity } from "viem";

// reusable types across components
export interface TxSimulationParams {
  gasPrice: string;
  from: string | undefined;
  to: `0x${string}` | undefined;
  gas?: string;
  value?: string;
  data?: Hash;
  nonce?: `0x${string}`;
  blockTag?: BlockTag | string;
  overrides?: any;
  accessList?: AccessList;
}

export type SimulationResult = {
  success: boolean;
  gasUsed: string;
  logs: string[];
  error?: string;
};

// Type for parsed function
export type ParsedFunction = {
  name: string;
  signature: string;
  inputs: any[];
};

// Simulation Types
export type SimulationType = "contract" | "basic";

// Type for access list
export interface AccessListItem {
  address: string;
  storageKeys: string[];
}

export interface SimulatorProps {
  from: string; // logged-in address (Alchemy or impersonated)
}

// ---------------------------
// Types for state overrides & access lists
// ---------------------------
interface StorageOverride {
  key: string;
  value: string;
}
export interface AccountOverride {
  address: string;
  balance?: string; // hex or decimal ETH; UI will transform to wei hex
  code?: string; // 0x bytecode
  storage?: StorageOverride[];
}

export interface BundleResults {
  index: number;
  ok: boolean;
  result?: string;
  error?: string;
}

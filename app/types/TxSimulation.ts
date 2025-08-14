import { AccessList, Address, BlockTag, Hash, Quantity } from "viem";

// reusable types across components
export interface TokenInfo {
  address: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  logoURI?: string;
}

export interface ABIItem {
  name: string;
  type: string;
  inputs?: { name: string; type: string }[];
  outputs?: any[];
  stateMutability?: string;
}

export interface ContractSource {
  label: string;
  address: string;
  abi?: ABIItem[];
}

export interface TxBuildState {
  contract?: ContractSource | null;
  functionABI?: ABIItem | null;
  params: Record<string, any>;
  rawData?: string;
}

export interface TxSimulationParams {
  from: Address | undefined;
  to: Address | undefined;
  gas?: `0x${string}`;
  value?: `0x${string}`;
  data?: Hash;
  blockTag?: BlockTag | `0x${string}`;
  overrides?: any;
  accessList?: AccessList;
} 

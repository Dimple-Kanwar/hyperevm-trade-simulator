import { clsx, type ClassValue } from "clsx"
import { ethers } from "ethers";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isValidAddress(address: string): address is `0x${string}` {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

export const tryDecodeRevert = (data: string) => {
  // EVM revert selectors: Error(string) 0x08c379a0, Panic(uint256) 0x4e487b71
  if (!data || !data.startsWith("0x") || data.length < 10) return null;
  const selector = data.slice(0, 10).toLowerCase();
  const coder = ethers.AbiCoder.defaultAbiCoder();
  try {
    if (selector === "0x08c379a0") {
      const [reason] = coder.decode(["string"], "0x" + data.slice(10));
      return { type: "Error", reason };
    }
    if (selector === "0x4e487b71") {
      const [code] = coder.decode(["uint256"], "0x" + data.slice(10));
      return { type: "Panic", code: code.toString() };
    }
  } catch {}
  return null;
};

// Transform input value like "0.1" ETH -> hex wei; if already 0x, pass-through
export const toHexWei = (val?: string) => {
  if (!val) return undefined as unknown as string | undefined;
  if (val.startsWith("0x")) return val;
  try { return ethers.toQuantity(ethers.parseEther(val)); } catch { return undefined; }
};

// Transform decimal or hex gas fields to hex quantity
export const toHexQty = (v?: string) => {
  if (!v) return undefined as unknown as string | undefined;
  if (v.startsWith("0x")) return v;
  try { return ethers.toQuantity(BigInt(v)); } catch { return undefined; }
};
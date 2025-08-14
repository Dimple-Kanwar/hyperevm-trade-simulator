import { clsx, type ClassValue } from "clsx"
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

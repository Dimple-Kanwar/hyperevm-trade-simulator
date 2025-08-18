import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";

// Utility hook for persistent state using localStorage
export function usePersistentState<T>(key: string, defaultValue: T) {
    const [value, setValue] = useState<T>(() => {
        if (typeof window === "undefined") return defaultValue;
        try {
            const stored = localStorage.getItem(key);
            return stored ? (JSON.parse(stored) as T) : defaultValue;
        } catch (err) {
            console.error("Failed to load from localStorage", err);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.error("Failed to save to localStorage", err);
        }
    }, [key, value]);

    return [value, setValue] as const;
}

// Define type for network
export type NetworkType = "mainnet" | "testnet";

interface NetworkContextProps {
    network: NetworkType;
    setNetwork: (network: NetworkType) => void;
}

export const NetworkContext = createContext<NetworkContextProps | undefined>(undefined);

// Hook to use network context
export const useNetwork = () => {
    const context = useContext(NetworkContext);
    if (!context) {
        throw new Error("useNetwork must be used within a NetworkProvider");
    }
    return context;
};
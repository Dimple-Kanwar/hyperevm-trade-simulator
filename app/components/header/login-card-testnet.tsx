"use client";

import { useEffect, useState } from "react";

interface Props {
  onLogin: (address: string) => void;
}

export default function LoginCardTestnet({ onLogin }: Props) {
  const [address, setAddress] = useState("");
  
  return (
    <div className="p-4 rounded-2xl shadow-md bg-white w-96">
      <h2 className="text-lg font-semibold mb-3">Simulation Mode Login</h2>
      <p className="text-sm text-gray-600 mb-3">
        Enter any address to impersonate for simulation. No private key required.
      </p>
      <input
        type="text"
        placeholder="0xYourTestAddress"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full p-2 border rounded-xl mb-3"
      />
      <button
        disabled={!address}
        onClick={() => onLogin(address)}
        className="w-full py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
      >
        Use Address
      </button>
    </div>
  );
}

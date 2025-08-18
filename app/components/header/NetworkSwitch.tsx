"use client";

import { NetworkType, useNetwork } from "@/app/context/Network-Context";
import { CHAINS, NetworkKey } from "@/lib/constants";
import { useEffect, useState } from "react";

type Network = "mainnet" | "testnet";

interface Props {
  value: Network;
  onChange: (network: Network) => void;
}

const NetworkSwitch: React.FC = () => {
  const { network, setNetwork } = useNetwork();
  return (
    <div className="inline-flex items-center p-1 bg-gray-100 rounded-2xl shadow-inner">
      {(["mainnet", "testnet"] as NetworkKey[]).map(n => (
        <button
          key={n}
          onClick={() => setNetwork(n)}
          className={`px-4 py-2 rounded-xl text-sm transition ${network === n ? (n === "mainnet" ? "bg-blue-600 text-white" : "bg-green-600 text-white") : "bg-white text-gray-700"
            }`}
        >
          {CHAINS[n].name}
        </button>
      ))}
    </div>
  );
};

export default NetworkSwitch;

// const NetworkSwitch: React.FC = () => {
//   const { network, setNetwork } = useNetwork();

//   return (
//     <div className="p-4 bg-gray-100 rounded-2xl shadow-md flex justify-between items-center">
//       <span className="font-semibold text-gray-800">Network:</span>
//       <select
//         value={network}
//         onChange={(e) => setNetwork(e.target.value as NetworkType)}
//         className="ml-2 p-2 rounded-lg border border-gray-300"
//       >
//         <option value="mainnet">Mainnet (Alchemy Smart Wallet)</option>
//         <option value="testnet">Testnet (Simulation Mode)</option>
//       </select>
//     </div>
//   );
// };
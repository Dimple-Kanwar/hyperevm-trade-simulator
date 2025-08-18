export const mockERC20Input = {
  type: "erc20_transfer",
  from: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
  to: "0x16c8481ee905b47dBBF7E2269c7A6Fa1AE3479c1",
  tokenRecipient: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
  tokenAmount: 100,             // 100 tokens
  tokenDecimals: 18,             // ERC20 decimals
  gasLimit: 50000,               // typical ERC20 transfer gas
  maxFeePerGasGwei: 5,           
  maxPriorityFeePerGasGwei: 2,
  accessList: [
    { address: "0x16c8481ee905b47dBBF7E2269c7A6Fa1AE3479c1", storageKeys: ["0x0", "0x1"] },
    { address: "0x29231436e1872beDAaF2577b207E8a156547a6Ac", storageKeys: [] }
  ],
  inputData: "transfer(tokenRecipient, tokenAmount)", // app will ABI-encode
  description: "Transfer 100 ERC20 tokens to recipient"
};

export const mockBundleInput = [
  // ----- Transaction 1: ETH Transfer -----
  {
    type: "eth_transfer",
    from: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
    to: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
    valueEth: 0.5,                // 0.5 ETH
    gasLimit: 21000,
    maxFeePerGasGwei: 5,          // 5 Gwei
    maxPriorityFeePerGasGwei: 2,  // 2 Gwei
    accessList: [
      { address: "0x29231436e1872beDAaF2577b207E8a156547a6Ac", storageKeys: [] }
    ],
    inputData: "",                 // empty for ETH transfer
    description: "Send 0.5 ETH to recipient"
  },

  // ----- Transaction 2: ERC-20 Transfer -----
  {
    type: "erc20_transfer",
    from: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
    to: "0xMockERC20ContractAddress0000000000000000",
    tokenRecipient: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
    tokenAmount: 100,             // 100 tokens
    tokenDecimals: 18,            // ERC-20 decimals
    gasLimit: 50000,              // typical ERC-20 transfer gas
    maxFeePerGasGwei: 5,
    maxPriorityFeePerGasGwei: 2,
    accessList: [
      { address: "0xMockERC20ContractAddress0000000000000000", storageKeys: ["0x0", "0x1"] },
      { address: "0x29231436e1872beDAaF2577b207E8a156547a6Ac", storageKeys: [] }
    ],
    inputData: "transfer(tokenRecipient, tokenAmount)", // App will ABI-encode this
    description: "Send 100 ERC-20 tokens to recipient"
  }
];

export const mockHYPEInput = {
  type: "eth_transfer",
  from: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
  to: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
  valueEth: 0.5,                // 0.5 ETH
  gasLimit: 21000,               // typical ETH transfer
  maxFeePerGasGwei: 5,           // 5 Gwei
  maxPriorityFeePerGasGwei: 2,   // 2 Gwei
  accessList: [
    { address: "0x29231436e1872beDAaF2577b207E8a156547a6Ac", storageKeys: [] }
  ],
  inputData: "",                 // empty for ETH transfer
  description: "Simple 0.5 ETH transfer to recipient"
};

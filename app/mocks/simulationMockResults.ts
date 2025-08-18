import { SingleResult } from "../components/simulator/SimulationResults";

export const mockSimulationResult: SingleResult = {
  type: "0x2",
  chainId: "0x1",
  nonce: "0x1",
  gas: "0x5208",
  maxFeePerGas: "0x12a05f200", // 5 Gwei in hex
  maxPriorityFeePerGas: "0x77359400", // 2 Gwei in hex
  to: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
  value: "0x6f05b59d3b20000", // 0.5 ETH in hex
  accessList: [
    { address: "0x29231436e1872beDAaF2577b207E8a156547a6Ac", storageKeys: [] },
  ],
  input: "0x", // ETH transfer
  v: "0x0",
  hash: "0xbee75a4fcfaf3deaa9ed70aba3ddf4dbc9128db6824de91b8ce1923ee54b4a76", // realistic tx hash
  blockHash:
    "0x94510fd985739be9474ccf22a9ab5eaf73b64ea4f3a399ff4b755c8daa2eb607",
  blockNumber: "0x14e1982",
  transactionIndex: "0x0",
  logs: [],
  state: [
    {
      account: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
      balanceChange: "-0x6f05b59d3b20000",
      nonceChange: "0x1",
    },
    {
      account: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
      balanceChange: "+0x6f05b59d3b20000",
    },
  ],
  from: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
  gasPrice: "0x12a05f200",
  status: "success",
  gasUsed: "0x5208",
  trace: [
    {
      action: "call",
      from: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
      to: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
      value: "0x6f05b59d3b20000",
      gasUsed: "0x5208",
    },
  ],
  error: undefined,
};

export const mockERC20SimulationResult: SingleResult = {
  type: "0x2",
  chainId: "0x1",
  nonce: "0x5",
  gas: "0xc350", // 50,000 gas
  maxFeePerGas: "0x12a05f200", // 5 Gwei
  maxPriorityFeePerGas: "0x77359400", // 2 Gwei
  to: "0x16c8481ee905b47dBBF7E2269c7A6Fa1AE3479c1",
  value: "0x0", // ERC-20 transfer, value = 0
  accessList: [
    {
      address: "0x16c8481ee905b47dBBF7E2269c7A6Fa1AE3479c1",
      storageKeys: ["0x0", "0x1"],
    },
    { address: "0x29231436e1872beDAaF2577b207E8a156547a6Ac", storageKeys: [] },
  ],
  input:
    "0xa9059cbb00000000000000000000000029231436e1872beDAaF2577b207E8a156547a6Ac000000000000000000000000000000000000000000000000056bc75e2d63100000", // transfer(recipient, 100 tokens)
  v: "0x0",
  hash: "0xa3f1b6d7c82e4d6d8ef58b1b4c3f9b1a6f0e1d7c4a3b2e1d9f6a5b4c3d2e1f0a", // realistic tx hash
  blockHash:
    "0x94510fd985739be9474ccf22a9ab5eaf73b64ea4f3a399ff4b755c8daa2eb608",
  blockNumber: "0x14e1983",
  transactionIndex: "0x1",
  logs: [
    {
      address: "0x16c8481ee905b47dBBF7E2269c7A6Fa1AE3479c1",
      topics: [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", // Transfer event signature
        "0x000000000000000000000000C82306Ca37bbCb0C560608bD76F1fbeB360C411B",
        "0x00000000000000000000000029231436e1872beDAaF2577b207E8a156547a6Ac",
      ],
      data: "0x000000000000000000000000000000000000000000000000056bc75e2d63100000", // 100 tokens in hex
      logIndex: "0x0",
      transactionHash:
        "0xa3f1b6d7c82e4d6d8ef58b1b4c3f9b1a6f0e1d7c4a3b2e1d9f6a5b4c3d2e1f0a",
      blockHash:
        "0x94510fd985739be9474ccf22a9ab5eaf73b64ea4f3a399ff4b755c8daa2eb608",
      blockNumber: "0x14e1983",
    },
  ],
  state: [
    {
      account: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
      balanceChange: "-0x0",
      nonceChange: "0x1",
      tokenBalanceChange: "-100",
    },
    {
      account: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
      balanceChange: "+0x0",
      tokenBalanceChange: "+100",
    },
  ],
  from: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
  gasPrice: "0x12a05f200",
  status: "success",
  gasUsed: "0xc350",
  trace: [
    {
      action: "call",
      from: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
      to: "0x16c8481ee905b47dBBF7E2269c7A6Fa1AE3479c1",
      input:
        "0xa9059cbb00000000000000000000000029231436e1872beDAaF2577b207E8a156547a6Ac000000000000000000000000000000000000000000000000056bc75e2d63100000",
      gasUsed: "0xc350",
      value: "0x0",
    },
  ],
  error: undefined,
};

export const mockTransactionBundle: SingleResult[] = [
  // ----- Transaction 1: ETH Transfer -----
  {
    type: "0x2",
    chainId: "0x1",
    nonce: "0x1",
    gas: "0x5208",
    maxFeePerGas: "0x12a05f200", // 5 Gwei
    maxPriorityFeePerGas: "0x77359400", // 2 Gwei
    to: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
    value: "0x6f05b59d3b20000", // 0.5 ETH
    accessList: [
      {
        address: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
        storageKeys: [],
      },
    ],
    input: "0x",
    v: "0x0",
    hash: "0xbee75a4fcfaf3deaa9ed70aba3ddf4dbc9128db6824de91b8ce1923ee54b4a77",
    blockHash:
      "0x94510fd985739be9474ccf22a9ab5eaf73b64ea4f3a399ff4b755c8daa2eb609",
    blockNumber: "0x14e1982",
    transactionIndex: "0x0",
    logs: [],
    state: [
      {
        account: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
        balanceChange: "-0x6f05b59d3b20000",
        nonceChange: "0x1",
      },
      {
        account: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
        balanceChange: "+0x6f05b59d3b20000",
      },
    ],
    from: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
    gasPrice: "0x12a05f200",
    status: "success",
    gasUsed: "0x5208",
    trace: [
      {
        action: "call",
        from: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
        to: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
        value: "0x6f05b59d3b20000",
        gasUsed: "0x5208",
      },
    ],
    error: undefined,
  },

  // ----- Transaction 2: ERC-20 Transfer -----
  {
    type: "0x2",
    chainId: "0x1",
    nonce: "0x2",
    gas: "0xc350", // 50,000 gas
    maxFeePerGas: "0x12a05f200", // 5 Gwei
    maxPriorityFeePerGas: "0x77359400", // 2 Gwei
    to: "0x16c8481ee905b47dBBF7E2269c7A6Fa1AE3479c1",
    value: "0x0", // ERC-20 transfer
    accessList: [
      {
        address: "0xMockERC20ContractAddress0000000000000000",
        storageKeys: ["0x0", "0x1"],
      },
      {
        address: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
        storageKeys: [],
      },
    ],
    input:
      "0xa9059cbb00000000000000000000000029231436e1872beDAaF2577b207E8a156547a6Ac000000000000000000000000000000000000000000000000056bc75e2d63100000", // transfer(recipient, 100 tokens)
    v: "0x0",
    hash: "0xa3f1b6d7c82e4d6d8ef58b1b4c3f9b1a6f0e1d7c4a3b2e1d9f6a5b4c3d2e1f1b",
    blockHash:
      "0x94510fd985739be9474ccf22a9ab5eaf73b64ea4f3a399ff4b755c8daa2eb60a",
    blockNumber: "0x14e1982",
    transactionIndex: "0x1",
    logs: [
      {
        address: "0xMockERC20ContractAddress0000000000000000",
        topics: [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", // Transfer
          "0x000000000000000000000000C82306Ca37bbCb0C560608bD76F1fbeB360C411B",
          "0x00000000000000000000000029231436e1872beDAaF2577b207E8a156547a6Ac",
        ],
        data: "0x000000000000000000000000000000000000000000000000056bc75e2d63100000", // 100 tokens
        logIndex: "0x0",
        transactionHash:
          "0xa3f1b6d7c82e4d6d8ef58b1b4c3f9b1a6f0e1d7c4a3b2e1d9f6a5b4c3d2e1f1b",
        blockHash:
          "0x94510fd985739be9474ccf22a9ab5eaf73b64ea4f3a399ff4b755c8daa2eb60a",
        blockNumber: "0x14e1982",
      },
    ],
    state: [
      {
        account: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
        balanceChange: "-0x0",
        nonceChange: "0x1",
        tokenBalanceChange: "-100",
      },
      {
        account: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
        balanceChange: "+0x0",
        tokenBalanceChange: "+100",
      },
    ],
    from: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
    gasPrice: "0x12a05f200",
    status: "success",
    gasUsed: "0xc350",
    trace: [
      {
        action: "call",
        from: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
        to: "0xMockERC20ContractAddress0000000000000000",
        input:
          "0xa9059cbb00000000000000000000000029231436e1872beDAaF2577b207E8a156547a6Ac000000000000000000000000000000000000000000000000056bc75e2d63100000",
        gasUsed: "0xc350",
        value: "0x0",
      },
    ],
    error: undefined,
  },
];

export const mockContractBundleSimulationResult: SingleResult[] = [
  {
    type: "0x2",
    chainId: "0x1",
    nonce: "0x1",
    gas: "0x5208",
    maxFeePerGas: "0x12a05f200",
    maxPriorityFeePerGas: "0x77359400",
    to: "0x29231436e1872beDAaF2577b207E8a156547a6Ac",
    value: "0x6f05b59d3b20000", // 0.5 ETH
    accessList: [
      { address: "0x29231436e1872beDAaF2577b207E8a156547a6Ac", storageKeys: [] }
    ],
    input: "0x",
    v: "0x0",
    hash: "0xbee75a4fcfaf3deaa9ed70aba3ddf4dbc9128db6824de91b8ce1923ee54b4a77",
    blockHash: "0x94510fd985739be9474ccf22a9ab5eaf73b64ea4f3a399ff4b755c8daa2eb609",
    blockNumber: "0x14e1982",
    transactionIndex: "0x0",
    logs: [],
    state: [
      { account: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B", balanceChange: "-0x6f05b59d3b20000", nonceChange: "0x1" },
      { account: "0x29231436e1872beDAaF2577b207E8a156547a6Ac", balanceChange: "+0x6f05b59d3b20000" }
    ],
    from: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
    gasPrice: "0x12a05f200",
    status: "success",
    gasUsed: "0x5208",
    trace: [
      { action: "call", from: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B", to: "0x29231436e1872beDAaF2577b207E8a156547a6Ac", value: "0x6f05b59d3b20000", gasUsed: "0x5208" }
    ],
    error: undefined
  },

  // ----- Transaction 2: ERC-20 Transfer -----
  {
    type: "0x2",
    chainId: "0x1",
    nonce: "0x2",
    gas: "0xc350",
    maxFeePerGas: "0x12a05f200",
    maxPriorityFeePerGas: "0x77359400",
    to: "0x16c8481ee905b47dBBF7E2269c7A6Fa1AE3479c1",
    value: "0x0",
    accessList: [
      { address: "0x16c8481ee905b47dBBF7E2269c7A6Fa1AE3479c1", storageKeys: ["0x0", "0x1"] },
      { address: "0x29231436e1872beDAaF2577b207E8a156547a6Ac", storageKeys: [] }
    ],
    input: "0xa9059cbb00000000000000000000000029231436e1872beDAaF2577b207E8a156547a6Ac000000000000000000000000000000000000000000000000056bc75e2d63100000",
    v: "0x0",
    hash: "0xa3f1b6d7c82e4d6d8ef58b1b4c3f9b1a6f0e1d7c4a3b2e1d9f6a5b4c3d2e1f1b",
    blockHash: "0x94510fd985739be9474ccf22a9ab5eaf73b64ea4f3a399ff4b755c8daa2eb60a",
    blockNumber: "0x14e1982",
    transactionIndex: "0x1",
    logs: [
      {
        address: "0x16c8481ee905b47dBBF7E2269c7A6Fa1AE3479c1",
        topics: [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
          "0x000000000000000000000000C82306Ca37bbCb0C560608bD76F1fbeB360C411B",
          "0x00000000000000000000000029231436e1872beDAaF2577b207E8a156547a6Ac"
        ],
        data: "0x000000000000000000000000000000000000000000000000056bc75e2d63100000",
        logIndex: "0x0",
        transactionHash: "0xa3f1b6d7c82e4d6d8ef58b1b4c3f9b1a6f0e1d7c4a3b2e1d9f6a5b4c3d2e1f1b",
        blockHash: "0x94510fd985739be9474ccf22a9ab5eaf73b64ea4f3a399ff4b755c8daa2eb60a",
        blockNumber: "0x14e1982"
      }
    ],
    state: [
      { account: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B", balanceChange: "-0x0", nonceChange: "0x1", tokenBalanceChange: "-100" },
      { account: "0x29231436e1872beDAaF2577b207E8a156547a6Ac", balanceChange: "+0x0", tokenBalanceChange: "+100" }
    ],
    from: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
    gasPrice: "0x12a05f200",
    status: "success",
    gasUsed: "0xc350",
    trace: [
      {
        action: "call",
        from: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B",
        to: "0x16c8481ee905b47dBBF7E2269c7A6Fa1AE3479c1",
        input: "0xa9059cbb00000000000000000000000029231436e1872beDAaF2577b207E8a156547a6Ac000000000000000000000000000000000000000000000000056bc75e2d63100000",
        gasUsed: "0xc350",
        value: "0x0"
      }
    ],
    error: undefined
  },
  {
      type: "0x2",
      chainId: "0x1",
      nonce: "0x3",
      gas: "0xc350",
      maxFeePerGas: "0x12a05f200",
      maxPriorityFeePerGas: "0x77359400",
      to: "0xAnotherMockERC20ContractAddress0000000000",
      value: "0x0",
      accessList: [
          { address: "0xAnotherMockERC20ContractAddress0000000000", storageKeys: ["0x0"] },
          { address: "0xSomeOtherRecipientAddress000000000000", storageKeys: [] }
      ],
      input: "0xa9059cbb000000000000000000000000SomeOtherRecipientAddress00000000000000000000000000000000000000000000000000000000000000032",
      v: "0x0",
      hash: "0xb4c2d1e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
      blockHash: "0x94510fd985739be9474ccf22a9ab5eaf73b64ea4f3a399ff4b755c8daa2eb60b",
      blockNumber: "0x14e1982",
      transactionIndex: "0x2",
      logs: [
          {
              address: "0xAnotherMockERC20ContractAddress0000000000",
              topics: [
                  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                  "0x000000000000000000000000C82306Ca37bbCb0C560608bD76F1fbeB360C411B",
                  "0x000000000000000000000000SomeOtherRecipientAddress000000000000"
              ],
              data: "0x0000000000000000000000000000000000000000000000000000000000000032", // 50 tokens
              logIndex: "0x0",
              transactionHash: "0xb4c2d1e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
              blockHash: "0x94510fd985739be9474ccf22a9ab5eaf73b64ea4f3a399ff4b755c8daa2eb60b",
              blockNumber: "0x14e1982"
          }
      ],
      state: [
          { account: "0xC82306Ca37bbCb0C560608bD76F1fbeB360C411B", balanceChange: "-0x0", nonceChange: "0x1", tokenBalanceChange: "-50" },
          { account: "0xSomeOtherRecipientAddress000000000000", }
      ],
      status: "success",
      from: "",
      gasPrice: "",
      gasUsed: ""
  }]

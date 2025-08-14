// import React, { useState } from 'react';
// import Layout from '@/components/Layout';
// import ContractSelector from '../components/ContractSelector';
// import TxBuilder from '../components/TxBuilder';
// import SimulationButton from '../components/SimulationButton';
// import TransactionParameters from '../components/TransactionParameters';
// import ResultsPanel from '../components/ResultsPanel';
// import AccessListEditor from '../components/AccessListEditor';
// import StateOverridesEditor from '../components/StateOverridesEditor';
// import useLocalContracts from '../hooks/useLocalContracts';
// import { TxBuildState, TxSimulationParams } from '../types';
// import axios from 'axios';

// export default function Home() {
//   const { contracts } = useLocalContracts();
//   const [selectedAddress, setSelectedAddress] = useState<string>('');
//   const [txBuild, setTxBuild] = useState<TxBuildState>({ params: {} });
//   const [txParams, setTxParams] = useState<TxSimulationParams>({ from: '0x0000000000000000000000000000000000000000', to: '', blockTag: 'pending' });
//   const [accessList, setAccessList] = useState<any[]>([]);
//   const [stateOverrides, setStateOverrides] = useState<Record<string, any>>({});
//   const [result, setResult] = useState<any | null>(null);
//   const [loading, setLoading] = useState(false);

//   React.useEffect(() => {
//     if (selectedAddress && selectedAddress !== '__custom') {
//       const c = contracts.find((c) => c.address === selectedAddress);
//       setTxParams((p) => ({ ...p, to: selectedAddress }));
//       setTxBuild((s) => ({ ...s, contract: c ?? undefined }));
//     } else if (selectedAddress === '__custom') {
//       setTxBuild((s) => ({ ...s, contract: undefined }));
//     }
//   }, [selectedAddress, contracts]);

//   React.useEffect(() => {
//     // keep txParams.to in sync with txBuild.contract
//     if (txBuild.contract) setTxParams((p) => ({ ...p, to: txBuild.contract!.address }));
//   }, [txBuild.contract]);

//   const runSimulation = async () => {
//     setLoading(true);
//     setResult(null);
//     try {
//       // assemble payload for backend simulation
//       const payload = {
//         tx: {
//           from: txParams.from,
//           to: txParams.to,
//           gas: txParams.gas,
//           gasPrice: txParams.gasPrice,
//           value: txParams.value,
//           data: txBuild.rawData ?? txBuild.params?.data ?? ''
//         },
//         options: {
//           blockTag: txParams.blockTag,
//           accessList,
//           stateOverrides
//         }
//       };
//       // call local API (backend will use Alchemy / node)
//       const res = await axios.post('/api/simulate', payload);
//       setResult(res.data);
//     } catch (err: any) {
//       console.error(err);
//       setResult({ success: false, error: err?.message ?? 'Unknown error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div style={{ flex: 1, maxWidth: 560 }}>
//         <h2 style={{ marginBottom: 12 }}>New Simulation</h2>
//         <ContractSelector contracts={contracts} value={selectedAddress} onChange={setSelectedAddress} />
//         <div style={{marginTop:12}}>
//           <TxBuilder contract={txBuild.contract ?? undefined} onChange={setTxBuild} />
//         </div>
//       </div>

//       <div style={{ width: 720 }}>
//         <TransactionParameters value={txParams} onChange={setTxParams} />
//         <div style={{ marginTop: 12, display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
//           <AccessListEditor value={accessList} onChange={setAccessList} />
//           <StateOverridesEditor overrides={stateOverrides} onChange={setStateOverrides} />
//         </div>

//         <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
//           <SimulationButton onClick={runSimulation} loading={loading} />
//         </div>

//         <div style={{ marginTop: 18 }}>
//           <ResultsPanel result={result} />
//         </div>
//       </div>
//     </Layout>
//   );
// }

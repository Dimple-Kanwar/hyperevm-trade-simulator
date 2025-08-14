import React from 'react';
import styles from './TransactionParameters.module.css';
import { TxSimulationParams } from '../../types/TxSimulation';

interface Props {
    value: TxSimulationParams;
    onChange: (p: TxSimulationParams) => void;
}

export default function TransactionParameters({ value, onChange }: Props) {
    const set = (patch: Partial<TxSimulationParams>) => onChange({ ...value, ...patch });

    return (
        <div className={styles.wrapper}>
            <h3 className={styles.title}>Transaction Parameters</h3>

            <label className={styles.label}>From</label>
            <input className={styles.input} value={value.from} onChange={(e) => set({ from: e.target.value })} placeholder="0x..." />

            <label className={styles.label}>Gas (optional)</label>
            <input className={styles.input} value={value.gas ?? ''} onChange={(e) => set({ gas: e.target.value })} placeholder="8000000" />

            <label className={styles.label}>Gas Price (gwei)</label>
            <input className={styles.input} value={value.gasPrice ?? ''} onChange={(e) => set({ gasPrice: e.target.value })} placeholder="0" />

            <label className={styles.label}>Value (wei)</label>
            <input className={styles.input} value={value.value ?? ''} onChange={(e) => set({ value: e.target.value })} placeholder="0" />

            <label className={styles.label}>Block Tag</label>
            <select className={styles.input} value={String(value.blockTag ?? 'pending')} onChange={(e) => set({ blockTag: e.target.value })}>
                <option value="pending">Use Pending Block</option>
                <option value="latest">Latest</option>
                <option value="earliest">Earliest</option>
            </select>
        </div>
    );
}

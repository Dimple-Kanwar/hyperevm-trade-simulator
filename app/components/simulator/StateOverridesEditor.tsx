import React from 'react';
import styles from './StateOverridesEditor.module.css';

/**
 * Simple UI to show / edit state overrides (keyed by contract address)
 * We'll keep the data shape loose so backend can interpret.
 */
export default function StateOverridesEditor({ overrides, onChange }: { overrides?: Record<string, any>; onChange: (v: Record<string, any>) => void}) {
  const entries = Object.entries(overrides ?? {});
  const setEntry = (addr:string, val:any) => onChange({ ...(overrides ?? {}), [addr]: val });

  return (
    <div className={styles.wrap}>
      <label className={styles.label}>State Overrides</label>
      {entries.map(([address, val]) => (
        <div key={address} className={styles.row}>
          <div className={styles.addr}>{address}</div>
          <textarea className={styles.area} value={JSON.stringify(val,null,2)} onChange={(e) => setEntry(address, JSON.parse(e.target.value || '{}'))}/>
        </div>
      ))}
      <div className={styles.hint}>Tip: Add contract-address keys and set storage/balance overrides as JSON.</div>
    </div>
  )
}

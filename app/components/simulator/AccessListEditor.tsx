import React, { useState } from 'react';
import styles from './AccessListEditor.module.css';

interface AccessEntry { address: string; storageKeys?: string[] }
export default function AccessListEditor({ value, onChange } : { value?: AccessEntry[]; onChange: (v: AccessEntry[]) => void}) {
  const [list, setList] = useState<AccessEntry[]>(value ?? []);

  const add = () => { const n = [...list, { address: '' }]; setList(n); onChange(n); }
  const update = (idx:number, key: keyof AccessEntry, val:any) => {
    const n = list.slice(); (n[idx] as any)[key] = val; setList(n); onChange(n);
  }
  const remove = (idx:number) => {
    const n = list.slice(); n.splice(idx,1); setList(n); onChange(n);
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>Optional Access Lists</label>
      {list.map((l, i) => (
        <div key={i} className={styles.row}>
          <input className={styles.input} value={l.address} onChange={(e) => update(i, 'address', e.target.value)} placeholder="Contract address" />
          <button className={styles.del} onClick={() => remove(i)}>x</button>
        </div>
      ))}
      <button className={styles.add} onClick={add}>+ Add address to access list</button>
    </div>
  );
}

import React from 'react';
import styles from './SimulationButton.module.css';

export default function SimulationButton({ onClick, loading=false }: { onClick: () => void; loading?: boolean }) {
  return (
    <button className={styles.btn} onClick={onClick} disabled={loading}>
      {loading ? 'Simulating...' : 'Simulate Transaction'}
    </button>
  );
}

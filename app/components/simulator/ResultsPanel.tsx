import React from 'react';
import styles from './ResultsPanel.module.css';

export default function ResultsPanel({ result }: { result?: any }) {
  if (!result) {
    return <div className={styles.empty}>No simulation run yet. Results will appear here.</div>;
  }

  // we expect result to contain: success, gasUsed, trace (array), logs
  const { success, gasUsed, trace, logs, error } = result;

  return (
    <div className={styles.wrap}>
      <div className={styles.summary}>
        <div>Status: <strong>{success ? 'Success' : 'Failed'}</strong></div>
        <div>Gas Used: <strong>{String(gasUsed ?? '-')}</strong></div>
        {error && <div className={styles.error}>Error: {error}</div>}
      </div>

      <section className={styles.section}>
        <h4>Execution trace</h4>
        <pre className={styles.pre}>{JSON.stringify(trace ?? result, null, 2)}</pre>
      </section>

      <section className={styles.section}>
        <h4>Logs / Events</h4>
        <pre className={styles.pre}>{JSON.stringify(logs ?? [], null, 2)}</pre>
      </section>
    </div>
  );
}

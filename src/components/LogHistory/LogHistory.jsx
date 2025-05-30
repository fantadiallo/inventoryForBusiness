import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import styles from './LogHistory.module.scss';

export default function LogHistory() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from('inventory_logs')
        .select('*, inventory_items(name)')
        .order('date', { ascending: false });
      setLogs(data || []);
    }
    fetchLogs();
  }, []);

  return (
    <div className={styles.historyWrap}>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Date</th>
            <th>Item</th>
            <th>Start Qty</th>
            <th>Used</th>
            <th>Price</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.date}</td>
              <td>{log.inventory_items?.name}</td>
              <td>{log.start_qty}</td>
              <td>{log.used_qty}</td>
              <td>{log.price}</td>
              <td>{log.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';

export default function ReviewLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const businessId = localStorage.getItem('business_id');

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from('inventory_logs')
        .select('*, users(name), inventory_items(name)')
        .eq('business_id', businessId)
        .eq('approved', false);

      setLogs(data || []);
      setLoading(false);
    }

    fetchLogs();
  }, [businessId]);

  const handleApprove = async (id) => {
    await supabase
      .from('inventory_logs')
      .update({ approved: true, reviewed_by: user.id })
      .eq('id', id);

    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  if (loading) return <p>Loading logs...</p>;

  return (
    <div className="container mt-4">
      <h2>Pending Inventory Logs</h2>
      {logs.length === 0 && <p>No pending logs.</p>}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Item</th>
            <th>Used</th>
            <th>By</th>
            <th>Date</th>
            <th>Reason</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.inventory_items?.name}</td>
              <td>{log.amount_used}</td>
              <td>{log.users?.name}</td>
              <td>{log.date}</td>
              <td>{log.reason || '-'}</td>
              <td>
                <button className="btn btn-success btn-sm" onClick={() => handleApprove(log.id)}>
                  Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

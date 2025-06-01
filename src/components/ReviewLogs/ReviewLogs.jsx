import { useEffect, useState } from 'react';
import { supabase }            from '../../supabase/client';

export default function ReviewLogs() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  // Grab user ID and business_id from localStorage (set at login)
  const user       = JSON.parse(localStorage.getItem('user'));
  const businessId = localStorage.getItem('business_id');

  useEffect(() => {
    async function fetchLogs() {
      // 1) Query all unapproved logs for this business
      const { data, error } = await supabase
        .from('inventory_logs')
        .select('id, amount_used, date, reason, users(name), inventory_items(name)')
        .eq('business_id', businessId)
        .eq('approved', false);

      if (error) {
        console.error('Error fetching logs:', error.message);
        setLogs([]);
      } else {
        setLogs(data || []);
      }
      setLoading(false);
    }

    fetchLogs();
  }, [businessId]);

  // 2) Approve a single log by setting approved = true and reviewed_by = user.id
  const handleApprove = async (id) => {
    const { error } = await supabase
      .from('inventory_logs')
      .update({ approved: true, reviewed_by: user.id })
      .eq('id', id);

    if (error) {
      console.error('Error approving log:', error.message);
      alert(`❌ ${error.message}`);
      return;
    }

    // 3) Remove that log from local state so the row disappears
    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  if (loading) return <p className="text-center p-5">Loading logs...</p>;

  return (
    <div className="container mt-4">
      <h2>Pending Inventory Logs</h2>
      {logs.length === 0 && <p>No pending logs.</p>}

      <div className="table-responsive mt-3">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Item</th>
              <th>Used</th>
              <th>By</th>
              <th>Date</th>
              <th>Reason</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.inventory_items?.name || '—'}</td>
                <td>{log.amount_used}</td>
                <td>{log.users?.name || '—'}</td>
                <td>{log.date}</td>
                <td>{log.reason || '-'}</td>
                <td className="text-end">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleApprove(log.id)}
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

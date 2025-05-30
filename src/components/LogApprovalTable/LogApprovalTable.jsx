import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';

export default function LogApprovalTable() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');
  const [itemFilter, setItemFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory_logs')
      .select(`
        id,
        date,
        start_qty,
        used_qty,
        price,
        note,
        approved,
        inventory_items (
          name
        )
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs(data);
      setFilteredLogs(data);
    }
    setLoading(false);
  };

  const handleApprove = async (id, approved) => {
    const { error } = await supabase
      .from('inventory_logs')
      .update({ approved })
      .eq('id', id);

    if (!error) fetchLogs();
  };

  const applyFilters = () => {
    let result = [...logs];

    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        result = result.filter((log) => log.approved === null || log.approved === false);
      } else {
        result = result.filter((log) => log.approved === true);
      }
    }

    if (itemFilter) {
      result = result.filter((log) =>
        log.inventory_items?.name.toLowerCase().includes(itemFilter.toLowerCase())
      );
    }

    if (dateFilter) {
      result = result.filter((log) => log.date === dateFilter);
    }

    setFilteredLogs(result);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, statusFilter, itemFilter, dateFilter]);

  return (
    <div className="mt-5">
      <h2>Inventory Logs for Approval</h2>

      {/* Filters */}
      <div className="d-flex gap-3 my-3 flex-wrap">
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>

        <input
          type="text"
          className="form-control"
          placeholder="Filter by item"
          value={itemFilter}
          onChange={(e) => setItemFilter(e.target.value)}
        />

        <input
          type="date"
          className="form-control"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Item</th>
              <th>Date</th>
              <th>Start</th>
              <th>Used</th>
              <th>Note</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr
                key={log.id}
                className={
                  log.approved === null || log.approved === false
                    ? 'table-warning'
                    : 'table-success'
                }
              >
                <td>{log.inventory_items?.name}</td>
                <td>{log.date}</td>
                <td>{log.start_qty}</td>
                <td>{log.used_qty}</td>
                <td>{log.note || '-'}</td>
                <td>{log.approved ? '✅ Approved' : '⏳ Pending'}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => handleApprove(log.id, true)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleApprove(log.id, false)}
                  >
                    Decline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

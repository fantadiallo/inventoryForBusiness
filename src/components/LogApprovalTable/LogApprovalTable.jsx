import { useEffect, useState } from 'react';
import { supabase }            from '../../supabase/client';

export default function LogApprovalTable() {
  // ─────────── STATE ───────────
  const [logs, setLogs]               = useState([]);   // All logs
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading]         = useState(true);

  // Filters:
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved'
  const [itemFilter, setItemFilter]     = useState('');    // substring match
  const [dateFilter, setDateFilter]     = useState('');    // YYYY-MM-DD

  // ─────────── FETCH LOGS ───────────
  async function fetchLogs() {
    setLoading(true);

    const { data, error } = await supabase
      .from('inventory_logs')
      .select(`
        id,
        date,
        start_qty,
        used_qty,
        note,
        approved,
        inventory_items (
          name
        )
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error.message);
      setLogs([]);
      setFilteredLogs([]);
    } else {
      setLogs(data);
      setFilteredLogs(data);
    }

    setLoading(false);
  }

  // ─────────── APPROVE / DECLINE ───────────
  async function handleApprove(id, approved) {
    const { error } = await supabase
      .from('inventory_logs')
      .update({ approved })
      .eq('id', id);

    if (error) {
      console.error('Error updating log:', error.message);
    } else {
      // Refresh after update
      fetchLogs();
    }
  }

  // ─────────── APPLY FILTERS ───────────
  function applyFilters() {
    let result = [...logs];

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        result = result.filter(
          (log) => log.approved === false || log.approved === null
        );
      } else {
        result = result.filter((log) => log.approved === true);
      }
    }

    // Item name filter (case-insensitive)
    if (itemFilter.trim()) {
      result = result.filter((log) => {
        const name = log.inventory_items?.name || '';
        return name.toLowerCase().includes(itemFilter.trim().toLowerCase());
      });
    }

    // Date filter (exact match YYYY-MM-DD)
    if (dateFilter) {
      result = result.filter((log) => log.date === dateFilter);
    }

    setFilteredLogs(result);
  }

  // ─────────── EFFECTS ───────────
  // 1) On mount, fetch all logs
  useEffect(() => {
    fetchLogs();
  }, []);

  // 2) Whenever logs or any filter state changes, recompute filteredLogs
  useEffect(() => {
    applyFilters();
  }, [logs, statusFilter, itemFilter, dateFilter]);

  // ─────────── RENDER ───────────
  return (
    <div className="container mt-5">
      <h2>Inventory Logs for Approval</h2>

      {/* ───── FILTER CONTROLS ───── */}
      <div className="d-flex gap-3 my-3 flex-wrap">
        {/* Status Filter */}
        <div className="w-auto">
          <label htmlFor="statusFilter" className="form-label mb-1">
            Status
          </label>
          <select
            id="statusFilter"
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        {/* Item Name Filter */}
        <div className="w-auto">
          <label htmlFor="itemFilter" className="form-label mb-1">
            Filter by Item
          </label>
          <input
            id="itemFilter"
            type="text"
            className="form-control"
            placeholder="e.g. Sugar"
            value={itemFilter}
            onChange={(e) => setItemFilter(e.target.value)}
          />
        </div>

        {/* Date Filter */}
        <div className="w-auto">
          <label htmlFor="dateFilter" className="form-label mb-1">
            Filter by Date
          </label>
          <input
            id="dateFilter"
            type="date"
            className="form-control"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* ───── DISPLAY LOADING OR TABLE ───── */}
      {loading ? (
        <p>Loading logs…</p>
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
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No logs match these filters.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className={
                    log.approved === true ? 'table-success' : 'table-warning'
                  }
                >
                  <td>{log.inventory_items?.name || '-'}</td>
                  <td>{log.date}</td>
                  <td>{log.start_qty}</td>
                  <td>{log.used_qty}</td>
                  <td>{log.note || '-'}</td>
                  <td>
                    {log.approved === true ? '✅ Approved' : '⏳ Pending'}
                  </td>
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
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

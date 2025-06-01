import { useEffect, useState } from 'react';
import { supabase }            from '../../supabase/client';

export default function Dashboard() {
  // ─────────── STATE ───────────
  const [loading, setLoading] = useState(true);
  const [stats, setStats]     = useState({
    total_items:      0,
    low_stock:        0,
    pending_logs:     0,
    pending_orders:   0,
    pending_reports:  0,
    pending_shopping: 0,
  });
  const [userName, setUserName] = useState('');

  // business_id stored in localStorage at login
  const business_id = localStorage.getItem('business_id');

  // ─────────── FETCH DATA ON MOUNT ───────────
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // 1) Look up the user's name so we can greet them
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const { id: userId } = JSON.parse(stored);
          const { data: userRow, error: userErr } = await supabase
            .from('users')
            .select('name')
            .eq('id', userId)
            .single();

          if (!userErr && userRow) {
            setUserName(userRow.name);
          }
        } catch (e) {
          console.error('Error reading user from localStorage:', e.message);
        }
      }

      // 2) Call the RPC 'get_dashboard_stats' with the business_id
      const { data, error } = await supabase
        .rpc('get_dashboard_stats', { _biz_id: business_id })
        .single();

      if (error) {
        console.error('Error calling get_dashboard_stats RPC:', error.message);
      } else if (data) {
        setStats(data);
      }

      setLoading(false);
    }

    fetchData();
  }, [business_id]);

  // ─────────── LOADING STATE ───────────
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <p>Loading dashboard…</p>
      </div>
    );
  }

  // ─────────── RENDER DASHBOARD ───────────
  return (
    <div className="container mt-5">
      {/* 1) Greeting */}
      <h2 className="mb-4">
        Welcome{userName ? `, ${userName}` : ''}!
      </h2>

      {/* 2) Cards Row */}
      <div className="row g-3">
        {/* Total Inventory Items */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card text-white bg-primary h-100">
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 className="card-title">📦 Total Items</h5>
                <p className="card-text display-6">{stats.total_items}</p>
              </div>
              <small className="text-light">
                All unique items in inventory
              </small>
            </div>
          </div>
        </div>

        {/* Low-Stock Items */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card text-white bg-danger h-100">
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 className="card-title">⚠️ Low-Stock</h5>
                <p className="card-text display-6">{stats.low_stock}</p>
              </div>
              <small className="text-light">
                Items at or below threshold
              </small>
            </div>
          </div>
        </div>

        {/* Pending Tasks (Logs + Orders + Reports) */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card text-dark bg-warning h-100">
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 className="card-title">🔔 Pending Tasks</h5>
                <p className="card-text display-6">
                  {stats.pending_logs + stats.pending_orders + stats.pending_reports}
                </p>
              </div>
              <small className="text-dark">
                Logs, orders, and reports needing approval
              </small>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card text-white bg-info h-100">
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 className="card-title">🛒 Pending Orders</h5>
                <p className="card-text display-6">{stats.pending_orders}</p>
              </div>
              <small className="text-light">
                Orders waiting for approval
              </small>
            </div>
          </div>
        </div>

        {/* Pending Reports */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card text-dark bg-light h-100 border-warning">
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 className="card-title">📝 Pending Reports</h5>
                <p className="card-text display-6">{stats.pending_reports}</p>
              </div>
              <small className="text-dark">
                Daily reports needing approval
              </small>
            </div>
          </div>
        </div>

        {/* Shopping List Suggestions */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card text-white bg-secondary h-100">
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 className="card-title">🛍️ Shopping Suggestions</h5>
                <p className="card-text display-6">{stats.pending_shopping}</p>
              </div>
              <small className="text-light">
                Items suggested for purchase
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* 3) Explanations for Non-Tech Users */}
      <div className="mt-5">
        <h5>What do these cards mean?</h5>
        <ul className="mb-3">
          <li>
            <strong>📦 Total Items:</strong> Total number of unique inventory items
            (e.g., Sugar, Flour, Milk).
          </li>
          <li>
            <strong>⚠️ Low-Stock:</strong> Count of items whose current quantity
            is at or below your low-stock threshold. If this is above zero, you
            should consider reordering.
          </li>
          <li>
            <strong>🔔 Pending Tasks:</strong> This is the combined total of:
            <ul>
              <li>Inventory logs that need your approval</li>
              <li>Orders that need your approval</li>
              <li>Daily reports waiting for approval</li>
            </ul>
            Whenever this number is non-zero, there are tasks awaiting your review.
          </li>
          <li>
            <strong>🛒 Pending Orders:</strong> Number of orders staff submitted
            that require approval (so you can deduct inventory).
          </li>
          <li>
            <strong>📝 Pending Reports:</strong> Number of daily reports staff
            submitted that still need approval.
          </li>
          <li>
            <strong>🛍️ Shopping Suggestions:</strong> Items staff or the system
            marked as needing to be purchased. Check these to know what to buy next.
          </li>
        </ul>
      </div>
    </div>
  );
}

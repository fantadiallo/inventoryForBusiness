import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';

export default function InventoryTable() {
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const businessId = localStorage.getItem('business_id');

  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('business_id', businessId);

      if (error) {
        setMessage('❌ Error loading inventory.');
      } else {
        setItems(data);
      }

      setLoading(false);
    }

    fetchItems();
  }, [businessId]);

  const handleChange = (id, field, value) => {
    setLogs((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage('');

    const entries = Object.entries(logs);
    let successCount = 0;

    for (const [itemId, log] of entries) {
      const { amount_used, reason } = log;
      if (!amount_used) continue;

      const { error } = await supabase.from('inventory_logs').insert({
        business_id: businessId,
        user_id: user.id,
        item_id: itemId,
        amount_used: parseFloat(amount_used),
        reason: reason || null,
      });

      if (!error) successCount++;
    }

    setSubmitting(false);
    setLogs({});
    setMessage(`✅ Submitted ${successCount} logs!`);
  };

  if (loading) return <p className="text-center py-4">Loading inventory...</p>;

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">📦 Daily Inventory Log</h2>

      {message && <div className="alert alert-info text-center">{message}</div>}

      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Item</th>
              <th>In Stock</th>
              <th>Used Today</th>
              <th>Reason (optional)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity} {item.unit}</td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={logs[item.id]?.amount_used || ''}
                    onChange={(e) =>
                      handleChange(item.id, 'amount_used', e.target.value)
                    }
                    min="0"
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={logs[item.id]?.reason || ''}
                    onChange={(e) =>
                      handleChange(item.id, 'reason', e.target.value)
                    }
                    placeholder="Why different?"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="btn btn-primary w-100 mt-3"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit Daily Log'}
      </button>
    </div>
  );
}

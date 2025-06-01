import { useEffect, useState } from 'react';
import { supabase }            from '../../supabase/client';

export default function InventoryTable({ reloadSignal = 0 }) {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Read business_id from localStorage (must have been set at login)
  const businessId = localStorage.getItem('business_id');

  // Whenever reloadSignal changes, or on mount, re-fetch items
  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        setMessage(' Error loading inventory.');
        setItems([]);
      } else {
        setItems(data);
        setMessage('');
      }
      setLoading(false);
    }
    fetchItems();
  }, [businessId, reloadSignal]); // reloadSignal triggers re-fetch when toggled

  if (loading) return <p>Loading inventory...</p>;

  return (
    <div className="mt-4">
      {message && <div className="alert alert-danger">{message}</div>}

      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Unit</th>
            <th>Quantity</th>
            <th>Threshold</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No inventory items yet.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.unit}</td>
                <td>{item.quantity}</td>
                <td>{item.threshold}</td>
                <td>{new Date(item.created_at).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

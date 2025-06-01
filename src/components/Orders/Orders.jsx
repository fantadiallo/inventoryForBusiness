// src/components/Orders/Orders.jsx

import { useEffect, useState } from 'react';
import { supabase }            from '../../supabase/client';

export default function Orders() {
  const [templates, setTemplates]   = useState([]);
  const [quantities, setQuantities] = useState({});
  const userObj    = JSON.parse(localStorage.getItem('user'));
  const businessId = localStorage.getItem('business_id');
  const user_id    = userObj?.id;

  // ─────────── FETCH ALL TEMPLATES FOR THIS BUSINESS ───────────
  useEffect(() => {
    async function fetchTemplates() {
      const { data, error } = await supabase
        .from('predefined_orders')
        .select('*')
        .eq('business_id', businessId);

      if (error) {
        console.error('Error fetching templates:', error.message);
        setTemplates([]);
      } else {
        setTemplates(data || []);
      }
    }

    fetchTemplates();
  }, [businessId]);

  // ─────────── HANDLE ORDER SUBMISSION ───────────
  const handleOrder = async (templateId) => {
    const quantity = parseInt(quantities[templateId], 10) || 1;

    const { error } = await supabase.from('orders').insert({
      business_id,
      user_id,
      order_template_id: templateId,
      quantity
    });

    if (error) {
      console.error('Error placing order:', error.message);
      alert('❌ ' + error.message);
    } else {
      alert('✅ Order submitted!');
      // Optionally clear the input:
      setQuantities((prev) => ({ ...prev, [templateId]: '' }));
    }
  };

  return (
    <div className="container mt-4">
      <h2>Place Orders</h2>
      <ul className="list-group">
        {templates.map((t) => (
          <li
            key={t.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{t.name}</strong> ({t.type})
              <input
                type="number"
                className="form-control mt-1"
                placeholder="Qty"
                min={1}
                style={{ width: '4rem' }}
                value={quantities[t.id] || ''}
                onChange={(e) =>
                  setQuantities({ ...quantities, [t.id]: e.target.value })
                }
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => handleOrder(t.id)}
            >
              Submit
            </button>
          </li>
        ))}
        {templates.length === 0 && (
          <li className="list-group-item text-center">
            No templates found.
          </li>
        )}
      </ul>
    </div>
  );
}

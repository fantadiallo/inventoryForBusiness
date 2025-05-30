import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';

export default function Orders() {
  const [templates, setTemplates] = useState([]);
  const [quantities, setQuantities] = useState({});
  const user = JSON.parse(localStorage.getItem('user'));
  const businessId = localStorage.getItem('business_id');

  useEffect(() => {
    async function fetchTemplates() {
      const { data } = await supabase
        .from('predefined_orders')
        .select('*')
        .eq('business_id', businessId);

      setTemplates(data || []);
    }

    fetchTemplates();
  }, [businessId]);

  const handleOrder = async (templateId) => {
    const quantity = parseInt(quantities[templateId]) || 1;

    await supabase.from('orders').insert({
      business_id: businessId,
      user_id: user.id,
      order_template_id: templateId,
      quantity,
    });

    alert('Order submitted!');
  };

  return (
    <div className="container mt-4">
      <h2>Place Orders</h2>
      <ul className="list-group">
        {templates.map((t) => (
          <li key={t.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{t.name}</strong> ({t.type})
              <input
                type="number"
                className="form-control mt-1"
                placeholder="Qty"
                min={1}
                onChange={(e) => setQuantities({ ...quantities, [t.id]: e.target.value })}
              />
            </div>
            <button className="btn btn-primary" onClick={() => handleOrder(t.id)}>
              Submit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

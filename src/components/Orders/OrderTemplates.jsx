import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';

export default function OrderTemplates() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('dish');
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const businessId = localStorage.getItem('business_id');

  useEffect(() => {
    async function loadItems() {
      const { data } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('business_id', businessId);
      setItems(data || []);
    }

    loadItems();
  }, [businessId]);

  const toggleItem = (itemId) => {
    setSelected((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleCreate = async () => {
    if (!name || selected.length === 0) return;

    const { data: order, error } = await supabase
      .from('predefined_orders')
      .insert({ name, type, business_id: businessId })
      .select()
      .single();

    if (!error && order) {
      const rows = selected.map((itemId) => ({
        order_id: order.id,
        item_id: itemId,
        quantity_per_order: 1,
      }));
      await supabase.from('order_templates').insert(rows);
      setMessage(`✅ Created template "${name}"`);
      setName('');
      setSelected([]);
    }
  };

  return (
    <div className="container py-4">
      <h2>Create Order Template</h2>

      {message && <div className="alert alert-success">{message}</div>}

      <input
        className="form-control mb-2"
        placeholder="Template name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <select className="form-select mb-3" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="dish">Dish</option>
        <option value="hairstyle">Hairstyle</option>
      </select>

      <div className="mb-3">
        <p>Select required items:</p>
        {items.map((item) => (
          <div key={item.id} className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id={`item-${item.id}`}
              checked={selected.includes(item.id)}
              onChange={() => toggleItem(item.id)}
            />
            <label className="form-check-label" htmlFor={`item-${item.id}`}>
              {item.name}
            </label>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={handleCreate}>
        Save Template
      </button>
    </div>
  );
}

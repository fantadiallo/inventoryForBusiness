// src/components/Orders/OrderTemplates.jsx

import { useEffect, useState } from 'react';
import { supabase }            from '../../supabase/client';

export default function OrderTemplates() {
  // ─────────── STATE ───────────
  const [items, setItems]       = useState([]);
  const [name, setName]         = useState('');
  const [type, setType]         = useState('dish');
  const [selected, setSelected] = useState([]);   // array of item_ids
  const [message, setMessage]   = useState('');

  const businessId = localStorage.getItem('business_id');
  const userObj    = JSON.parse(localStorage.getItem('user'));
  const user_id    = userObj?.id;

  // ─────────── LOAD INVENTORY ITEMS ───────────
  useEffect(() => {
    async function loadItems() {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name')
        .eq('business_id', businessId);

      if (error) {
        console.error('Error loading items:', error.message);
        setItems([]);
      } else {
        setItems(data || []);
      }
    }
    loadItems();
  }, [businessId]);

  // ─────────── TOGGLE ITEM IN TEMPLATE ───────────
  const toggleItem = (itemId) => {
    setSelected((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // ─────────── CREATE TEMPLATE ───────────
  const handleCreate = async () => {
    if (!name.trim() || selected.length === 0) {
      setMessage('❌ Please enter a name and select at least one item.');
      return;
    }

    // 1) Insert into predefined_orders
    const { data: order, error: orderErr } = await supabase
      .from('predefined_orders')
      .insert({
        business_id: businessId,
        name:        name.trim(),
        type
      })
      .select()
      .single();

    if (orderErr) {
      console.error('Error creating template:', orderErr.message);
      setMessage(`❌ ${orderErr.message}`);
      return;
    }

    // 2) Insert into order_templates (one row per selected item)
    const rows = selected.map((itemId) => ({
      order_id:            order.id,
      item_id:             itemId,
      quantity_per_order:  1  // you could, in future, let user specify
    }));

    const { error: tplErr } = await supabase
      .from('order_templates')
      .insert(rows);

    if (tplErr) {
      console.error('Error saving order_templates:', tplErr.message);
      setMessage(`❌ ${tplErr.message}`);
      return;
    }

    setMessage(`✅ Created template "${name.trim()}"`);
    setName('');
    setSelected([]);
  };

  return (
    <div className="container py-4">
      <h2>Create Order Template</h2>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="mb-3">
        <input
          className="form-control"
          placeholder="Template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <select
          className="form-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="dish">Dish</option>
          <option value="hairstyle">Hairstyle</option>
        </select>
      </div>

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

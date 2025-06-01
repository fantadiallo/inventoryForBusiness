import { useEffect, useState } from 'react';
import { supabase }            from '../../supabase/client';

export default function AddPredefinedOrder() {
  const [name, setName]       = useState('');           // e.g. "Jollof Rice"
  const [type, setType]       = useState('dish');       // 'dish' or 'hairstyle'
  const [items, setItems]     = useState([]);           // inventory_items to choose from
  const [rows, setRows]       = useState([{ item_id: '', qty: 1 }]);
  const [msg, setMsg]         = useState('');
  const [loading, setLoading] = useState(false);

  const business_id = localStorage.getItem('business_id');

  // ─────────── Load all inventory_items for this business ───────────
  useEffect(() => {
    async function fetchInventoryItems() {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, unit')
        .eq('business_id', business_id)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading items:', error.message);
        setItems([]);
      } else {
        setItems(data || []);
      }
    }
    fetchInventoryItems();
  }, [business_id]);

  // ─────────── Add / Remove / Update Rows ───────────
  const addRow = () => setRows([...rows, { item_id: '', qty: 1 }]);
  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i, field, value) => {
    const copy = [...rows];
    copy[i][field] = value;
    setRows(copy);
  };

  // ─────────── SAVE THE NEW PREDEFINED ORDER ───────────
  async function handleSave() {
    setMsg('');

    // 1) Validation
    if (!name.trim() || rows.length === 0) {
      return setMsg('❌ Name & at least one ingredient required.');
    }
    // No empty item_id or qty < 1
    if (rows.some(r => !r.item_id || r.qty < 1)) {
      return setMsg('❌ Fill out all ingredient rows.');
    }
    // No duplicate item_id
    if (new Set(rows.map(r => r.item_id)).size !== rows.length) {
      return setMsg('❌ Duplicate items are not allowed.');
    }

    setLoading(true);

    // 2) Insert into predefined_orders
    const { data: order, error: orderErr } = await supabase
      .from('predefined_orders')
      .insert({ business_id, name: name.trim(), type })
      .select()
      .single();

    if (orderErr) {
      setMsg(`❌ ${orderErr.message}`);
      setLoading(false);
      return;
    }

    // 3) Insert each row into order_templates
    const templates = rows.map(r => ({
      order_id: order.id,
      item_id: r.item_id,
      quantity_per_order: r.qty,
    }));
    const { error: tErr } = await supabase
      .from('order_templates')
      .insert(templates);

    if (tErr) {
      setMsg(`❌ ${tErr.message}`);
    } else {
      setMsg('✅ Product template saved!');
      setName('');
      setType('dish');
      setRows([{ item_id: '', qty: 1 }]);
      // Scroll to top so user sees the success msg
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setLoading(false);
  }

  // ─────────── RENDER ───────────
  return (
    <div className="container py-4">
      <h2 className="mb-3">Add Dish / Product</h2>
      {msg && <div className="alert alert-info">{msg}</div>}

      {/* 1) Name Input */}
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        className="form-control mb-2"
        placeholder="Name (e.g. Jollof Rice)"
        required
      />

      {/* 2) Type Selector */}
      <select
        value={type}
        onChange={e => setType(e.target.value)}
        className="form-select mb-3"
      >
        <option value="dish">Dish</option>
        <option value="hairstyle">Hairstyle</option>
      </select>

      {/* 3) Ingredient Rows */}
      <h5 className="mb-2">Ingredients</h5>
      {rows.map((r, i) => (
        <div key={i} className="row g-2 mb-2 align-items-center">
          {/* 3a) Dropdown of items */}
          <div className="col-6">
            <select
              className="form-select"
              value={r.item_id}
              onChange={e => updateRow(i, 'item_id', e.target.value)}
            >
              <option value="">-- select item --</option>
              {items.map(it => (
                <option key={it.id} value={it.id}>
                  {it.name} ({it.unit})
                </option>
              ))}
            </select>
          </div>

          {/* 3b) Quantity input */}
          <div className="col-4">
            <input
              type="number"
              min="1"
              className="form-control"
              value={r.qty}
              onChange={e => updateRow(i, 'qty', Number(e.target.value))}
            />
          </div>

          {/* 3c) Remove button */}
          <div className="col-2">
            <button
              type="button"
              className="btn btn-danger w-100"
              onClick={() => removeRow(i)}
            >
              🗑
            </button>
          </div>
        </div>
      ))}

      {/* 4) Add-Row Button */}
      <button
        type="button"
        className="btn btn-outline-primary w-100 mb-3"
        onClick={addRow}
      >
        ➕ Add Item
      </button>

      {/* 5) Save Button */}
      <button
        type="button"
        className="btn btn-success w-100"
        disabled={loading}
        onClick={handleSave}
      >
        {loading ? 'Saving…' : 'Save Template'}
      </button>
    </div>
  );
}

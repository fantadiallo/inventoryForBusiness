import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';

export default function AddPredefinedOrder() {
  const [name, setName] = useState('');
  const [type, setType] = useState('dish');
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const business_id = localStorage.getItem('business_id');

  useEffect(() => {
    async function fetchItems() {
      const { data } = await supabase
        .from('inventory_items')
        .select('id, name')
        .eq('business_id', business_id);
      setItems(data || []);
    }
    fetchItems();
  }, [business_id]);

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { item_id: '', quantity: 1 }]);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!name || selectedItems.length === 0) {
      setError('Name and at least one item required.');
      return;
    }

    const { data: order, error: orderError } = await supabase
      .from('predefined_orders')
      .insert({ name, type, business_id })
      .select()
      .single();

    if (orderError) return setError(orderError.message);

    const templates = selectedItems.map((item) => ({
      order_id: order.id,
      item_id: item.item_id,
      quantity_per_order: item.quantity,
    }));

    const { error: templateError } = await supabase
      .from('order_templates')
      .insert(templates);

    if (templateError) return setError(templateError.message);

    setSuccess('✅ Product template added successfully!');
    setName('');
    setSelectedItems([]);
  };

  return (
    <div className="container mt-4">
      <h2>Add Dish or Product</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <input
        type="text"
        className="form-control mb-2"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select
        className="form-select mb-3"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="dish">Dish</option>
        <option value="hairstyle">Hairstyle</option>
      </select>

      {selectedItems.map((sel, index) => (
        <div key={index} className="row mb-2">
          <div className="col-8">
            <select
              className="form-select"
              value={sel.item_id}
              onChange={(e) => {
                const updated = [...selectedItems];
                updated[index].item_id = e.target.value;
                setSelectedItems(updated);
              }}
            >
              <option value="">-- Select Item --</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
          <div className="col-4">
            <input
              type="number"
              className="form-control"
              min={1}
              value={sel.quantity}
              onChange={(e) => {
                const updated = [...selectedItems];
                updated[index].quantity = Number(e.target.value);
                setSelectedItems(updated);
              }}
            />
          </div>
        </div>
      ))}

      <button className="btn btn-outline-primary w-100 mb-3" onClick={handleAddItem}>
        ➕ Add Item
      </button>

      <button className="btn btn-success w-100" onClick={handleSubmit}>
        Save Template
      </button>
    </div>
  );
}

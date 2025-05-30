import { useState } from 'react';
import { supabase } from '../../supabase/client';
import styles from './AddItemForm.module.scss';

export default function AddItemForm({ onItemAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    initial_stock: '',
    min_stock: '',
  });
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const { error } = await supabase.from('inventory_items').insert([
      {
        name: formData.name,
        unit: formData.unit,
        initial_stock: Number(formData.initial_stock),
        min_stock: Number(formData.min_stock),
      },
    ]);
    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Item added ✅');
      setFormData({ name: '', unit: '', initial_stock: '', min_stock: '' });
      if (onItemAdded) onItemAdded();
    }
  }

  return (
    <div className={styles.formWrap}>
      <h4>Add New Inventory Item</h4>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          type="text"
          placeholder="Item Name"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          className="form-control mb-2"
          type="text"
          placeholder="Unit (e.g. kg, L)"
          value={formData.unit}
          onChange={e => setFormData({ ...formData, unit: e.target.value })}
          required
        />
        <input
          className="form-control mb-2"
          type="number"
          placeholder="Initial Stock"
          value={formData.initial_stock}
          onChange={e => setFormData({ ...formData, initial_stock: e.target.value })}
          required
        />
        <input
          className="form-control mb-2"
          type="number"
          placeholder="Minimum Stock"
          value={formData.min_stock}
          onChange={e => setFormData({ ...formData, min_stock: e.target.value })}
          required
        />
        <button className="btn btn-success w-100">Add Item</button>
        {message && <p className="mt-2 text-info">{message}</p>}
      </form>
    </div>
  );
}

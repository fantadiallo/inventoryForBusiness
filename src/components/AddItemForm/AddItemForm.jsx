import { useState } from 'react';
import { supabase } from '../../supabase/client';
import styles from './AddItemForm.module.scss';

export default function AddItemForm({ onItemAdded }) {
  // ─────────── STATE ───────────
  const [itemName, setItemName]         = useState('');
  const [itemUnit, setItemUnit]         = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [threshold, setThreshold]       = useState('');
  const [msg, setMsg]                   = useState('');  
  const [loading, setLoading]           = useState(false);

  // business_id was saved to localStorage when the admin logged in
  const business_id = localStorage.getItem('business_id');

  // ─────────── HANDLE FORM SUBMIT ───────────
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    // Trim and convert to numbers
    const nameTrimmed = itemName.trim();
    const unitTrimmed = itemUnit.trim();
    const qtyNumber   = Number(initialStock);
    const thrNumber   = Number(threshold);

    // Basic validation
    if (!nameTrimmed || !unitTrimmed || qtyNumber <= 0 || thrNumber < 0) {
      setMsg('❌ Please fill out all fields with valid values.');
      setLoading(false);
      return;
    }

    // Insert into Supabase
    const { error } = await supabase
      .from('inventory_items')
      .insert([
        {
          business_id,
          name:       nameTrimmed,
          unit:       unitTrimmed,
          quantity:   qtyNumber,
          threshold:  thrNumber,
        },
      ]);

    if (error) {
      setMsg(`❌ ${error.message}`);
    } else {
      setMsg('✅ Item added successfully!');
      // Clear form
      setItemName('');
      setItemUnit('');
      setInitialStock('');
      setThreshold('');

      // Inform the parent to re-fetch the table
      if (onItemAdded) onItemAdded();

      // Remove message after 3 seconds
      setTimeout(() => setMsg(''), 3000);
    }

    setLoading(false);
  }

  // ─────────── RENDER ───────────
  return (
    <div className={styles.formWrap + ' p-4 border rounded shadow-sm bg-light'}>
      <h4 className="mb-3">Add New Inventory Item</h4>
      <form onSubmit={handleSubmit}>
        {/* ITEM NAME */}
        <label htmlFor="item-name" className="form-label">
          Item Name
        </label>
        <input
          id="item-name"
          type="text"
          className="form-control mb-2"
          placeholder="e.g. Sugar"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />

        {/* UNIT */}
        <label htmlFor="item-unit" className="form-label">
          Unit
        </label>
        <input
          id="item-unit"
          type="text"
          className="form-control mb-2"
          placeholder="e.g. kg, L"
          value={itemUnit}
          onChange={(e) => setItemUnit(e.target.value)}
          required
        />

        {/* INITIAL STOCK */}
        <label htmlFor="initial-stock" className="form-label">
          Initial Stock
        </label>
        <input
          id="initial-stock"
          type="number"
          className="form-control mb-2"
          placeholder="e.g. 10"
          value={initialStock}
          onChange={(e) => setInitialStock(e.target.value)}
          min="1"
          required
        />

        {/* LOW-STOCK THRESHOLD */}
        <label htmlFor="threshold" className="form-label">
          Low-Stock Threshold
        </label>
        <input
          id="threshold"
          type="number"
          className="form-control mb-3"
          placeholder="e.g. 2"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          min="0"
          required
        />

        {/* SUBMIT BUTTON */}
        <button className="btn btn-success w-100" disabled={loading}>
          {loading ? 'Saving…' : 'Add Item'}
        </button>

        {/* SUCCESS / ERROR MESSAGE */}
        {msg && (
          <p className={`mt-3 ${msg.startsWith('❌') ? 'text-danger' : 'text-success'}`}>
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}

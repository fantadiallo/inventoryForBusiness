// src/pages/AddLog/AddLog.jsx

import { useEffect, useState } from 'react';
import { supabase }            from '../../supabase/client';

export default function AddLog() {
  // ─────────── STATE ───────────
  const [items, setItems]               = useState([]);   // All inventory items for dropdown
  const [selectedItemId, setSelectedItemId] = useState(''); // ID of the chosen item
  const [startQty, setStartQty]         = useState(0);    // Auto‐filled from last log
  const [usedQty, setUsedQty]           = useState('');   // How much was used today
  const [price, setPrice]               = useState('');   // Optional price field
  const [note, setNote]                 = useState('');   // Optional note
  const [loading, setLoading]           = useState(false); 
  const [message, setMessage]           = useState('');   // Success / error message

  // Logged‐in user & business from localStorage
  const user       = JSON.parse(localStorage.getItem('user'));
  const businessId = localStorage.getItem('business_id');

  // Today's date in "YYYY-MM-DD" format
  const today = new Date().toISOString().split('T')[0];

  // ─────────── FETCH INVENTORY ITEMS ON MOUNT ───────────
  useEffect(() => {
    async function loadItems() {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, unit')
        .eq('business_id', businessId)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading inventory items:', error.message);
        setItems([]);
      } else {
        setItems(data || []);
      }
    }
    if (businessId) loadItems();
  }, [businessId]);

  // ─────────── WHEN ITEM CHANGES, AUTO-FILL START_QTY ───────────
  useEffect(() => {
    async function fetchPreviousLog() {
      if (!selectedItemId) {
        setStartQty(0);
        return;
      }

      // Compute yesterday’s date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yDate = yesterday.toISOString().split('T')[0];

      // Fetch yesterday’s single log for this item (if any)
      const { data, error } = await supabase
        .from('inventory_logs')
        .select('start_qty, used_qty')
        .eq('item_id', selectedItemId)
        .eq('date', yDate)
        .maybeSingle();

      if (error) {
        console.error('Error fetching previous log:', error.message);
        setStartQty(0);
      } else if (data) {
        // If we have a previous log, the “end of day” was start_qty - used_qty
        const previousEnd = (data.start_qty || 0) - (data.used_qty || 0);
        setStartQty(previousEnd >= 0 ? previousEnd : 0);
      } else {
        // No previous log → assume startQty = 0
        setStartQty(0);
      }
    }

    fetchPreviousLog();
  }, [selectedItemId]);

  // ─────────── HANDLE FORM SUBMIT ───────────
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Basic validation
    if (!selectedItemId) {
      setMessage('❌ Please select an item.');
      setLoading(false);
      return;
    }
    const usedNumber = Number(usedQty);
    if (isNaN(usedNumber) || usedNumber < 0) {
      setMessage('❌ Please enter a valid “Used Qty” (0 or greater).');
      setLoading(false);
      return;
    }

    // Insert into inventory_logs
    const { error } = await supabase.from('inventory_logs').insert({
      business_id:  businessId,
      user_id:      user.id,
      item_id:      selectedItemId,
      date:         today,
      start_qty:    startQty,
      used_qty:     usedNumber,
      price:        price ? Number(price) : null,
      note:         note.trim() || null,
    });

    if (error) {
      console.error('Error inserting log:', error.message);
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage('✅ Log saved!');
      // Reset form fields
      setSelectedItemId('');
      setStartQty(0);
      setUsedQty('');
      setPrice('');
      setNote('');
    }

    setLoading(false);
  }

  // ─────────── RENDER ───────────
  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">➕ Add Inventory Log</h2>

      {message && (
        <div
          className={`alert ${
            message.startsWith('❌') ? 'alert-danger' : 'alert-success'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ITEM DROPDOWN */}
        <div className="mb-3">
          <label htmlFor="item-select" className="form-label">
            Item
          </label>
          <select
            id="item-select"
            className="form-select"
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            required
          >
            <option value="">— Select an item —</option>
            {items.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name} ({it.unit})
              </option>
            ))}
          </select>
        </div>

        {/* START QTY (READ-ONLY) */}
        <div className="mb-3">
          <label htmlFor="start-qty" className="form-label">
            Start Quantity (auto-filled)
          </label>
          <input
            id="start-qty"
            type="number"
            className="form-control"
            value={startQty}
            readOnly
          />
        </div>

        {/* USED QUANTITY */}
        <div className="mb-3">
          <label htmlFor="used-qty" className="form-label">
            Used Quantity
          </label>
          <input
            id="used-qty"
            type="number"
            min="0"
            className="form-control"
            value={usedQty}
            onChange={(e) => setUsedQty(e.target.value)}
            placeholder="e.g. 5"
            required
          />
        </div>

        {/* PRICE (OPTIONAL) */}
        <div className="mb-3">
          <label htmlFor="price" className="form-label">
            Price (optional)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 12.50"
          />
        </div>

        {/* NOTE (OPTIONAL) */}
        <div className="mb-4">
          <label htmlFor="note" className="form-label">
            Note (optional)
          </label>
          <textarea
            id="note"
            className="form-control"
            rows="3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any reason for unexpected usage..."
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? 'Saving…' : '✅ Submit Log'}
        </button>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';

export default function LogForm() {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [startQty, setStartQty] = useState(0);
  const [usedQty, setUsedQty] = useState(0);
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');

  const date = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function loadItems() {
      const { data, error } = await supabase.from('inventory_items').select();
      if (data) setItems(data);
    }

    loadItems();
  }, []);

  useEffect(() => {
    async function fetchPreviousLog() {
      if (!selectedItemId) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yDate = yesterday.toISOString().split('T')[0];

      const { data } = await supabase
        .from('inventory_logs')
        .select('start_qty, used_qty')
        .eq('item_id', selectedItemId)
        .eq('date', yDate)
        .maybeSingle();

      if (data) {
        const previousEnd = data.start_qty - data.used_qty;
        setStartQty(previousEnd);
      } else {
        setStartQty(0);
      }
    }

    fetchPreviousLog();
  }, [selectedItemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('inventory_logs').insert({
      item_id: selectedItemId,
      date,
      start_qty: startQty,
      used_qty: usedQty,
      price,
      note,
    });

    if (error) {
      alert('Error saving log');
      console.error(error);
    } else {
      alert('Log saved!');
      setUsedQty(0);
      setPrice('');
      setNote('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Item</label>
      <select onChange={(e) => setSelectedItemId(e.target.value)} required>
        <option value="">Select item</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>

      <label>Start Qty (auto-filled)</label>
      <input value={startQty} readOnly />

      <label>Used Qty</label>
      <input type="number" value={usedQty} onChange={(e) => setUsedQty(Number(e.target.value))} required />

      <label>Price (optional)</label>
      <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />

      <label>Note</label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} />

      <button type="submit">Submit</button>
    </form>
  );
}

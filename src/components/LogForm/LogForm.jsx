import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import styles from './LogForm.module.scss';

export default function LogForm() {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [log, setLog] = useState({
    date: '',
    start_qty: '',
    used_qty: '',
    price: '',
    note: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchItems() {
      const { data } = await supabase.from('inventory_items').select('id, name');
      setItems(data || []);
    }
    fetchItems();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const { error } = await supabase.from('inventory_logs').insert([
      {
        item_id: selectedItemId,
        ...log,
        start_qty: Number(log.start_qty),
        used_qty: Number(log.used_qty),
        price: Number(log.price),
      },
    ]);
    if (error) {
      setMessage('Error logging inventory: ' + error.message);
    } else {
      setMessage('Log saved ✅');
      setLog({ date: '', start_qty: '', used_qty: '', price: '', note: '' });
      setSelectedItemId('');
    }
  }

  return (
    <div className={styles.formWrap}>
      <h2>Add Daily Inventory Log</h2>
      <form onSubmit={handleSubmit}>
        <select
          className="form-select mb-2"
          value={selectedItemId}
          onChange={e => setSelectedItemId(e.target.value)}
          required
        >
          <option value="">Select Item</option>
          {items.map(i => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>

        <input
          type="date"
          className="form-control mb-2"
          value={log.date}
          onChange={e => setLog({ ...log, date: e.target.value })}
          required
        />
        <input
          type="number"
          className="form-control mb-2"
          placeholder="Start Quantity"
          value={log.start_qty}
          onChange={e => setLog({ ...log, start_qty: e.target.value })}
          required
        />
        <input
          type="number"
          className="form-control mb-2"
          placeholder="Used Quantity"
          value={log.used_qty}
          onChange={e => setLog({ ...log, used_qty: e.target.value })}
          required
        />
        <input
          type="number"
          className="form-control mb-2"
          placeholder="Price per Unit"
          value={log.price}
          onChange={e => setLog({ ...log, price: e.target.value })}
          required
        />
        <textarea
          className="form-control mb-3"
          placeholder="Notes (optional)"
          value={log.note}
          onChange={e => setLog({ ...log, note: e.target.value })}
        />
        <button className="btn btn-primary w-100">Save Log</button>
        {message && <p className="mt-2 text-info">{message}</p>}
      </form>
    </div>
  );
}

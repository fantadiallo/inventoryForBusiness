import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import styles from './InventoryTable.module.scss';

export default function InventoryTable() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase.from('inventory_items').select('*').order('name', { ascending: true });
      if (!error) setItems(data || []);
    }
    fetchItems();
  }, []);

  return (
    <div className={styles.tableWrap}>
      <h2 className="mb-3">Inventory Overview</h2>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Unit</th>
            <th>Initial Stock</th>
            <th>Min Stock</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.unit}</td>
              <td>{item.initial_stock}</td>
              <td>{item.min_stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

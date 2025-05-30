import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';

export default function ShoppingList() {
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const businessId = localStorage.getItem('business_id');

  useEffect(() => {
    async function loadList() {
      const { data } = await supabase
        .from('shopping_list')
        .select('*, inventory_items(name)')
        .eq('business_id', businessId);

      setItems(data || []);
    }

    loadList();
  }, [businessId]);

  const updateQuantity = async (id, quantity) => {
    await supabase
      .from('shopping_list')
      .update({ suggested_quantity: quantity })
      .eq('id', id);

    alert('Updated!');
  };

  return (
    <div className="container mt-4">
      <h2>Shopping List</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Suggested Quantity</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.inventory_items?.name}</td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={quantities[item.id] || item.suggested_quantity}
                  onChange={(e) => setQuantities({ ...quantities, [item.id]: e.target.value })}
                />
              </td>
              <td>
                <button className="btn btn-outline-primary" onClick={() => updateQuantity(item.id, quantities[item.id])}>
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';

export default function ShoppingList() {
  // ─────────── STATE ───────────
  const [items, setItems]           = useState([]);
  const [quantities, setQuantities] = useState({}); // { [shoppingListRowId]: newQuantity }
  const businessId = localStorage.getItem('business_id');

  // ─────────── LOAD SHOPPING LIST ───────────
  useEffect(() => {
    async function loadList() {
      const { data, error } = await supabase
        .from('shopping_list')
        .select('id, suggested_quantity, inventory_items(name)')
        .eq('business_id', businessId);

      if (error) {
        console.error('Error loading shopping list:', error.message);
        setItems([]);
      } else {
        setItems(data || []);
      }
    }

    loadList();
  }, [businessId]);

  // ─────────── UPDATE A ROW’S SUGGESTED_QUANTITY ───────────
  const updateQuantity = async (id, quantity) => {
    // Convert to numeric
    const newQty = Number(quantity);
    if (isNaN(newQty) || newQty < 0) {
      alert('Please enter a valid number ≥ 0');
      return;
    }

    const { error } = await supabase
      .from('shopping_list')
      .update({ suggested_quantity: newQty })
      .eq('id', id);

    if (error) {
      console.error('Error updating quantity:', error.message);
      alert(`❌ ${error.message}`);
    } else {
      alert('✅ Updated!');
      // Optimistically update the local state so the table shows the new value
      setItems((prev) =>
        prev.map((row) =>
          row.id === id
            ? { ...row, suggested_quantity: newQty }
            : row
        )
      );
      // Clear the temporary input value if desired
      setQuantities((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  // ─────────── RENDER ───────────
  return (
    <div className="container mt-4">
      <h2>Shopping List</h2>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Item</th>
              <th>Suggested Quantity</th>
              <th className="text-end">Update</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center">
                  No shopping‐list items found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.inventory_items?.name || '—'}</td>
                  <td style={{ maxWidth: '120px' }}>
                    <input
                      type="number"
                      className="form-control"
                      value={
                        quantities[item.id] !== undefined
                          ? quantities[item.id]
                          : item.suggested_quantity
                      }
                      min="0"
                      onChange={(e) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                    />
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          quantities[item.id] !== undefined
                            ? quantities[item.id]
                            : item.suggested_quantity
                        )
                      }
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

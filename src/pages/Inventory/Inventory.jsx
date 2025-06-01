// src/pages/Inventory/Inventory.jsx

import { useState } from 'react';
import AddItemForm    from '../../components/AddItemForm/AddItemForm';
import InventoryTable from '../../components/InventoryTable/InventoryTable';

export default function InventoryPage() {
  // ─────────── STATE ───────────
  // We’ll use `reloadSignal` as a “toggle.” Whenever we call `setReloadSignal(prev => prev + 1)`,
  // InventoryTable will notice that prop changed and re-fetch its data.
  const [reloadSignal, setReloadSignal] = useState(0);

  // This function is passed into AddItemForm. After AddItemForm inserts a new item,
  // it calls onItemAdded(), which here just increments reloadSignal by 1.
  function handleItemAdded() {
    setReloadSignal((prev) => prev + 1);
  }

  return (
    <div className="container mt-4">
      <h1>Inventory Management</h1>

      {/* 1) This form lets you add a new inventory item */}
      <AddItemForm onItemAdded={handleItemAdded} />

      {/* 2) Below, the table shows all existing items. It re-fetches whenever reloadSignal changes */}
      <InventoryTable reloadSignal={reloadSignal} />
    </div>
  );
}

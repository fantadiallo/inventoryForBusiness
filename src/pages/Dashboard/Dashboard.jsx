import InventoryTable from '../../components/InventoryTable/InventoryTable';
import AddItemForm from '../../components/AddItemForm/AddItemForm';
import { useState } from 'react';

export default function Dashboard() {
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="container">
      <h1 className="mb-4 text-center">Dashboard</h1>
      <AddItemForm onItemAdded={() => setRefresh(!refresh)} />
      <InventoryTable key={refresh} />
    </div>
  );
}

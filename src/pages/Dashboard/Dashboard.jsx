import { useEffect, useState } from 'react';
import InventoryTable from '../../components/InventoryTable/InventoryTable';
import AddItemForm from '../../components/AddItemForm/AddItemForm';
import LogApprovalTable from '../../components/LogApprovalTable/LogApprovalTable';
import { supabase } from '../../supabase/client';

export default function Dashboard() {
  const [refresh, setRefresh] = useState(false);
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);
  const [userBusinessId, setUserBusinessId] = useState(null);

  useEffect(() => {
    async function getBusinessAndPass() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('business_id')
        .eq('id', user.id)
        .single();

      if (userDataError || !userData) return;

      setUserBusinessId(userData.business_id);

      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('manager_passcode')
        .eq('id', userData.business_id)
        .single();

      if (businessError || !business) return;

      const enteredCode = prompt('Enter 6-digit manager passcode to access admin panel:');

      if (enteredCode && enteredCode === business.manager_passcode) {
        setCanAccessAdmin(true);
      } else {
        alert('❌Wrong code. Admin panel will remain hidden.');
      }
    }

    getBusinessAndPass();
  }, []);

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-center">📋 Inventory Dashboard</h1>
      <AddItemForm onItemAdded={() => setRefresh(!refresh)} />
      <InventoryTable key={refresh} />
      {canAccessAdmin && (
        <>
          <hr />
          <h2 className="text-center mt-4">🛠 Admin Panel</h2>
          <LogApprovalTable />
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
      setLoading(false);
    }
    checkSession();
  }, []);

  if (loading) return <p>Loading...</p>;

  return user ? children : <Navigate to="/" />;
}

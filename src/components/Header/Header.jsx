import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import { useState, useEffect } from 'react';
import styles from './Header.module.scss';

export default function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) setRole(storedRole);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/');
  }

  const toggleSidebar = () => setOpen(!open);
  const closeSidebar = () => setOpen(false);

  return (
    <>
      <header className={`${styles.topBar} py-2 px-3 bg-dark text-white`}>
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <button className={`${styles.toggleButton} btn btn-sm btn-light`} onClick={toggleSidebar}>
            ☰
          </button>
          <Link to="/dashboard" className={`${styles.logo} text-white text-decoration-none fw-bold`}>
            InventoryGMB
          </Link>
        </div>
      </header>

      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <nav>
          <ul className="list-unstyled p-3">
            <li><Link to="/dashboard" onClick={closeSidebar}>📊 Dashboard</Link></li>
            <li><Link to="/inventory" onClick={closeSidebar}>📦 Inventory</Link></li>
            <li><Link to="/orders" onClick={closeSidebar}>🛒 Orders</Link></li>
            <li><Link to="/daily-report" onClick={closeSidebar}>📝 Daily Report</Link></li>

            {role === 'admin' && (
              <>
                <li><Link to="/approve-logs" onClick={closeSidebar}>✅ Approve Logs</Link></li>
                <li><Link to="/shopping-list" onClick={closeSidebar}>🛍️ Shopping List</Link></li>
                <li><Link to="/add-product" onClick={closeSidebar}>➕ Add Product</Link></li>
              </>
            )}

            <li><Link to="/logs" onClick={closeSidebar}>📁 Logs</Link></li>
            <li><Link to="/add-log" onClick={closeSidebar}>➕ Add Log</Link></li>
            <li><button className="btn btn-sm btn-outline-danger w-100 mt-3" onClick={handleLogout}>🚪 Logout</button></li>
          </ul>
        </nav>
      </aside>

      {open && <div className={styles.overlay} onClick={closeSidebar} />}
    </>
  );
}

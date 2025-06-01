import { Link, useNavigate, Outlet } from 'react-router-dom';
import { supabase }                  from '../../supabase/client';
import { useState, useEffect }       from 'react';
import styles                        from './Header.module.scss';

export default function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(null);

  // On mount, read the stored role (admin vs. worker)
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setRole(storedRole);
    }
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
      {/* ─── Top Navbar ─── */}
      <header className={`${styles.topBar} py-2 px-3 bg-dark text-white`}>
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* Hamburger / Toggle */}
          <button
            className={`${styles.toggleButton} btn btn-sm btn-light`}
            onClick={toggleSidebar}
          >
            ☰
          </button>

          {/* Logo / Dashboard Link */}
          <Link
            to="/dashboard"
            className={`${styles.logo} text-white text-decoration-none fw-bold`}
          >
            InventoryGMB
          </Link>

          {/* Right‐side: “Logout” (optional) */}
          <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      {/* ─── Sidebar ─── */}
      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <nav>
          <ul className="list-unstyled p-3">
            <li>
              <Link to="/dashboard" onClick={closeSidebar}>
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link to="/inventory" onClick={closeSidebar}>
                📦 Inventory
              </Link>
            </li>
            <li>
              <Link to="/orders" onClick={closeSidebar}>
                🛒 Place Orders
              </Link>
            </li>
            <li>
              <Link to="/daily-report" onClick={closeSidebar}>
                📝 Daily Report
              </Link>
            </li>

            {/* Only show these if the user is an admin */}
            {role === 'admin' && (
              <>
                <li>
                  <Link to="/approve-logs" onClick={closeSidebar}>
                    ✅ Approve Logs
                  </Link>
                </li>
                <li>
                  <Link to="/approve-orders" onClick={closeSidebar}>
                    ✅ Approve Orders
                  </Link>
                </li>
                <li>
                  <Link to="/review-reports" onClick={closeSidebar}>
                    📋 Review Reports
                  </Link>
                </li>
                <li>
                  <Link to="/shopping-list" onClick={closeSidebar}>
                    🛍️ Shopping List
                  </Link>
                </li>
                <li>
                  <Link to="/add-product" onClick={closeSidebar}>
                    ➕ Add Product
                  </Link>
                </li>
              </>
            )}

            <li>
              <Link to="/logs" onClick={closeSidebar}>
                📁 Logs
              </Link>
            </li>
            <li>
              <Link to="/add-log" onClick={closeSidebar}>
                ➕ Add Log
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* ─── Overlay (click to close sidebar) ─── */}
      {open && <div className={styles.overlay} onClick={closeSidebar} />}

      {/* ─── Page Content Below Header/Sidebar ─── */}
      <main style={{ marginLeft: open ? '250px' : '0', transition: 'margin 0.3s ease' }}>
        {/* The <Outlet> renders whichever page matched by the router */}
        <Outlet />
      </main>
    </>
  );
}

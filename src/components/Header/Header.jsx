import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import { useState } from 'react';
import styles from './Header.module.scss';

export default function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <>
      <header className={styles.topBar}>
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <button className={styles.toggleButton} onClick={() => setOpen(!open)}>
            ☰
          </button>
          <Link to="/" className={styles.logo}>Inventory</Link>
        </div>
      </header>

      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <nav>
          <ul>
            <li><Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link></li>
            <li><Link to="/logs" onClick={() => setOpen(false)}>Logs</Link></li>
            <li><Link to="/add-log" onClick={() => setOpen(false)}>Add Log</Link></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </ul>
        </nav>
      </aside>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}
    </>
  );
}

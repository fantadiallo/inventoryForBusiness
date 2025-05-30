import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import styles from './Layout.module.scss';

export default function Layout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className="container py-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

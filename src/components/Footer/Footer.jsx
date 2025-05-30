import styles from './Footer.module.scss';

export default function Footer() {
  return (
    <footer className={`text-center py-3 ${styles.footer}`}>
      &copy; {new Date().getFullYear()} Inventory for Businesses
    </footer>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Logs from './pages/Logs/Logs';
import AddLog from './pages/AddLog/AddLog';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AddItemForm from './components/AddItemForm/AddItemForm';
import InventoryTable from './components/Inventory/InventoryTable';
import Orders from './components/Orders/Orders';
import DailyReports from './components/Reports/DailyReports';
import ShoppingList from './components/Shopping/ShoppingList';
import ReviewLogs from './components/ReviewLogs/ReviewLogs';
import AddPredefinedOrder from './components/Orders/AddPredefinedOrder'; // ✅ newly added

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-log"
            element={
              <ProtectedRoute>
                <AddLog />
              </ProtectedRoute>
            }
          />

          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <Logs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryTable />
              </ProtectedRoute>
            }
          />

          <Route
            path="/approve-logs"
            element={
              <ProtectedRoute>
                <ReviewLogs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/daily-report"
            element={
              <ProtectedRoute>
                <DailyReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/shopping-list"
            element={
              <ProtectedRoute>
                <ShoppingList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-product"
            element={
              <ProtectedRoute>
                <AddPredefinedOrder />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

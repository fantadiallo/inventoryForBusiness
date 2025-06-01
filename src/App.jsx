import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout            from './components/Layout/Layout';
import ProtectedRoute    from './components/Auth/ProtectedRoute';
import Home              from './pages/Home/Home';
import Dashboard         from './pages/Dashboard/Dashboard';
import AddLogPage        from './pages/AddLog/AddLog';
import LogsPage          from './pages/Logs/LogsPage';
import InventoryPage     from './pages/Inventory/InventoryPage';
import ReviewLogsPage    from './pages/ReviewLogs/ReviewLogsPage';
import OrdersPage        from './pages/Orders/OrdersPage';
import OrderApprovalPage from './pages/Orders/OrderApprovalPage';
import ReportsPage       from './pages/Reports/ReportsPage';
import ReportReviewPage  from './pages/Reports/ReportReviewPage';
import ShoppingPage      from './pages/Shopping/ShoppingPage';
import AddProductPage    from './pages/Orders/AddProductPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 
          Use <Layout /> (which renders <Header />, <Outlet />, <Footer />) 
          as the wrapper for all child routes.
        */}
        <Route element={<Layout />}>
          {/* Public route: Home (login/register) */}
          <Route path="/" element={<Home />} />

          {/* All protected routes below */}
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
                <AddLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <LogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approve-logs"
            element={
              <ProtectedRoute>
                <ReviewLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approve-orders"
            element={
              <ProtectedRoute>
                <OrderApprovalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daily-report"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review-reports"
            element={
              <ProtectedRoute>
                <ReportReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopping-list"
            element={
              <ProtectedRoute>
                <ShoppingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-product"
            element={
              <ProtectedRoute>
                <AddProductPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

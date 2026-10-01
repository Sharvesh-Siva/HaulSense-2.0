/**
 * HaulSense - Main Application Router & Shell
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogisticsProvider } from './context/LogisticsContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { ManagerLayout } from './components/ManagerLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ShipmentsPage } from './pages/ShipmentsPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { DriversPage } from './pages/DriversPage';
import { ReturnLoadsPage } from './pages/ReturnLoadsPage';
import { AgentPage } from './pages/AgentPage';
import { DriverLayout } from './pages/driver/DriverLayout';
import { DriverOverviewPage } from './pages/driver/DriverOverviewPage';
import { DriverTripsPage } from './pages/driver/DriverTripsPage';
import { DriverVehiclesPage } from './pages/driver/DriverVehiclesPage';
import { DriverMatchingPage } from './pages/driver/DriverMatchingPage';
import { DriverLoadsPage } from './pages/driver/DriverLoadsPage';
import { DriverEarningsPage } from './pages/driver/DriverEarningsPage';
import { DriverTrustPage } from './pages/driver/DriverTrustPage';
import { DriverHealthPage } from './pages/driver/DriverHealthPage';
import { DriverDocumentsPage } from './pages/driver/DriverDocumentsPage';
import { TripChatPage } from './pages/TripChatPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route wrapper for Manager portal
const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loginAsDefaultManager } = useAuth();
  
  // If user navigated directly to manager URL, auto-initialize as default manager
  if (!user) {
    loginAsDefaultManager();
  } else if (user.role !== 'manager') {
    return <Navigate to="/driver" replace />;
  }

  return <>{children}</>;
};

// Protected Route wrapper for Driver portal
const DriverRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loginDriver } = useAuth();

  // If user navigated directly to driver URL, auto-initialize as default driver (Ravi Kumar)
  if (!user) {
    loginDriver('DRV-001', '1234');
  } else if (user.role !== 'driver') {
    return <Navigate to="/manager" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LogisticsProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing */}
              <Route path="/" element={<LandingPage />} />

              {/* Manager Operations Portal */}
              <Route
                path="/manager"
                element={
                  <ManagerRoute>
                    <ManagerLayout />
                  </ManagerRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="shipments" element={<ShipmentsPage />} />
                <Route path="vehicles" element={<VehiclesPage />} />
                <Route path="drivers" element={<DriversPage />} />
                <Route path="returns" element={<ReturnLoadsPage />} />
                <Route path="agent/:shipmentId" element={<AgentPage />} />
                <Route path="agent" element={<Navigate to="/manager/agent/S-GOLDEN" replace />} />
                <Route path="chat" element={<TripChatPage />} />
                <Route path="chat/:tripId" element={<TripChatPage />} />
              </Route>

              {/* Driver Workspace (Full Suite) */}
              <Route
                path="/driver"
                element={
                  <DriverRoute>
                    <DriverLayout />
                  </DriverRoute>
                }
              >
                <Route index element={<DriverOverviewPage />} />
                <Route path="trips" element={<DriverTripsPage />} />
                <Route path="vehicles" element={<DriverVehiclesPage />} />
                <Route path="matching" element={<DriverMatchingPage />} />
                <Route path="loads" element={<DriverLoadsPage />} />
                <Route path="earnings" element={<DriverEarningsPage />} />
                <Route path="trust" element={<DriverTrustPage />} />
                <Route path="health" element={<DriverHealthPage />} />
                <Route path="documents" element={<DriverDocumentsPage />} />
                <Route path="chat" element={<TripChatPage />} />
                <Route path="chat/:tripId" element={<TripChatPage />} />
              </Route>

              {/* Diagnostics Suite */}
              <Route path="/diagnostics" element={<DiagnosticsPage />} />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </LogisticsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

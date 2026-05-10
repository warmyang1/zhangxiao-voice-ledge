import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { VoiceRecord } from './pages/VoiceRecord';
import { Transactions } from './pages/Transactions';
import { Analytics } from './pages/Analytics';
import { Platforms } from './pages/Platforms';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { Subscription } from './pages/Subscription';
import { Admin } from './pages/Admin';
import { AdminOverview } from './pages/AdminOverview';
import { AdminWithdrawal } from './pages/AdminWithdrawal';
import { BottomNav } from './components/layout/BottomNav';
import { useAuthStore } from './stores/authStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, currentUser, checkSubscriptionStatus } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (currentUser?.id !== 'admin_001' && !checkSubscriptionStatus()) {
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          
          <Route path="/subscription" element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/overview" element={<AdminOverview />} />
          <Route path="/admin/withdrawal" element={<AdminWithdrawal />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/voice" element={
            <ProtectedRoute>
              <VoiceRecord />
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/platforms" element={
            <ProtectedRoute>
              <Platforms />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;

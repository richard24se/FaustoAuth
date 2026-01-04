import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';
import { PrivateRoute } from './components/PrivateRoute';
import AdminLayout from '@/layout/AdminLayout';

import { ThemeManager } from './components/ThemeManager';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const Roles = lazy(() => import('./pages/Roles'));
const Permissions = lazy(() => import('./pages/Permissions'));
const Tenants = lazy(() => import('./pages/Tenants'));
const RolePermissions = lazy(() => import('./pages/RolePermissions'));
const Objects = lazy(() => import('./pages/Objects'));
const Audits = lazy(() => import('./pages/Audits'));
const AuditTypes = lazy(() => import('./pages/AuditTypes'));
const ObjectTypes = lazy(() => import('./pages/ObjectTypes'));
const JwtDebugger = lazy(() => import('./pages/JwtDebugger'));

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = () => {
      navigate('/login');
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [navigate]);

  return (
    <>
      <ThemeManager />
      <Suspense
        fallback={
          <Center h="100vh">
            <Spinner size="xl" color="blue.500" />
          </Center>
        }
      >
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/users" element={<Users />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/permissions" element={<Permissions />} />
              <Route path="/roles/:roleId/permissions" element={<RolePermissions />} />

              <Route path="/objects" element={<Objects />} />
              <Route path="/audits" element={<Audits />} />
              <Route path="/audit-types" element={<AuditTypes />} />
              <Route path="/object-types" element={<ObjectTypes />} />
              <Route path="/jwt-debugger" element={<JwtDebugger />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;

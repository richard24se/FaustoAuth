import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';
import Objects from './pages/Objects';
import JwtDebugger from './pages/JwtDebugger';
import { PrivateRoute } from './components/PrivateRoute';
import AdminLayout from './layout/AdminLayout';

import { ThemeManager } from './components/ThemeManager';

function App() {
  return (
    <>
      <ThemeManager />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/permissions" element={<Permissions />} />
            <Route path="/permissions" element={<Permissions />} />
            <Route path="/objects" element={<Objects />} />
            <Route path="/jwt-debugger" element={<JwtDebugger />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;

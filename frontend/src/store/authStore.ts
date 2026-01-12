import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { LoginResponse, User } from '../types';
import { useTenantStore } from './tenantStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize state from local storage
  const token = localStorage.getItem('token');
  let user: User | null = null;

  if (token) {
    try {
      // We can decode to get basic info, or rely on persisted user data
      // For now, let's trust the token presence
      const decoded: any = jwtDecode(token);
      // Map decoded token back to user structure if needed, or just partial
      console.log("DECODED", decoded);
      user = {
        id: decoded.sub ? parseInt(decoded.sub) : 0,
        username: decoded.identity,
        names: decoded.name,
        role: { name: decoded.role, id: 0, tenant_id: decoded.tenant_id }, // Partial reconstruction
        tenant_id: decoded.tenant_id,
        scopes: decoded.scope ? decoded.scope.split(' ') : [],
      } as User;
    } catch (e) {
      console.error('Invalid token on load', e);
      localStorage.removeItem('token');
    }
  }

  return {
    user: user,
    token: token,
    isAuthenticated: !!token,

    login: (responseData: LoginResponse) => {
      // The backend returns { data: { access_token: ... } } shape usually?
      // Check auth/service/auth.py return: model_dump of TokenResponse
      // It returns: { access_token, id, username, names, surnames, id_role, tenant_id } directly inside 'data'?
      // Wait, endpoint returns GenericResponse(data=TokenResponse(...))

      const { access_token, username, names, id_role, tenant_id, id } = responseData.data; // Assuming wrapper

      const newUser: User = {
        id,
        username,
        names: names || '',
        role: { name: '', id: id_role, tenant_id }, // We might need role name from token later
        tenant_id,
      };

      localStorage.setItem('token', access_token);

      // Decode for extra info like Role Name if accessible
      try {
        const decoded: any = jwtDecode(access_token);
        newUser.role = { id: id_role, name: decoded.role || '', tenant_id };
        newUser.scopes = decoded.scope ? decoded.scope.split(' ') : [];
      } catch (e) { }

      set({
        user: newUser,
        token: access_token,
        isAuthenticated: true,
      });

      // Reset tenant selection on new login to ensure fresh state
      // This ensures admins start with "All Tenants" and regular users get their tenant auto-selected by components
      useTenantStore.getState().setTenant(null);
    },

    logout: () => {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});

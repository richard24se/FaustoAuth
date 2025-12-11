import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tenant } from '../types';

interface TenantState {
  selectedTenantId: number | null;
  tenants: Tenant[];
  setTenant: (id: number | null) => void;
  setTenants: (tenants: Tenant[]) => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      selectedTenantId: null,
      tenants: [],
      setTenant: (id) => set({ selectedTenantId: id }),
      setTenants: (tenants) => set({ tenants }),
    }),
    {
      name: 'tenant-storage', // unique name
    },
  ),
);

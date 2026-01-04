import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '@/services/tenantService';
import { Tenant } from '@/types';
import { toaster } from '@/components/ui/toaster';

export const useTenants = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tenants'],
    queryFn: tenantService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: tenantService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toaster.create({ title: 'Tenant created', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to create tenant', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Tenant> }) => tenantService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toaster.create({ title: 'Tenant updated', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to update tenant', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: tenantService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toaster.create({ title: 'Tenant deleted', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to delete tenant', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  return {
    tenants: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createTenant: createMutation.mutateAsync,
    updateTenant: updateMutation.mutateAsync,
    deleteTenant: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

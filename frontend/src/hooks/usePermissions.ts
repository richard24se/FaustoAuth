import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionService } from '@/services/permissionService';
import { Permission } from '@/types';
import { toaster } from '@/components/ui/toaster';

export const usePermissions = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: permissionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toaster.create({ title: 'Permission created', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to create permission', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Permission> }) => permissionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toaster.create({ title: 'Permission updated', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to update permission', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: permissionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toaster.create({ title: 'Permission deleted', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to delete permission', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  return {
    permissions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createPermission: createMutation.mutateAsync,
    updatePermission: updateMutation.mutateAsync,
    deletePermission: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

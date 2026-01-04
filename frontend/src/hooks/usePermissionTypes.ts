import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionTypeService } from '@/services/permissionTypeService';
import { PermissionType } from '@/services/permissionTypeService'; // Assuming type is exported from service or types.ts
import { toaster } from '@/components/ui/toaster';

export const usePermissionTypes = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['permissionTypes'],
    queryFn: permissionTypeService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: permissionTypeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissionTypes'] });
      toaster.create({ title: 'Permission Type created', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to create permission type', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PermissionType> }) => permissionTypeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissionTypes'] });
      toaster.create({ title: 'Permission Type updated', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to update permission type', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: permissionTypeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissionTypes'] });
      toaster.create({ title: 'Permission Type deleted', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to delete permission type', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  return {
    permissionTypes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createPermissionType: createMutation.mutateAsync,
    updatePermissionType: updateMutation.mutateAsync,
    deletePermissionType: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

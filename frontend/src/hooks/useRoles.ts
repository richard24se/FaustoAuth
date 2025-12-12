import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '@/services/roleService';
import { Role } from '@/types';
import { toaster } from '@/components/ui/toaster';

export const useRoles = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: roleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toaster.create({ title: 'Role created', type: 'success' });
    },
    onError: () => {
      toaster.create({ title: 'Failed to create role', type: 'error' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Role> }) => roleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toaster.create({ title: 'Role updated', type: 'success' });
    },
    onError: () => {
      toaster.create({ title: 'Failed to update role', type: 'error' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: roleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toaster.create({ title: 'Role deleted', type: 'success' });
    },
    onError: () => {
      toaster.create({ title: 'Failed to delete role', type: 'error' });
    }
  });

  return {
    roles: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createRole: createMutation.mutate,
    updateRole: updateMutation.mutate,
    deleteRole: deleteMutation.mutate,
  };
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { User } from '@/types';
import { toaster } from '@/components/ui/toaster';

export const useUsers = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toaster.create({ title: 'User created', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to create user', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toaster.create({ title: 'User updated', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to update user', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toaster.create({ title: 'User deleted', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to delete user', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  return {
    users: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

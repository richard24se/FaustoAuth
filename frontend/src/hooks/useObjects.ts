import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { objectService } from '@/services/objectService';
import { AuthObject } from '@/types';
import { toaster } from '@/components/ui/toaster';

export const useObjects = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['objects'],
    queryFn: objectService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: objectService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objects'] });
      toaster.create({ title: 'Object created', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to create object', 
        description: e.response?.data?.detail || e.message, 
        type: 'error' 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AuthObject> }) => objectService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objects'] });
      toaster.create({ title: 'Object updated', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to update object', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: objectService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objects'] });
      toaster.create({ title: 'Object deleted', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to delete object', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  return {
    objects: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createObject: createMutation.mutateAsync,
    updateObject: updateMutation.mutateAsync,
    deleteObject: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

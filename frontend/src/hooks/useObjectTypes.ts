import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { objectTypeService } from '@/services/objectTypeService';
import { ObjectType } from '@/types';
import { toaster } from '@/components/ui/toaster';

export const useObjectTypes = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['objectTypes'],
    queryFn: objectTypeService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: objectTypeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectTypes'] });
      toaster.create({ title: 'Object Type created', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to create object type', 
        description: e.response?.data?.detail || e.message, 
        type: 'error' 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ObjectType> }) => objectTypeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectTypes'] });
      toaster.create({ title: 'Object Type updated', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to update object type', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: objectTypeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectTypes'] });
      toaster.create({ title: 'Object Type deleted', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to delete object type', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  return {
    objectTypes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createObjectType: createMutation.mutateAsync,
    updateObjectType: updateMutation.mutateAsync,
    deleteObjectType: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

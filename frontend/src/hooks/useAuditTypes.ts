import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditTypeService } from '@/services/auditTypeService';
import { AuditType } from '@/types';
import { toaster } from '@/components/ui/toaster';

export const useAuditTypes = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['auditTypes'],
    queryFn: auditTypeService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: auditTypeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditTypes'] });
      toaster.create({ title: 'Audit Type created', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to create audit type', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AuditType> }) => auditTypeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditTypes'] });
      toaster.create({ title: 'Audit Type updated', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to update audit type', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: auditTypeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditTypes'] });
      toaster.create({ title: 'Audit Type deleted', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to delete audit type', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  return {
    auditTypes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createAuditType: createMutation.mutateAsync,
    updateAuditType: updateMutation.mutateAsync,
    deleteAuditType: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

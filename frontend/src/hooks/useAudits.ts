import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditService } from '@/services/auditService';
import { Audit } from '@/types';
import { toaster } from '@/components/ui/toaster';

export const useAudits = () => {
  const queryClient = useQueryClient();

  const query = useQuery<Audit[]>({
    queryKey: ['audits'],
    queryFn: auditService.getAll,
  });

  // Audits are usually read-only or system generated, but including delete for cleanup
  const deleteMutation = useMutation({
    mutationFn: auditService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toaster.create({ title: 'Audit log deleted', type: 'success' });
    },
    onError: (e: any) => {
      toaster.create({ 
        title: 'Failed to delete audit log', 
        description: e.response?.data?.detail || e.message,
        type: 'error' 
      });
    }
  });

  return {
    audits: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    deleteAudit: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

import { Box, Heading } from '@chakra-ui/react';
import { DataTable } from '@/components/common/DataTable';
import { useTranslation } from 'react-i18next';
import { useAudits } from '@/hooks/useAudits';
import { useTenants } from '@/hooks/useTenants';

export default function Audits() {
  const { audits, isLoading } = useAudits();
  const { tenants } = useTenants();
  const { t } = useTranslation();

  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('auditLogs')}</Heading>
      </Box>
      <DataTable
        data={audits}
        isLoading={isLoading}
        columns={[
          { header: 'ID', accessorKey: 'id', width: '50px' },
          { header: t('user'), accessorKey: 'id_user' }, // Ideally fetch user name
          { 
            header: t('tenant'), 
            render: (r) => tenants.find((t) => t.id === r.tenant_id)?.name || r.tenant_id 
          },
          { header: t('ipAddress'), accessorKey: 'ip_address' },
          { header: t('input'), accessorKey: 'input' },
          { header: t('date'), accessorKey: 'created_date' },
        ]}
        searchKeys={['input', 'ip_address']}
        searchPlaceholder={t('searchAudits')}
      />
    </Box>
  );
}

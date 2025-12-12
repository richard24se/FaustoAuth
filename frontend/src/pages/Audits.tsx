import { useState, useEffect } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { DataTable } from '@/components/common/DataTable';
import { Audit } from '@/types';
import { useTranslation } from 'react-i18next';
import { toaster } from '@/components/ui/toaster';
import { auditService } from '@/services/auditService';

export default function Audits() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const { t } = useTranslation();

  const loadAudits = async () => {
    try {
      const data = await auditService.getAll();
      setAudits(data);
    } catch (error) {
      console.error(error);
      toaster.create({ title: t('errorLoadingData'), type: 'error' });
    }
  };

  useEffect(() => {
    loadAudits();
  }, []);

  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('auditLogs')}</Heading>
      </Box>
      <DataTable
        data={audits}
        columns={[
          { header: 'ID', accessorKey: 'id', width: '50px' },
          { header: t('user'), accessorKey: 'id_user' }, // Ideally fetch user name
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

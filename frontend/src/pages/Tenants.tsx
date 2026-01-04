import { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  useDisclosure,
  Dialog,
  Field,
  Input,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { DataTable } from '@/components/common/DataTable';
import { useForm } from 'react-hook-form';
import { Tenant } from '@/types';
import { useTranslation } from 'react-i18next';
import { useTenants } from '@/hooks/useTenants';

export default function Tenants() {
  const { tenants, isLoading, createTenant, updateTenant, deleteTenant } = useTenants();
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const { t } = useTranslation();
  const { register, handleSubmit, reset, setValue } = useForm();

  const onEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setValue('name', tenant.name);
    onOpen();
  };

  const onAdd = () => {
    setEditingTenant(null);
    reset();
    onOpen();
  };

  const onSubmit = (data: any) => {
    if (editingTenant) {
      updateTenant({ id: editingTenant.id, data }, {
        onSuccess: () => onClose()
      });
    } else {
      createTenant(data, {
        onSuccess: () => onClose()
      });
    }
  };

  const onDelete = (id: number) => {
    if (!window.confirm(t('deleteTenantConfirm'))) return;
    deleteTenant(id);
  };

  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('tenants')}</Heading>
        <Button colorPalette="brand" onClick={onAdd}>
          <FiPlus /> {t('addTenant')}
        </Button>
      </Box>
      <DataTable
        data={tenants}
        isLoading={isLoading}
        columns={[
          { header: 'ID', accessorKey: 'id', width: '50px' },
          { header: t('name'), accessorKey: 'name' },
        ]}
        searchKeys={['name']}
        searchPlaceholder={t('searchTenants')}
        onEdit={onEdit}
        onDelete={(row) => onDelete(row.id)}
        tenantField='id'
      />

      <Dialog.Root open={isOpen} onOpenChange={(e) => (e.open ? onOpen() : onClose())}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{editingTenant ? t('editTenant') : t('addTenant')}</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body pb={6}>
              <form id="tenant-form" onSubmit={handleSubmit(onSubmit)}>
                <Field.Root required>
                  <Field.Label>{t('name')}</Field.Label>
                  <Input {...register('name')} placeholder="e.g. Acme Corp" />
                </Field.Root>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={onClose} mr={3} variant="ghost">
                {t('cancel')}
              </Button>
              <Button colorPalette="brand" form="tenant-form" type="submit">
                {t('save')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  useDisclosure,
  Dialog,
  Field,
  Input,
  NativeSelect,
} from '@chakra-ui/react';
import { FiPlus, FiLock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/common/DataTable';
import { useForm } from 'react-hook-form';
import { Role } from '@/types';
import { useTranslation } from 'react-i18next';
// import { toaster } from '@/components/ui/toaster';
import { useRoles } from '@/hooks/useRoles';
import { tenantService } from '@/services/tenantService';

export default function Roles() {
  const navigate = useNavigate();
  const { roles, isLoading, createRole, updateRole, deleteRole } = useRoles();
  const [tenants, setTenants] = useState<any[]>([]);
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { t } = useTranslation();
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    // Temporary: Still fetching tenants manually until we make a useTenants hook
    tenantService.getAll().then(setTenants).catch(console.error);
  }, []);

  const onEdit = (role: Role) => {
    setEditingRole(role);
    setValue('name', role.name);
    setValue('display_name', role.display_name);
    setValue('tenant_id', role.tenant_id);
    onOpen();
  };

  const onAdd = () => {
    setEditingRole(null);
    reset();
    setValue('tenant_id', tenants[0]?.id || 1);
    onOpen();
  };

  const onSubmit = (data: any) => {
      data.tenant_id = Number.parseInt(data.tenant_id);
      if (editingRole) {
        updateRole({ id: editingRole.id, data }, {
          onSuccess: () => {
            onClose();
          }
        });
      } else {
        createRole(data, {
          onSuccess: () => {
            onClose();
          }
        });
      }
  };

  const onDelete = (id: number) => {
    if (!window.confirm(t('deleteRoleConfirm'))) return;
    deleteRole(id);
  };

  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('roles')}</Heading>
        <Button colorPalette="brand" onClick={onAdd}>
          <FiPlus /> {t('addRole')}
        </Button>
      </Box>
      <DataTable
        data={roles}
        isLoading={isLoading}
        columns={[
          { header: 'ID', accessorKey: 'id', width: '50px' },
          { header: t('roleName'), accessorKey: 'name' },
          {
            header: t('tenant'),
            render: (r) => tenants.find((t) => t.id === r.tenant_id)?.name || r.tenant_id,
          },
          {
            header: t('actions'),
            render: (r) => (
              <Button size="xs" variant="ghost" onClick={() => navigate(`/roles/${r.id}/permissions`)}>
                 <FiLock /> {t('permissions')}
              </Button>
            )
          }
        ]}
        searchKeys={['name']}
        searchPlaceholder={t('searchRoles') || 'Search roles...'}
        onEdit={onEdit}
        onDelete={(r) => onDelete(r.id)}
      />

      <Dialog.Root open={isOpen} onOpenChange={(e) => (e.open ? onOpen() : onClose())}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{editingRole ? t('editRole') : t('createRole')}</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body pb={6}>
              <form id="role-form" onSubmit={handleSubmit(onSubmit)}>
                <Field.Root required mb={4}>
                  <Field.Label>{t('roleName')}</Field.Label>
                  <Input {...register('name')} />
                </Field.Root>
                <Field.Root required>
                  <Field.Label>{t('tenant')}</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field {...register('tenant_id')} placeholder="Select tenant">
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field.Root>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={onClose} mr={3} variant="ghost">
                {t('cancel')}
              </Button>
              <Button colorPalette="brand" form="role-form" type="submit">
                {t('save')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}

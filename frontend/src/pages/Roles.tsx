import { useEffect, useState } from 'react';
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
import { FiPlus } from 'react-icons/fi';
import { DataTable } from '../components/common/DataTable';
import { useForm } from 'react-hook-form';
import { roleService } from '../services/roleService';
import { Role } from '../types';
import { useTranslation } from 'react-i18next';
import { toaster } from '../components/ui/toaster';

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { t } = useTranslation();
  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchRoles = async () => {
    try {
      const [r, t] = await Promise.all([
        roleService.getAll(),
        import('../services/tenantService').then((m) => m.tenantService.getAll()),
      ]);
      setRoles(r);
      setTenants(t);
    } catch (e) {
      toaster.create({ title: 'Failed to load roles', type: 'error' });
    }
  };

  useEffect(() => {
    fetchRoles();
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

  const onSubmit = async (data: any) => {
    try {
      data.tenant_id = Number.parseInt(data.tenant_id);
      if (editingRole) {
        await roleService.update(editingRole.id, data);
        toaster.create({ title: t('roleUpdated'), type: 'success' });
      } else {
        await roleService.create(data);
        toaster.create({ title: t('roleCreated'), type: 'success' });
      }
      onClose();
      fetchRoles();
    } catch (e: any) {
      toaster.create({
        title: t('operationFailed'),
        description: e.response?.data?.detail,
        type: 'error',
      });
    }
  };

  const onDelete = async (id: number) => {
    if (!window.confirm(t('deleteRoleConfirm'))) return;
    try {
      await roleService.delete(id);
      toaster.create({ title: t('roleDeleted'), type: 'success' });
      fetchRoles();
    } catch (e) {
      toaster.create({ title: t('deleteFailed'), type: 'error' });
    }
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
        columns={[
          { header: 'ID', accessorKey: 'id', width: '50px' },
          { header: t('roleName'), accessorKey: 'name' },
          {
            header: t('tenant'),
            render: (r) => tenants.find((t) => t.id === r.tenant_id)?.name || r.tenant_id,
          },
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

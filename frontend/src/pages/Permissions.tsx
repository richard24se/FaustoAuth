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
import { permissionService } from '../services/permissionService';
import { objectService } from '../services/objectService';
import { Permission, AuthObject } from '../types';
import { useTranslation } from 'react-i18next';
import { toaster } from '../components/ui/toaster';

export default function Permissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [objects, setObjects] = useState<AuthObject[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const { t } = useTranslation();
  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchData = async () => {
    try {
      const [p, o, t] = await Promise.all([
        permissionService.getAll(),
        objectService.getAll(),
        import('../services/tenantService').then(m => m.tenantService.getAll())
      ]);
      setPermissions(p);
      setObjects(o);
      setTenants(t);
    } catch (e) {
      toaster.create({ title: 'Failed to load data', type: 'error' });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onEdit = (perm: Permission) => {
    setEditingPerm(perm);
    setValue('name', perm.name);
    setValue('id_object', perm.id_object);
    setValue('tenant_id', perm.tenant_id);
    onOpen();
  };

  const onAdd = () => {
    setEditingPerm(null);
    reset();
    setValue('tenant_id', tenants[0]?.id || 1);
    onOpen();
  };

  const onSubmit = async (data: any) => {
    try {
      data.id_object = Number.parseInt(data.id_object);
      data.tenant_id = Number.parseInt(data.tenant_id);
      if (editingPerm) {
        await permissionService.update(editingPerm.id, data);
        toaster.create({ title: t('permissionUpdated'), type: 'success' });
      } else {
        await permissionService.create(data);
        toaster.create({ title: t('permissionCreated'), type: 'success' });
      }
      onClose();
      fetchData();
    } catch (e: any) {
        toaster.create({ title: t('operationFailed'), description: e.response?.data?.detail, type: 'error' });
    }
  };

  const onDelete = async (id: number) => {
    if (!window.confirm(t('deletePermissionConfirm'))) return;
    try {
      await permissionService.delete(id);
      toaster.create({ title: t('permissionDeleted'), type: 'success' });
      fetchData();
    } catch (e) {
      toaster.create({ title: t('deleteFailed'), type: 'error' });
    }
  };

  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('permissions')}</Heading>
        <Button colorPalette="brand" onClick={onAdd}><FiPlus /> {t('addPermission')}</Button>
      </Box>
      <DataTable
        data={permissions}
        columns={[
            { header: 'ID', accessorKey: 'id', width: '50px' },
            { header: t('permissionName'), accessorKey: 'name' },
            { header: t('objectId'), render: (p) => objects.find(o => o.id === p.id_object)?.name || p.id_object },
            { header: t('tenant'), render: (p) => tenants.find(t => t.id === p.tenant_id)?.name || p.tenant_id },
        ]}
        searchKeys={['name']}
        searchPlaceholder={t('searchPermissions') || "Search permissions..."}
        onEdit={onEdit}
        onDelete={(p) => onDelete(p.id)}
      />

      <Dialog.Root open={isOpen} onOpenChange={(e) => e.open ? onOpen() : onClose()}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
            <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>{editingPerm ? t('editPermission') : t('createPermission')}</Dialog.Title>
                <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body pb={6}>
                <form id="perm-form" onSubmit={handleSubmit(onSubmit)}>
                <Field.Root required mb={4}>
                    <Field.Label>{t('permissionName')}</Field.Label>
                    <Input {...register('name')} placeholder="e.g. read:users" />
                </Field.Root>
                <Field.Root required mb={4}>
                    <Field.Label>{t('object')}</Field.Label>
                    <NativeSelect.Root>
                        <NativeSelect.Field {...register('id_object')} placeholder="Select Object">
                            {objects.map(obj => (
                                <option key={obj.id} value={obj.id}>{obj.name}</option>
                            ))}
                        </NativeSelect.Field>
                    </NativeSelect.Root>
                </Field.Root>
                <Field.Root required>
                    <Field.Label>{t('tenant')}</Field.Label>
                    <NativeSelect.Root>
                        <NativeSelect.Field {...register('tenant_id')} placeholder="Select tenant">
                            {tenants.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </NativeSelect.Field>
                    </NativeSelect.Root>
                </Field.Root>
                </form>
            </Dialog.Body>
            <Dialog.Footer>
                <Button onClick={onClose} mr={3} variant="ghost">{t('cancel')}</Button>
                <Button colorPalette="brand" form="perm-form" type="submit">{t('save')}</Button>
            </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}

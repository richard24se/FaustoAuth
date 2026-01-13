import { useState } from 'react';
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
import { DataTable } from '@/components/common/DataTable';
import { useForm } from 'react-hook-form';
import { Permission } from '@/types';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/usePermissions';
import { useObjects } from '@/hooks/useObjects';
import { useTenants } from '@/hooks/useTenants';
import { usePermissionTypes } from '@/hooks/usePermissionTypes';

export default function Permissions() {
  const { permissions, isLoading, createPermission, updatePermission, deletePermission } = usePermissions();
  const { objects } = useObjects();
  const { tenants } = useTenants();
  const { permissionTypes } = usePermissionTypes();

  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const { t } = useTranslation();
  const { register, handleSubmit, reset, setValue } = useForm();

  const onEdit = (perm: Permission) => {
    setEditingPerm(perm);
    setValue('name', perm.name);
    setValue('object_id', perm.object_id);
    setValue('permission_type_id', perm.permission_type_id);
    setValue('tenant_id', perm.tenant_id);
    onOpen();
  };

  const onAdd = () => {
    setEditingPerm(null);
    reset();
    setValue('tenant_id', tenants[0]?.id || 1);
    onOpen();
  };

  const onSubmit = (data: any) => {
    data.object_id = Number.parseInt(data.object_id);
    data.permission_type_id = Number.parseInt(data.permission_type_id);
    data.tenant_id = Number.parseInt(data.tenant_id);
    if (editingPerm) {
      updatePermission({ id: editingPerm.id, data }, {
        onSuccess: () => onClose()
      });
    } else {
      createPermission(data, {
        onSuccess: () => onClose()
      });
    }
  };

  const onDelete = (id: number) => {
    if (!window.confirm(t('deletePermissionConfirm'))) return;
    deletePermission(id);
  };

  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('permissions')}</Heading>
        <Button colorPalette="brand" onClick={onAdd}>
          <FiPlus /> {t('addPermission')}
        </Button>
      </Box>
      <DataTable
        data={permissions}
        isLoading={isLoading}
        columns={[
          { header: 'ID', accessorKey: 'id', width: '50px' },
          { header: t('permissionName'), accessorKey: 'name' },
          {
            header: t('objectId'),
            render: (p) => objects.find((o) => o.id === p.object_id)?.name || p.object_id,
          },
          {
            header: t('permissionType'),
            render: (p) => permissionTypes.find((pt) => pt.id === p.permission_type_id)?.name || p.permission_type_id,
          },
          {
            header: t('tenant'),
            render: (p) => tenants.find((t) => t.id === p.tenant_id)?.name || p.tenant_id,
          },
        ]}
        searchKeys={['name']}
        searchPlaceholder={t('searchPermissions') || 'Search permissions...'}
        onEdit={onEdit}
        onDelete={(p) => onDelete(p.id)}
      />

      <Dialog.Root open={isOpen} onOpenChange={(e) => (e.open ? onOpen() : onClose())}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {editingPerm ? t('editPermission') : t('createPermission')}
              </Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body pb={6}>
              <form id="perm-form" onSubmit={handleSubmit(onSubmit)}>
                <Field.Root required mb={4}>
                  <Field.Label>{t('permissionName')}</Field.Label>
                  <Input {...register('name')} placeholder="e.g. read:users" />
                </Field.Root>
                <Field.Root required mb={4}>
                  <Field.Label>{t('permissionType')}</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field {...register('permission_type_id')} placeholder="Select Type">
                      {permissionTypes.map((pt) => (
                        <option key={pt.id} value={pt.id}>
                          {pt.name}
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field.Root>
                <Field.Root required mb={4}>
                  <Field.Label>{t('object')}</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field {...register('object_id')} placeholder="Select Object">
                      {objects.map((obj) => (
                        <option key={obj.id} value={obj.id}>
                          {obj.name}
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
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
              <Button colorPalette="brand" form="perm-form" type="submit">
                {t('save')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}

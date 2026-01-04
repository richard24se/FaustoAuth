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
  Badge,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { User } from '@/types';
import { useTranslation } from 'react-i18next';
import { DataTable, Column } from '@/components/common/DataTable';
import { useColorMode } from '@/components/ui/color-mode';
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { useTenants } from '@/hooks/useTenants';

export default function Users() {
  const { users, isLoading: usersLoading, createUser, updateUser, deleteUser } = useUsers();
  const { roles } = useRoles();
  const { tenants } = useTenants();

  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { t } = useTranslation();
  const { colorMode } = useColorMode();

  // Specific Filter State for Users Page
  const [roleFilter, setRoleFilter] = useState<number | ''>('');

  const { register, handleSubmit, reset, setValue } = useForm();
  const bgInput = colorMode === 'dark' ? 'gray.700' : 'white';

  // Helper to get Tenant Name
  const getTenantName = (id: number) => {
    return tenants.find((t) => t.id === id)?.name || id;
  };

  // Helper to get Role Name (fallback)
  const getRoleName = (user: User) => {
    if (user.role?.name) {
      return Array.isArray(user.role.name) ? user.role.name.join(', ') : user.role.name;
    }
    // Fallback to finding in roles list
    const r = roles.find((role) => role.id === user.id_role);
    return r ? r.name : user.id_role || '-';
  };

  // Define Columns
  const columns: Column<User>[] = [
    { header: 'ID', accessorKey: 'id', width: '50px' },
    { header: t('username'), accessorKey: 'username' },
    { header: t('names'), render: (u) => u.names || '-' },
    { header: t('role'), render: (u) => <Badge>{getRoleName(u)}</Badge> },
    { header: t('tenant'), render: (u) => getTenantName(u.tenant_id) },
  ];

  // Handle Edit Click
  const onEdit = (user: User) => {
    setEditingUser(user);
    setValue('username', user.username);
    setValue('names', user.names);
    setValue('id_role', user.id_role || user.role?.id);
    setValue('tenant_id', user.tenant_id);
    onOpen();
  };

  // Handle Add Click
  const onAdd = () => {
    setEditingUser(null);
    reset();
    setValue('tenant_id', tenants[0]?.id || 1);
    onOpen();
  };

  const onSubmit = (data: any) => {
    data.id_role = Number.parseInt(data.id_role);
    data.tenant_id = Number.parseInt(data.tenant_id);

    if (editingUser) {
      updateUser({ id: editingUser.id, data }, {
        onSuccess: () => onClose()
      });
    } else {
      if (!data.password) data.password = 'password123';
      createUser(data, {
        onSuccess: () => onClose()
      });
    }
  };

  const onDelete = (user: User) => {
    if (!window.confirm(t('deleteUserConfirm'))) return;
    deleteUser(user.id);
  };

  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('users')}</Heading>
        <Button colorPalette="brand" onClick={onAdd} variant="solid">
          {t('addUser')}
        </Button>
      </Box>

      <DataTable
        data={users}
        isLoading={usersLoading}
        columns={columns}
        searchKeys={['username', 'names']}
        searchPlaceholder={t('searchUsers') || 'Search users...'}
        onEdit={onEdit}
        onDelete={onDelete}
        customFilter={(u) =>
          roleFilter ? u.id_role === roleFilter || u.role?.id === roleFilter : true
        }
        extraControls={
          <NativeSelect.Root maxW="200px">
            <NativeSelect.Field
              placeholder={t('filterByRole') || 'Filter by Role'}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value ? Number(e.target.value) : '')}
              bg={bgInput}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </NativeSelect.Field>
          </NativeSelect.Root>
        }
      />

      <Dialog.Root open={isOpen} onOpenChange={(e) => (e.open ? onOpen() : onClose())}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{editingUser ? t('editUser') : t('createUser')}</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body pb={6}>
              <form id="user-form" onSubmit={handleSubmit(onSubmit)}>
                <Field.Root required mb={4}>
                  <Field.Label>{t('username')}</Field.Label>
                  <Input {...register('username')} />
                </Field.Root>
                <Field.Root mb={4}>
                  <Field.Label>{t('names')}</Field.Label>
                  <Input {...register('names')} />
                </Field.Root>
                {!editingUser && (
                  <Field.Root mb={4}>
                    <Field.Label>{t('password')}</Field.Label>
                    <Input
                      type="password"
                      {...register('password')}
                      placeholder="Default: password123"
                    />
                  </Field.Root>
                )}

                <Field.Root required mb={4}>
                  <Field.Label>{t('role')}</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field {...register('id_role')} placeholder="Select role">
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
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
              <Button colorPalette="brand" form="user-form" type="submit">
                {t('save')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}

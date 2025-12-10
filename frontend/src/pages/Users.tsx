import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  Select,
  ModalFooter,
  useToast,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { userService } from '../services/userService';
import { roleService } from '../services/roleService';
import { tenantService } from '../services/tenantService';
import { User, Role } from '../types';
import { useTranslation } from 'react-i18next';
// useTenantStore is used inside DataTable, but we don't need it here unless we have specific logic. 
// Actually we used it for role filter? No, we simply pass customFilter. DataTable handles filtering.

import { DataTable, Column } from '../components/common/DataTable';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const toast = useToast();
  const { t } = useTranslation();

  // Specific Filter State for Users Page
  const [roleFilter, setRoleFilter] = useState<number | ''>('');

  const { register, handleSubmit, reset, setValue } = useForm();
  const bgInput = useColorModeValue('white', 'gray.700');

  // Fetch Users and Roles on mount
  const fetchData = async () => {
    try {
      const [u, r, t] = await Promise.all([
        userService.getAll(),
        roleService.getAll(),
        tenantService.getAll()
      ]);
      setUsers(u);
      setRoles(r);
      setTenants(t);
    } catch (e) {
      toast({ title: 'Failed to load data', status: 'error' });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to get Tenant Name
  const getTenantName = (id: number) => {
    return tenants.find(t => t.id === id)?.name || id;
  };

  // Helper to get Role Name (fallback)
  const getRoleName = (user: User) => {
    if (user.role?.name) {
      return Array.isArray(user.role.name) ? user.role.name.join(', ') : user.role.name;
    }
    // Fallback to finding in roles list
    const r = roles.find(role => role.id === user.id_role);
    return r ? r.name : (user.id_role || '-');
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
    // user.role might be complex object or id based on backend response layout.
    // Based on types.ts: role?: Role. We need role.id for the Select value.
    setValue('id_role', user.id_role || user.role?.id);
    setValue('tenant_id', user.tenant_id);
    onOpen();
  };

  // Handle Add Click
  const onAdd = () => {
    setEditingUser(null);
    reset();
    setValue('tenant_id', tenants[0]?.id || 1); // Default to first tenant logic or 1
    onOpen();
  };

  const onSubmit = async (data: any) => {
    try {
      data.id_role = Number.parseInt(data.id_role);
      data.tenant_id = Number.parseInt(data.tenant_id);

      if (editingUser) {
        await userService.update(editingUser.id, data);
        toast({ title: t('userUpdated'), status: 'success' });
      } else {
        // Default password if needed, mostly handled by backend default or separate flow
        if (!data.password) data.password = "password123"; // TODO: Temporary default or handled by form?
        await userService.create(data);
        toast({ title: t('userCreated'), status: 'success' });
      }
      onClose();
      fetchData();
    } catch (e: any) {
      toast({ title: t('operationFailed'), description: e.response?.data?.detail, status: 'error' });
    }
  };

  const onDelete = async (user: User) => {
    if (!window.confirm(t('deleteUserConfirm'))) return;
    try {
      await userService.delete(user.id);
      toast({ title: t('userDeleted'), status: 'success' });
      fetchData();
    } catch (e) {
      toast({ title: t('deleteFailed'), status: 'error' });
    }
  };

  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('users')}</Heading>
        <Button colorScheme="brand" onClick={onAdd} variant={"solid"}>
          {t('addUser')}
        </Button>
      </Box>

      <DataTable
        data={users}
        columns={columns}
        searchKeys={['username', 'names']}
        searchPlaceholder={t('searchUsers') || 'Search users...'}
        onEdit={onEdit}
        onDelete={onDelete}
        customFilter={(u) => roleFilter ? (u.id_role === roleFilter || u.role?.id === roleFilter) : true}
        extraControls={
          <Select
            placeholder={t('filterByRole') || 'Filter by Role'}
            maxW="200px"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value ? Number(e.target.value) : '')}
            bg={bgInput}
          >
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </Select>
        }
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingUser ? t('editUser') : t('createUser')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form id="user-form" onSubmit={handleSubmit(onSubmit)}>
              <FormControl isRequired mb={4}>
                <FormLabel>{t('username')}</FormLabel>
                <Input {...register('username')} />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>{t('names')}</FormLabel>
                <Input {...register('names')} />
              </FormControl>
              {/* Password field only for new users? or modify separately? keeping it simple per existing code */}
              {!editingUser && (
                <FormControl mb={4}>
                  <FormLabel>{t('password')}</FormLabel>
                  <Input type="password" {...register('password')} placeholder="Default: password123" />
                </FormControl>
              )}

              <FormControl isRequired mb={4}>
                <FormLabel>{t('role')}</FormLabel>
                <Select {...register('id_role')} placeholder="Select role">
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>{t('tenant')}</FormLabel>
                <Select {...register('tenant_id')} placeholder="Select tenant">
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              </FormControl>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3}>{t('cancel')}</Button>
            <Button colorScheme="brand" form="user-form" type="submit">{t('save')}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

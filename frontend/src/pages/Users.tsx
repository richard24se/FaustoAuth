import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
import { FiMoreVertical, FiPlus, FiEdit, FiTrash } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { userService } from '../services/userService';
import { roleService } from '../services/roleService';
import { tenantService } from '../services/tenantService';
import { User, Role } from '../types';
import { useTranslation } from 'react-i18next';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const toast = useToast();
  const { t } = useTranslation();

  const { register, handleSubmit, reset, setValue } = useForm();

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
    if (user.role?.name) return user.role.name;
    // Fallback to finding in roles list
    const r = roles.find(role => role.id === user.id_role);
    return r ? r.name : (user.id_role || '-');
  };

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
    // Default tenant?
    setValue('tenant_id', tenants[0]?.id || 1);
    onOpen();
  };

  // Handle Form Submit (Create/Update)
  const onSubmit = async (data: any) => {
    try {
      // Ensure IDs are numbers
      data.id_role = Number.parseInt(data.id_role);
      data.tenant_id = Number.parseInt(data.tenant_id);

      if (editingUser) {
        await userService.update(editingUser.id, data);
        toast({ title: t('userUpdated'), status: 'success' });
      } else {
        await userService.create(data);
        toast({ title: t('userCreated'), status: 'success' });
      }
      onClose();
      fetchData();
    } catch (e: any) {
      toast({ title: t('operationFailed'), description: e.response?.data?.detail, status: 'error' });
    }
  };

  // Handle Delete
  const onDelete = async (id: number) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await userService.delete(id);
      toast({ title: t('userDeleted'), status: 'success' });
      fetchData();
    } catch (e) {
      toast({ title: t('deleteFailed'), status: 'error' });
    }
  };

  const bg = 'surface.500';
  const theadBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('users')}</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={onAdd}>
          {t('addUser')}
        </Button>
      </Box>

      <Box bg={bg} shadow="md" borderRadius="lg" overflowX="auto" borderWidth="1px" borderColor="gray.200">
        <Table variant="simple">
          <Thead bg={theadBg}>
            <Tr>
              <Th width="5%">ID</Th>
              <Th width="25%">{t('username')}</Th>
              <Th width="30%">{t('names')}</Th>
              <Th width="15%">{t('role')}</Th>
              <Th width="20%">{t('tenant')}</Th>
              <Th width="5%"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user.id}>
                <Td>{user.id}</Td>
                <Td fontWeight="medium">{user.username}</Td>
                <Td>{user.names || '-'}</Td>
                <Td>
                  <Badge colorScheme="secondary">{getRoleName(user)}</Badge>
                </Td>
                <Td>{getTenantName(user.tenant_id)}</Td>
                <Td>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      size="sm"
                      aria-label="Actions"
                    />
                    <MenuList>
                      <MenuItem icon={<FiEdit />} onClick={() => onEdit(user)}>
                        {t('edit')}
                      </MenuItem>
                      <MenuItem icon={<FiTrash />} color="red.500" onClick={() => onDelete(user.id)}>
                        {t('delete')}
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
            {users.length === 0 && (
              <Tr><Td colSpan={6} textAlign="center">{t('noUsersFound')}</Td></Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Modal for Create/Update */}
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

              {!editingUser && (
                <FormControl isRequired mb={4}>
                  <FormLabel>{t('password')}</FormLabel>
                  <Input type="password" {...register('password')} />
                </FormControl>
              )}
              {editingUser && (
                <FormControl mb={4}>
                  <FormLabel>{t('password')} (Leave blank to keep current)</FormLabel>
                  <Input type="password" {...register('password')} placeholder="******" />
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
            <Button colorScheme="brand" form="user-form" type="submit">
              {t('save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

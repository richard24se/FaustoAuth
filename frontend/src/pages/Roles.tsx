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
  useColorModeValue,
} from '@chakra-ui/react';
import { FiMoreVertical, FiPlus, FiEdit, FiTrash } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { roleService } from '../services/roleService';
import { Role } from '../types';
import { useTranslation } from 'react-i18next';

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const toast = useToast();
  const { t } = useTranslation();
  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchRoles = async () => {
    try {
      const [r, t] = await Promise.all([
          roleService.getAll(),
          import('../services/tenantService').then(m => m.tenantService.getAll())
      ]);
      setRoles(r);
      setTenants(t);
    } catch (e) {
      toast({ title: 'Failed to load roles', status: 'error' });
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
        toast({ title: t('roleUpdated'), status: 'success' });
      } else {
        await roleService.create(data);
        toast({ title: t('roleCreated'), status: 'success' });
      }
      onClose();
      fetchRoles();
    } catch (e: any) {
        toast({ title: t('operationFailed'), description: e.response?.data?.detail, status: 'error' });
    }
  };

  const onDelete = async (id: number) => {
    if (!window.confirm(t('deleteRoleConfirm'))) return;
    try {
      await roleService.delete(id);
      toast({ title: t('roleDeleted'), status: 'success' });
      fetchRoles();
    } catch (e) {
      toast({ title: t('deleteFailed'), status: 'error' });
    }
  };

  const bg = 'surface.500';
  const theadBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('roles')}</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={onAdd}>
          {t('addRole')}
        </Button>
      </Box>
      <Box bg={bg} shadow="md" borderRadius="lg" overflowX="auto">
        <Table variant="simple">
          <Thead bg={theadBg}>
            <Tr>
              <Th>ID</Th>
              <Th>{t('roleName')}</Th>
              <Th>{t('tenant')}</Th>
              <Th w="50px"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {roles.map((role) => (
              <Tr key={role.id}>
                <Td>{role.id}</Td>
                <Td fontWeight="medium">{role.name}</Td>
                <Td>{tenants.find(t => t.id === role.tenant_id)?.name || role.tenant_id}</Td>
                <Td>
                  <Menu>
                    <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                    <MenuList>
                      <MenuItem icon={<FiEdit />} onClick={() => onEdit(role)}>{t('edit')}</MenuItem>
                      <MenuItem icon={<FiTrash />} color="red.500" onClick={() => onDelete(role.id)}>{t('delete')}</MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingRole ? t('editRole') : t('createRole')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form id="role-form" onSubmit={handleSubmit(onSubmit)}>
              <FormControl isRequired mb={4}>
                <FormLabel>{t('roleName')}</FormLabel>
                <Input {...register('name')} />
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
             <Button colorScheme="brand" form="role-form" type="submit">{t('save')}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

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
import { permissionService } from '../services/permissionService';
import { objectService } from '../services/objectService';
import { Permission, AuthObject } from '../types';
import { useTranslation } from 'react-i18next';

export default function Permissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [objects, setObjects] = useState<AuthObject[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const toast = useToast();
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
      toast({ title: 'Failed to load data', status: 'error' });
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
        toast({ title: t('permissionUpdated'), status: 'success' });
      } else {
        await permissionService.create(data);
        toast({ title: t('permissionCreated'), status: 'success' });
      }
      onClose();
      fetchData();
    } catch (e: any) {
        toast({ title: t('operationFailed'), description: e.response?.data?.detail, status: 'error' });
    }
  };

  const onDelete = async (id: number) => {
    if (!window.confirm(t('deletePermissionConfirm'))) return;
    try {
      await permissionService.delete(id);
      toast({ title: t('permissionDeleted'), status: 'success' });
      fetchData();
    } catch (e) {
      toast({ title: t('deleteFailed'), status: 'error' });
    }
  };

  const bg = useColorModeValue('white', 'gray.800');
  const theadBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('permissions')}</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={onAdd}>{t('addPermission')}</Button>
      </Box>
      <Box bg={bg} shadow="md" borderRadius="lg" overflowX="auto">
        <Table variant="simple">
          <Thead bg={theadBg}>
            <Tr>
              <Th>ID</Th>
              <Th>{t('permissionName')}</Th>
              <Th>{t('objectId')}</Th>
              <Th>{t('tenant')}</Th>
              <Th w="50px"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {permissions.map((perm) => (
              <Tr key={perm.id}>
                <Td>{perm.id}</Td>
                <Td fontWeight="medium">{perm.name}</Td>
                <Td>{objects.find(o => o.id === perm.id_object)?.name || perm.id_object}</Td>
                <Td>{tenants.find(t => t.id === perm.tenant_id)?.name || perm.tenant_id}</Td>
                <Td>
                  <Menu>
                    <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                    <MenuList>
                      <MenuItem icon={<FiEdit />} onClick={() => onEdit(perm)}>{t('edit')}</MenuItem>
                      <MenuItem icon={<FiTrash />} color="red.500" onClick={() => onDelete(perm.id)}>{t('delete')}</MenuItem>
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
          <ModalHeader>{editingPerm ? t('editPermission') : t('createPermission')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form id="perm-form" onSubmit={handleSubmit(onSubmit)}>
              <FormControl isRequired mb={4}>
                <FormLabel>{t('permissionName')}</FormLabel>
                <Input {...register('name')} placeholder="e.g. read:users" />
              </FormControl>
              <FormControl isRequired mb={4}>
                <FormLabel>{t('object')}</FormLabel>
                <Select {...register('id_object')} placeholder="Select Object">
                    {objects.map(obj => (
                        <option key={obj.id} value={obj.id}>{obj.name}</option>
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
             <Button colorScheme="brand" form="perm-form" type="submit">{t('save')}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

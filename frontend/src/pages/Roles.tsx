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
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { DataTable } from '../components/common/DataTable';
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



  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('roles')}</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={onAdd}>
          {t('addRole')}
        </Button>
      </Box>
      <DataTable
        data={roles}
        columns={[
            { header: 'ID', accessorKey: 'id', width: '50px' },
            { header: t('roleName'), accessorKey: 'name' },
            { header: t('tenant'), render: (r) => tenants.find(t => t.id === r.tenant_id)?.name || r.tenant_id },
        ]}
        searchKeys={['name']}
        searchPlaceholder={t('searchRoles') || "Search roles..."}
        onEdit={onEdit}
        onDelete={(r) => onDelete(r.id)}
      />

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

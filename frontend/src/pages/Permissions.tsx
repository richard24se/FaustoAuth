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



  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('permissions')}</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={onAdd}>{t('addPermission')}</Button>
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

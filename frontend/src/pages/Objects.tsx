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
  ModalFooter,
  useToast,
  Select,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { DataTable } from '../components/common/DataTable';
import { useForm } from 'react-hook-form';
import { objectService } from '../services/objectService';
import { AuthObject } from '../types';
import { useTranslation } from 'react-i18next';

export default function Objects() {
  const [objects, setObjects] = useState<AuthObject[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingObj, setEditingObj] = useState<AuthObject | null>(null);
  const toast = useToast();
  const { t } = useTranslation();
  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchObjects = async () => {
    try {
      const [o, t] = await Promise.all([
          objectService.getAll(),
          import('../services/tenantService').then(m => m.tenantService.getAll())
      ]);
      setObjects(o);
      setTenants(t);
    } catch (e) {
      toast({ title: 'Failed to load objects', status: 'error' });
    }
  };

  useEffect(() => {
    fetchObjects();
  }, []);

  const onEdit = (obj: AuthObject) => {
    setEditingObj(obj);
    setValue('name', obj.name);
    setValue('display_name', obj.display_name);
    setValue('id_object_type', obj.id_object_type);
    setValue('tenant_id', obj.tenant_id);
    onOpen();
  };

  const onAdd = () => {
    setEditingObj(null);
    reset();
    setValue('tenant_id', tenants[0]?.id || 1);
    setValue('id_object_type', 1); // Default type
    onOpen();
  };

  const onSubmit = async (data: any) => {
    try {
      data.id_object_type = Number.parseInt(data.id_object_type);
      data.tenant_id = Number.parseInt(data.tenant_id);
      if (editingObj) {
        await objectService.update(editingObj.id, data);
        toast({ title: t('objectUpdated'), status: 'success' });
      } else {
        await objectService.create(data);
        toast({ title: t('objectCreated'), status: 'success' });
      }
      onClose();
      fetchObjects();
    } catch (e: any) {
        toast({ title: t('operationFailed'), description: e.response?.data?.detail, status: 'error' });
    }
  };

  const onDelete = async (id: number) => {
    if (!window.confirm(t('deleteObjectConfirm'))) return;
    try {
      await objectService.delete(id);
      toast({ title: t('objectDeleted'), status: 'success' });
      fetchObjects();
    } catch (e) {
      toast({ title: t('deleteFailed'), status: 'error' });
    }
  };



  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('objects')}</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={onAdd}>{t('addObject')}</Button>
      </Box>
      <DataTable
        data={objects}
        columns={[
            { header: 'ID', accessorKey: 'id', width: '50px' },
            { header: t('permissionName'), accessorKey: 'name' },
            { header: t('typeId'), accessorKey: 'id_object_type' }, // Maybe fetch type name?
            { header: t('tenant'), render: (o) => tenants.find(t => t.id === o.tenant_id)?.name || o.tenant_id },
        ]}
        searchKeys={['name']}
        searchPlaceholder={t('searchObjects') || "Search objects..."}
        onEdit={onEdit}
        onDelete={(o) => onDelete(o.id)}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingObj ? t('editObject') : t('createObject')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form id="obj-form" onSubmit={handleSubmit(onSubmit)}>
              <FormControl isRequired mb={4}>
                <FormLabel>{t('permissionName')}</FormLabel>
                <Input {...register('name')} />
              </FormControl>
              <FormControl isRequired mb={4}>
                <FormLabel>{t('objectType')}</FormLabel>
                <Input type="number" {...register('id_object_type')} />
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
             <Button colorScheme="brand" form="obj-form" type="submit">{t('save')}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

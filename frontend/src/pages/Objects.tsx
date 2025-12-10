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
import { objectService } from '../services/objectService';
import { AuthObject } from '../types';
import { useTranslation } from 'react-i18next';
import { toaster } from '../components/ui/toaster';

export default function Objects() {
  const [objects, setObjects] = useState<AuthObject[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const [editingObj, setEditingObj] = useState<AuthObject | null>(null);
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
      toaster.create({ title: 'Failed to load objects', type: 'error' });
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
        toaster.create({ title: t('objectUpdated'), type: 'success' });
      } else {
        await objectService.create(data);
        toaster.create({ title: t('objectCreated'), type: 'success' });
      }
      onClose();
      fetchObjects();
    } catch (e: any) {
        toaster.create({ title: t('operationFailed'), description: e.response?.data?.detail, type: 'error' });
    }
  };

  const onDelete = async (id: number) => {
    if (!window.confirm(t('deleteObjectConfirm'))) return;
    try {
      await objectService.delete(id);
      toaster.create({ title: t('objectDeleted'), type: 'success' });
      fetchObjects();
    } catch (e) {
      toaster.create({ title: t('deleteFailed'), type: 'error' });
    }
  };

  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('objects')}</Heading>
        <Button colorPalette="brand" onClick={onAdd}><FiPlus /> {t('addObject')}</Button>
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

      <Dialog.Root open={isOpen} onOpenChange={(e) => e.open ? onOpen() : onClose()}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
            <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>{editingObj ? t('editObject') : t('createObject')}</Dialog.Title>
                <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body pb={6}>
                <form id="obj-form" onSubmit={handleSubmit(onSubmit)}>
                <Field.Root required mb={4}>
                    <Field.Label>{t('permissionName')}</Field.Label>
                    <Input {...register('name')} />
                </Field.Root>
                <Field.Root required mb={4}>
                    <Field.Label>{t('objectType')}</Field.Label>
                    <Input type="number" {...register('id_object_type')} />
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
                <Button colorPalette="brand" form="obj-form" type="submit">{t('save')}</Button>
            </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}

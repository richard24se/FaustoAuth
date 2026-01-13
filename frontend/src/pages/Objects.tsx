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
import { DataTable } from '../components/common/DataTable';
import { useForm } from 'react-hook-form';
import { AuthObject } from '../types';
import { useTranslation } from 'react-i18next';
import { useObjects } from '@/hooks/useObjects';
import { useTenants } from '@/hooks/useTenants';
import { useObjectTypes } from '@/hooks/useObjectTypes';

export default function Objects() {
  const { objects, isLoading, createObject, updateObject, deleteObject } = useObjects();
  const { tenants } = useTenants();
  const { objectTypes } = useObjectTypes();

  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const [editingObj, setEditingObj] = useState<AuthObject | null>(null);
  const { t } = useTranslation();
  const { register, handleSubmit, reset, setValue } = useForm();

  const onEdit = (obj: AuthObject) => {
    setEditingObj(obj);
    setValue('name', obj.name);
    setValue('display_name', obj.display_name);
    setValue('object_type_id', obj.object_type_id);
    setValue('tenant_id', obj.tenant_id);
    onOpen();
  };

  const onAdd = () => {
    setEditingObj(null);
    reset();
    setValue('tenant_id', tenants[0]?.id || 1);
    setValue('object_type_id', objectTypes[0]?.id || 1); // Default type
    onOpen();
  };

  const onSubmit = (data: any) => {
    data.object_type_id = Number.parseInt(data.object_type_id);
    data.tenant_id = Number.parseInt(data.tenant_id);
    if (editingObj) {
      updateObject({ id: editingObj.id, data }, {
        onSuccess: () => onClose()
      });
    } else {
      createObject(data, {
        onSuccess: () => onClose()
      });
    }
  };

  const onDelete = (id: number) => {
    if (!window.confirm(t('deleteObjectConfirm'))) return;
    deleteObject(id);
  };

  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('objects')}</Heading>
        <Button colorPalette="brand" onClick={onAdd}>
          <FiPlus /> {t('addObject')}
        </Button>
      </Box>
      <DataTable
        data={objects}
        isLoading={isLoading}
        columns={[
          { header: 'ID', accessorKey: 'id', width: '50px' },
          { header: t('permissionName'), accessorKey: 'name' },
          {
            header: t('type') || 'Type',
            render: (o) => objectTypes.find(ot => ot.id === o.object_type_id)?.name || o.object_type_id
          },
          {
            header: t('tenant'),
            render: (o) => tenants.find((t) => t.id === o.tenant_id)?.name || o.tenant_id,
          },
        ]}
        searchKeys={['name']}
        searchPlaceholder={t('searchObjects') || 'Search objects...'}
        onEdit={onEdit}
        onDelete={(o) => onDelete(o.id)}
      />

      <Dialog.Root open={isOpen} onOpenChange={(e) => (e.open ? onOpen() : onClose())}>
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
                <Field.Root mb={4}>
                  <Field.Label>{t('displayName') || 'Display Name'}</Field.Label>
                  <Input {...register('display_name')} />
                </Field.Root>
                <Field.Root required mb={4}>
                  <Field.Label>{t('objectType')}</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field {...register('object_type_id')} placeholder="Select type">
                      {objectTypes.map((ot) => (
                        <option key={ot.id} value={ot.id}>
                          {ot.name}
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
              <Button colorPalette="brand" form="obj-form" type="submit">
                {t('save')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}

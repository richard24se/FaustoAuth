import { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  useDisclosure,
  Dialog,
  Field,
  Input,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { DataTable } from '@/components/common/DataTable';
import { useForm } from 'react-hook-form';
import { ObjectType } from '@/types';
import { useTranslation } from 'react-i18next';
import { useObjectTypes } from '@/hooks/useObjectTypes';

export default function ObjectTypes() {
  const { objectTypes, isLoading, createObjectType, updateObjectType, deleteObjectType } = useObjectTypes();
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const [editingObjType, setEditingObjType] = useState<ObjectType | null>(null);
  const { t } = useTranslation();
  const { register, handleSubmit, reset, setValue } = useForm();

  const onEdit = (objType: ObjectType) => {
    setEditingObjType(objType);
    setValue('name', objType.name);
    onOpen();
  };

  const onAdd = () => {
    setEditingObjType(null);
    reset();
    onOpen();
  };

  const onSubmit = (data: any) => {
      if (editingObjType) {
        updateObjectType({ id: editingObjType.id, data }, {
          onSuccess: () => {
            onClose();
          }
        });
      } else {
        createObjectType(data, {
          onSuccess: () => {
            onClose();
          }
        });
      }
  };

  const onDelete = (id: number) => {
    if (!window.confirm(t('deleteObjectTypeConfirm') || 'Are you sure you want to delete this object type?')) return;
    deleteObjectType(id);
  };

  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('objectTypes') || 'Object Types'}</Heading>
        <Button colorPalette="brand" onClick={onAdd}>
          <FiPlus /> {t('addObjectType') || 'Add Object Type'}
        </Button>
      </Box>
      <DataTable
        data={objectTypes}
        isLoading={isLoading}
        columns={[
          { header: 'ID', accessorKey: 'id', width: '50px' },
          { header: t('name') || 'Name', accessorKey: 'name' },
          { header: t('createdDate') || 'Created Date', accessorKey: 'created_date' },
        ]}
        searchKeys={['name']}
        searchPlaceholder={t('searchObjectTypes') || 'Search object types...'}
        onEdit={onEdit}
        onDelete={(o) => onDelete(o.id)}
        disableTenantFilter={true}
      />

      <Dialog.Root open={isOpen} onOpenChange={(e) => (e.open ? onOpen() : onClose())}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{editingObjType ? (t('editObjectType') || 'Edit Object Type') : (t('createObjectType') || 'Create Object Type')}</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body pb={6}>
              <form id="obj-type-form" onSubmit={handleSubmit(onSubmit)}>
                <Field.Root required mb={4}>
                  <Field.Label>{t('name') || 'Name'}</Field.Label>
                  <Input {...register('name')} />
                </Field.Root>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={onClose} mr={3} variant="ghost">
                {t('cancel')}
              </Button>
              <Button colorPalette="brand" form="obj-type-form" type="submit">
                {t('save')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}

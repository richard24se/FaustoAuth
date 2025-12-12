import { useState, useEffect } from 'react';
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
import { AuditType } from '@/types';
import { useTranslation } from 'react-i18next';
import { toaster } from '@/components/ui/toaster';
import { auditTypeService } from '@/services/auditTypeService';

export default function AuditTypes() {
  const [auditTypes, setAuditTypes] = useState<AuditType[]>([]);
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const [editingAuditType, setEditingAuditType] = useState<AuditType | null>(null);
  const { t } = useTranslation();
  const { register, handleSubmit, reset, setValue } = useForm();

  const loadAuditTypes = async () => {
    try {
      const data = await auditTypeService.getAll();
      setAuditTypes(data);
    } catch (error) {
      console.error(error);
      toaster.create({ title: t('errorLoadingData'), type: 'error' });
    }
  };

  useEffect(() => {
    loadAuditTypes();
  }, []);

  const onEdit = (auditType: AuditType) => {
    setEditingAuditType(auditType);
    setValue('name', auditType.name);
    onOpen();
  };

  const onAdd = () => {
    setEditingAuditType(null);
    reset();
    onOpen();
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingAuditType) {
        await auditTypeService.update(editingAuditType.id, data);
        toaster.create({ title: t('auditTypeUpdated'), type: 'success' });
      } else {
        await auditTypeService.create(data);
        toaster.create({ title: t('auditTypeCreated'), type: 'success' });
      }
      onClose();
      loadAuditTypes();
    } catch (error) {
      console.error(error);
      toaster.create({ title: t('errorSavingAuditType'), type: 'error' });
    }
  };

  const onDelete = async (id: number) => {
    if (!window.confirm(t('deleteAuditTypeConfirm'))) return;
    try {
      await auditTypeService.delete(id);
      toaster.create({ title: t('auditTypeDeleted'), type: 'success' });
      loadAuditTypes();
    } catch (error) {
      console.error(error);
      toaster.create({ title: t('errorDeletingAuditType'), type: 'error' });
    }
  };

  return (
    <Box p={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{t('auditTypes')}</Heading>
        <Button colorPalette="brand" onClick={onAdd}>
          <FiPlus /> {t('addAuditType')}
        </Button>
      </Box>
      <DataTable
        data={auditTypes}
        columns={[
          { header: 'ID', accessorKey: 'id', width: '50px' },
          { header: t('name'), accessorKey: 'name' },
        ]}
        searchKeys={['name']}
        searchPlaceholder={t('searchAuditTypes')}
        onEdit={onEdit}
        onDelete={(row) => onDelete(row.id)}
      />

      <Dialog.Root open={isOpen} onOpenChange={(e) => (e.open ? onOpen() : onClose())}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{editingAuditType ? t('editAuditType') : t('addAuditType')}</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body pb={6}>
              <form id="audit-type-form" onSubmit={handleSubmit(onSubmit)}>
                <Field.Root required>
                  <Field.Label>{t('name')}</Field.Label>
                  <Input {...register('name')} placeholder="e.g. Login" />
                </Field.Root>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={onClose} mr={3} variant="ghost">
                {t('cancel')}
              </Button>
              <Button colorPalette="brand" form="audit-type-form" type="submit">
                {t('save')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Heading,
    Button,
    HStack,
    useDisclosure,
    Dialog,
    Checkbox,
    Stack,
    Input,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { roleService } from '@/services/roleService';
import { permissionService } from '@/services/permissionService';
import { rolePermissionService } from '@/services/rolePermissionService';
import { permissionTypeService, PermissionType } from '@/services/permissionTypeService';
import { Role, Permission } from '@/types';
import { toaster } from '@/components/ui/toaster';
import { FiArrowLeft, FiPlus, FiTrash } from 'react-icons/fi';
import { DataTable } from '@/components/common/DataTable';

export default function RolePermissions() {
    const { roleId } = useParams<{ roleId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { open: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();

    const [role, setRole] = useState<Role | null>(null);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [permissionTypes, setPermissionTypes] = useState<PermissionType[]>([]);
    const [assignedPermissionIds, setAssignedPermissionIds] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [selectedToAdd, setSelectedToAdd] = useState<Set<number>>(new Set());
    const [modalSearch, setModalSearch] = useState('');

    useEffect(() => {
        if (!roleId) return;
        loadData();
    }, [roleId]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const id = parseInt(roleId!);

            const [roleData, permissionsData, permissionTypesData] = await Promise.all([
                roleService.getById(id),
                permissionService.getAll(),
                permissionTypeService.getAll(),
            ]);

            let rolePermissionsData: any[] = [];
            try {
                rolePermissionsData = await rolePermissionService.getByRoleId(id);
            } catch (error: any) {
                if (error.response?.status !== 404) {
                    throw error;
                }
                // If 404, it means no permissions, which is fine.
            }

            setRole(roleData);
            setAllPermissions(permissionsData);
            setPermissionTypes(permissionTypesData);

            const assignedIds = new Set<number>();
            if (Array.isArray(rolePermissionsData)) {
                rolePermissionsData.forEach((obj: any) => {
                    if (obj.permissions) {
                        obj.permissions.forEach((p: Permission) => {
                            assignedIds.add(p.id);
                        });
                    }
                });
            }
            setAssignedPermissionIds(assignedIds);

        } catch (error) {
            console.error(error);
            toaster.create({
                title: t('errorLoadingData'),
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updatePermissions = async (newIds: Set<number>) => {
        if (!role) return;
        try {
            await roleService.update(role.id, {
                permissions: Array.from(newIds)
            } as Partial<Role> & { permissions: number[] });

            setAssignedPermissionIds(newIds);
            toaster.create({
                title: t('permissionsUpdated'),
                type: 'success',
            });
        } catch (error) {
            console.error(error);
            toaster.create({
                title: t('errorSavingPermissions'),
                type: 'error',
            });
        }
    };

    const handleAddPermissions = async () => {
        const newIds = new Set(assignedPermissionIds);
        selectedToAdd.forEach(id => newIds.add(id));

        await updatePermissions(newIds);
        onAddClose();
        setSelectedToAdd(new Set());
    };

    const handleRemovePermission = async (permissionId: number) => {
        if (!window.confirm(t('confirmRemovePermission'))) return;
        const newIds = new Set(assignedPermissionIds);
        newIds.delete(permissionId);
        await updatePermissions(newIds);
    };

    const assignedPermissions = useMemo(() =>
        allPermissions.filter(p => assignedPermissionIds.has(p.id)),
        [allPermissions, assignedPermissionIds]);

    const unassignedPermissions = useMemo(() =>
        allPermissions.filter(p => !assignedPermissionIds.has(p.id)),
        [allPermissions, assignedPermissionIds]);

    const filteredUnassigned = useMemo(() => {
        if (!modalSearch) return unassignedPermissions;
        return unassignedPermissions.filter(p =>
            p.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
            p.object?.name.toLowerCase().includes(modalSearch.toLowerCase())
        );
    }, [unassignedPermissions, modalSearch]);

    if (isLoading) return <Box p={8}>{t('loading')}</Box>;
    if (!role) return <Box p={8}>{t('roleNotFound')}</Box>;

    return (
        <Box p={8}>
            <HStack mb={6} justifyContent="space-between">
                <HStack>
                    <Button variant="ghost" onClick={() => navigate('/roles')}>
                        <FiArrowLeft />
                    </Button>
                    <Heading size="lg">
                        {t('managePermissionsFor')} {role.display_name || role.name}
                    </Heading>
                </HStack>
                <Button colorPalette="brand" onClick={onAddOpen}>
                    <FiPlus /> {t('addPermission')}
                </Button>
            </HStack>

            <DataTable
                data={assignedPermissions}
                columns={[
                    { header: 'ID', accessorKey: 'id', width: '50px' },
                    { header: t('permissionName'), accessorKey: 'name' },
                    { header: t('object'), render: (p) => p.object?.name || p.id_object },
                    {
                        header: t('permissionType'),
                        render: (p) => permissionTypes.find((pt) => pt.id === p.id_permission_type)?.name || p.id_permission_type,
                    },
                    {
                        header: t('actions'),
                        render: (p) => (
                            <Button size="xs" colorPalette="red" variant="ghost" onClick={() => handleRemovePermission(p.id)}>
                                <FiTrash />
                            </Button>
                        ),
                        width: '80px'
                    }
                ]}
                searchKeys={['name']}
            />

            <Dialog.Root open={isAddOpen} onOpenChange={(e) => (e.open ? onAddOpen() : onAddClose())} size="lg">
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>{t('addPermissions')}</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body>
                            <Input
                                placeholder={t('searchPermissions')}
                                mb={4}
                                value={modalSearch}
                                onChange={(e) => setModalSearch(e.target.value)}
                            />
                            <Stack gap={2} maxH="400px" overflowY="auto">
                                {filteredUnassigned.length === 0 && <Box>{t('noPermissionsFound')}</Box>}
                                {filteredUnassigned.map(perm => (
                                    <Checkbox.Root
                                        key={perm.id}
                                        checked={selectedToAdd.has(perm.id)}
                                        onCheckedChange={({ checked }) => {
                                            setSelectedToAdd(prev => {
                                                const next = new Set(prev);
                                                if (checked) next.add(perm.id);
                                                else next.delete(perm.id);
                                                return next;
                                            });
                                        }}
                                    >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control />
                                        <Checkbox.Label>
                                            {perm.name} <Box as="span" color="gray.500" fontSize="sm">({perm.object?.name})</Box>
                                        </Checkbox.Label>
                                    </Checkbox.Root>
                                ))}
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button variant="ghost" onClick={onAddClose}>{t('cancel')}</Button>
                            <Button colorPalette="brand" onClick={handleAddPermissions} disabled={selectedToAdd.size === 0}>
                                {t('addSelected')} ({selectedToAdd.size})
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Box>
    );
}

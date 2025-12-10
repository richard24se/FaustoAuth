import React, { useEffect, useState } from 'react';
import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Input,
    InputGroup,
    InputLeftElement,
    Button,
    HStack,
    Text,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useColorModeValue,
    Flex,
} from '@chakra-ui/react';
import { FiSearch, FiChevronLeft, FiChevronRight, FiMoreVertical, FiEdit, FiTrash } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useTenantStore } from '../../store/tenantStore';

export interface Column<T> {
    header: string;
    accessorKey?: keyof T; // Key to access data directly
    render?: (item: T) => React.ReactNode; // Custom render function
    width?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    searchKeys?: (keyof T)[]; // Array of keys to search in (e.g. ['name', 'username'])
    searchPlaceholder?: string;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    customFilter?: (item: T) => boolean; // Additional filter logic (e.g. role filter)
    extraControls?: React.ReactNode; // Extra UI like Role Select dropdown
    tenantField?: keyof T; // Key for tenant_id (default 'tenant_id')
}

export function DataTable<T extends { id: number | string }>({
    data,
    columns,
    searchKeys = [],
    searchPlaceholder = "Search...",
    onEdit,
    onDelete,
    customFilter,
    extraControls,
    tenantField = 'tenant_id' as keyof T
}: DataTableProps<T>) {
    const { t } = useTranslation();
    const { selectedTenantId } = useTenantStore();

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Derived state: Filtered Data
    const filteredData = React.useMemo(() => {
        let result = data;

        // 1. Tenant Filter
        if (selectedTenantId) {
            // We cast to any to access the dynamic field safely, or we rely on the generic constraint if strictly typed
            result = result.filter(item => (item as any)[tenantField] === selectedTenantId);
        }

        // 2. Search Filter
        if (searchQuery && searchKeys.length > 0) {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(item =>
                searchKeys.some(key => {
                    const val = (item as any)[key];
                    return val ? String(val).toLowerCase().includes(lowerQ) : false;
                })
            );
        }

        // 3. Custom Filter (e.g. Role)
        if (customFilter) {
            result = result.filter(customFilter);
        }

        return result;
    }, [data, selectedTenantId, searchQuery, searchKeys, customFilter, tenantField]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = React.useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        // Ensure we don't go out of bounds if filters change
        return filteredData.slice(startIndex, startIndex + pageSize);
    }, [filteredData, currentPage, pageSize]);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTenantId, searchQuery, customFilter]); // Dependency on filters

    // Styling
    const bg = useColorModeValue('white', 'surface.500'); // Adapting to surface.500 if that's the theme
    const theadBg = useColorModeValue('gray.50', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const prevPage = () => setCurrentPage(p => Math.max(1, p - 1));
    const nextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

    return (
        <Box>
            {/* Controls Bar */}
            <Flex mb={4} justify="space-between" align="center" wrap="wrap" gap={4}>
                <HStack spacing={4} flex={1}>
                    {searchKeys.length > 0 && (
                        <InputGroup maxW="300px">
                            <InputLeftElement pointerEvents="none">
                                <FiSearch color="gray.300" />
                            </InputLeftElement>
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                bg={useColorModeValue('white', 'gray.700')}
                            />
                        </InputGroup>
                    )}
                    {extraControls}
                </HStack>
            </Flex>

            {/* Table Area */}
            <Box bg={bg} shadow="md" borderRadius="lg" overflowX="auto" border="1px" borderColor={borderColor}>
                <Table variant="simple">
                    <Thead bg={theadBg}>
                        <Tr>
                            {columns.map((col, idx) => (
                                <Th key={idx} w={col.width}>{col.header}</Th>
                            ))}
                            {(onEdit || onDelete) && <Th w="50px"></Th>}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item) => (
                                <Tr key={item.id}>
                                    {columns.map((col, idx) => (
                                        <Td key={idx}>
                                            {col.render ? col.render(item) : (col.accessorKey ? String((item as any)[col.accessorKey]) : '')}
                                        </Td>
                                    ))}
                                    {(onEdit || onDelete) && (
                                        <Td>
                                            <Menu>
                                                <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" aria-label="Actions" />
                                                <MenuList>
                                                    {onEdit && <MenuItem icon={<FiEdit />} onClick={() => onEdit(item)}>{t('edit')}</MenuItem>}
                                                    {onDelete && <MenuItem icon={<FiTrash />} color="red.500" onClick={() => onDelete(item)}>{t('delete')}</MenuItem>}
                                                </MenuList>
                                            </Menu>
                                        </Td>
                                    )}
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} textAlign="center" py={8} color="gray.500">
                                    {t('noResults') || "No results found"}
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Flex justify="space-between" align="center" mt={4}>
                    <Text fontSize="sm" color="gray.500">
                        {t('showing')} {((currentPage - 1) * pageSize) + 1} {t('to')} {Math.min(currentPage * pageSize, filteredData.length)} {t('of')} {filteredData.length} {t('entries')}
                    </Text>
                    <HStack>
                        <Button size="sm" onClick={prevPage} isDisabled={currentPage === 1} leftIcon={<FiChevronLeft />}>
                            {t('previous')}
                        </Button>
                        <Text fontSize="sm" fontWeight="bold">{currentPage}</Text>
                        <Button size="sm" onClick={nextPage} isDisabled={currentPage === totalPages} rightIcon={<FiChevronRight />}>
                            {t('next')}
                        </Button>
                    </HStack>
                </Flex>
            )}
        </Box>
    );
}

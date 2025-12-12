import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Input,
  Button,
  HStack,
  Text,
  IconButton,
  Menu,
  Flex,
  Portal,
} from '@chakra-ui/react';
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiEdit,
  FiTrash,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useTenantStore } from '../../store/tenantStore';
import { useColorModeValue } from '../ui/color-mode';

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
  searchPlaceholder = 'Search...',
  onEdit,
  onDelete,
  customFilter,
  extraControls,
  tenantField = 'tenant_id' as keyof T,
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
    console.log(result)
    console.log(selectedTenantId)
    // if (selectedTenantId && !disableTenantFilter) {
    if (selectedTenantId) {

      result = result.filter((item) => (item as any)[tenantField] === selectedTenantId);
      console.log(result)
    }

    // 2. Search Filter
    if (searchQuery && searchKeys.length > 0) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const val = (item as any)[key];
          return val ? String(val).toLowerCase().includes(lowerQ) : false;
        }),
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
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTenantId, searchQuery, customFilter]);

  // Styling
  const bg = useColorModeValue('white', 'surface.500');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');

  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const nextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <Box>
      {/* Controls Bar */}
      <Flex mb={4} justify="space-between" align="center" wrap="wrap" gap={4}>
        <HStack gap={4} flex={1}>
          {searchKeys.length > 0 && (
            <Box position="relative" maxW="300px" width="full">
              <Box position="absolute" left="3" top="2.5" pointerEvents="none" zIndex={2}>
                <FiSearch color="gray" />
              </Box>
              <Input
                pl="10"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={inputBg}
              />
            </Box>
          )}
          {extraControls}
        </HStack>
      </Flex>

      {/* Table Area */}
      <Box
        bg={bg}
        shadow="md"
        borderRadius="lg"
        overflowX="auto"
        border="1px"
        borderColor={borderColor}
      >
        <Table.Root variant="outline">
          <Table.Header>
            <Table.Row>
              {columns.map((col, idx) => (
                <Table.ColumnHeader key={idx} width={col.width}>
                  {col.header}
                </Table.ColumnHeader>
              ))}
              {(onEdit || onDelete) && <Table.ColumnHeader width="50px"></Table.ColumnHeader>}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <Table.Row key={item.id}>
                  {columns.map((col, idx) => (
                    <Table.Cell key={idx}>
                      {col.render
                        ? col.render(item)
                        : col.accessorKey
                          ? String((item as any)[col.accessorKey])
                          : ''}
                    </Table.Cell>
                  ))}
                  {(onEdit || onDelete) && (
                    <Table.Cell>
                      <Menu.Root>
                        <Menu.Trigger asChild>
                          <IconButton variant="ghost" size="sm" aria-label="Actions">
                            <FiMoreVertical />
                          </IconButton>
                        </Menu.Trigger>
                        <Portal>
                          <Menu.Positioner>
                            <Menu.Content>
                              {onEdit && (
                                <Menu.Item value="edit" onClick={() => onEdit(item)}>
                                  <FiEdit /> {t('edit')}
                                </Menu.Item>
                              )}
                              {onDelete && (
                                <Menu.Item
                                  value="delete"
                                  color="red.500"
                                  onClick={() => onDelete(item)}
                                >
                                  <FiTrash /> {t('delete')}
                                </Menu.Item>
                              )}
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>
                    </Table.Cell>
                  )}
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  textAlign="center"
                  py={8}
                  color="gray.500"
                >
                  {t('noResults') || 'No results found'}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justify="space-between" align="center" mt={4}>
          <Text fontSize="sm" color="gray.500">
            {t('showing')} {(currentPage - 1) * pageSize + 1} {t('to')}{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} {t('of')} {filteredData.length}{' '}
            {t('entries')}
          </Text>
          <HStack>
            <Button size="sm" onClick={prevPage} disabled={currentPage === 1}>
              <FiChevronLeft /> {t('previous')}
            </Button>
            <Text fontSize="sm" fontWeight="bold">
              {currentPage}
            </Text>
            <Button size="sm" onClick={nextPage} disabled={currentPage === totalPages}>
              {t('next')} <FiChevronRight />
            </Button>
          </HStack>
        </Flex>
      )}
    </Box>
  );
}

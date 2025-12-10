import { useEffect, useState } from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardHeader,
  CardBody,
  Text,
  VStack,
  HStack,
  Progress
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { userService } from '../services/userService';
import { roleService } from '../services/roleService';
import { permissionService } from '../services/permissionService';
import { objectService } from '../services/objectService';
import { User } from '../types'; // Import types

import { FiUserCheck } from 'react-icons/fi';


interface StatsProps {
  title: string;
  stat: string;
}

function StatsCard(props: StatsProps) {
  const { title, stat } = props;
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py={'5'}
      shadow={'xl'}
      border={'1px solid'}
      borderColor={useColorModeValue('brand.500', 'brand.200')}
      rounded={'lg'}
      bg={useColorModeValue('white', 'gray.700')}
    >
      <StatLabel fontWeight={'medium'} isTruncated color={useColorModeValue('gray.600', 'gray.300')}>
        {title}
      </StatLabel>
      <StatNumber fontSize={'2xl'} fontWeight={'medium'} color={useColorModeValue('brand.600', 'brand.100')}>
        {stat}
      </StatNumber>
    </Stat>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<{ name: string, count: number }[]>([]);
  const [counts, setCounts] = useState({
    users: 0,
    roles: 0,
    permissions: 0,
    objects: 0
  });


  useEffect(() => {
    async function fetchStats() {
      try {
        const [users, roles, perms, objs] = await Promise.all([
          userService.getAll(),
          roleService.getAll(),
          permissionService.getAll(),
          objectService.getAll()
        ]);
        setCounts({
          users: users.length,
          roles: roles.length,
          permissions: perms.length,
          objects: objs.length
        });

        // 1. Get Recent Users (Last 5)
        // Assuming users are returned in some order, or we sort by ID desc
        const sortedUsers = [...users].sort((a, b) => b.id - a.id).slice(0, 5);
        setRecentUsers(sortedUsers);

        // 2. Role Distribution
        const roleCounts: { [key: string]: number } = {};
        users.forEach(u => {
          // Get role name
          const rName = u.role?.name || roles.find(r => r.id === u.id_role)?.name || 'Unknown';
          roleCounts[rName] = (roleCounts[rName] || 0) + 1;
        });

        const dist = Object.entries(roleCounts).map(([name, count]) => ({ name, count }));
        setRoleDistribution(dist);

      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    }
    fetchStats();
  }, []);

  return (
    <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <Heading mb={10} textAlign={'center'} size="xl" fontWeight="bold">
        {t('systemOverview')}
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={{ base: 5, lg: 8 }}>
        <StatsCard title={t('usersCount')} stat={counts.users.toString()} />
        <StatsCard title={t('rolesCount')} stat={counts.roles.toString()} />
        <StatsCard title={t('permissionsCount')} stat={counts.permissions.toString()} />
        <StatsCard title={t('objectsCount')} stat={counts.objects.toString()} />
      </SimpleGrid>

      {/* Widgets Area */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mt={10}>

        {/* Recent Users Widget */}
        <Card>
          <CardHeader>
            <Heading size="md">{t('recentUsers') || 'Recent Users'}</Heading>
            <Text fontSize="sm" color="gray.500">Newest members of the platform</Text>
          </CardHeader>
          <CardBody>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th>Tenant</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentUsers.map(user => (
                  <Tr key={user.id}>
                    <Td fontWeight="medium">{user.username}</Td>
                    <Td>{user.role?.name || '-'}</Td>
                    <Td>{user.tenant_id}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Role Distribution Widget */}
        <Card>
          <CardHeader>
            <Heading size="md">{t('roleDistribution') || 'Role Distribution'}</Heading>
            <Text fontSize="sm" color="gray.500">Users by role</Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {roleDistribution.map((item, index) => (
                <Box key={index}>
                  <HStack justify="space-between" mb={1}>
                    <HStack>
                      <FiUserCheck />
                      <Text fontWeight="medium">{item.name}</Text>
                    </HStack>
                    <Text fontWeight="bold">{item.count}</Text>
                  </HStack>
                  <Progress
                    value={(item.count / counts.users) * 100}
                    size="sm"
                    colorScheme="brand"
                    borderRadius="full"
                  />
                </Box>
              ))}
              {roleDistribution.length === 0 && <Text>No data available</Text>}
            </VStack>
          </CardBody>
        </Card>

      </SimpleGrid>
    </Box>
  );
}

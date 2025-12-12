import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Card,
  Table,
  Badge,
  Stack,
  Progress,
  Container,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { userService } from '../services/userService';
import { roleService } from '../services/roleService';
import { tenantService } from '../services/tenantService';
import { UserRoleGraph } from '../components/visualization/UserRoleGraph';

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    roles: 0,
    tenants: 0,
    activeUsers: 0, // Placeholder
  });
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, roles, tenants] = await Promise.all([
          userService.getAll(),
          roleService.getAll(),
          tenantService.getAll(),
        ]);
        setStats({
          users: users.length,
          roles: roles.length,
          tenants: tenants.length,
          activeUsers: Math.floor(users.length * 0.8),
        });
      } catch (e) {
        console.error('Failed to fetch dashboard stats', e);
      }
    };
    fetchStats();
  }, []);

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={8}>
        <Box>
          <Heading size="lg" mb={2}>
            {t('dashboard')}
          </Heading>
          <Text color="gray.500">{t('dashboardSubtitle') || 'Overview of your system'}</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
          <Card.Root>
            <Card.Body>
              <Stack gap={2}>
                <Text fontSize="sm" color="gray.500">
                  {t('totalUsers')}
                </Text>
                <Heading size="2xl">{stats.users}</Heading>
                <Progress.Root value={80} size="sm" colorPalette="blue">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
                <Text fontSize="xs" color="gray.400">
                  80% active this month
                </Text>
              </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <Stack gap={2}>
                <Text fontSize="sm" color="gray.500">
                  {t('totalRoles')}
                </Text>
                <Heading size="2xl">{stats.roles}</Heading>
                <Progress.Root value={40} size="sm" colorPalette="purple">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
                <Text fontSize="xs" color="gray.400">
                  {stats.roles} defined roles
                </Text>
              </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <Stack gap={2}>
                <Text fontSize="sm" color="gray.500">
                  {t('totalTenants')}
                </Text>
                <Heading size="2xl">{stats.tenants}</Heading>
                <Progress.Root value={60} size="sm" colorPalette="green">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
                <Text fontSize="xs" color="gray.400">
                  {stats.tenants} active tenants
                </Text>
              </Stack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        <Card.Root>
          <Card.Header>
            <Heading size="md">{t('recentActivity') || 'Recent Activity'}</Heading>
          </Card.Header>
          <Card.Body>
            <Table.Root variant="outline">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>User</Table.ColumnHeader>
                  <Table.ColumnHeader>Action</Table.ColumnHeader>
                  <Table.ColumnHeader>Time</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>admin</Table.Cell>
                  <Table.Cell>Login</Table.Cell>
                  <Table.Cell>2 mins ago</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette="green">Success</Badge>
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>user1</Table.Cell>
                  <Table.Cell>Update Profile</Table.Cell>
                  <Table.Cell>1 hour ago</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette="blue">Completed</Badge>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Root>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading size="md">{t('accessVisualization') || 'Access Visualization'}</Heading>
          </Card.Header>
          <Card.Body>
            <UserRoleGraph />
          </Card.Body>
        </Card.Root>
      </Stack>
    </Container>
  );
}
